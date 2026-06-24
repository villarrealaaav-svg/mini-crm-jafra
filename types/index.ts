export type PersonStatus = 'activa' | 'pendiente' | 'inactiva'
export type PaymentStatus = 'pagado' | 'pendiente' | 'atrasado'
export type ReminderType = 'llamada' | 'cobro' | 'reunion' | 'catalogo'
export type MeetingModality = 'zoom' | 'presencial'

export interface Person {
  id: string
  name: string
  phone: string
  birthday: string | null  // YYYY-MM-DD, opcional
  notes: string
  status: PersonStatus
  billing_date: string | null
  payment_date: string | null
  created_at: string
}

export interface Payment {
  id: string
  person_id: string
  person_name: string
  billing_date: string
  payment_date: string
  amount: number
  mod_fac: number
  status: PaymentStatus
  notes: string
}

export interface Reminder {
  id: string
  title: string
  reminder_type: ReminderType
  reminder_date: string
  reminder_time: string
  notes: string
  person_id?: string
  auto?: boolean
}

export interface Meeting {
  id: string
  title: string
  meeting_date: string
  modality: MeetingModality
  zoom_link: string
  notes: string
}

// ─── Contenido público (compartible vía /p) ─────────────

// Ranking del Muro del Éxito — formato JAFRA fijo
export interface MuroEntry {
  id: string
  name: string
  score: number
}

export interface MuroRanking {
  month: string            // "MAYO 2026"
  entries: MuroEntry[]     // se ordenan auto por score desc al render
  updated_at: string
}

// (legacy — mantengo type para evitar romper imports)
export interface MuroPost {
  id: string
  type: 'logro' | 'testimonio' | 'reconocimiento'
  title: string
  body: string
  author: string
  image: string
  date: string
  created_at: string
}

export interface PublicProducto {
  id: string
  name: string
  description: string
  price: string          // string para poder incluir "$" o "desde $X"
  image: string          // base64 dataURL u URL
  category: string
  highlight: boolean     // destacar como "nuevo"
  created_at: string
}

export interface PublicCurso {
  id: string
  title: string
  date: string           // YYYY-MM-DD
  time: string           // HH:MM
  modality: 'zoom' | 'presencial' | 'híbrido'
  location: string       // dirección o link zoom
  description: string
  image: string          // URL Storage (antes base64), opcional
  created_at: string
}

export interface CatalogoItem {
  id: string
  title: string
  type: 'link' | 'imagen' | 'pdf' | 'texto'
  content: string        // URL Storage, URL externa, o texto
  public: boolean        // true = visible en /p/catalogos
  created_at: string
}

export type QrSlot = 'app' | 'whatsapp'
export interface ContactoQR {
  app?: string | null
  whatsapp?: string | null
}
