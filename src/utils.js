import gPalette from 'google-material-color-palette-json'
import {refMethod} from 'vdux-fire'
import isArray from '@f/is-array'
import Analyse from 'js-analyse'
import reduce from '@f/reduce'
import Hashids from 'hashids'
import map from '@f/map'
import _ from 'lodash'

const hashids = new Hashids(
  'Oranges never ripen in the winter',
  5,
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789'
)

function generateID () {
  return hashids.encode(Math.floor(Math.random() * 10000) + 1)
}

function * checkForExisting (ref, id) {
  const snap = yield refMethod({
    ref,
    updates: [
      {method: 'orderByKey'},
      {method: 'equalTo', value: id},
      {method: 'once', value: 'value'}
    ]
  })
  return snap.val()
}

function * createCode (ref = '/links/') {
  const id = generateID()
  const exists = yield checkForExisting(ref, id)

  if (exists) {
    return yield createCode(ref)
  } else {
    return id
  }
}

function getRotation (rot) {
  const circles = Math.floor(Math.abs(rot) / 360)
  if (rot < 0) {
    return rot + (360 * (circles + 1))
  } else {
    return rot - (360 * circles)
  }
}

function getDirection (rot) {
  return (getRotation(rot) / 90) % 4
}

const icons = {
  up: 'arrow_upward',
  down: 'arrow_downward',
  left: 'arrow_back',
  right: 'arrow_forward',
  paint: 'brush',
  comment: 'comment',
  loop: 'loop',
  loop_end: 'loop',
  move: 'arrow_upward',
  turnRight: 'rotate_right',
  turnLeft: 'rotate_left  '
}

const colors = {
  up: 'blue',
  right: 'yellow',
  down: 'green',
  left: 'red',
  comment: '#666',
  loop: 'deepPurple'
}

const directions = {
  forward: 'N',
  back: 'S',
  right: 'E',
  left: 'W'
}

const palette = _.drop(reduce(
  (arr, value, key) => [...arr, {
    name: key,
    value: value['shade_500'] || value
  }],
  [],
  gPalette
))

function nameToIcon (name) {
  return icons[name]
}

function nameToDirection (name) {
  return directions[name]
}

function nameToColor (name) {
  return colors[name] || 'white'
}

function isLocal (url) {
  return !/^(?:[a-z]+\:)?\/\//i.test(url)
}

function range (low, hi) {
  function rangeRec (low, hi, vals) {
    if (low > hi) {
      return vals
    }
    vals.push(low)
    return rangeRec(low + 1, hi, vals)
  }
  return rangeRec(low, hi, [])
}

function maybeAddToArray (val, arr = []) {
  if (arr.indexOf(val) > -1) {
    return arr.filter((item) => item !== val)
  } else {
    return arr.concat(val)
  }
}

function initGame (name = '') {
  return {
    permissions: ['Run Button', 'Edit Code'],
    title: 'Untitled',
    description: 'Use code to draw the image.',
    inputType: 'icons',
    levelSize: [5, 5],
    animals: [{
      type: 'zebra',
      sequence: [],
      initial: {
        location: [4, 0],
        dir: 0,
        rot: 0
      },
      current: {
        location: [4, 0],
        dir: 0,
        rot: 0
      }
    }],
    name
  }
}

function * publish (draftID) {
  yield refMethod({
    ref: '/queue/tasks',
    updates: {
      method: 'push',
      value: {
        _state: 'create_game',
        draftRef: draftID
      }
    }
  })
}

let lastLoc = 0

function getLoc (code = '') {
  try {
    const analysis = new Analyse(maybeStringify(code))
    lastLoc = analysis.lloc()
    return lastLoc
  } catch (e) {
    return lastLoc
  }
}

const maybeStringify = (seq) => isArray(seq) ? seq.join('\n') : seq

function arrayAt (obj, at) {
  return map((elem, key) => {
    if (key === at) {
      return reduce((arr, next, k) => [...arr, next], [], elem)
    }
    return elem
  }, obj)
}

function * createPlaylistLink (anonymous, key) {
  const code = yield createCode()
  yield refMethod({
    ref: `/links/${code}`,
    updates: {
      method: 'set',
      value: {
        type: 'playlists',
        payload: {
          anonymous,
          ref: key
        }
      }
    }
  })
  return code
}

export {
  createPlaylistLink,
  maybeAddToArray,
  nameToDirection,
  getDirection,
  nameToColor,
  nameToIcon,
  createCode,
  initGame,
  publish,
  palette,
  arrayAt,
  isLocal,
  getLoc,
  range
}
