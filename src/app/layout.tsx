"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar, lightTheme } from '@/components';
import { FluentProvider } from "@fluentui/react-components";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FluentProvider theme={lightTheme} className='light'>
          <Navbar />
          {children}
        </FluentProvider>
      </body>
    </html>
  )
}
