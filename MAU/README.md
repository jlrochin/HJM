# 🏥 MAU Hospital - Sistema de Gestión Hospitalaria

Sistema integral de gestión hospitalaria desarrollado con Django (Backend) y Vue.js (Frontend), diseñado para optimizar los procesos médicos y administrativos de instituciones de salud.

## ✨ Características Principales

### 🔐 **Gestión de Usuarios y Autenticación**

- Sistema de autenticación JWT
- Roles y permisos diferenciados
- Panel de administración personalizado

### 👥 **Gestión de Pacientes**

- Registro completo de pacientes con campos separados (nombre, apellido paterno, apellido materno)
- Historial médico completo
- Búsqueda avanzada con filtros múltiples
- Verificación de duplicados automática

### 📋 **Sistema de Prescripciones**

- Creación y gestión de recetas médicas
- Integración con catálogo CIE-10 oficial de México
- Flujo de validación y dispensación
- Seguimiento de estado de recetas

### 💊 **Gestión de Medicamentos e Inventario**

- Control de stock en tiempo real
- Gestión de lotes y fechas de caducidad
- Alertas automáticas de inventario bajo
- Trazabilidad completa de medicamentos

### 🏥 **Módulos Especializados**

- **CMI (Centro de Mezclas Intravenosas)**: Preparación de mezclas parenterales
- **Farmacia**: Dispensación de medicamentos
- **Validación**: Revisión y aprobación de prescripciones
- **Auditoría**: Registro completo de actividades del sistema

### 📊 **Reportes y Analytics**

- Dashboard ejecutivo con métricas clave
- Reportes personalizables
- Exportación de datos en múltiples formatos
- Análisis de tendencias y patrones

## 🛠️ Tecnologías Utilizadas

### **Backend**

- **Django 4.2.7** - Framework web robusto y escalable
- **Django REST Framework** - API REST completa
- **SQLite/PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación segura
- **Python 3.13** - Lenguaje de programación

### **Frontend**

- **Vue.js 3** - Framework progresivo de JavaScript
- **Vue Router** - Enrutamiento de aplicaciones
- **Vuex/Pinia** - Gestión de estado
- **Tailwind CSS** - Framework CSS utilitario
- **Vite** - Herramienta de construcción rápida

### **Características Técnicas**

- **Arquitectura SPA** - Aplicación de página única
- **Responsive Design** - Compatible con todos los dispositivos
- **PWA Ready** - Preparado para aplicación web progresiva
- **API REST** - Interfaz de programación estandarizada

## 🚀 Instalación y Configuración

### **Prerrequisitos**

- Python 3.11+
- Node.js 18+
- npm o yarn
- Git

### **1. Clonar el Repositorio**

```bash
git clone https://github.com/tu-usuario/mau-hospital.git
cd mau-hospital
```

### **2. Configurar Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### **3. Configurar Frontend**

```bash
cd frontend
npm install
npm run dev
```

### **4. Cargar Datos Iniciales (Opcional)**

```bash
cd backend
python manage.py load_cie10_mexico
python manage.py load_cie10_extended
```

## �� Estructura del Proyecto

```
MAU/
├── backend/                 # Aplicación Django
│   ├── apps/               # Módulos de la aplicación
│   │   ├── authentication/ # Autenticación y usuarios
│   │   ├── patients/       # Gestión de pacientes
│   │   ├── prescriptions/  # Sistema de prescripciones
│   │   ├── inventory/      # Control de inventario
│   │   ├── reports/        # Reportes y analytics
│   │   └── notifications/  # Sistema de notificaciones
│   ├── mau_hospital/       # Configuración principal
│   └── manage.py           # Script de gestión Django
├── frontend/               # Aplicación Vue.js
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── views/          # Páginas principales
│   │   ├── router/         # Configuración de rutas
│   │   ├── stores/         # Gestión de estado
│   │   └── services/       # Servicios y APIs
│   └── package.json
└── README.md
```

## 🔧 Configuración del Entorno

### **Variables de Entorno**

Crear archivo `.env` en el directorio `backend/`:

```env
DEBUG=True
SECRET_KEY=tu-clave-secreta-aqui
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### **Configuración de Base de Datos**

El sistema está configurado para usar SQLite por defecto. Para producción, se recomienda PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mau_hospital',
        'USER': 'tu_usuario',
        'PASSWORD': 'tu_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📱 Uso del Sistema

### **Acceso Inicial**

1. Navegar a `http://localhost:3000`
2. Iniciar sesión con las credenciales del superusuario
3. Comenzar a registrar pacientes y crear prescripciones

### **Flujo de Trabajo Típico**

1. **Registro de Paciente** → Crear nuevo paciente con datos completos
2. **Crear Prescripción** → Asignar medicamentos y dosis
3. **Validación** → Revisar y aprobar la prescripción
4. **Dispensación** → Preparar y entregar medicamentos
5. **Seguimiento** → Monitorear estado y generar reportes

## 🧪 Pruebas

### **Backend**

```bash
cd backend
python manage.py test
```

### **Frontend**

```bash
cd frontend
npm run test
```

## 📦 Despliegue

### **Despliegue Manual**

1. Configurar servidor web (Nginx/Apache)
2. Configurar base de datos de producción
3. Ejecutar `python manage.py collectstatic`
4. Configurar variables de entorno de producción

## 🤝 Contribución

**IMPORTANTE**: Este es software propietario de MAU Hospital.

**NO SE PERMITEN** contribuciones externas sin autorización previa.

Para solicitar permisos de contribución o colaboración:

- **Email**: legal@mauhospital.com
- **Proceso**: Solicitud formal por escrito con propuesta detallada
- **Evaluación**: Revisión interna por el equipo de MAU Hospital
- **Aprobación**: Permiso expreso requerido para cualquier modificación

**Prohibida** la distribución, modificación o uso comercial sin autorización.

## 📄 Licencia

Este proyecto es **SOFTWARE PROPIETARIO** de MAU Hospital. Todos los derechos reservados.

**PROHIBIDO** el uso, copia, modificación, distribución, publicación, sublicencia y/o venta
sin permiso expreso por escrito de MAU Hospital.

Para solicitar permisos de uso, contactar a: legal@mauhospital.com

Ver el archivo `LICENSE` para los términos completos de la licencia.

## 👨‍💻 Equipo de Desarrollo

- **Desarrollador Principal**: [Tu Nombre]
- **Contribuidores**: [Lista de contribuidores]

## 📞 Soporte

- **Email**: soporte@mauhospital.com
- **Documentación**: [Enlace a documentación]
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/mau-hospital/issues)

## 🔄 Changelog

### **v1.0.0** (Agosto 2025)

- ✅ Sistema base completo
- ✅ Gestión de pacientes con campos separados
- ✅ Catálogo CIE-10 oficial de México
- ✅ Sistema de prescripciones completo
- ✅ Módulos CMI y Farmacia
- ✅ Panel de administración personalizado
- ✅ API REST completa
- ✅ Frontend responsive con Vue.js

---

**MAU Hospital** - Transformando la gestión hospitalaria con tecnología moderna y eficiente. 🏥✨
