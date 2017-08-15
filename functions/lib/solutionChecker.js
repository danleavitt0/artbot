const {createFrames, getLastFrame, getIterator} = require('../utils/frameReducer/frameReducer')
const animalApis = require('../utils/animalApis/index')
const checkCorrect = require('../utils/checkCorrect')
const functions = require('firebase-functions')
const cors = require('cors')({origin: true})
const palette = require('../utils/palette')
const objEqual = require('@f/equal-obj')
const admin = require('firebase-admin')
const express = require('express')
const srand = require('@f/srand')

const createApi = animalApis.default
const teacherBot = animalApis.teacherBot
const router = new express.Router()

const savedRef = admin.database().ref('/saved')

router.use(cors)
router.get('*', (req, res) => {
  return res.send('Can not GET')
})
router.post('/', (req, res) => {
  res.set({'Cache-Control': 'no-cache'})
  const props = req.body.props
  const {active, advanced, animals, palette, solution, initialData, targetPainted, capabilities} = props
  const saveRef = props.saveRef
    ? savedRef.child(props.saveRef)
    : {update: () => Promise.resolve()}
  const userApi = createApi(capabilities, active, palette)
  const userCode = getIterator(animals[active].sequence, userApi)
  try {
    userCode()
  } catch (e) {
    return res.status(200).send({status: 'failed', error: e})
  }
  const base = Object.assign({}, props, {painted: {}})
  if (!advanced) {
    const painted = initialData.initialPainted || {}
    console.log(painted)
    const [answer, steps] = getLastFrame(Object.assign({}, base, {painted}), userCode)
    console.log('answer', answer)
    const seed = [{painted, userSolution: answer}]
    if (checkCorrect(answer, targetPainted)) {
      return saveRef.update({steps, solutionSteps: props.solutionSteps})
        .then(() => res.status(200).send({
          correctSeeds: seed,
          status: 'success'
        }))
    }
    return res.status(200).send({status: 'failed', failedSeeds: seed})
  }

  const startCode = getIterator(initialData.initialPainted, createApi(teacherBot, 0, palette.color))
  const solutionIterator = getIterator(solution[0].sequence, userApi)
  const uniquePaints = []
  const failedSeeds = []
  const correctSeeds = []
  for (let i = 0; i < 100; i++) {
    const painted = createPainted(Object.assign({}, base, {
      animals: animals.filter(a => a.type === 'teacherBot').map(a => Object.assign({}, a, {current: a.initial})),
      rand: srand(i)
    }), startCode)
    if (uniquePaints.every((paint) => !objEqual(paint, painted))) {
      uniquePaints.push(painted)
      const [answer, steps] = getLastFrame(Object.assign({}, base, {painted}), userCode)
      const solutionState = Object.assign({}, props, {startGrid: painted})
      var [solutionPainted, solutionSteps] = generateSolution(solutionState, solutionIterator)
      if (!checkCorrect(answer, solutionPainted)) {
        failedSeeds.push({painted, userSolution: answer, seed: i})
      } else {
        correctSeeds.push({painted, userSolution: answer, seed: i, steps, solutionSteps})
      }
    }
  }
  if (failedSeeds.length > 0) {
    return res.status(200).send({status: 'failed', failedSeeds, correctSeeds})
  }
  return saveRef
    .update({
      steps: average(getSteps(correctSeeds, 'steps')),
      solutionSteps: average(getSteps(correctSeeds, 'solutionSteps'))
    })
    .then(() => res.status(200).send({
      status: 'success',
      correctSeeds
    }))
})

function getSteps (arr, key) {
  return arr.map(val => val[key])
}

function average (arr) {
  return arr.reduce((acc, next) => acc + next, 0) / arr.length
}

module.exports = functions.https.onRequest((req, res) => {
  req.url = req.path ? req.url : `/${req.url}`
  return router(req, res)
})

function createPainted (state, code) {
  return createFrames(state, code).pop().painted
}

function generateSolution ({initialPainted, solution, levelSize, active, startGrid}, code) {
  const frames = createFrames({
    active,
    painted: startGrid,
    animals: solution.map(animal => Object.assign({}, animal, {current: animal.initial}))
  }, code)
  return [frames.pop().painted, frames.length]
}
