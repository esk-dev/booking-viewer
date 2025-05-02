import { format, isToday, isTomorrow, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale/ru'

export const formatDateForButton = (dateString: string): string => {
  try {
    const date = parseISO(dateString)
    if (!isValid(date)) return dateString

    const primary = format(date, 'd MMMM', { locale: ru })
    let secondary = ''

    if (isToday(date)) {
      secondary = 'сегодня'
    } else if (isTomorrow(date)) {
      secondary = 'завтра'
    } else {
      secondary = format(date, 'EEEE', { locale: ru })
    }

    secondary = secondary.charAt(0).toUpperCase() + secondary.slice(1)

    return `${primary}<br/><span class="secondary-line">${secondary}</span>`
  } catch (e) {
    console.error('Error formatting date:', dateString, e)
    return dateString
  }
}
