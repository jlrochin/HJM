export interface Direction {
  id: string
  name: string
  description: string
  servicesCount: number
}

export interface Service {
  id: string
  directionId: string
  name: string
  responsiblePerson: string
  phoneExtension: string
  serviceType: string
  location: string
  description: string
}

export interface ChangeRecord {
  id: string
  field: string
  previousValue: string
  newValue: string
  timestamp: string
  user: string
}
