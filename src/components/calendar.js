import {
  computed,
  inject,
  nextTick,
  onUnmounted,
  provide,
  ref,
  watch,
  watchEffect,
} from 'vue'
import { render } from '../internals/render'
import { adjustDays, endOfWeek, startOfWeek } from '../internals/dates'
import { omit, chunk, isEqual } from '../internals/utils'
import { useId } from '../internals/useId'
import { monthMatrix } from '../matrices/monthMatrix'

export const calendarContext = Symbol('CalendarContext')

function useCalendarContext (component) {
  let context = inject(calendarContext, null)

  if (context === null) {
    let err = new Error(
      `<${component} /> is missing a parent <Calendar /> component.`,
    )

    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, useCalendarContext)
    }

    throw err
  }

  return context
}

export const Calendar = {
  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },

    modelValue: {
      type: [Date, Array],
      default: null,
    },

    cursor: {
      type: Date,
      default: () => new Date(),
    },

    weekStartsFrom: {
      type: Number,
      default: 1,
    },

    matrix: {
      type: Object,
      default: () => monthMatrix,
    },
  },

  emits: ['update:modelValue', 'update:cursor'],

  setup (props, { attrs, slots, emit }) {
    const value = computed(() => props.modelValue)
    const cursor = computed(() => props.cursor)
    const matrix = computed(() => props.matrix)
    const weekStartsFrom = computed(() => props.weekStartsFrom)
    const dateRefs = ref(new Map())
    const componentIds = ref(new Map())
    const dates = computed(() => {
      return matrix.value.dates(cursor.value, weekStartsFrom.value)
    })

    provide(calendarContext, {
      value,
      cursor,
      matrix,
      dates,
      dateRefs,
      weekStartsFrom,
      componentIds,
      setComponentId (component, id) {
        componentIds.value.set(component, id)
      },
      registerDate (ref, value) {
        dateRefs.value.set(ref, value)
      },
      unregisterDate (ref) {
        dateRefs.value.delete(ref)
      },
      select (selected) {
        emit('update:modelValue', selected)
      },
      setCursor (date) {
        emit('update:cursor', date)
      },
    })

    watch(value, async (newDate) => {
      await nextTick()
      for (let [ref, value] of dateRefs.value.entries()) {
        if (isEqual(newDate, value)) {
          ref.value.focus()
        }
      }
    })

    return () => {
      const slot = {
        dates: dates.value,
        cursor: cursor.value,
      }

      return render({
        slots,
        attrs,
        slot,
        props: omit(props, [
          'modelValue',
          'cursor',
          'matrix',
          'weekStartsFrom',
        ]),
        name: 'Calendar',
      })
    }
  },
}

export const CalendarGrid = {
  name: 'CalendarGrid',

  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },

  setup (props, { attrs, slots }) {
    const context = useCalendarContext('CalendarGrid')

    return () => {
      const ourProps = {
        role: 'grid',
        'aria-labelledby': context.componentIds.value.get('CalendarLabel'),
      }
      const slot = {
        weeks: chunk(context.dates.value, 7),
      }

      return render({
        slots,
        attrs,
        slot,
        props: { ...props, ...ourProps },
        name: 'CalendarGrid',
      })
    }
  },
}

export const CalendarGridHeader = {
  name: 'CalendarGridHeader',

  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },

  setup (props, { attrs, slots }) {
    const context = useCalendarContext('CalendarGridHeader')

    return () => {
      const ourProps = {
        role: 'row',
      }
      const slot = {
        weekdays: context.dates.value.slice(0, 7),
      }

      return render({
        slots,
        attrs,
        slot,
        props: { ...props, ...ourProps },
        name: 'CalendarGridRow',
      })
    }
  },
}

export const CalendarGridHeaderColumn = {
  name: 'CalendarGridHeaderColumn',

  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },

  setup (props, { attrs, slots }) {
    return () => {
      return render({
        slots,
        attrs,
        props: { ...props, ...{ role: 'columnheader' } },
        name: 'CalendarGridHeaderColumn',
      })
    }
  },
}

export const CalendarGridRow = {
  name: 'CalendarGridRow',

  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },
  },

  setup (props, { attrs, slots }) {
    return () => {
      return render({
        slots,
        attrs,
        props: { ...props, ...{ role: 'row' } },
        name: 'CalendarGridRow',
      })
    }
  },
}

