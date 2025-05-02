export interface Restaurant {
  id: number
  timezone: string
  restaurant_name: string
  opening_time: string
  closing_time: string
}

export interface Order {
  id: string
  status: 'New' | 'Bill' | 'Closed' | 'Banquet' | string
  start_time: string // ISO 8601 format "2025-04-04T12:32:47.885000+10:00"
  end_time: string // ISO 8601 format
}

export interface Reservation {
  id: number
  name_for_reservation?: string
  num_people: number
  phone_number?: string
  status: 'Живая очередь' | 'Новая' | 'Заявка' | 'Открыт' | 'Закрыт' | string
  seating_time: string // ISO 8601 format
  end_time: string // ISO 8601 format
}

export interface Table {
  id: string
  capacity: number
  number: string
  zone: string
  orders: Order[]
  reservations: Reservation[]
}

export interface BookingData {
  available_days: string[]
  current_day: string
  restaurant: Restaurant
  tables: Table[]
}


export interface BookingEventData {
  uniqueId: string
  type: 'order' | 'reservation'
  status: string
  startMinute: number
  durationMinutes: number
  displayName: string
  start_time?: string
  end_time?: string
  seating_time?: string
  num_people?: number
  phone_number?: string
  name_for_reservation?: string
  originalId: string
}

export interface ZoomLevel {
  cellWidth: number
  cellHeight: number
}

export interface LayoutBookingEventData extends BookingEventData {
  layoutColumn: number
  layoutTotalColumns: number
  isIntersect: boolean
  intersectionColumns: number
}
