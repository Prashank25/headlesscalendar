import { startOfWeek, endOfWeek, fillDatesBetween } from '../internals/dates'

export const monthMatrix = {
  name: 'monthMatrix',

  dates (cursorDate, weekStartsFrom) {
    const year = cursorDate.getFullYear()
    const month = cursorDate.getMonth()

    const firstDay = startOfWeek(new Date(year, month, 1), weekStartsFrom)
    const lastDay = endOfWeek(new Date(year, month + 1, 0), weekStartsFrom)

    return fillDatesBetween(firstDay, lastDay)
  },

  adjustBy (cursorDate, adjustment) {
    const date = new Date(cursorDate)

    date.setDate(1)
    date.setMonth(date.getMonth() + adjustment)

    return date
  },
}
