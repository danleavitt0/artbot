'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _typeof2 = require('babel-runtime/helpers/typeof')

var _typeof3 = _interopRequireDefault(_typeof2)

function _interopRequireDefault (obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function sequenceToCode (sequence) {
  return Array.isArray(sequence) ? blocksToCode(sequence) : sequence
}

function blocksToCode (blocks) {
  var indent =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0

  var level = 0

  return blocks
    .map(function (_ref) {
      var type = _ref.type,
        payload = _ref.payload,
        parentType = _ref.parentType

      var args = getArgs(type, payload)
      var indent = tabs(level)

      switch (type) {
        case 'faceNorth':
          return indent + 'faceNorth()'
        case 'up':
          return indent + 'up(' + (args || 1) + ')'
        case 'left':
          return indent + 'left(' + (args || 1) + ')'
        case 'right':
          return indent + 'right(' + (args || 1) + ')'
        case 'down':
          return indent + 'down(' + (args || 1) + ')'
        case 'paint':
          return indent + 'paint(' + (args || "'black'") + ')'
        case 'toggle':
          return indent + 'toggle()'
        case 'comment':
          return indent + '// ' + args
        case 'lineBreak':
          return
        case 'move':
          return indent + 'forward(' + (args || 1) + ')'
        case 'paintO':
          return indent + 'paintO(' + (args || "'black'") + ')'
        case 'paintI':
          return indent + 'paintI(' + (args || "'black'") + ')'
        case 'paintS':
          return indent + 'paintS(' + (args || "'black'") + ')'
        case 'paintZ':
          return indent + 'paintZ(' + (args || "'black'") + ')'
        case 'paintJ':
          return indent + 'paintJ(' + (args || "'black'") + ')'
        case 'paintT':
          return indent + 'paintT(' + (args || "'black'") + ')'
        case 'paintL':
          return indent + 'paintL(' + (args || "'black'") + ')'
        case 'forward':
          return indent + 'forward(' + (args || 1) + ')'
        case 'moveTo':
          return indent + 'moveTo(' + args + ')'
        case 'turnRight':
          return indent + 'turnRight()'
        case 'turnLeft':
          return indent + 'turnLeft()'
        case 'repeat':
          return tabs(level++) + 'repeat(' + args + ', function () {'
        case 'block_end':
          return '' + tabs(--level) + (parentType === 'userFn' ? '}' : '})')
        case 'userFn':
          return tabs(level++) + 'function ' + payload[0] + ' (' + args + ') {'
        case 'ifColor':
          return tabs(level++) + 'ifColor(' + args + ', function () {'
        default:
          return '' + indent + type + '(' + args + ')'
      }
    })
    .join('\n')
}

function getArgs (type, payload) {
  if (type === 'userFn') {
    return payload
      .slice(1)
      .map(function (val) {
        return val.name
      })
      .join(', ')
  } else if (
    (typeof payload === 'undefined'
      ? 'undefined'
      : (0, _typeof3.default)(payload)) === 'object'
  ) {
    return payload
      .map(function (val) {
        var value = val.value || val
        return !val.type || val.type === 'string' ? '"' + value + '"' : value
      })
      .join(', ')
  } else {
    return payload
  }
}

function tabs (n) {
  var str = ''

  while (n--) {
    str += '\t'
  }

  return str
}

exports.default = sequenceToCode
