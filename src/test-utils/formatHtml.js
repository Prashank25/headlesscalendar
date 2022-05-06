import * as prettier from 'prettier'

export function formatHtml (input) {
  if (input === null) throw new Error('input is null')
  let contents = (typeof input === 'string' ? input : input.outerHTML).trim()
  return prettier.format(contents, { parser: 'babel' })
}