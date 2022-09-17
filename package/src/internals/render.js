import { cloneVNode, h } from 'vue'

/**
 * Taken from awesome headlessui library.
 *
 * {@link https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-vue/src/utils/render.ts}
 */
export function render ({ ...main }) {
  return _render(main)
}

function _render ({ props, attrs, slots, slot, name }) {
  let { as, ...incomingProps } = props

  let children = slots.default?.(slot)

  if (as === 'template') {
    if (
      Object.keys(incomingProps).length > 0 || Object.keys(attrs).length > 0
    ) {
      let [firstChild, ...other] = children ?? []

      if (!isValidElement(firstChild) || other.length > 0) {
        throw new Error([
          'Passing props on "template"!',
          '',
          `The current component <${name} /> is rendering a "template".`,
          `However we need to passthrough the following props:`,
          Object.keys(incomingProps)
            .concat(Object.keys(attrs))
            .map((line) => `  - ${line}`)
            .join('\n'),
          '',
          'You can apply a few solutions:',
          [
            'Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
            'Render a single element as the child so that we can forward the props onto that element.']
            .map((line) => `  - ${line}`)
            .join('\n')].join('\n'))
      }

      return cloneVNode(firstChild, incomingProps)
    }

    if (Array.isArray(children) && children.length === 1) {
      return children[0]
    }

    return children
  }

  return h(as, incomingProps, children)
}

function isValidElement (input) {
  if (input == null) return false // No children
  if (typeof input.type === 'string') return true // 'div', 'span', ...
  if (typeof input.type === 'object') return true // Other components
  if (typeof input.type === 'function') return true // Built-ins like Transition
  return false // Comments, strings, ...
}