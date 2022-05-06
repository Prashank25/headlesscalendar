import { dayMatrix as matrix } from './dayMatrix'

describe('generate dates', () => {
  it('returns the same cursor date but in an array', () => {
    const dates = matrix.dates(new Date(2022, 2, 23))

    expect(dates.length).toBe(1)
    expect(dates[0].toString()).toBe(
      new Date(2022, 2, 23).toString(),
    )
  })
})

describe('adjust date', () => {
  it('can add 1 day to cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, +1)

    expect(adjusted.toString()).toBe(new Date(2022, 2, 24).toString())
  })

  it('can add multiple days to cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, 10)

    expect(adjusted.toString()).toBe(new Date(2022, 3, 2).toString())
  })

  it('can subtract 1 day from cursor date', () => {
    const cursor = new Date(2022, 2, 23)

    const adjusted = matrix.adjustBy(cursor, -1)

    expect(adjusted.toString()).toBe(new Date(2022, 2, 22).toString())
  })

  it('can subtract multiple days from cursor date', () => {
    const cursor = new Date(2022, 0, 23)

    const adjusted = matrix.adjustBy(cursor, -23)

    expect(adjusted.toString()).toBe(new Date(2021, 11, 31).toString())
  })
})

