import axios, { type AxiosResponse } from 'axios'
import type { BookingData } from '@/types/booking'

const API_BASE_URL = 'https://hh.frontend.ark.software/api/booking'

export const fetchBookingData = async (date: string): Promise<BookingData> => {
  const selectedDate = new Date(date)
  try {
    const response: AxiosResponse<BookingData> = await axios.get(`${API_BASE_URL}`)
    if (response.data && Array.isArray(response.data.tables) && response.data.restaurant) {
      response.data.tables.forEach((table) => {
        table.orders = table.orders || []
        table.reservations = table.reservations || []
        table.orders = table.orders.filter(({ start_time }) => {
          const orderDate = new Date(start_time)
          return (
            orderDate.getDate() === selectedDate.getDate() &&
            orderDate.getMonth() === selectedDate.getMonth()
          )
        })
        table.reservations = table.reservations.filter(({ seating_time }) => {
          const reservationDate = new Date(seating_time)
          return (
            reservationDate.getDate() === selectedDate.getDate() &&
            reservationDate.getMonth() === selectedDate.getMonth()
          )
        })
      })
      return response.data
    } else {
      console.error('Invalid data structure received:', response.data)
      throw new Error('Invalid data structure received from API.')
    }
  } catch (error) {
    console.error(`Error fetching booking data for date ${date}:`, error)
    throw error
  }
}
