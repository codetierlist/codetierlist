import { lightTheme } from '@/components/client';
import { Navbar } from '@/components/server';
import { FluentProvider } from '@/components/fluent';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout ({
    children
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={inter.className}>
                <FluentProvider theme={lightTheme}>
                    <Navbar />
                    {children}
                </FluentProvider>
            </body>
        </html>
    );
}
