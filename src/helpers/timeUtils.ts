import { format, parseISO, differenceInMinutes, startOfDay, addMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

export const getCurrentTimeInZone = (timeZone: string | undefined): Date => {
  if (!timeZone) {
    console.warn('No timezone provided, returning local time.')
    return new Date()
  }

  try {
    return toZonedTime(new Date(), timeZone)
  } catch (e) {
    console.error('Invalid timezone provided:', timeZone, e)
    return new Date()
  }
}

export const formatTime = (date: Date | null | undefined): string => {
  if (!date) return ''
  try {
    return format(date, 'HH:mm')
  } catch (e) {
    console.error('Error formatting time:', date, e)
    return 'Invalid Date'
  }
}

export const formatDate = (date: Date | null | undefined): string => {
  if (!date) return ''
  try {
    return format(date, 'yyyy-MM-dd')
  } catch (e) {
    console.error('Error formatting date:', date, e)
    return 'Invalid Date'
  }
}

export const timeToMinutes = (timeString: string | undefined | null): number => {
  if (!timeString || !timeString.includes(':')) return 0
  try {
    const [hours, minutes] = timeString.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return 0
    return hours * 60 + minutes
  } catch (e) {
    console.error('Error parsing time string:', timeString, e)
    return 0
  }
}

export const parseZonedISO = (
  isoString: string | undefined | null,
  timeZone: string | undefined,
): Date | null => {
  if (!isoString || !timeZone) return null
  try {
    const utcDate = parseISO(isoString)
    return toZonedTime(utcDate, timeZone)
  } catch (e) {
    console.error('Error parsing zoned ISO:', isoString, timeZone, e)
    return null
  }
}

export const generateTimeSlots = (
  openingTime: string,
  closingTime: string,
  intervalMinutes: number = 30,
): string[] => {
  const slots: string[] = []
  const startMinutes = timeToMinutes(openingTime)
  const endMinutes = timeToMinutes(closingTime)

  if (endMinutes <= startMinutes) {
    console.warn(
      `Closing time ${closingTime} is not after opening time ${openingTime}. Assuming single day operation.`,
    )
  }

  const adjustedEndMinutes = endMinutes > startMinutes ? endMinutes : endMinutes + 24 * 60

  for (let minutes = startMinutes; minutes < adjustedEndMinutes; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60) % 24
    const mins = minutes % 60
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
  }
  return slots
}

interface EventTimingResult {
  startMinute: number
  durationMinutes: number
}

export const calculateEventTimings = (
  startTimeISO: string | undefined | null,
  endTimeISO: string | undefined | null,
  timeZone: string | undefined,
  dayOpeningTimeMinutes: number,
): EventTimingResult => {
  const start = parseZonedISO(startTimeISO, timeZone)
  const end = parseZonedISO(endTimeISO, timeZone)

  if (!start || !end || !timeZone) return { startMinute: 0, durationMinutes: 0 }

  try {
    const startOfDayInZone = startOfDay(start)
    const openingTimeDate = addMinutes(startOfDayInZone, dayOpeningTimeMinutes)

    const startMinute = differenceInMinutes(start, openingTimeDate)
    const durationMinutes = differenceInMinutes(end, start)
    return {
      startMinute: Math.max(0, startMinute),
      durationMinutes: Math.max(1, durationMinutes),
    }
  } catch (e) {
    console.error('Error calculating event timings:', { startTimeISO, endTimeISO, timeZone }, e)
    return { startMinute: 0, durationMinutes: 0 }
  }
}
