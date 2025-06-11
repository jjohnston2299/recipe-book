import './globals.css'
import { LayoutWrapper } from './LayoutWrapper'
import { dmSans, lora, outfit } from '@/styles/fonts'
import { LAYOUT } from '@/constants'

export const metadata = {
  title: LAYOUT.APP_NAME,
  description: LAYOUT.APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable} ${outfit.variable}`}>
      <body className="bg-[#F5F6F0] font-sans">
        <LayoutWrapper caveatClassName="font-display">
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
} 