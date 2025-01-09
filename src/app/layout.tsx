import { StoreProvider } from '@/store'
import { AuthProvider } from '@/context/AuthContext'
import './global.css'


export default function RootLayout({
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