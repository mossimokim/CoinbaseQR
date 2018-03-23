import React from 'react';
import {View, Platform} from 'react-native';

const StatusBar = (props) => {
  return(
    //Accepts styles using props
    <View style={[styles.statusBar, props.style || {}]}>
    </View>
  );
}

const styles = {
  statusBar: {
    // Apply 20px top margin only if ios
    height: (Platform.OS === 'ios') ? 20 : 0,
    backgroundColor: "white",
  }
}

module.exports= StatusBar
