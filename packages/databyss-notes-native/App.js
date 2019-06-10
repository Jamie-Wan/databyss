import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import ThemeProvider from '@databyss-org/ui/theming/ThemeProvider'
import Text from '@databyss-org/ui/primitives/Text/Text'

const instructions = Platform.select({
  ios: `Press Cmd+R to reload,\nCmd+D or shake for dev menu`,
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
})

export default () => (
  <ThemeProvider>
    <View style={styles.container}>
      <Text textSize="extraLarge">Welcome to React Native!</Text>
      <Text>To get started, edit App.js</Text>
      <Text lineHeight="large" textAlign="center">
        {instructions}
      </Text>
    </View>
  </ThemeProvider>
)
