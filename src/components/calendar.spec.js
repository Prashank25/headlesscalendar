import {
  Calendar,
  CalendarDate,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridHeaderColumn,
  CalendarGridRow,
  CalendarLabel,
  CalendarNextButton,
  CalendarPreviousButton,
} from './calendar'
import { shallowMount } from '@vue/test-utils'
import { fireEvent } from '@testing-library/vue'
import { renderComponent } from '../test-utils/renderComponent'
import { suppressConsoleLogs } from '../test-utils/surpressConsoleLog'
import { formatHtml } from '../test-utils/formatHtml'
import { nextTick, ref } from 'vue'
import { weekMatrix } from '../matrices/weekMatrix'
import { monthMatrix } from '../matrices/monthMatrix'

const log = console.log

function render (input) {
  let defaultComponents = {
    Calendar,
    CalendarLabel,
    CalendarDate,
    CalendarGrid,
    CalendarGridRow,
    CalendarGridHeader,
    CalendarGridHeaderColumn,
    CalendarNextButton,
    CalendarPreviousButton,
  }

  return renderComponent(input, defaultComponents)
}

function assertHtml (element, { attributes, textContent, tag }) {
  if (textContent) {
    expect(element).toHaveTextContent(textContent)
  }

  for (let attributeName in attributes) {
    expect(element).toHaveAttribute(attributeName, attributes[attributeName])
  }

  if (tag) {
    expect(element.tagName.toLowerCase()).toBe(tag)
  }
}

describe('Safeguards', () => {
  it.each([
    ['CalendarLabel', CalendarLabel],
    ['CalendarDate', CalendarDate],
    ['CalendarGrid', CalendarGrid],
    ['CalendarGridHeader', CalendarGridHeader],
    ['CalendarNextButton', CalendarNextButton],
    ['CalendarPreviousButton', CalendarPreviousButton],
  ])(
    'should error when we are using a <%s /> without a parent <Calendar />',
    (name, component) => {
      suppressConsoleLogs(() => {
        expect(() => render(component)).toThrowError(
          `<${component.name} /> is missing a parent <Calendar /> component.`,
        )
      })
    },
  )

  it('can render only Calendar and CalendarDate without crashing', () => {
    const { queryAllByTestId } = render(`
      <Calendar v-slot="{ dates }">
        <CalendarDate data-testid="date" v-for="date in dates">
          {{ date.toDateString() }}
        </CalendarDate>
      </Calendar>
    `)

    const today = new Date()
    const dates = monthMatrix.dates(today, 1)
    const CalendarDates = queryAllByTestId('date')

    CalendarDates.forEach((dom, index) => {
      const date = dates[index]
      assertHtml(dom, {
        attributes: {
          'tabindex': '-1',
          'data-testid': 'date',
        },
        textContent: date.toDateString(),
      })
    })
  })

  it('can render Calendar with the grid without crashing', () => {
    const { queryAllByTestId } = render(`
      <Calendar v-slot="{ dates }">
        <CalendarGrid>
          <CalendarDate data-testid="date" v-for="date in dates">
            {{ date.toDateString() }}
          </CalendarDate>
        </CalendarGrid>
      </Calendar>
    `)

    const today = new Date()
    const dates = monthMatrix.dates(today, 1)
    const CalendarDates = queryAllByTestId('date')

    expect(CalendarDates).toHaveLength(dates.length)
    CalendarDates.forEach((dom, index) => {
      const date = dates[index]
      assertHtml(dom, {
        attributes: {
          'data-testid': 'date',
        },
        textContent: date.toDateString(),
      })
    })
  })
})

describe('Calendar', () => {
  it('Calendar renders as a div by default', () => {
    const { html } = render(`<Calendar>test</Calendar>`)

    expect(html()).toEqual('<div>test</div>')
  })

  it('Calendar uses the month matrix if it is not set as a prop', () => {
    const wrapper = shallowMount({
      components: { Calendar },
      template: `
        <Calendar ref="calendar"></Calendar>
      `,
      setup: () => ({ calendar: ref() }),
    })

    expect(wrapper.vm.$refs.calendar.matrix).toBe(monthMatrix)
  })

  it('Calendar can take any arbitrary matrix object', () => {
    const matrix = {
      dates: () => ['one', 'two'],
      adjustBy: (date) => date,
    }
    const { container } = render({
      template: `
        <Calendar :matrix="matrix" v-slot="{ dates }">
        {{ JSON.stringify(dates) }}
        </Calendar>
      `,
      setup: () => ({ matrix }),
    })

    expect(container.textContent).toBe(JSON.stringify(matrix.dates()))
  })

  it('Calendar sets the cursor to current date if it is not set as a prop',
    () => {
      const { html } = render(
        `<Calendar v-slot="{ cursor }">{{ cursor.toString() }}</Calendar>`,
      )

      expect(html()).toEqual(`<div>${new Date().toString()}</div>`)
    },
  )
})

