export const dayMatrix = {
  name: 'dayMatrix',

  dates (cursorDate) {
    return [cursorDate]
  },

  adjustBy (cursorDate, adjustment) {
    const date = new Date(cursorDate)

    date.setDate(date.getDate() + adjustment)

    return date
  },
}
