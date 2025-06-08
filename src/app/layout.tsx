import './globals.css'
import { Inter, Caveat } from 'next/font/google'
import { Edu_SA_Beginner } from 'next/font/google'
import { LayoutWrapper } from './LayoutWrapper'

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
        <LayoutWrapper caveatClassName={caveat.className}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
} 