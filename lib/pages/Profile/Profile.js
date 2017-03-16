/**
 * Imports
 */

import IndeterminateProgress from 'components/IndeterminateProgress'
import maybeAddToArray from 'utils/maybeAddToArray'
import {Avatar, Block, Flex, Text} from 'vdux-ui'
import CardFeed from 'components/CardFeed'
import Loading from 'components/Loading'
import Layout from 'layouts/MainLayout'
import {component, element} from 'vdux'
import Authored from 'pages/Authored'
import Tabs from 'components/Tabs'
import Studio from 'pages/Studio'
import filter from '@f/filter'
import enroute from 'enroute'
import fire from 'vdux-fire'
import omit from '@f/omit'

/**
 * <Profile/>
 */

const router = enroute({
  'authored': (params, props) => <Authored {...props} />,
  'studio': (params, props) => <Studio {...props} />,
  'gallery': (params, props) => <CardFeed items={props.profile.showcase} {...props} />
})

const Profile = fire((props) => ({
  thisProfile: `/users/${props.thisProfileId}`
}))(component({
  initialState: {
    selected: []
  },
  * onCreate ({props, context}) {
  	if (!props.thisProfileId) {
  		yield context.setUrl('/404')
  	}
  },
  render ({props, context, actions, state}) {
	  const {mine, thisProfile, userProfile} = props
	  const {uid, username} = context
	  const {selected} = state

	  if (thisProfile.loading) return <Loading />

	  const profile = mine ? userProfile : thisProfile.value
  	const selectMode = selected.length > 0

	  const {playlists} = profile
	  const headerBar = (
	  	<Tabs
		    tabs={['gallery', mine && 'studio', 'authored']}
		    active={props.category}
		    onClick={actions.handleClick} />
		)
	  return (
		  <Layout
		    navigation={[{category: 'user', title: profile.displayName}]}
		    bodyProps={{py: 0, display: 'flex'}}
		    titleImg={profile.photoURL}>
		    <Block column wide h='calc(100% - 1px)'>
		      <Block id='action-bar-holder' px='20px'>
		        {headerBar}
		        {router(props.category, {...props, ...state, profile})}
		      </Block>
		    </Block>
		  </Layout>
	  )
  },
  controller: {
  	* handleClick ({props, actions, context}, tab) {
  		if (props.params !== tab) {
  			yield context.setUrl(`/${props.profileName}/${tab}`)
  		}
  	}
  },
  reducer: {
  	toggleSelected: (state, key) => ({selected: maybeAddToArray(key, state.selected)}),
  	clearSelected: (state) => ({selected: []})
  }
}))

/**
 * <Loader/>
 */

export default fire((props) => ({
  thisProfileId: `/usernames/${props.profileName}`
}))(component({
  render ({props, context}) {
    const {thisProfileId} = props
    const {value, loading} = thisProfileId
    const {uid} = context

    if (loading) return <Loading />

    return <Profile
      {...omit('thisProfileId', props)}
      mine={uid === value}
      thisProfileId={value} />
  }
}))
