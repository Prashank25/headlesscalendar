import { monthMatrix as matrix } from './monthMatrix'
import { dayName } from '../test-utils/dayName'

describe('generate dates', () => {
  it(
    'can generate a list of dates for a month from the start of week of previous month to end of week of next month',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 23), 1)

      expect(dates[0].toString()).toBe(
        new Date(2022, 1, 28).toString(),
      )
      expect(dayName(dates[0])).toBe('monday')
      expect(dates.length).toBe(35)
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 3, 3).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('sunday')
    },
  )

  it(
    'can get list of dates for a whole month from previous sunday and last saturday',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 23), 0)

      expect(dates[0].toString()).toBe(
        new Date(2022, 1, 27).toString(),
      )
      expect(dayName(dates[0])).toBe('sunday')
      expect(dates.length).toBe(35)
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 3, 2).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('saturday')
    },
  )

  it(
    'can get list of dates for a whole month from previous saturday and last friday',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 20), 6)

      expect(dates[0].toString()).toBe(
        new Date(2022, 1, 26).toString(),
      )
      expect(dayName(dates[0])).toBe('saturday')
      expect(dates.length).toBe(35)
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 3, 1).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('friday')
    },
  )
})

describe('adjust date', () => {
  it(
    'adding a month to 31st of current month does not skip a month and sets the cursor to first of next month',
    () => {
      const cursor = new Date(2022, 0, 31)

      const adjusted = matrix.adjustBy(cursor, +1)

      expect(adjusted.toString()).toBe(new Date(2022, 1, 1).toString())
    },
  )

  it('can add 1 month to cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, +1)

    expect(adjusted.toString()).toBe(new Date(2022, 3, 1).toString())
  })

  it('can add multiple months to cursor date', () => {
    const cursor = new Date(2022, 0, 23)

    const adjusted = matrix.adjustBy(cursor, +13)

    expect(adjusted.toString()).toBe(new Date(2023, 1, 1).toString())
  })

  it('can subtract 1 month from cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, -1)

    expect(adjusted.toString()).toBe(new Date(2022, 1, 1).toString())
  })

  it('can subtract multiple months from cursor date', () => {
    const cursor = new Date(2022, 0, 23)

    const adjusted = matrix.adjustBy(cursor, -13)

    expect(adjusted.toString()).toBe(new Date(2020, 11, 1).toString())
  })
})
