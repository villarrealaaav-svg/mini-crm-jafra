import * as XLSX from 'xlsx'
import type { Payment, Person } from '@/types'

export interface ImportRow {
  name: string
  billing_date: string
  amount: number
  mod_fac: number
  payment_date: string
  status: 'pagado' | 'pendiente'
  notes: string
}

function excelDateToString(value: unknown): string {
  if (!value) return ''
  // Si es número, SheetJS lo convierte desde el serial de Excel
  if (typeof value === 'number') {
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      const y = date.y
      const m = String(date.m).padStart(2, '0')
      const d = String(date.d).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  // Si ya es string con formato DD/MM/YYYY
  const str = String(value).trim()
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  // Si es YYYY-MM-DD ya está bien
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  return ''
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value
  const str = String(value || '').replace(/[$,\s]/g, '')
  return parseFloat(str) || 0
}

function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i].map(c => String(c || '').toUpperCase())
    if (row.some(c => c.includes('NOMBRE'))) return i
  }
  return 0
}

function detectColumns(headerRow: unknown[]) {
  const h = headerRow.map(c => String(c || '').toUpperCase().trim())
  return {
    name:    h.findIndex(c => c.includes('NOMBRE') || c === 'NAME'),
    billing: h.findIndex(c => c.includes('FAC') && !c.includes('FECHA')),
    amount:  h.findIndex(c => c.includes('IMP') || c.includes('TOTAL') || c.includes('MONTO')),
    mod:     h.findIndex(c => c.includes('MOD')),
    payment: h.findIndex(c => c.includes('PAG') || c.includes('FECHA DE PAG')),
    obs:     h.findIndex(c => c.includes('OBS') || c.includes('OBSERV')),
  }
}

function rowsToImport(dataRows: unknown[][], idx: ReturnType<typeof detectColumns>): ImportRow[] {
  return dataRows
    .filter(r => r[idx.name] && String(r[idx.name]).trim())
    .map(r => {
      const obs = String(r[idx.obs] || '').toUpperCase().trim()
      return {
        name: String(r[idx.name] || '').trim(),
        billing_date: excelDateToString(r[idx.billing]),
        amount: parseAmount(r[idx.amount]),
        mod_fac: parseAmount(r[idx.mod]),
        payment_date: excelDateToString(r[idx.payment]),
        status: obs === 'PAGADO' ? 'pagado' : 'pendiente',
        notes: '',
      }
    })
}

// Parse .xlsx / .xls from ArrayBuffer
export function parseExcelBuffer(buffer: ArrayBuffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: false })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' })

  if (rows.length < 2) return []
  const headerIdx = findHeaderRow(rows)
  const idx = detectColumns(rows[headerIdx])
  if (idx.name === -1) return []

  return rowsToImport(rows.slice(headerIdx + 1), idx)
}

// Parse CSV / TSV from text string (fallback)
export function parseImportFile(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/)
  const rows: string[][] = lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes }
      else if ((char === ',' || char === '\t') && !inQuotes) { result.push(current.trim()); current = '' }
      else { current += char }
    }
    result.push(current.trim())
    return result
  })

  if (rows.length < 2) return []
  const headerIdx = findHeaderRow(rows)
  const idx = detectColumns(rows[headerIdx])
  if (idx.name === -1) return []
  return rowsToImport(rows.slice(headerIdx + 1), idx)
}

export function exportToCSV(payments: Payment[], persons: Person[]): void {
  const personMap = new Map(persons.map(p => [p.id, p]))

  const formatDate = (d: string) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const header = ['#', 'NOMBRE', 'TELÉFONO', 'DIA DE FAC', 'IMP TOTAL', 'MOD FAC', 'FECHA DE PAG', 'OBSERVACIONES']
  const rows = payments.map((p, i) => {
    const person = personMap.get(p.person_id)
    return [
      i + 1,
      p.person_name,
      person?.phone || '',
      formatDate(p.billing_date),
      p.amount ? `$${p.amount.toFixed(2)}` : '',
      p.mod_fac || '',
      formatDate(p.payment_date),
      p.status === 'pagado' ? 'PAGADO' : p.status === 'atrasado' ? 'ATRASADO' : '',
    ]
  })

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows])
  XLSX.utils.book_append_sheet(wb, ws, 'Pagos JAFRA')
  XLSX.writeFile(wb, `jafra_pagos_${new Date().toISOString().split('T')[0]}.xlsx`)
}
