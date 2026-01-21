import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'GPT-UI Admin Dashboard',
  description: 'Admin dashboard for AI-powered UI generation system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}