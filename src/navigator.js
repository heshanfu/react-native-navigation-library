import React from 'react'
import PropTypes from 'prop-types'
import { BackButton } from 'react-router-native'

const { Provider, Consumer } = React.createContext({})

const ScreenContext = React.createContext({})

class Screens extends React.Component {
  setScreensFromChildren = children => {
    const screens = React.Children.toArray(children).map(
      (child, index) => `${child.props.name || index}`
    )
    this.setState({ screens })
  }

  state = {
    screens: [],
    setScreensFromChildren: this.setScreensFromChildren,
  }

  render() {
    return (
      <ScreenContext.Provider value={this.state}>
        {this.props.children}
      </ScreenContext.Provider>
    )
  }
}

import { Route } from 'react-router-native'

function NavigatorRoute(props) {
  return (
    <Consumer>
      {context => {
        // we can inherit the base path from parent context if we're a nested navigator
        // this helps because we no longer need to pass down all props to a custom navigator component
        let path = ''

        if (context) {
          path = `${context.basepath || ''}/${props.name}`
        }

        if (props.basepath) {
          path = `${props.basepath || ''}/${props.name}`
        }

        return (
          <Screens>
            <ScreenContext.Consumer>
              {({ screens }) => {
                return (
                  <Route
                    path={path}
                    render={({ match }) => {
                      const root = match.isExact
                      return (
                        <Route
                          path={`${path}/:activeScreen`}
                          children={({ match, location, history }) => {
                            return (
                              <Navigator
                                match={match}
                                history={history}
                                location={location}
                                initialState={location.state || {}}
                                screens={screens}
                                root={root}
                                {...props}
                                basepath={path}
                              />
                            )
                          }}
                        />
                      )
                    }}
                  />
                )
              }}
            </ScreenContext.Consumer>
          </Screens>
        )
      }}
    </Consumer>
  )
}

class Navigator extends React.Component {
  static defaultProps = {
    animated: true,
    screens: [],
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
  }

  onNavigationChange = () => {
    if (this.props.onNavigationChange) {
      this.props.onNavigationChange({
        activeIndex: this.state.activeIndex,
        activeScreen: this.props.screens[this.state.activeIndex],
        navigation: this.state.navigation,
      })
    }
  }

  push = data => {
    const { activeIndex } = this.state
    const nextScreen = this.props.screens[activeIndex + 1]

    if (nextScreen) {
      this.props.history.push(`${this.props.basepath}/${nextScreen}`, data)
    }
  }

  pop = data => {
    const { activeIndex } = this.state
    const previousScreen = this.props.screens[activeIndex - 1]
    if (previousScreen) {
      this.props.history.push(`${this.props.basepath}/${previousScreen}`, data)
    }
  }

  navigate = (routeName, data) => {
    this.props.history.push(`${this.props.basepath}/${routeName}`, data)
  }

  goTo = (routeName, data) => {
    this.props.history.push(`${routeName}`, data)
  }

  back = () => {
    if (this.props.history.index !== 0) {
      this.props.history.goBack()
    }
  }

  select = (index, data) => {
    const nextScreen = this.props.screens[index]
    if (nextScreen) {
      this.props.history.push(`${this.props.basepath}/${nextScreen}`, data)
    }
  }

  reset = () => {
    this.props.history.go(-this.state.updateCount)
    this.setState(this.initialState)
  }

  toggleModal = (name, data, active) => {
    const modal = this.state.modals.indexOf(name)

    if (modal !== -1) {
      this.setState(state => {
        return {
          navigation: {
            ...state.navigation,
            state: { ...state.navigation.state, ...data },
            modal: {
              ...state.navigation.modal,
              activeIndex: active ? modal : -1,
              active: active,
            },
          },
        }
      }, this.onNavigationChange)
    }
  }

  modal = {
    active: false,
    activeIndex: -1,

    show: (name, data) => {
      this.toggleModal(name, data, true)
    },

    dismiss: (name, data) => {
      this.toggleModal(name, data, false)
    },
  }

  registerModals = modals => {
    if (this.state.modals.length === 0) {
      this.setState({
        modals: React.Children.toArray(modals).map(
          (child, index) => child.props.name || `${index}`
        ),
      })
    }
  }

  initialState = {
    activeIndex: this.props.initialIndex || 0,
    navigation: {
      push: this.push,
      pop: this.pop,
      reset: this.reset,
      back: this.back,
      select: this.select,
      navigate: this.navigate,
      goTo: this.goTo,
      state: this.props.initialState || {},
      modal: this.modal,
    },
    basepath: this.props.basepath,
    name: this.props.name,
    animated: this.props.animated,
    modals: this.props.modals || [],
    registerModals: this.registerModals,
    updateCount: 0,
  }

  state = this.initialState

  setActiveIndex = data => {
    const { match } = this.props
    let activeIndex = 0
    if (match) {
      activeIndex = this.props.screens.indexOf(match.params.activeScreen)
    }

    this.setState(state => {
      return {
        activeIndex: activeIndex,
        navigation: {
          ...state.navigation,
          state: {
            ...state.navigation.state,
            ...data,
          },
        },
      }
    }, this.onNavigationChange)
  }