export const CalendarDate = {
  name: 'CalendarDate',

  props: {
    as: {
      type: [Object, String],
      default: 'div',
    },

    value: {
      type: Date,
      required: false,
    },
  },

  setup (props, { attrs, slots }) {
    const context = useCalendarContext('CalendarDate')

    const dateRef = ref()

    watchEffect(() => context.registerDate(dateRef, props.value))
    onUnmounted(() => context.unregisterDate(dateRef))

    function goToDate (date) {
      context.select(date)
      if (date > context.cursor.value || date < context.cursor.value) {
        context.setCursor(date)
      }
    }

    function handleKeyboard (event) {
      event.preventDefault()

      switch (event.key) {
        case 'ArrowUp':
          goToDate(adjustDays(props.value, -7))
          break

        case 'ArrowDown':
          goToDate(adjustDays(props.value, 7))
          break

        case 'ArrowLeft':
          goToDate(adjustDays(props.value, -1))
          break

        case 'ArrowRight':
          goToDate(adjustDays(props.value, 1))
          break

        case 'Home':
          const firstDayOfWeek = startOfWeek(
            props.value,
            context.weekStartsFrom.value,
          )
          goToDate(firstDayOfWeek)
          break

        case 'End':
          const lastDayOfWeek = endOfWeek(
            props.value,
            context.weekStartsFrom.value,
          )
          goToDate(lastDayOfWeek)
          break

        case event.shiftKey && 'PageUp': {
          const newDate = new Date(props.value)
          newDate.setFullYear(newDate.getFullYear() - 1)
          goToDate(newDate)
          break
        }

        case event.shiftKey && 'PageDown': {
          const newDate = new Date(props.value)
          newDate.setFullYear(newDate.getFullYear() + 1)
          goToDate(newDate)
          break
        }

        case 'PageUp': {
          const newDate = new Date(props.value)
          newDate.setMonth(newDate.getMonth() - 1)
          goToDate(newDate)
          break
        }

        case 'PageDown': {
          const newDate = new Date(props.value)
          newDate.setMonth(newDate.getMonth() + 1)
          goToDate(newDate)
          break
        }
      }
    }

    const selected = computed(() => {
      return props.value && isEqual(props.value, context.value.value)
    })

    const isPreviousMonth = computed(() => {
      return props.value?.getMonth() < context.cursor.value.getMonth()
    })

    const isNextMonth = computed(() => {
      return props.value?.getMonth() > context.cursor.value.getMonth()
    })

    const ariaRole = computed(() => {
      if (dateRef.value?.parentElement?.getAttribute('role') === 'row') {
        return 'gridcell'
      }
    })

    return () => {
      const slot = {
        selected: selected.value,
        previousMonth: isPreviousMonth.value,
        nextMonth: isNextMonth.value,
      }

      const ourProps = {
        ref: dateRef,
        role: ariaRole.value,
        tabindex: selected.value ? '0' : '-1',
        'aria-selected': selected.value ? 'true' : null,
        onClick: () => context.select(props.value),
        onKeydown: handleKeyboard,
      }

      return render({
        slots,
        attrs,
        slot,
        props: { ...omit(props, ['value']), ...ourProps },
        name: 'CalendarDate',
      })
    }
  },
}

export const CalendarLabel = {
  name: 'CalendarLabel',

  props: {
    as: {
      type: [Object, String],
      default: 'h2',
    },
  },

  setup (props, { attrs, slots }) {
    const context = useCalendarContext('CalendarLabel')

    const id = useId('renderless-calendar-label-')
    context.setComponentId('CalendarLabel', id)

    return () => {
      const ourProps = {
        id,
        'aria-live': 'polite',
      }

      const slot = {
        cursor: context.cursor.value,
      }

      return render({
        slots,
        attrs,
        slot,
        props: { ...props, ...ourProps },
        name: 'CalendarLabel',
      })
    }
  },
}

const ChangeButton = (name, onClick) => {
  return {
    name,

    props: {
      as: {
        type: [Object, String],
        default: 'button',
      },

      disabled: {
        type: Boolean,
        default: false,
      },
    },

    setup (props, { attrs, slots }) {
      const context = useCalendarContext(name)
      const disabled = computed(() => props.disabled)

      return () => {
        const slot = {
          disabled: disabled.value,
        }

        const ourProps = {
          type: props.as.toLowerCase() === 'button' ? 'button' : null,
          onClick: () => disabled.value || onClick(context),
          'aria-disabled': disabled.value ? true : null,
        }

        return render({
          slots,
          attrs,
          slot,
          props: { ...omit(props, ['disabled']), ...ourProps },
          name,
        })
      }
    },
  }
}

export const CalendarPreviousButton = ChangeButton(
  'CalendarPreviousButton',
  (context) => {
    return context.setCursor(
      context.matrix.value.adjustBy(context.cursor.value, -1),
    )
  },
)

export const CalendarNextButton = ChangeButton(
  'CalendarNextButton',
  (context) => {
    return context.setCursor(
      context.matrix.value.adjustBy(context.cursor.value, +1),
    )
  },
)
