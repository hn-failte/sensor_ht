import React, { Component } from 'react';
import { API_LEVEL, Package, Host, Device, PackageEvent, Service } from 'miot';
import { View, ScrollView, Text, Image } from 'react-native';
import NavigationBar from 'miot/ui/NavigationBar';
import Separator from 'miot/ui/Separator';
import { strings as SdkStrings } from 'miot/resources';
import PluginStrings from '../resources/strings';
import styles from './styles';

export default class MainPage extends Component {
  /**
   * 页面内部自定义Header
   * @param navigation
   * @returns {{header: *}|{header: null}}
   */
  static navigationOptions = ({ navigation }) => {
    const { titleProps } = navigation.state.params || {};
    if (!titleProps) return { header: null };
    return {
      header: <NavigationBar {...titleProps} />
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      /**
       * @property {String} type
       * @property {String} description
       * @property {String} dynamic
       * @property {Object} services
       */
      specInfo: {},
      /**
       * @property {String} id
       * @property {String} siid
       * @property {String} piid
       * @property {String} code
       */
      specValue: {}
    };

    this.initNavigationBar();
  }

  initNavigationBar() {
    this.props.navigation.setParams({
      titleProps: {
        title: Device.name,
        left: [
          {
            key: NavigationBar.ICON.BACK,
            onPress: () => {
              Package.exit();
            }
          }
        ],
        right: [
          {
            key: NavigationBar.ICON.MORE,
            onPress: () => {
              // 跳转到设置页
              this.props.navigation.navigate('SettingPage', {
                title: SdkStrings.setting
              });
            }
          }
        ]
      }
    });
    Service.spec
      .getSpecString(Device.deviceID)
      .then((res) => {
        this.setState({
          specInfo: JSON.parse(res)
        });
      })
      .catch((error) => {
        console.log('error', error);
      });
    Service.spec
      .getPropertiesValue([{ did: Device.deviceID, sid: 1, pid: 1 }])
      .then(([res]) => {
        this.setState({
          specValue: res
        });
      });
  }

  UNSAFE_componentWillMount() {
    this.packageAuthorizationAgreed = PackageEvent.packageAuthorizationAgreed.addListener(
      () => {
        // 隐私弹窗-用户点击同意
        console.log('user agree protocol...');
      }
    );
  }

  /**
   * 渲染设备信息
   * @returns
   */
  renderSpecInfo = () => (
    <Text style={{ padding: 20 }}>
      {Object.keys(this.state.specInfo)
        .map((key) => {
          const value = this.state.specInfo[key];
          return `${key}: ${
            typeof value === 'string' ? value : JSON.stringify(value)
          }`;
        })
        .join('\n')}
    </Text>
  );

  /**
   * 渲染设备值
   * @returns
   */
  renderSpecValue = () => (
    <Text style={{ padding: 20 }}>
      {Object.keys(this.state.specValue)
        .map((key) => {
          const value = this.state.specValue[key];
          return `${key}: ${value}`;
        })
        .join('\n')}
    </Text>
  );

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.info}>
          {this.renderSpecInfo()}
          {this.renderSpecValue()}
        </ScrollView>
        <Separator />
        <View style={{ padding: 20 }}>
          <Text style={styles.textStyle1}>{PluginStrings.hello}</Text>
          <Text style={styles.textStyle}>
            当前使用的SDK版本号(API_LEVEL):{API_LEVEL}
          </Text>
          <Text style={styles.textStyle}>
            当前米家APP支持的SDK版本号(NATIVE_API_LEVEL):{Host.apiLevel}
          </Text>
          <Text style={styles.textStyle}>
            当前插件的版本号(Plugin Version):{Package.version}
          </Text>
          <Text style={styles.textStyle}>插件包名:{Package.packageName}</Text>
          <Text style={styles.textStyle}>
            插件支持的设备models:{Package.models}
          </Text>
        </View>
      </View>
    );
  }

  componentWillUnmount() {
    // 取消监听
    this.packageAuthorizationAgreed && this.packageAuthorizationAgreed.remove();
  }
}
