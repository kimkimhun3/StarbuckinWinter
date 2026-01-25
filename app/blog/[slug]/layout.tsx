// Metadata & data fetching live in page.tsx (single server fetch). Layout is a pass-through.
export const dynamic = 'force-dynamic'
export const revalidate = 60

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
