import { AuthProvider } from './providers/AuthProvider'
import { GroupProvider } from './providers/GroupProvider'
import './globals.css'
import Header from '../components/Header'

export const metadata = {
  title: 'wadake - 家計簿アプリ',
  description: 'マネーフォワード風の家計簿アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <GroupProvider>
            <Header />
            <main>
              {children}
            </main>
          </GroupProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
