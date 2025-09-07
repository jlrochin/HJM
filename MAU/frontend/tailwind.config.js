/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Colores principales definidos según las preferencias del usuario
                primary: {
                    50: '#f8fafc',   // Fondo claro para elementos primarios
                    500: '#6b7280',   // Color primario medio (gris)
                    600: '#4b5563',   // Color primario (gris)
                    700: '#374151',   // Color secundario (gris oscuro)
                },
                accent: {
                    500: '#ef4444',   // Error/Pendiente (ROJO)
                    600: '#dc2626',   // Énfasis/Acentos (ROJO)
                    700: '#b91c1c',   // Hover para acentos (ROJO oscuro)
                },
                secondary: {
                    50: '#f8fafc',   // Fondo claro para elementos secundarios
                    100: '#f1f5f9',  // Fondo muy claro
                    200: '#e2e8f0',  // Bordes y separadores
                    300: '#cbd5e1',  // Bordes de formularios
                    400: '#94a3b8',  // Texto de placeholder
                    500: '#64748b',  // Color secundario medio
                    600: '#64748B',  // Texto secundario
                    700: '#475569',  // Color secundario oscuro
                    900: '#1E293B',  // Texto principal
                },
                success: '#10B981',
                warning: '#F59E0B',
                background: {
                    main: '#F1F5F9',
                    card: '#FFFFFF',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
