import { ref, computed, getCurrentInstance } from 'vue'

export function useOptionalModel (propName) {
  const instance = getCurrentInstance()
  const localValue = ref(instance.props.cursor)

  return computed({
    set (value) {
      localValue.value = value
      instance.emit(`update:${propName}`, value)
    },

    get () {
      if (vModelNotUsed(instance, propName)) {
        return localValue.value
      }

      return instance.props.cursor
    },
  })
}

function vModelNotUsed (instance, propName) {
  return propName in (instance?.propsDefaults ?? {})
}
