import createAction from '@f/create-action'
import {run, createIterators} from '../runner'
import {scrollTo} from './scroll'
import {
  setActiveLine,
  throwError,
  startRun,
  stopRun,
  reset
} from '../actions'

const runCode = createAction('RUN_CODE')
const abortRun = createAction('ABORT_RUN')
const stepForward = createAction('STEP_FORWARD')
const pauseRun = createAction('PAUSE_RUN')
const incrementSteps = createAction('INCREMENT_STEPS')
const resume = createAction('RESUME')

let runners

function codeRunner () {
  return ({getState, dispatch}) => {
    function getSpeed () {
      return getState().speed
    }
    return (next) => (action) => {
      let state = getState()
      if (action.type === runCode.type && !state.running && !state.hasRun) {
        const {animals} = state.game
        function * onComplete () {
          yield stopRun()
          if (typeof (action.payload) === 'function') {
            yield action.payload()
          }
        }
        dispatch(startRun())
        createIterators(animals)
          .then((its) => {
            runners = its.map((it) => {
              return run(it, animals, getSpeed, onValue, (e) => console.warn(e), () => dispatch(onComplete()))
            })
            runners.forEach((runner) => runner.run())
          })
          .catch(({message, lineNum}) => dispatch(throwError(message, lineNum)))
      }
      if (action.type === abortRun.type || action.type === throwError.type || action.type === reset.type) {
        if (runners) {
          runners.forEach((runner) => runner.pause())
          runners = undefined
        }
        dispatch(stopRun(true))
      }
      if (action.type === pauseRun.type) {
        dispatch(stopRun())
        runners.forEach((runner) => runner.pause())
      }
      if (action.type === resume.type) {
        dispatch(startRun())
        runners.forEach((runner) => runner.run())
      }
      if (action.type === stepForward.type) {
        const {animals} = state.game
        if (!runners) {
          dispatch(reset())
          createIterators(animals)
          .then((its) => {
            runners = its.map((it) => {
              return run(it, animals, getSpeed, onValue, (e) => console.warn(e), () => dispatch(stopRun(true)))
            })
            runners.forEach((runner, id) => runner.step(id).then((action) => onValue(action)))
          })
          .catch(({message, lineNum}) => dispatch(throwError(message, lineNum)))
        } else {
          runners.forEach((runner, id) => runner.step(id).then((action) => onValue(action)))
        }
      }

      function onValue (action) {
        if (action.meta) {
          const lineNum = action.meta.lineNum
          if (getState().game.inputType === 'icons') {
            dispatch(scrollTo('.code-editor', `#code-icon-${lineNum}`))
          }
          dispatch(setActiveLine(lineNum))
        }
        dispatch(incrementSteps())
        return dispatch(action)
      }

      return next(action)
    }
  }
}

export default codeRunner
export {
  resume,
  runCode,
  abortRun,
  pauseRun,
  stepForward,
  incrementSteps,
  throwError
}
