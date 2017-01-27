/** @jsx element */

import element from 'vdux/element'
import {Block, Icon} from 'vdux-ui'
import {Input} from 'vdux-containers'
import {removeLine, updateLine} from '../actions'

function render ({props}) {
  const {
    shouldTransition,
    newElement,
    lineNum,
    animal,
    line
  } = props

  const shouldFlash = !shouldTransition && newElement
  const comment = line.replace('//', '').trim()
  const handleUpdateLine = props.editorActions.updateLine || updateLine
  const handleRemoveLine = props.editorActions.removeLine || removeLine

  return (
    <Block relative wide>
      <Block
        relative
        {...props}
        class={[shouldFlash && 'flash']}
        fs='18px'
        align='center center'>
        <Block color='white'>//</Block>
        <Input
          m='0'
          h='90%'
          onClick={(e) => e.stopPropagation()}
          onKeyUp={(e) => handleUpdateLine({id: animal, lineNum, code: `// ${e.target.value}`})}
          value={comment}
          inputProps={{bgColor: 'transparent', h: '100%', borderWidth: '0px', color: 'white'}} />
      </Block>
      <Block align='center center' absolute right='0' top='5px'>
        <Icon
          color='#666'
          name='delete'
          onClick={[(e) => e.stopPropagation(), () => handleRemoveLine({id: animal, idx: lineNum})]} />
      </Block>
    </Block>
  )
}

export default {
  render
}
