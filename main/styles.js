import { StyleSheet } from 'react-native';
import { Styles as SdkStyles } from 'miot/resources';
import * as SdkFontStyle from 'miot/utils/fonts';

export default StyleSheet.create({
  container: {
    backgroundColor: SdkStyles.common.backgroundColor
  },
  info: {
    height: 300
  },
  textStyle: {
    fontSize: 16,
    lineHeight: 18,
    color: '#666666',
    marginBottom: 10
  },
  textStyle1: {
    fontSize: 20,
    lineHeight: 22,
    color: '#333333',
    fontFamily: SdkFontStyle.FontKmedium,
    marginBottom: 20
  }
});
