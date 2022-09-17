export function suppressConsoleLogs (cb, type = 'warn') {
  return (...args) => {
    let spy = jest.spyOn(globalThis.console, type).mockImplementation(jest.fn())

    return new Promise((resolve, reject) => {
      Promise.resolve(cb(...args)).then(resolve, reject)
    }).finally(() => spy.mockRestore())
  }
}