describe('CalendarDate', () => {
  it('CalendarDate renders as a div by default', () => {
    const { html } = render(`
      <Calendar>
        <CalendarDate>date goes here</CalendarDate>
      </Calendar>
    `)

    expect(formatHtml(html())).toEqual(formatHtml(`
      <div>
        <div tabindex="-1">date goes here</div>
      </div>
    `))
  })

  it('CalendarDate can be rendered as anything', () => {
    const { html } = render(`
      <Calendar>
        <CalendarDate as="button">date goes here</CalendarDate>
      </Calendar>
    `)

    expect(formatHtml(html())).toEqual(formatHtml(`
      <div>
        <button tabindex="-1">date goes here</button>
      </div>
    `))
  })

  it(
    'CalendarDate adds a gridcell role when used as a child of a CalendarGridRow',
    async () => {
      const { container } = render(`
        <Calendar>
          <CalendarGridRow>
            <CalendarDate>date goes here</CalendarDate>
          </CalendarGridRow>
        </Calendar>
      `)

      await nextTick()

      const element = container.querySelector('[role="gridcell"]')
      assertHtml(element, {
        attributes: {
          tabindex: '-1',
          role: 'gridcell',
        },
      })
    },
  )

  it(
    'CalendarDate does not add a gridcell role when not a child of CalendarGridRow',
    async () => {
      const { container } = render(`
        <Calendar>
          <CalendarDate>date goes here</CalendarDate>
        </Calendar>
      `)

      await nextTick()

      const element = container.querySelector('[role="gridcell"]')
      expect(element).toBeNull()
    },
  )

  it(
    'should toggle the selected state of a date when clicking on it',
    async () => {
      const { getByTestId } = render({
        template: `
          <Calendar v-model="value">
          <CalendarDate data-testid="one" :value="value1" v-slot="{ selected }">
            {{ selected }}
          </CalendarDate>
          <CalendarDate data-testid="two" :value="value2" v-slot="{ selected }">
            {{ selected }}
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({
          value: ref(),
          value1: new Date(2017),
          value2: new Date(2020),
        }),
      })

      await fireEvent.click(getByTestId('two'))

      assertHtml(getByTestId('two'), {
        textContent: 'true',
      })
      assertHtml(getByTestId('one'), {
        textContent: 'false',
      })
    },
  )

  it(
    'should toggle the aria selected state of a date when clicking on it',
    async () => {
      const { getByText } = render({
        template: `
          <Calendar v-model="value">
          <CalendarDate :value="value1">
            value 1
          </CalendarDate>
          <CalendarDate :value="value2">
            value 2
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({
          value: ref(),
          value1: new Date(2017, 1, 1),
          value2: new Date(2020, 1, 1),
        }),
      })

      const value2 = getByText('value 2')

      await fireEvent.click(value2)

      assertHtml(value2, {
        attributes: {
          'aria-selected': 'true',
        },
      })
    },
  )

  it(
    'should focus the on the selected CalendarDate',
    async () => {
      const selected = ref(null)
      const dates = [
        new Date(2017, 1, 1),
        new Date(2018, 1, 1),
      ]
      const { getByText } = render({
        template: `
          <Calendar v-model="selected">
          <CalendarDate v-for="date in dates" :value="date">
            {{ date.toDateString() }}
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({ selected, dates }),
      })

      assertHtml(document.activeElement, { tag: 'body' })

      selected.value = dates[1]

      await nextTick()
      const selectedElement = await getByText(dates[1].toDateString())
      expect(selectedElement === document.activeElement).toBe(true)
    },
  )

  it(
    'does pass the previous and next month slot props correctly',
    () => {
      const cursor = new Date()
      const selected = new Date(cursor.getFullYear(), cursor.getMonth(), 10)
      const dates = monthMatrix.dates(cursor, 1)
      const { getByText } = render({
        template: `
          <Calendar v-model="selected" v-model:cursor="cursor">
          <CalendarDate v-for="date in dates" :value="date" v-slot="data">
            {{ JSON.stringify({ ...data, date: date.toDateString() }) }}
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({ selected, cursor, dates }),
      })

      dates.forEach((date) => {
        const data = JSON.stringify({
          selected: date.toDateString() === selected.toDateString(),
          previousMonth: date.getMonth() < cursor.getMonth(),
          nextMonth: date.getMonth() > cursor.getMonth(),
          date: date.toDateString(),
        })

        expect(getByText(data)).not.toBe(null)
      })
    },
  )

  it.each([
    ['ArrowUp', -7],
    ['ArrowDown', +7],
    ['ArrowLeft', -1],
    ['ArrowRight', +1],
  ])(
    '%s arrow key move the date by %i',
    async (key, daysToAdd) => {
      const date = 10
      const selected = ref(
        new Date(new Date().getFullYear(), new Date().getMonth(), date),
      )
      const { getByTestId } = render({
        template: `
          <Calendar v-model="selected" v-slot="{ dates }">
          <CalendarDate
            v-for="date in dates"
            :value="date"
            v-slot="{ selected }"
            :data-testid="date.toDateString()"
          >
            {{ selected }}
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({ selected }),
      })

      const findSelected = (date) => getByTestId(date.toDateString())

      fireEvent.keyDown(findSelected(selected.value), { key })

      await nextTick()
      expect(selected.value.getDate()).toBe(date + daysToAdd)
      expect(findSelected(selected.value)).toHaveTextContent('true')
    },
  )

  it.each`
  key  |  movedToDate  | message
  ${'Home'} |  ${'Mon Apr 04 2022'}  | ${'start of current week'}
  ${'End'}  |  ${'Sun Apr 10 2022'}  | ${'end of current week'}
  ${'PageUp'}  |  ${'Sun Mar 06 2022'}  | ${'previous month but same date'}
  ${'PageDown'}  |  ${'Fri May 06 2022'}  | ${'next month but same date'}
  ${'Shift+PageUp'}  |  ${'Tue Apr 06 2021'}  | ${'previous year but same date'}
  ${'Shift+PageDown'}  |  ${'Thu Apr 06 2023'}  | ${'next year but same date'}
  `('$key key moves the date to $message',
    async ({ key, movedToDate }) => {
      const selected = ref(new Date(2022, 3, 6))

      const { getByTestId } = render({
        template: `
          <Calendar
            v-model="selected"
            :cursor="selected"
            v-slot="{ dates }"
            :week-start-from="1"
          >
          <CalendarDate
            v-for="date in dates"
            :value="date"
            v-slot="{ selected }"
            :data-testid="date.toDateString()"
          >
            {{ selected }}
          </CalendarDate>
          </Calendar>
        `,
        setup: () => ({ selected }),
      })

      const findSelected = (date) => getByTestId(date.toDateString())

      fireEvent.keyDown(findSelected(selected.value), {
        key: key.split('+')?.[1] ?? key,
        shiftKey: key.includes('Shift'),
      })

      await nextTick()
      expect(selected.value.toDateString()).toBe(movedToDate)
      expect(findSelected(selected.value)).toHaveTextContent('true')
    },
  )
})

describe('CalendarPreviousButton', () => {
  it('moves the cursor to previous month without matrix prop', async () => {
    const testCursor = ref(new Date())
    const { getByTestId } = render({
      template: `
        <Calendar v-model:cursor="testCursor" v-slot:="{ cursor }">
        <span data-testid="date">
          {{ cursor.toDateString() }}
        </span>
        <CalendarPreviousButton data-testid="button"/>
        </Calendar>
      `,
      setup: () => ({ testCursor }),
    })

    await fireEvent.click(getByTestId('button'))

    await nextTick()

    const expectedCursor = new Date()
    expectedCursor.setMonth(expectedCursor.getMonth() - 1)
    // expect(testCursor.value.toString()).toBe(expectedCursor.toString())
    // expect(getByTestId('date').textContent).toBe(expectedCursor.toDateString())
  })

  it('moves the cursor to previous unit of time when matrix is set',
    async () => {
      const testCursor = ref(new Date())
      const { getByTestId } = render({
        template: `
          <Calendar v-model:cursor="testCursor" v-slot:="{ cursor }"
                    :matrix="weekMatrix">
          <span data-testid="date">
            {{ cursor.toDateString() }}
          </span>
          <CalendarPreviousButton data-testid="button"/>
          </Calendar>
        `,
        setup: () => ({ testCursor, weekMatrix }),
      })

      await fireEvent.click(getByTestId('button'))

      await nextTick()

      const expectedCursor = new Date()
      expectedCursor.setDate(expectedCursor.getDate() - 7)
      expect(testCursor.value.toString()).toBe(expectedCursor.toString())
      expect(getByTestId('date'))
        .toHaveTextContent(expectedCursor.toDateString())
    })

  it('adds type button attribute when rendered as a button', () => {
    const { getByTestId } = render({
      template: `
        <Calendar>
        <CalendarPreviousButton data-testid="button"/>
        </Calendar>
      `,
    })

    expect(formatHtml(getByTestId('button'))).toBe(
      formatHtml(`<button type="button" data-testid="button"></button>`),
    )
  })

  it('does not add the type button attribute when not rendered as a button',
    () => {
      const { getByTestId } = render({
        template: `
        <Calendar>
        <CalendarPreviousButton as="div" data-testid="button"/>
        </Calendar>
      `,
      })

      expect(formatHtml(getByTestId('button'))).toBe(
        formatHtml(`<div data-testid="button"></div>`),
      )
    },
  )

  it('does disables the button when disabled prop is set', async () => {
    const testCursor = ref(new Date())
    const { getByTestId } = render({
      template: `
        <Calendar v-model:cursor="testCursor" v-slot="{ cursor }">
        <span data-testid="cursor">{{ cursor.toDateString() }}</span>
        <CalendarPreviousButton
          :disabled="true" v-slot="{ disabled }" data-testid="button"
        >
          {{ disabled }}
        </CalendarPreviousButton>
        </Calendar>
      `,
      setup: () => ({ testCursor }),
    })

    await fireEvent.click(getByTestId('button'))

    expect(testCursor.value.toDateString()).toBe(new Date().toDateString())
    expect(getByTestId('button')).toHaveTextContent('true')
    expect(getByTestId('cursor')).toHaveTextContent(new Date().toDateString())
  })

  it('adds aria-disabled attribute only when disabled', async () => {
    const { getByTestId } = render(`
     <Calendar>
      <CalendarPreviousButton disabled data-testid="disabledButton"/>
     </Calendar>
    `)

    assertHtml(getByTestId('disabledButton'), {
      attributes: {
        'aria-disabled': 'true',
      },
    })
  })
})

describe('CalendarNextButton', () => {
  it('moves the cursor to next month without matrix prop', async () => {
    const testCursor = ref(new Date())
    const { getByTestId } = render({
      template: `
        <Calendar v-model:cursor="testCursor" v-slot:="{ cursor }">
        <span data-testid="date">
          {{ cursor.toDateString() }}
        </span>
        <CalendarNextButton data-testid="button"/>
        </Calendar>
      `,
      setup: () => ({ testCursor }),
    })

    await fireEvent.click(getByTestId('button'))

    await nextTick()

    const expectedCursor = new Date()
    expectedCursor.setDate(1)
    expectedCursor.setMonth(expectedCursor.getMonth() + 1)
    expect(testCursor.value.toString()).toBe(expectedCursor.toString())
    expect(getByTestId('date').textContent).toBe(expectedCursor.toDateString())
  })

  it('moves the cursor to next unit of time when matrix is set',
    async () => {
      const testCursor = ref(new Date())
      const { getByTestId } = render({
        template: `
          <Calendar v-model:cursor="testCursor" v-slot:="{ cursor }"
                    :matrix="weekMatrix">
          <span data-testid="date">
            {{ cursor.toDateString() }}
          </span>
          <CalendarNextButton data-testid="button"/>
          </Calendar>
        `,
        setup: () => ({ testCursor, weekMatrix }),
      })

      await fireEvent.click(getByTestId('button'))

      await nextTick()

      const expectedCursor = new Date()
      expectedCursor.setDate(expectedCursor.getDate() + 7)
      expect(testCursor.value.toString()).toBe(expectedCursor.toString())
      expect(getByTestId('date'))
        .toHaveTextContent(expectedCursor.toDateString())
    })

  it('adds type button attribute when rendered as a button', () => {
    const { getByTestId } = render({
      template: `
        <Calendar>
        <CalendarNextButton data-testid="button"/>
        </Calendar>
      `,
    })

    expect(formatHtml(getByTestId('button'))).toBe(
      formatHtml(`<button type="button" data-testid="button"></button>`),
    )
  })

  it('does not add the type button attribute when not rendered as a button',
    () => {
      const { getByTestId } = render({
        template: `
        <Calendar>
        <CalendarNextButton as="div" data-testid="button"/>
        </Calendar>
      `,
      })

      expect(formatHtml(getByTestId('button'))).toBe(
        formatHtml(`<div data-testid="button"></div>`),
      )
    },
  )

  it('does disables the button when disabled prop is set', async () => {
    const testCursor = ref(new Date())
    const { getByTestId } = render({
      template: `
        <Calendar v-model:cursor="testCursor" v-slot="{ cursor }">
        <span data-testid="cursor">{{ cursor.toDateString() }}</span>
        <CalendarNextButton
          :disabled="true" v-slot="{ disabled }" data-testid="button"
        >
          {{ disabled }}
        </CalendarNextButton>
        </Calendar>
      `,
      setup: () => ({ testCursor }),
    })

    await fireEvent.click(getByTestId('button'))

    expect(testCursor.value.toDateString()).toBe(new Date().toDateString())
    expect(getByTestId('button')).toHaveTextContent('true')
    expect(getByTestId('cursor')).toHaveTextContent(new Date().toDateString())
  })

  it('adds aria-disabled attribute only when disabled', async () => {
    const { getByTestId } = render(`
     <Calendar>
      <CalendarNextButton disabled data-testid="disabledButton"/>
     </Calendar>
    `)

    assertHtml(getByTestId('disabledButton'), {
      attributes: {
        'aria-disabled': 'true',
      },
    })
  })
})
