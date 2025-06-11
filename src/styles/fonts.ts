import { Outfit, Lora, DM_Sans } from 'next/font/google';

// Main body font - Clean, modern, highly readable
export const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

// Display/heading font - Elegant serif that pairs well with DM Sans
export const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lora',
});

// Accent font - Modern, geometric sans-serif for UI elements
export const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
}); 