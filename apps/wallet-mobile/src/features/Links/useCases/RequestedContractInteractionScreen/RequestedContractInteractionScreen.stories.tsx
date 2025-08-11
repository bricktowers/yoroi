import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {RequestedContractInteractionScreen} from './RequestedContractInteractionScreen'

storiesOf('Links ShowDisclaimer', module)
  .addDecorator((story) => <View style={styles.container}>{story()}</View>)
  .add('trusted source', () => (
    <RequestedContractInteractionScreen message="message" isTrusted onContinue={action('onContinue')} />
  ))
  .add('untrusted source', () => (
    <RequestedContractInteractionScreen message="message" onContinue={action('onContinue')} />
  ))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})
