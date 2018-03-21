// @flow

import { Platform } from 'react-native';
import styled from 'styled-components/native';

const font = Platform.select({
  ios: 'GillSans-light',
  android: 'sans-serif-thin'
});

export default styled.Text`
  color: white;
  font-family: ${font};
  font-size: 32px;
  margin-top: 120px;
  background-color: transparent;
  text-align: center;
`;
