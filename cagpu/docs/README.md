# Sistema CAGPU - Catálogo de Atención Generalizada

// ============================================================================
// DESCRIPCIÓN DEL PROYECTO
// ============================================================================
// Sistema completo de gestión para el Catálogo de Atención Generalizada
// a la Población Usuaria (CAGPU). Incluye gestión de usuarios, servicios,
// direcciones y documentación completa del sistema.
// ============================================================================

Sistema de gestión de usuarios, servicios y direcciones construido con **Next.js 14**, **React**, **TypeScript** y **Prisma**.

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd cagpu

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones

# Ejecutar migraciones de base de datos
npx prisma migrate dev

# Iniciar servidor de desarrollo
pnpm dev
```

### Comandos Útiles

```bash
# ============================================================================
# DESARROLLO Y PRODUCCIÓN
# ============================================================================
pnpm dev                    # Servidor de desarrollo
pnpm build                  # Construir para producción
pnpm start                  # Servidor de producción

# ============================================================================
# BASE DE DATOS
# ============================================================================
npx prisma studio          # Interfaz visual de base de datos
npx prisma migrate dev     # Ejecutar migraciones
npx prisma generate        # Generar cliente Prisma

# ============================================================================
# TESTING Y CALIDAD DE CÓDIGO
# ============================================================================
pnpm test                  # Ejecutar tests
pnpm test:watch           # Tests en modo watch
pnpm lint                  # Verificación de código
```

## 📚 Documentación del Sistema

**La documentación completa del sistema está disponible en la aplicación web:**

- **URL**: `http://localhost:3000/documentacion` ✅ **FUNCIONANDO**
- **Acceso**: Desde el header principal (ícono de libro)
- **Navegación**: Sidebar lateral con todas las secciones
- **Estado**: Completamente funcional y accesible

### Secciones de Documentación Disponibles

1. **Arquitectura del Sistema** - Estructura, tecnologías y patrones de diseño
2. **Base de Datos** - Esquema, modelos y optimización de consultas
3. **Autenticación y Autorización** - Seguridad, permisos y roles
4. **API y Endpoints** - Endpoints disponibles y validaciones
5. **Componentes de la Interfaz** - Sistema de diseño y componentes reutilizables
6. **Páginas y Rutas** - Estructura de navegación y enrutamiento
7. **Estado y Gestión de Datos** - Hooks personalizados y contexto
8. **Utilidades y Helpers** - Funciones auxiliares y helpers
9. **Despliegue y Configuración** - CI/CD y configuración de servidores
10. **Mantenimiento y Operaciones** - Scripts de mantenimiento y operaciones

## 🏗️ Arquitectura del Sistema

// ============================================================================
// STACK TECNOLÓGICO
// ============================================================================
// El sistema está construido con tecnologías modernas y robustas
// que garantizan escalabilidad, mantenibilidad y rendimiento
// ============================================================================

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT, bcrypt para hash de contraseñas
- **Deployment**: Railway, Vercel, o servidores tradicionales

## 📁 Estructura del Proyecto

```
cagpu/
├── app/                    # App Router de Next.js 14
│   ├── api/               # Endpoints de la API
│   ├── components/         # Componentes de la aplicación
│   ├── documentacion/      # Sistema de documentación
│   └── ...                 # Otras rutas de la aplicación
├── components/             # Componentes React reutilizables
│   ├── ui/                # Componentes de interfaz base
│   └── ...                # Componentes específicos
├── lib/                    # Utilidades y configuración
├── prisma/                 # Esquema y migraciones de base de datos
├── scripts/                # Scripts de mantenimiento y utilidades
├── hooks/                  # Hooks personalizados de React
├── documentación/          # Documentación completa del sistema
└── README.md               # Este archivo
```

## 🔧 Características Principales

// ============================================================================
// FUNCIONALIDADES DEL SISTEMA
// ============================================================================
// El sistema incluye todas las funcionalidades necesarias para
// la gestión completa de un catálogo de servicios
// ============================================================================

- ✅ **Autenticación y autorización robusta** - Sistema de roles y permisos
- ✅ **Gestión completa de usuarios y roles** - CRUD de usuarios y administración
- ✅ **Sistema de notificaciones** - Notificaciones en tiempo real
- ✅ **Auditoría y logging** - Registro completo de cambios y acciones
- ✅ **Interfaz responsive y accesible** - Diseño adaptativo y accesible
- ✅ **API RESTful documentada** - Endpoints bien documentados y validados
- ✅ **Base de datos optimizada** - Esquema optimizado con Prisma
- ✅ **Scripts de mantenimiento automático** - Automatización de tareas

## 📖 Acceso a la Documentación Detallada

Para acceder a la documentación completa del sistema:

1. **Inicia el servidor de desarrollo**: `pnpm dev`
2. **Abre tu navegador en**: `http://localhost:3000`
3. **Haz clic en el ícono de libro** 📚 en el header principal
4. **Navega por las diferentes secciones** usando el sidebar lateral
5. **URL directa**: `http://localhost:3000/documentacion`

## 🤝 Contribución al Proyecto

// ============================================================================
// PROCESO DE CONTRIBUCIÓN
// ============================================================================
// Para mantener la calidad del código y facilitar la colaboración,
// seguimos un proceso estandarizado de contribución
// ============================================================================

1. **Crear branch desde `main`** - Usar nombres descriptivos
2. **Implementar cambios** - Seguir estándares de código
3. **Ejecutar tests y linting** - Verificar calidad del código
4. **Crear Pull Request** - Con descripción detallada
5. **Revisión de código** - Revisión por pares obligatoria
6. **Merge a `main`** - Solo después de aprobación

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

**Última actualización**: Diciembre 2024  
**Versión del sistema**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo CAGPU  
**Estado del proyecto**: ✅ Activo y en desarrollo
