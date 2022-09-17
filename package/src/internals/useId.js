let id = 0

function generateId () {
  return ++id
}

export function useId (prefix) {
  return prefix + generateId()
}