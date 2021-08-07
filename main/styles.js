import { StyleSheet } from 'react-native';
import { Styles as SdkStyles } from 'miot/resources';
import * as SdkFontStyle from 'miot/utils/fonts';

export default StyleSheet.create({
  container: {
    backgroundColor: SdkStyles.common.backgroundColor
  },
  opContainer: {
    flex: 1,
    flexDirection: `column`,
    justifyContent: `center`,
    alignItems: `center`
  },
  opButton: {
    flexDirection: `column`,
    width: 150,
    margin: 5
  },
  info: {
    height: 300
  },
  textStyle: {
    fontSize: 16,
    lineHeight: 18,
    color: `#666666`,
    marginBottom: 10
  },
  textTitle: {
    fontSize: 20,
    fontWeight: `bold`,
    textAlign: `center`,
    lineHeight: 24,
    color: `#333333`,
    fontFamily: SdkFontStyle.FontKmedium,
    margin: 20
  },
  center: {
    textAlign: `center`
  },
  p5: {
    padding: 5
  },
  pullData: {
    flex: 1,
    margin: 10
  },
  debugInfo: {
    padding: 10
  },
  bold: {
    fontWeight: `bold`
  }
});
