import { AuthProvider } from '@/context/AuthContext'
import { StoreProvider } from '@/store'
import '../global.css'

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}