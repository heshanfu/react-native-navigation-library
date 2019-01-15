import React, { Component } from 'react'

import {
  StyleSheet,
  Text,
  View,
  Button,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native'

import {
  Navigator,
  Stack,
  Header,
  TabBar,
  Tabs,
  Tab,
  Switch,
  Screen,
  Modal,
  Router,
  Route,
} from 'react-native-navigation-library'

export default class App extends Component {
  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <TabsExample />
      </SafeAreaView>
    )
  }
}

function RouterExample() {
  return (
    <Navigator>
      <Router>
        <Route name="Test-1">
          <MyRoute nextRoute="Test-3" />
        </Route>
        <Route name="Test-2">
          <MyRoute nextRoute="Test-1" />
        </Route>
        <Route name="Test-3">
          <MyRoute nextRoute="Test-2" />
        </Route>
      </Router>
    </Navigator>
  )
}

function MyRoute(props) {
  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <Text style={styles.title}>{props.name}</Text>
      {/* <Text style={styles.subtitle}>{props.data.test}</Text> */}
      <Button
        title={`Go to ${props.nextRoute}`}
        onPress={() =>
          props.navigation.navigate(props.nextRoute, { test: props.nextRoute })
        }
      />
    </View>
  )
}

function TabsExample() {
  return (
    <Navigator>
      <Header>
        <MyHeader text="Header 1" />
        <MyHeader text="Header 2" />
        <MyHeader text="Header 3" />
      </Header>

      <Tabs>
        <Screen>
          <Panel title="Panel 1" subtitle="Panel 1" />
        </Screen>
        <Screen>
          <Panel title="Panel 2" subtitle="Panel 2" />
        </Screen>
        <Screen>
          <Panel title="Panel 3" subtitle="Panel 3" />
        </Screen>
      </Tabs>

      <TabBar>
        <Tab>
          <MyTab text="Tab 1" />
        </Tab>
        <Tab>
          <MyTab text="Tab 2" />
        </Tab>
        <Tab>
          <MyTab text="Tab 3" />
        </Tab>
      </TabBar>
    </Navigator>
  )
}

function StackExample() {
  return (
    <Navigator>
      <Stack>
        <Screen>
          <StackScreen title="Stack 1" />
        </Screen>
        <Screen>
          <StackScreen title="Stack 2" />
        </Screen>
        <Screen>
          <StackScreen title="Stack 3" />
        </Screen>
      </Stack>
    </Navigator>
  )
}

function ModalExample() {
  return (
    <Navigator>
      <Switch>
        <Screen>
          <ModalPanel />
        </Screen>
      </Switch>
      <Modal>
        <Screen>
          <ModalScreen />
        </Screen>
      </Modal>
    </Navigator>
  )
}

function ModalScreen(props) {
  return (
    <View style={[styles.container, { backgroundColor: 'white' }]}>
      <Text style={styles.title}>I'm a modal</Text>
      <Text style={styles.subtitle}>{props.subtitle}</Text>
      <Button
        title="Dismiss modal"
        onPress={() => props.navigation.modal.dismiss()}
      />
    </View>
  )
}

function ModalPanel(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.subtitle}>{props.subtitle}</Text>
      <Button
        title="Display modal"
        onPress={() => props.navigation.modal.push()}
      />
    </View>
  )
}

function StackScreen(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.subtitle}>{props.subtitle}</Text>
      <Button title="Next" onPress={() => props.navigation.push()} />
      <Button title="Previous" onPress={() => props.navigation.pop()} />
    </View>
  )
}

function Panel(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.subtitle}>{props.subtitle}</Text>
    </View>
  )
}

function MyTab(props) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: props.active ? 1 : 0,
      }}>
      <Text>{props.text}</Text>
    </View>
  )
}

function MyHeader(props) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: props.active ? 1 : 0,
      }}>
      <Text>{props.text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    margin: 10,
  },
})
