import type { Metadata } from 'next'

// The login page is a client component and cannot export metadata, and it sits
// outside the (protected) layout that sets noindex — so without this file it
// carried the homepage's title and no robots tag. robots.txt already disallows
// /dashboard, but only this tag keeps a linked URL out of the index.
export const metadata: Metadata = {
  title: 'Dashboard Login',
  robots: { index: false, follow: false },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
