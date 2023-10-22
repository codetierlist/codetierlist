"use client"

import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar, lightTheme, darkTheme } from '@/components';
import { FluentProvider, teamsLightTheme } from "@fluentui/react-components";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <FluentProvider theme={teamsLightTheme}>
          <Navbar />
          {children}
        </FluentProvider>
      </body>
    </html>
  )
}
