import { tap } from './utils'

export function adjustDays (date, days) {
  return tap(new Date(date), (d) => d.setDate(d.getDate() + days))
}

export function fillDatesBetween (start, end) {
  const dates = [start]

  const compact = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
  }

  let day = new Date(start)
  let dayCompact = compact(day)
  const endCompact = compact(end)
  while (dayCompact < endCompact) {
    day = adjustDays(day, +1)
    dayCompact = compact(day)

    dates.push(day)
  }

  return dates
}

export function startOfWeek (date, startFrom) {
  date = new Date(date)
  const day = date.getDay()
  const subDays = 7 - (7 - (day - startFrom))
  if (subDays < 7) {
    const adjustedSubDays = subDays < 0 ? (7 + subDays) : subDays
    date.setDate(date.getDate() - adjustedSubDays)
  }

  return date
}

export function endOfWeek (date, startFrom) {
  date = new Date(date)
  const day = date.getDay()
  // current day is 3, start day is Monday which is 1
  // subtract 1 from 3 which gives us 2 (Tuesday)
  // add 1 cuz week starts from 0, which gives us 3
  // subtract 3 from 7 to get 4 which is the number of days we
  // need to add to current day 3 to get 7 which completes the week.
  const addDays = 7 - ((day - startFrom) + 1)
  // adjust the days, so it's always less than a week.
  const adjustedAddDays = addDays >= 7 ? addDays - 7 : addDays
  date.setDate(date.getDate() + adjustedAddDays)

  return date
}
