/**
 * Imports
 */

import { CSSContainer, Input, wrap, Icon, Button } from 'vdux-containers'
import { component, element, stopPropagation, decodeValue } from 'vdux'
import { capabilities, typeColors, arrowColors } from 'animalApis'
import BlockArgument from 'components/BlockArgument'
import BlockCursor from 'components/BlockCursor'
import BlockIcon from 'components/BlockIcon'
import { Block, Checkbox } from 'vdux-ui'
import objEqual from '@f/equal-obj'
import sleep from '@f/sleep'
import times from '@f/times'
import omit from '@f/omit'

/**
  * Constants
  */

const tabSize = 30
const width = 200
const height = 40
const margin = 18

/**
  * <CodeBlock/>
  */

export default wrap(CSSContainer, {
  hoverProps: {
    hovering: true
  }
})(
  component({
    * onCreate ({ props, actions, context }) {
      let count = 0
      yield scrollElement()
      function * scrollElement () {
        let element = document.querySelector('.code-block.new')
        yield sleep(50)
        if (element) {
          element = element.nextSibling || element
        }
        if (element) {
          yield element.scrollIntoViewIfNeeded(false)
          if (
            element.previousSibling &&
            element.previousSibling.previousSibling
          ) {
            let lastElement = element.previousSibling.previousSibling
            yield lastElement && lastElement.scrollIntoViewIfNeeded(false)
          }
        } else if (count > 15) {
        } else {
          count++
          yield sleep(50)
          return yield scrollElement()
        }
      }
    },

    render ({ props, actions }) {
      const {
        block,
        indentation,
        line,
        selected,
        readOnly,
        hovering,
        active,
        docs = {},
        isSelected,
        scopedVars = [],
        isNew,
        numLineDigits,
        setArgument,
        select,
        nameFunction,
        isAtCursor,
        clearSelection,
        removeBlock,
        isSelecting,
        openParameterModal,
        setBlockPayload,
        addCapability,
        openFunctionModal,
        ...rest
      } = props
      const { type } = block
      const isBlockEnd = type === 'block_end'
      const blockType = isBlockEnd ? block.parentType || 'repeat' : block.type
      const bgColor =
        typeColors[(capabilities[blockType] || { type: 'functions' }).type]

      return (
        <Block
          id={`code-block-${line}`}
          class={['code-block', { active: active, new: isAtCursor || isNew }]}
          {...omit('key', rest)}>
          <BlockCursor
            ml={(indentation + isBlockEnd) * tabSize}
            hidden={readOnly || isSelecting || !isAtCursor}
            block={block}
            w={width}
            h={margin} />
          <Block
            wide
            align='start center'
            relative
            boxShadow={
              isSelected || (readOnly && isAtCursor)
                ? '0 0 0 9px rgba(white, .2), inset 0 0 0 99px rgba(white, .2)'
                : ''
            }
            {...omit('key', rest)}>
            <LineNumber
              line={line}
              isSelecting={isSelecting}
              isSelected={isSelected}
              select={select}
              hovering={!readOnly && hovering}
              unselectable={docs.unselectable}
              numLineDigits={numLineDigits} />
            <Indentation color={bgColor} size={indentation} />
            <BlockBody
              indentation={indentation}
              tabSize={tabSize}
              block={block}
              addCapability={addCapability}
              args={docs.args}
              readOnly={readOnly}
              line={line}
              nameFunction={nameFunction}
              active={active}
              hovering={hovering}
              openParameterModal={openParameterModal}
              openFunctionModal={openFunctionModal}
              setBlockPayload={setBlockPayload}
              isBlockEnd={isBlockEnd}
              bgColor={bgColor} />
            {type !== 'userFn' &&
              (docs.args || []).map((arg, i) => (
                <BlockArgument
                  key={`${block.id}-argument-${i}}`}
                  readOnly={readOnly}
                  arg={arg}
                  scopeValues={scopedVars}
                  setArgument={!readOnly && setArgument(block, i)}
                  {...getBlockProps(active, height, bgColor, block)}
                  value={(block.payload || [])[i]} />
              ))}
            {hovering &&
              !readOnly &&
              !docs.unselectable && (
                <Icon
                  pointer
                  opacity={0.6}
                  name='delete'
                  key={block.id + 'removeIcon'}
                  hoverProps={{ opacity: 1 }}
                  ml='s'
                  fs='m'
                  onClick={actions.removeBlock(block)} />
              )}
          </Block>
        </Block>
      )
    },

    * onUpdate (prev, next) {
      if (
        !objEqual(prev.props, next.props) &&
        next.props.active &&
        next.props.running
      ) {
        let element = document.getElementById(`code-block-${next.props.line}`)
        if (!element.previousSibling) {
          return yield element.scrollIntoViewIfNeeded(false)
        }
        if (element && element.nextSibling) element = element.nextSibling
        yield element.scrollIntoViewIfNeeded(false)
      }
    },

    controller: {
      * removeBlock ({ props }, block) {
        if (block.type === 'userFn') {
          yield props.removeCapability(block.payload[0])
        }
        yield props.removeBlock(block)
      }
    }
  })
)

/**
  * Constants
  */

const inputProps = {
  bgColor: 'transparent',
  h: '100%',
  borderWidth: '0px',
  color: 'white'
}

/**
  * <BlockBody/>
  */

