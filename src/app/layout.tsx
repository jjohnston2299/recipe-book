import './globals.css'
import { Inter, Caveat } from 'next/font/google'
import { Edu_SA_Beginner } from 'next/font/google'

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
          <div className="container mx-auto flex justify-between items-center">
            <h1 className={`${caveat.className} text-2xl font-bold`}>Recipe Book</h1>
            <div className="space-x-4">
              <a href="/" className="hover:text-[#D1D8BE]">Home</a>
              <a href="/recipes/new" className="hover:text-[#D1D8BE]">New Recipe</a>
              <a href="/recipes/ai" className="hover:text-[#D1D8BE]">AI Recommendations</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
} 