  componentDidMount() {
    if (this.props.screens.length > 0) {
      this.setActiveIndex()
    }

    // update count used to get the correct index for reset()
    this.unlisten = this.props.history.listen(() => {
      this.setState(state => {
        return {
          updateCount: state.updateCount + 1,
        }
      })
    })
  }

  componentWillUnmount() {
    this.unlisten()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.key !== this.props.location.key) {
      this.setActiveIndex(this.props.location.state)
    }

    if (this.props.root) {
      if (this.props.screens.length > 0) {
        this.props.history.push(
          `${this.props.basepath}/${this.props.screens[0]}`,
          this.props.initialState
        )
      }
    } else {
      if (prevProps.screens.length === 0 && this.props.screens.length > 0) {
        this.setActiveIndex()
      }
    }
  }

  render() {
    const children = this.props.children
    return (
      <Provider value={this.state}>
        <BackButton />
        {typeof children === 'function'
          ? children(this.state)
          : React.cloneElement(children, this.state)}
      </Provider>
    )
  }
}

function withNavigation(Component) {
  class NavigationContainer extends React.Component {
    render() {
      return (
        <Consumer>
          {context => {
            return <Component {...this.props} {...context} />
          }}
        </Consumer>
      )
    }
  }

  NavigationContainer.displayName = `withNavigation(${Component.displayName ||
    Component.name ||
    'Component'})`

  return NavigationContainer
}

class ScreenContainer extends React.Component {
  componentDidMount() {
    this.props.setScreensFromChildren(this.props.screens)
  }

  render() {
    return this.props.children
  }
}

function withScreenNavigation(Component) {
  class NavigationContainer extends React.Component {
    render() {
      return (
        <Consumer>
          {context => {
            return (
              <ScreenContext.Consumer>
                {({ setScreensFromChildren }) => {
                  return (
                    <ScreenContainer
                      screens={this.props.children}
                      setScreensFromChildren={setScreensFromChildren}
                    >
                      <Component {...this.props} {...context} />
                    </ScreenContainer>
                  )
                }}
              </ScreenContext.Consumer>
            )
          }}
        </Consumer>
      )
    }
  }

  NavigationContainer.displayName = `withNavigation(${Component.displayName ||
    Component.name ||
    'Component'})`

  return NavigationContainer
}

function withModalNavigation(ModalNavigator) {
  class RegisterModals extends React.Component {
    constructor(props) {
      super(props)

      if (props.registerModals) {
        props.registerModals(React.Children.toArray(props.modals))
      }
    }

    render() {
      return this.props.children
    }
  }

  class ModalNavigationContainer extends React.Component {
    render() {
      return (
        <Consumer>
          {context => {
            return (
              <RegisterModals
                registerModals={context.registerModals}
                modals={this.props.children}
              >
                <ModalNavigator
                  {...this.props}
                  navigation={context.navigation}
                  activeIndex={context.navigation.modal.activeIndex}
                  animated={context.animated}
                />
              </RegisterModals>
            )
          }}
        </Consumer>
      )
    }
  }

  ModalNavigationContainer.displayName = `withNavigation(${ModalNavigator.displayName ||
    ModalNavigator.name ||
    'ModalNavigator'})`

  return ModalNavigationContainer
}

export { Navigator, withNavigation, withScreenNavigation, withModalNavigation }
export default NavigatorRoute

// type Props = {
//   animated: boolean,
//   initialIndex?: number,
//   initialState?: any,
//   screens?: [string],
//   navigation?: Navigation,
//   onNavigationChange: (navigation: CallbackArgs) => void,
//   children: any,
// }

// type Navigation = {
//   back: (data: any, callback: (navigation: CallbackArgs) => void) => void,
//   push: (data: any, callback: (navigation: CallbackArgs) => void) => void,
//   pop: (data: any, callback: (navigation: CallbackArgs) => void) => void,
//   reset: (callback: (navigation: CallbackArgs) => void) => void,
//   select: (
//     index: number,
//     data: any,
//     callback: (navigation: CallbackArgs) => void
//   ) => void,
//   modal: {
//     active: boolean,
//     dismiss: (data: any) => void,
//     show: (data: any) => void,
//   },
//   navigate: (
//     routeName: string,
//     data: any,
//     callback: (navigation: CallbackArgs) => void
//   ) => void,
//   parent?: Navigation,
//   state: any,
// }

// type CallbackArgs = {
//   activeIndex: number,
//   activeScreen: string,
//   navigation: Navigation,
// }

// type State = {
//   navigation: Navigation,
//   activeIndex: number,
//   previous: [number],
//   screens: [string],
//   registerScreens: (screens: [any]) => void,
//   animated: boolean,
// }

// static propTypes = {
//   animated: PropTypes.bool,
//   initialIndex: PropTypes.number,
//   initialState: PropTypes.object,
//   navigation: PropTypes.object,
//   onNavigationChange: PropTypes.func,
//   name: PropTypes.string.isRequired,
// }
