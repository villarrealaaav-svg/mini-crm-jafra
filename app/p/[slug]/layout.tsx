import PublicNav from '@/components/PublicNav'

export default async function PublicSpaceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="min-h-screen bg-[#EDF0FF] pb-24">
      {children}
      <PublicNav slug={slug} />
    </div>
  )
}
