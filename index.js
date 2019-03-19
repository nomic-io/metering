'use strict'

const babel = require('babel-core')

const SKIP = Symbol('skip')

function metering (gasIdentifier, code) {
  let plugin = function ({ types: t }) {
    return {
      visitor: {
        Expression (path, state) {
          if (SKIP in path.node) {
            // is wrapper, skip
            return
          }
          if (path.parentPath && SKIP in path.parentPath.node) {
            // already wrapped, skip
            return
          }

          let call = t.callExpression(t.identifier(gasIdentifier), [])
          call[SKIP] = true

          let seq = t.sequenceExpression([
            call,
            path.node
          ])
          seq[SKIP] = true

          path.replaceWith(seq)
        }
      }
    }
  }

  let transformed = babel.transform(code, {
    plugins: [ plugin ]
  })
  return transformed.code
}

module.exports = metering
