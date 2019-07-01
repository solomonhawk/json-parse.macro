const t = require('@babel/types');

const {
  createMacro,
  MacroError
} = require('babel-plugin-macros');

const {
  getSource,
  identifierToLiteral,
  objectToLiteral
} = require('./helpers');

module.exports = createMacro(jsonParseMacro);

function jsonParseMacro({
  references
}) {
  references.default.forEach(reference => {
    if (!reference.parentPath.isCallExpression()) {
      throw new MacroError(`json-parse.macro should be used as function call, instead you have used it as part of "${reference.parentPath.node.type}".`);
    }

    let argument = reference.parentPath.get('arguments.0');

    if (!(argument.isObjectExpression() || argument.isIdentifier())) {
      throw new MacroError(`json-parse.macro only works with object literal values and identifiers, found "${argument.node.type}".`);
    }

    if (argument.isObjectExpression()) {
      replaceWithJSON(reference, objectToLiteral(argument));
    }

    if (argument.isIdentifier()) {
      let binding = argument.scope.getBinding(argument.node.name);

      if (binding.referenced && binding.references === 1) {
        replaceWithJSON(reference, identifierToLiteral(argument));
        binding.path.remove();
      } else {
        throw new MacroError(`json-parse.macro cannot optimize bindings that are referenced by other code. Ensure the variable passed to \`macro(..)\` is not referenced elsewhere.`);
      }
    }
  });
}

function replaceWithJSON(path, node) {
  path.parentPath.replaceWith(t.callExpression(t.memberExpression(t.identifier('JSON'), t.identifier('parse')), [t.stringLiteral(JSON.stringify(getSource(node)))]));
}