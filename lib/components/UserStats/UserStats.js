/**
 * Imports
 */

import { component, element } from 'vdux'
import { Block } from 'vdux-ui'
import Badge from 'components/Badge'

/**
 * <User Stats/>
 */

export default component({
  render ({ props }) {
    const { badges = {}, stats = {} } = props.profile
    const {
      completed = 0,
      lineLimit = 0,
      stepLimit = 0,
      errorLimit = 0,
      modLimit = 0
    } = badges

    return (
      <Block w='800px' mx='auto'>
        <Block mb='l' bgColor='white' border='1px solid divider'>
          <Block
            bg='#835584'
            p
            textAlign='center'
            color='white'
            fontFamily='&quot;Press Start 2P&quot;'>
            Badges
          </Block>
          <Block align='space-around center' p='l'>
            <Badge type='completed' count={completed} />
            <Badge type='lineLimit' count={lineLimit} />
            <Badge type='stepLimit' count={stepLimit} />
          </Block>
          <Block align='center center' p='l'>
            <Badge type='errorLimit' count={errorLimit} mr='xl' />
            <Badge type='modLimit' count={modLimit} ml='xl' />
          </Block>
        </Block>
        <Block bgColor='white' border='1px solid divider' flex>
          <Block
            bg='#835584'
            p
            textAlign='center'
            color='white'
            fontFamily='&quot;Press Start 2P&quot;'>
            Stats
          </Block>
          <Block p>
            <Row label='Playlists Completed'>
              {stats.completedPlaylists || 0}
            </Row>
            <Row label='Reading Challenges'>{stats.read || 0}</Row>
            <Row label='Writing Challenges'>{stats.write || 0}</Row>
            <Row label='Debug Challenges'>{stats.debug || 0}</Row>
            <Row label='Project Challenges'>{stats.project || 0}</Row>
          </Block>
        </Block>
      </Block>
    )
  }
})

const Row = component({
  render ({ props, children }) {
    const { label, ...rest } = props
    return (
      <Block
        py
        align='start center'
        fontFamily='&quot;Press Start 2P&quot;'
        fs={14}
        {...rest}>
        <Block w='60%' pr='l'>
          {label}:
        </Block>
        <Block>{children}</Block>
      </Block>
    )
  }
})
