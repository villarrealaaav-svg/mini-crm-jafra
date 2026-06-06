import PublicNav from '@/components/PublicNav'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EDF0FF] pb-24">
      {children}
      <PublicNav />
    </div>
  )
}
