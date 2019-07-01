const path = require('path')
const pluginTester = require('babel-plugin-tester')
const plugin = require('babel-plugin-macros')

pluginTester({
  plugin,
  fixtures: path.join(__dirname, '..', '__fixtures__'),
  tests: [
    {
      code: `
        import macro from './json-parse.macro'

        const value = {
          string: 'string',
          number: 1,
          array: [1, 2, 3],
          object: {
            foo: 'bar'
          }
        }

        console.log(value)

        const obj = macro(value)
      `,
      error: /json-parse.macro cannot optimize bindings that are referenced by other code\. Ensure the variable passed to `macro\(..\)` is not referenced elsewhere\./
    }
  ]
})
