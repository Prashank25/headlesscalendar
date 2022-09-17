import { adjustDays, fillDatesBetween } from './dates'

describe('adjustDays', () => {
  it('can add 1 day to a date', () => {
    const date = new Date(2022, 3, 2)

    const adjusted = adjustDays(date, +1)

    expect(adjusted.toString()).toBe(new Date(2022, 3, 3).toString())
  })

  it('can add more than 2 months worth of days to a date', () => {
    const date = new Date(2022, 3, 1)

    const adjusted = adjustDays(date, +70)

    expect(adjusted.toString()).toBe(new Date(2022, 5, 10).toString())
  })

  it('can subtract 1 day from a date', () => {
    const date = new Date(2022, 3, 2)

    const adjusted = adjustDays(date, -1)

    expect(adjusted.toString()).toBe(new Date(2022, 3, 1).toString())
  })

  it('can subtract more than 2 months worth of days from a date', () => {
    const date = new Date(2022, 3, 1)

    const adjusted = adjustDays(date, -70)

    expect(adjusted.toString()).toBe(new Date(2022, 0, 21).toString())
  })
})

describe('fillDatesBetween', () => {
  it('can fill dates between 2 dates 1 day apart', () => {
    const start = adjustDays(new Date(), -1)
    const end = adjustDays(new Date(), +1)

    const range = fillDatesBetween(start, end)

    expect(range).toHaveLength(3)
    expect(range[0].toString()).toBe(start.toString())
    expect(range[1].toString()).toBe(new Date().toString())
    expect(range[2].toString()).toBe(end.toString())
  })

  it('can fill dates between 2 dates 31 days apart', () => {
    const date = new Date(2022, 2, 15)
    const start = adjustDays(date, -15)
    const end = adjustDays(date, +15)

    const range = fillDatesBetween(start, end)

    expect(range).toHaveLength(31)
    expect(range[0].toString()).toBe(
      new Date(2022, 1, 28).toString(),
    )
    expect(range.at(-1).toString()).toBe(
      new Date(2022, 2, 30).toString(),
    )
  })

  it('can fill dates between 2 dates 5 years and change apart', () => {
    const date = new Date(2022, 2, 15)
    const start = adjustDays(date, -950)
    const end = adjustDays(date, +950)

    const range = fillDatesBetween(start, end)

    expect(range).toHaveLength(1901)
    expect(range[0].toString()).toBe(
      new Date(2019, 7, 8).toString(),
    )
    expect(range.at(-1).toString()).toBe(
      new Date(2024, 9, 20).toString(),
    )
  })

  it('returns only the start date when start and end are the same date', () => {
    const start = new Date()
    start.setHours(1)
    const end = new Date()
    end.setHours(5)

    const range = fillDatesBetween(start, end)

    expect(range).toHaveLength(1)
    expect(range[0].toString()).toBe(start.toString())
  })
})
