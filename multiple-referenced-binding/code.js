import macro from '../../../macro'

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
