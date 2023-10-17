"use client"

import './globals.css'
import { Inter } from 'next/font/google'

import {
  FluentProvider,
  webLightTheme,
} from "@fluentui/react-components";

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FluentProvider theme={webLightTheme}>
          {children}
        </FluentProvider>
      </body>
    </html>
  )
}