const BlockBody = component({
  render ({ props, actions }) {
    const { indentation, tabSize, block, active, isBlockEnd, bgColor } = props
    const blockProps = {
      ...getBlockProps(active, height, bgColor, block),
      w: isBlockEnd ? width / 1.3 : width,
      ml: 5 + indentation * tabSize,
      align: 'center center'
    }

    switch (block.type) {
      case 'comment':
        return <CommentBlock color='white' ml={blockProps.ml} {...props} />
      case 'lineBreak':
        return <Block {...blockProps} />
      case 'userFn':
        return (
          <FunctionDefinition
            {...props}
            key={'userFn' + block.id + 'body'}
            blockProps={blockProps}
            color='#333'
            w={isBlockEnd ? width / 1.3 : width} />
        )
      default:
        return (
          <Block
            color={block.type === 'paint' ? 'white' : arrowColors[block.type]}
            fs='14px'
            highlight={active ? 0.35 : 0}
            {...blockProps}>
            <BlockIcon name={block.type} />
          </Block>
        )
    }
  }
})

/**
  * <FunctionDefinition/>
  */

const FunctionDefinition = component({
  render ({ props, actions, context }) {
    const {
      openFunctionModal,
      nameFunction,
      hovering,
      blockProps,
      readOnly,
      block,
      line,
      ...rest
    } = props

    const width = 60
    const pad = 8

    const [name, ...args] = block.payload || []

    return (
      <Block align='start center' pointerEvents={readOnly ? 'none' : 'all'}>
        <Block
          {...rest}
          {...blockProps}
          cursor='default'
          color='white'
          fontFamily='monospace'>
          <Block mx='s' fs='m' mb={3} italic bold>
            ƒ
          </Block>
          <Block fs='s' flex>
            {name}
          </Block>
          <Button
            fs='s'
            p='s'
            hidden={!hovering || readOnly}
            icon='edit'
            opacity={0.6}
            hoverProps={{ opacity: 1 }}
            onClick={openFunctionModal(block, nameFunction)} />
        </Block>
        {args.map(arg => (
          <Block
            key={arg.id}
            cursor='pointer'
            fontFamily='monospace'
            align='center center'
            onClick={props.openParameterModal(block, arg)}
            relative
            {...blockProps}
            ml='s'
            minWidth={width}
            w='auto'
            px={pad}>
            <Block
              color='text'
              background='white'
              border='1px solid #555'
              lh='24px'
              px={6}
              wide
              textAlign='center'
              borderRadius={arg.type === 'string' ? 9999 : 0}>
              {arg.name}
            </Block>
          </Block>
        ))}
        <Button
          bgColor={blockProps.bgColor}
          align='center center'
          key={block.id + 'argButton'}
          onClick={props.openParameterModal(block)}
          {...blockProps}
          ml='s'
          icon='add'
          w={width}
          borderWidth='0'
          fs='m' />
      </Block>
    )
  }
})

/**
  * <Indentation/>
  */

const Indentation = component({
  render ({ props }) {
    const { size } = props
    return (
      <Block>
        {times(size > 0 ? size : 0, i => (
          <Block
            borderRight='3px dotted #7A7A7A'
            left={(i + 1) * tabSize + 5}
            h={height + margin + 2}
            top={margin / -2}
            absolute />
        ))}
      </Block>
    )
  }
})

/**
  * <CommentBlock/>
  */

const CommentBlock = component({
  render ({ props }) {
    const { setBlockPayload, block, ml, ...restProps } = props

    return (
      <Block relative align='left center' {...restProps}>
        <Block
          h='36px'
          relative
          {...props}
          align='left center'
          bgColor='#666'
          fs='28px'
          w='268px'
          fontFamily='monospace'>
          <Block ml='s' mr='3' fs='s' bold color='white'>
            {'//'}
          </Block>
          <Input
            m='0'
            h='90%'
            fs='s'
            autofocus
            inputProps={inputProps}
            onClick={stopPropagation}
            onKeyUp={decodeValue(setBlockPayload(block))}
            value={block.payload} />
        </Block>
      </Block>
    )
  }
})

/**
  * <LineNumber/>
  */

const LineNumber = component({
  render ({ props }) {
    const {
      select,
      hovering,
      line,
      unselectable,
      numLineDigits,
      isSelecting,
      isSelected
    } = props
    const checkProps = {
      align: 'center center',
      textIndent: -1,
      circle: 25,
      lh: '24px',
      fs: 14,
      ml: 5,
      line
    }
    const offset = numLineDigits * 6

    return (
      <Block
        align='center center'
        color='#666'
        w='30px'
        left={`${offset}px`}
        {...props}>
        {!unselectable && (isSelecting || hovering) ? (
          <Checkbox
            checkProps={{ ...checkProps }}
            onClick={stopPropagation}
            btn={Check}
            checked={isSelected}
            onChange={select} />
        ) : (
          <Block {...checkProps}>{line + 1}</Block>
        )}
      </Block>
    )
  }
})

/**
  * <Check/>
  */

function Check ({ props }) {
  const { checkProps, checked } = props
  const { line, ...rest } = checkProps

  return (
    <Block
      bgColor={checked ? 'green' : 'white'}
      color={checked ? 'white' : '#666'}
      border='1px solid rgba(black, .2)'
      align='center center'
      pointer
      {...rest}>
      {line + 1}
    </Block>
  )
}

/**
  * Helpers
  */

function getBlockProps (active, height, bgColor, block) {
  return {
    boxShadow: active
      ? '0 0 7px 2px  rgba(white,.7), 0 0px 3px rgba(0,0,0,.7)'
      : '0 0',
    bgColor: bgColor,
    h: height
  }
}
