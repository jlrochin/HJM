# HJM Home - Portal de Acceso

Portal de acceso principal para los módulos del sistema hospitalario HJM.

## Descripción

Esta aplicación Next.js proporciona una interfaz simple y elegante para acceder a los diferentes módulos del sistema hospitalario:

- **Módulo de Atención al Usuario (MAU)**: Sistema integral para la gestión de pacientes, recetas médicas y atención hospitalaria
- **Módulo de Informes (CAGPU)**: Generación de reportes, análisis estadísticos y métricas del sistema hospitalario

## Características

- Diseño moderno y elegante siguiendo las pautas de diseño del sistema
- Interfaz responsive que se adapta a diferentes dispositivos
- Botones llamativos con efectos hover y transiciones suaves
- Colores consistentes con el sistema de diseño HJM

## Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
```

## Configuración

La aplicación se ejecuta en el puerto 3002 por defecto. Las URLs de los módulos están configuradas como:

- MAU: `/hjm/mau`
- CAGPU: `/hjm/cagpu`

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (iconos)
