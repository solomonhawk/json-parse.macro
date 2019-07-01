const babel = require('@babel/core');

const t = require('@babel/types');

function getSource(literal) {
  let obj;
  let {
    code
  } = babel.transformFromAst(t.program([t.expressionStatement(literal)]));
  eval(`obj = ${code}`);
  return obj;
}

function objectToLiteral(path) {
  const props = path.get('properties').map(propPath => {
    const propNodeClone = t.clone(propPath.node);
    const valPath = propPath.get('value');
    propNodeClone.shorthand = false;
    propNodeClone.value = toLiteral(valPath);
    return propNodeClone;
  });
  return t.objectExpression(props);
}

function arrayToLiteral(path) {
  const els = path.get('elements').map(toLiteral);
  return t.arrayExpression(els);
}

function identifierToLiteral(path) {
  const binding = path.scope.getBinding(path.node.name);
  const initPath = binding.path.get('init');
  return toLiteral(initPath);
}

function memberExpressionToLiteral(path) {
  const pathProperty = path.get('property');
  let literalProperty;
  const pathPropertyValue = getPathPropertyValue();
  const literalObject = toLiteral(path.get('object'));

  if (t.isObjectExpression(literalObject)) {
    const literalObjectProperty = literalObject.properties.find(prop => {
      return prop.key.name === pathPropertyValue;
    });

    if (literalObjectProperty) {
      literalProperty = literalObjectProperty.value;
    }
  } else if (t.isArrayExpression(literalObject)) {
    literalProperty = literalObject.elements[pathPropertyValue];
  } else {
    throw new Error( // eslint-disable-next-line max-len
    `${literalObject.type} is not yet supported in memberExpressionToLiteral`);
  }

  return t.clone(literalProperty || t.identifier('undefined'));

  function getPathPropertyValue() {
    if (pathProperty.isIdentifier() && path.node.computed) {
      return getLiteralPropertyValue(identifierToLiteral(pathProperty));
    } else {
      return getLiteralPropertyValue(pathProperty.node);
    }
  }

  function getLiteralPropertyValue(node) {
    if (t.isLiteral(node)) {
      return node.value;
    } else if (t.isIdentifier(node)) {
      return node.name;
    } else {
      throw new Error( // eslint-disable-next-line max-len
      `${node.type} is not yet supported in getLiteralPropertyValue of memberExpressionToLiteral`);
    }
  }
}

function toLiteral(path) {
  const toLiterals = [[t.isLiteral, p => t.clone(p.node)], [t.isMemberExpression, memberExpressionToLiteral], [t.isIdentifier, identifierToLiteral], [t.isArrayExpression, arrayToLiteral], [t.isObjectExpression, objectToLiteral]];
  return toLiterals.reduce((literalVal, [test, toLiteralFn]) => {
    if (literalVal) {
      return literalVal;
    }

    if (test(path)) {
      return toLiteralFn(path);
    }

    return null;
  }, null);
}

exports.getSource = getSource;
exports.objectToLiteral = objectToLiteral;
exports.identifierToLiteral = identifierToLiteral;