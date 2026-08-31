import { Image, StyleSheet, View } from 'react-native';

import cardanoLogo from '@/assets/images/cardano-ada-logo.png';
import { ThemedText } from '@/components/ThemedText';

export function SavingsHeader() {
  return (
    <View style={styles.container}>
      <Image source={cardanoLogo} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>
        ADA Savings with yield
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    marginRight: 16,
  },
  logo: {
    height: 56,
    width: 56,
    resizeMode: 'contain',
  },
});
