import React from 'react';
import { View, ActivityIndicator } from 'react-native';
// prop size (small or large), foreground color
const Spinner = ({ size , color }) => {
  return (
    <View style={styles.spinnerStyle}>
      <ActivityIndicator size={size || 'large'} color={color || '#a0a0a0'}/>
    </View>
  );
};

const styles = {
  spinnerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
};

export { Spinner };
