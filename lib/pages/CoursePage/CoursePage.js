/**
 * Imports
 */

import PixelGradient from 'components/PixelGradient'
import ShowcaseView from 'components/ShowcaseView'
import {component, element} from 'vdux'
import {Block, Icon} from 'vdux-ui'
import fire from 'vdux-fire'

/**
 * <Course Page/>
 */

export default fire((props) => ({
  courseVal: `/courses/${props.course}`
}))(component({
  render ({props, context}) {
  	const {courseVal} = props
  	const {value, loading} = courseVal

    if (loading) return <span />
    
    const {title, description, playlists} = value

    return (
    	<Block>
	    	<PixelGradient h={250}>
	        <Block tag='h1' m='24px 0' lighter fs={40} fontFamily='"Press Start 2P"'>
	          {title}
	        </Block>
	        <Block fs='l'>{description}</Block>
	        <Block align='center' mt='l' pointer onClick={context.setUrl('/courses')}>
	        	<Icon name='chevron_left'/>
	        	Back to Courses
        	</Block>
	      </PixelGradient>
	    	<ShowcaseView playlists={playlists} />
    	</Block>
    )
  }
}))
