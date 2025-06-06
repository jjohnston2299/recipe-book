import './globals.css'
import { Inter, Caveat } from 'next/font/google'
import { Edu_SA_Beginner } from 'next/font/google'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })
const eduSA = Edu_SA_Beginner({ 
  subsets: ['latin'],
  variable: '--font-edu-sa',
})
const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Recipe Book',
  description: 'A personal recipe management system with AI-powered recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${eduSA.variable} bg-[#F5F6F0]`}>
        <nav className="bg-[#819A91] text-white p-4 shadow-md">
          <div className="container mx-auto">
            <Link 
              href="/" 
              className={`${caveat.className} text-2xl font-bold hover:text-[#D1D8BE] transition-colors`}
            >
              Recipe Book
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 