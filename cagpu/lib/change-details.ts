export function generateUserChangeDetails(oldUser: any, newUser: any): string {
  const changes: string[] = [];
  
  // Mapeo de campos a nombres legibles en español
  const fieldLabels: Record<string, string> = {
    username: 'nombre de usuario',
    email: 'correo electrónico', 
    role: 'rol',
    firstName: 'nombre',
    lastName: 'apellido',
    department: 'departamento',
    phone: 'teléfono',
    passwordHash: 'contraseña'
  };

  // Mapeo de roles a español
  const roleLabels: Record<string, string> = {
    admin: 'administrador',
    user: 'usuario'
  };

  // Comparar cada campo
  Object.keys(newUser).forEach(key => {
    if (key === 'passwordHash' || key === 'password') {
      // Para contraseña, solo indicar que cambió sin mostrar valores
      if (newUser[key] && newUser[key] !== oldUser[key]) {
        changes.push('contraseña actualizada');
      }
      return;
    }

    if (oldUser[key] !== newUser[key] && newUser[key] !== undefined) {
      const fieldName = fieldLabels[key] || key;
      let oldValue = oldUser[key] || '(vacío)';
      let newValue = newUser[key] || '(vacío)';
      
      // Traducir roles si es necesario
      if (key === 'role') {
        oldValue = roleLabels[oldValue] || oldValue;
        newValue = roleLabels[newValue] || newValue;
      }
      
      changes.push(`${fieldName}: "${oldValue}" → "${newValue}"`);
    }
  });

  if (changes.length === 0) {
    return 'Sin cambios detectados';
  }

  return changes.join(', ');
}

export function generateServiceChangeDetails(action: 'create' | 'update', serviceName: string, directionName: string, oldService?: any, newService?: any): string {
  if (action === 'create') {
    return `Nuevo servicio "${serviceName}" creado en ${directionName}`;
  }

  if (!oldService || !newService) {
    return `Servicio "${serviceName}" actualizado`;
  }

  const changes: string[] = [];
  
  // Mapeo de campos a nombres legibles
  const fieldLabels: Record<string, string> = {
    name: 'nombre del servicio',
    responsiblePerson: 'persona responsable',
    phoneExtension: 'extensión telefónica',
    serviceType: 'tipo de servicio',
    location: 'ubicación',
    description: 'descripción',
    directionId: 'dirección asignada',
    isActive: 'estado del servicio'
  };

  // Mapeo de tipos de servicio más completo
  const serviceTypeLabels: Record<string, string> = {
    clinical: 'Clínico',
    administrative: 'Administrativo',
    support: 'Apoyo',
    specialized: 'Especializado',
    'Unidad': 'Unidad',
    'División': 'División',
    'Servicio': 'Servicio',
    'Departamento': 'Departamento',
    'Subdirección': 'Subdirección',
    'Coordinación': 'Coordinación',
    'Área': 'Área',
    'Laboratorio': 'Laboratorio'
  };

  // Mapeo de direcciones para mostrar nombres más legibles
  const directionLabels: Record<string, string> = {
    'DIRECCION_GENERAL': 'Dirección General',
    'DIRECCION_MEDICA': 'Dirección Médica',
    'DIRECCION_INVESTIGACION_ENSENANZA': 'Dirección de Investigación y Enseñanza',
    'DIRECCION_DESARROLLO_VINCULACION_INSTITUCIONAL': 'Dirección de Desarrollo y Vinculación Institucional',
    'DIRECCION_ADMINISTRACION': 'Dirección de Administración',
    'DIRECCION_ENFERMERIA': 'Dirección de Enfermería'
  };

  // Comparar campos relevantes, incluyendo directionId
  const fieldsToCheck = ['name', 'responsiblePerson', 'phoneExtension', 'serviceType', 'location', 'description', 'directionId', 'isActive'];
  
  fieldsToCheck.forEach(key => {
    const oldValue = oldService[key];
    const newValue = newService[key];
    
    // Solo reportar cambios si realmente hay diferencia
    if (oldValue !== newValue) {
      const fieldName = fieldLabels[key] || key;
      
      // Formatear valores para mejor legibilidad
      let oldDisplayValue = oldValue;
      let newDisplayValue = newValue;
      
      // Manejar valores vacíos o nulos
      if (oldValue === null || oldValue === undefined || oldValue === '') {
        oldDisplayValue = '(no especificado)';
      }
      
      if (newValue === null || newValue === undefined || newValue === '') {
        newDisplayValue = '(no especificado)';
      }
      
      // Formatear según el tipo de campo
      if (key === 'serviceType') {
        oldDisplayValue = serviceTypeLabels[oldValue] || oldValue;
        newDisplayValue = serviceTypeLabels[newValue] || newValue;
      }
      
      if (key === 'directionId') {
        oldDisplayValue = directionLabels[oldValue] || oldValue;
        newDisplayValue = directionLabels[newValue] || newValue;
      }
      
      if (key === 'isActive') {
        oldDisplayValue = oldValue ? 'Activo' : 'Inactivo';
        newDisplayValue = newValue ? 'Activo' : 'Inactivo';
      }
      
      // Agregar el cambio con formato mejorado
      changes.push(`${fieldName}: "${oldDisplayValue}" → "${newDisplayValue}"`);
    }
  });

  if (changes.length === 0) {
    return `Servicio "${serviceName}" actualizado sin cambios en los campos principales`;
  }

  // Limitar la longitud para evitar mensajes muy largos
  const changeText = changes.join(', ');
  if (changeText.length > 200) {
    return `Servicio "${serviceName}" actualizado: ${changes.length} campo(s) modificado(s)`;
  }

  return `Servicio "${serviceName}" actualizado: ${changeText}`;
} 