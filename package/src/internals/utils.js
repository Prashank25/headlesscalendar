export function isEqual (value1, value2) {
  if (value1 instanceof Date && value2 instanceof Date) {
    return value1.getTime() === value2.getTime()
  }

  return value1 === value2
}

export function chunk (array, size) {
  let chunks = []
  for (let i = 0; i < array.length; i += size) {
    const chunk = array.slice(i, i + size)
    chunks.push(chunk)
  }

  return chunks
}

export function tap (value, callback) {
  callback?.(value)

  return value
}

export function omit (object, keysToOmit) {
  let clone = Object.assign({}, object)
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }

  return clone
}
