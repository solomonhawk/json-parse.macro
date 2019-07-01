import macro from '../../macro'

const value = {
  string: 'string',
  number: 1,
  array: [1, 2, 3],
  object: {
    foo: 'bar'
  }
}

const obj = macro(value)
