import { AuthProvider } from './providers/AuthProvider'
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
          <Header />
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
