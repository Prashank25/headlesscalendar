import { render } from '@testing-library/vue'

export function renderComponent (input, defaultComponents) {
  if (typeof input === 'string') {
    return render({
      components: defaultComponents,
      template: input,
      setup: () => {},
    })
  }

  return render(
    Object.assign({}, input, {
      components: { ...defaultComponents, ...input.components },
    }),
  )
}