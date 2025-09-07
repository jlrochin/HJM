import { z } from 'zod'

// ============================================================================
// ESQUEMAS DE VALIDACIÓN CON ZOD
// ============================================================================
// Validación robusta de entrada para todas las APIs
// ============================================================================

// Esquema para login
export const loginSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  password: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
})

// Esquema para creación de usuarios
export const createUserSchema = z.object({
  username: z.string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(50, 'El nombre de usuario no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'),
  email: z.string()
    .email('El email debe tener un formato válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  password: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/^(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/^(?=.*\d)/, 'La contraseña debe contener al menos un número')
    .regex(/^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 'La contraseña debe contener al menos un símbolo especial'),
  role: z.enum(['user', 'admin', 'service_user', 'developer']).default('user'),
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
    .optional(),
  department: z.string()
    .max(100, 'El departamento no puede exceder 100 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'El teléfono debe tener un formato válido')
    .optional(),
  serviceId: z.string()
    .max(50, 'El ID de servicio no puede exceder 50 caracteres')
    .optional()
})

// Esquema para actualización de usuarios
export const updateUserSchema = z.object({
  firstName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .optional(),
  lastName: z.string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El apellido solo puede contener letras y espacios')
    .optional(),
  department: z.string()
    .max(100, 'El departamento no puede exceder 100 caracteres')
    .optional(),
  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]{7,20}$/, 'El teléfono debe tener un formato válido')
    .optional(),
  email: z.string()
    .email('El email debe tener un formato válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .optional(),
  password: z.string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .max(128, 'La contraseña no puede exceder 128 caracteres')
    .regex(/^(?=.*[a-z])/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/^(?=.*[A-Z])/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/^(?=.*\d)/, 'La contraseña debe contener al menos un número')
    .regex(/^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 'La contraseña debe contener al menos un símbolo especial')
    .optional()
})

// Esquema para servicios
export const serviceSchema = z.object({
  id: z.string()
    .min(1, 'El ID del servicio es requerido')
    .max(50, 'El ID del servicio no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El ID solo puede contener letras, números, guiones y guiones bajos'),
  directionId: z.string()
    .min(1, 'El ID de dirección es requerido')
    .max(50, 'El ID de dirección no puede exceder 50 caracteres'),
  name: z.string()
    .min(3, 'El nombre del servicio debe tener al menos 3 caracteres')
    .max(100, 'El nombre del servicio no puede exceder 100 caracteres'),
  responsiblePerson: z.string()
    .max(100, 'El responsable no puede exceder 100 caracteres')
    .optional(),
  phoneExtension: z.string()
    .regex(/^[0-9]{1,10}$/, 'La extensión debe ser un número de hasta 10 dígitos')
    .optional(),
  serviceType: z.string()
    .max(50, 'El tipo de servicio no puede exceder 50 caracteres')
    .optional(),
  location: z.string()
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .optional(),
  description: z.string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional()
})

// Esquema para direcciones
export const directionSchema = z.object({
  id: z.string()
    .min(1, 'El ID de dirección es requerido')
    .max(50, 'El ID de dirección no puede exceder 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El ID solo puede contener letras, números, guiones y guiones bajos'),
  name: z.string()
    .min(3, 'El nombre de dirección debe tener al menos 3 caracteres')
    .max(100, 'El nombre de dirección no puede exceder 100 caracteres'),
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  displayOrder: z.number()
    .int('El orden de visualización debe ser un número entero')
    .min(0, 'El orden de visualización debe ser mayor o igual a 0')
    .optional()
})

// Esquema para paginación
export const paginationSchema = z.object({
  page: z.coerce.number()
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor a 0')
    .default(1),
  limit: z.coerce.number()
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor a 0')
    .max(100, 'El límite no puede exceder 100')
    .default(10)
})

// Esquema para búsqueda
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'El término de búsqueda es requerido')
    .max(100, 'El término de búsqueda no puede exceder 100 caracteres')
    .trim()
})

// Función helper para validar datos
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Error de validación desconocido'] }
  }
}

// Función helper para validar datos de forma segura
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

// Función específica para validar datos de servicios
export function validateServiceData(data: unknown): { isValid: boolean; errors?: string[]; data?: any } {
  const result = validateData(serviceSchema, data)
  if (result.success) {
    return { isValid: true, data: result.data }
  } else {
    return { isValid: false, errors: result.errors }
  }
} 