/** @jsx element */

import element from 'vdux/element'
import ColorSwatch from './ColorSwatch'
import {Dropdown, Grid} from 'vdux-containers'

function render ({props}) {
  const {btn, clickHandler, palette, swatchSize = '24px', ...restProps} = props
  let close

  return (
    <Dropdown zIndex='999' ref={(api) => close = api.close} btn={btn} {...restProps}>
      <Grid itemsPerRow='4' rowAlign='center center' columnAlign='start center'>
        {palette.map(({value, name}) => <ColorSwatch
          size={swatchSize}
          bgColor={value}
          name={name}
          clickHandler={handleClick}/>)}
      </Grid>
    </Dropdown>
  )

  function * handleClick (name) {
    yield close()
    yield clickHandler(name)
  }
}

export default {
  render
}
