import { startOfWeek, endOfWeek, fillDatesBetween } from '../internals/dates'

export const weekMatrix = {
  name: 'weekMatrix',

  dates (cursorDate, weekStartsFrom) {
    const firstDay = startOfWeek(cursorDate, weekStartsFrom)
    const lastDay = endOfWeek(cursorDate, weekStartsFrom)

    return fillDatesBetween(firstDay, lastDay)
  },

  adjustBy (cursorDate, adjustment) {
    const date = new Date(cursorDate)

    date.setDate(date.getDate() + (7 * adjustment))

    return date
  },
}
