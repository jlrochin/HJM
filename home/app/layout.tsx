import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'HJM - Sistema Hospitalario',
    description: 'Portal de acceso a los módulos del sistema hospitalario HJM',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    )
}
