import { weekMatrix as matrix } from './weekMatrix'
import { dayName } from '../test-utils/dayName'

describe('generate dates', () => {
  it(
    'can generate a list of dates for the week in the cursor date, starting the week from monday',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 23), 1)

      expect(dates.length).toBe(7)
      expect(dates[0].toString()).toBe(
        new Date(2022, 2, 21).toString(),
      )
      expect(dayName(dates[0])).toBe('monday')
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 2, 27).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('sunday')
    },
  )

  it(
    'can generate a list of dates for the week in the cursor date, starting the week from sunday',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 23), 0)

      expect(dates.length).toBe(7)
      expect(dates[0].toString()).toBe(
        new Date(2022, 2, 20).toString(),
      )
      expect(dayName(dates[0])).toBe('sunday')
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 2, 26).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('saturday')
    },
  )

  it(
    'can generate a list of dates for the week in the cursor date, starting the week from saturday',
    () => {
      const dates = matrix.dates(new Date(2022, 2, 23), 6)

      expect(dates.length).toBe(7)
      expect(dates[0].toString()).toBe(
        new Date(2022, 2, 19).toString(),
      )
      expect(dayName(dates[0])).toBe('saturday')
      expect(dates[dates.length - 1].toString()).toBe(
        new Date(2022, 2, 25).toString(),
      )
      expect(dayName(dates[dates.length - 1])).toBe('friday')
    },
  )
})

describe('adjust date', () => {
  it('can add 1 week to cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, +1)

    expect(adjusted.toString()).toBe(new Date(2022, 2, 30).toString())
  })

  it('can add multiple weeks to cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, +3)

    expect(adjusted.toString()).toBe(new Date(2022, 3, 13).toString())
  })

  it('can subtract 1 week from cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, -1)

    expect(adjusted.toString()).toBe(new Date(2022, 2, 16).toString())
  })

  it('can subtract multiple weeks from cursor date', () => {
    const cursor = new Date(2022, 0, 23)

    const adjusted = matrix.adjustBy(cursor, -3)

    expect(adjusted.toString()).toBe(new Date(2022, 0, 2).toString())
  })
})

