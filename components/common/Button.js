import React, { Component } from 'react';
import { TouchableOpacity, StyleSheet, Text} from 'react-native';

const Button = (props) => (
  <TouchableOpacity activeOpacity={0.5} onPress={props.onPress} style={[styles.buttonStyle, props.style || {}]}>
    <Text>{props.text}</Text>
  </TouchableOpacity>
);

const styles = {
  buttonStyle:{
    height: 50,
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
  }
}

export default Button;
