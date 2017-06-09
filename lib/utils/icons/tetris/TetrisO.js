/**
 * Imports
 */


import {component, element} from 'vdux'
import {Block} from 'vdux-ui'

/**
 * <TetrisT />
 */

export default component({
	render ({props}) {
		return (
			<Block align='center center' {...props}>
				<svg height='40' fill='white' viewBox="0 -12 100 125">
          <rect x="24.4" y="24.4" width="18.7" height="18.7"/>
          <rect x="46.8" y="24.4" width="18.7" height="18.7"/>
          <rect x="24.4" y="46.8" width="18.7" height="18.7"/>
          <rect x="46.8" y="46.8" width="18.7" height="18.7"/>
				</svg>
			</Block>
		)
	}
})