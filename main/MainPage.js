import React, { Component } from 'react';
import {
  API_LEVEL,
  Package,
  Host,
  Device,
  DeviceEvent,
  PackageEvent,
  Service
} from 'miot';
import { View, ScrollView, Text, Button, TextInput } from 'react-native';
import NavigationBar from 'miot/ui/NavigationBar';
import Separator from 'miot/ui/Separator';
import { strings as SdkStrings } from 'miot/resources';
import dayjs from 'dayjs';
import { getDeviceDataWithTime } from './actions';
import {
  OBJECT_ID_MAP,
  TEMP_HUMI_DEVICE_INFO,
  HUMAN_SENSOR_DEVICE_INFO
} from './const';
import { hex2int } from './utils';
import { post } from './request';
import styles from './styles';

const TEMP = hex2int(OBJECT_ID_MAP.TEMP);
const HUMI = hex2int(OBJECT_ID_MAP.HUMI);
const NBM = hex2int(OBJECT_ID_MAP.NBM);
const LIGHT = hex2int(OBJECT_ID_MAP.LIGHT);

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
      temperatureHistory: [],
      humidityHistory: [],
      moveHistory: [],
      lightHistory: [],
      specInfo: {},
      specValue: {},
      config: {
        server: 'http://10.0.0.4:8080',
        syncTemp: '/t',
        syncLight: '/l',
        syncPersion: '/p',
        limit: 10,
        pullInterval: 30,
        syncInterval: 30
      },
      status: {
        pull: false,
        sync: false
      }
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
    // 使用subscribeMessages()接口订阅产品的属性
    // Device.getDeviceWifi()
    //   .subscribeMessages('prop.1.1')
    //   .then((subcription) => {
    //     this.subcription = subcription;
    //   })
    //   .catch((error) => {});
    // // 添加监听事件，若产品的属性发生变化，会发送事件到js，此处会收到监听回调
    // this.deviceReceivedMessages = DeviceEvent.deviceReceivedMessages.addListener(
    //   (device, map, data) => {
    //     console.log('Device.addListener', device, map, data);
    //   }
    // );
  }

  /**
   * 获取相关设备最新的数据
   */
  getLatestData = () => {
    this.getTempAndHumi(TEMP_HUMI_DEVICE_INFO.deviceId);
    this.getEnvMove(HUMAN_SENSOR_DEVICE_INFO.deviceId);
  };

  /**
   * 开始数据定时拉取
   */
  startPull = () => {
    console.log('startPull');
    if (this.loopPull) return;
    this.getLatestData();
    this.loopPull = setInterval(
      this.getLatestData,
      this.state.config.pullInterval * 1000
    );
    this.setState((state) => {
      state.status = { ...state.status, pull: true };
      return state;
    });
  };

  /**
   * 停止数据定时拉取
   */
  stopPull = () => {
    clearInterval(this.loopPull);
    this.loopPull = null;
    this.setState((state) => {
      state.status = { ...state.status, pull: false };
      return state;
    });
  };

  /**
   * 同步温度、有人、光照数据
   */
  syncData = () => {
    const {
      config,
      temperatureHistory,
      moveHistory,
      lightHistory
    } = this.state;
    const [tempItem] = temperatureHistory;
    const [moveItem] = moveHistory;
    const [lightItem] = lightHistory;
    post(`${config.server}${config.syncTemp}`, {
      temp: tempItem.value,
      time: tempItem.time
    }).then((res) => {
      console.log('syncTemp', res);
    });
    post(`${config.server}${config.syncPersion}`, {
      is_someone_here: moveItem.value,
      time: moveItem.time
    }).then((res) => {
      console.log('syncPersion', res);
    });
    post(`${config.server}${config.syncLight}`, {
      light: lightItem.value,
      time: lightItem.time
    }).then((res) => {
      console.log('syncLight', res);
    });
  };

  /**
   * 开始数据定时同步
   */
  startSync = () => {
    console.log('startSync');
    if (this.loopSync) return;
    this.syncData();
    this.loopSync = setInterval(
      this.syncData,
      this.state.config.syncInterval * 1000
    );
    this.setState((state) => {
      state.status = { ...state.status, sync: true };
      return state;
    });
  };

  /**
   * 停止数据定时同步
   */
  stopSync = () => {
    clearInterval(this.loopSync);
    this.loopSync = null;
    this.setState((state) => {
      state.status = { ...state.status, sync: false };
      return state;
    });
  };

  /**
   * 获取格式化的数据
   * @param {object} item
   * @returns
   */
  getFormatValue(item) {
    const value = JSON.parse(item.value)[0];
    if (+item.key === LIGHT) {
      return parseInt('0x' + value);
    }
    if (+item.key === NBM) {
      const val =
        '0x' +
        value[6] +
        value[7] +
        value[4] +
        value[5] +
        value[2] +
        value[3] +
        value[0] +
        value[1];
      let result = parseInt(val);
      return result;
    }
    const val = '0x' + value[2] + value[3] + value[0] + value[1];
    const binary = parseInt(val, 16).toString(2);
    let result = 0;
    if (binary.length == 16 && binary[0] == 1) {
      let num = '';
      for (let i = 1; i < binary.length; i++) {
        num += binary[i] == '1' ? '0' : '1';
      }
      result = -parseInt(num, 2) - 1;
    } else {
      result = parseInt(val);
    }

    if (+item.key === TEMP) return String(result / 10);
    else if (+item.key === HUMI) return result / 10;
    return result;
  }
  /**
   * 渲染设备信息
   * @returns
   */
  renderSpecInfo = () => (
    <Text style={styles.p5}>
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
    <Text style={styles.p5}>
      {Object.keys(this.state.specValue)
        .map((key) => {
          const value = this.state.specValue[key];
          return `${key}: ${value}`;
        })
        .join('\n')}
    </Text>
  );

  /**
   * 获取温湿度
   * @returns
   */
  getTempAndHumi = async (deviceID) => {
    let now = parseInt(Date.now() / 1000 - 3600 * 60);
    let end = parseInt(Date.now() / 1000);
    const tData = await getDeviceDataWithTime({
      did: deviceID,
      key: [TEMP, HUMI],
      type: 'prop',
      time_start: now,
      time_end: end,
      group: 'hour',
      limit: this.state.config.limit
    });

    const data = tData.map((tItem) => ({
      ...tItem,
      time: dayjs(new Date(tItem.time * 1000)).format('YYYY-MM-DD hh:mm:ss'),
      value: this.getFormatValue(tItem)
    }));
    const temperatureHistory = data.filter((item) => +item.key === TEMP);
    const humidityHistory = data.filter((item) => +item.key === HUMI);
    console.log(
      'temperatureHistory, humidityHistory',
      temperatureHistory,
      humidityHistory
    );
    this.setState({
      temperatureHistory,
      humidityHistory
    });
    console.log('getTempAndHumi', data);
  };

  /**
   * 获取环境与移动信息
   * @returns
   */
  getEnvMove = async (deviceID) => {
    let now = parseInt(Date.now() / 1000 - 3600 * 60);
    let end = parseInt(Date.now() / 1000);
    const tData = await getDeviceDataWithTime({
      did: deviceID,
      key: [NBM, LIGHT],
      type: 'prop',
      time_start: now,
      time_end: end,
      group: 'hour',
      limit: this.state.config.limit
    });

    const data = tData.map((tItem) => ({
      ...tItem,
      time: dayjs(new Date(tItem.time * 1000)).format('YYYY-MM-DD hh:mm:ss'),
      value: this.getFormatValue(tItem)
    }));
    console.log('getEnvMove', data);
    const moveHistory = data.filter((item) => +item.key === NBM);
    const lightHistory = data.filter((item) => +item.key === LIGHT);
    this.setState({
      moveHistory,
      lightHistory
    });
  };

  render() {
    const {
      temperatureHistory,
      humidityHistory,
      moveHistory,
      lightHistory,
      status
    } = this.state;
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.textTitle}>{'黝黑蜗牛智能硬件中枢'}</Text>
        <Text style={styles.center}>{`定时拉取(${
          this.state.config.pullInterval
        }s)：${status.pull ? '开' : '关'}`}</Text>
        <Text style={styles.center}>{`定时同步(${
          this.state.config.syncInterval
        }s)：${status.sync ? '开' : '关'}`}</Text>
        <View style={styles.opContainer}>
          <View style={styles.opButton}>
            <Button onPress={this.startPull} title={'开始定时拉取设备数据'} />
          </View>
          <View style={styles.opButton}>
            <Button onPress={this.stopPull} title={'停止定时拉取设备数据'} />
          </View>
          <View style={styles.opButton}>
            <Button onPress={this.startSync} title={'开始定时同步数据到后台'} />
          </View>
          <View style={styles.opButton}>
            <Button onPress={this.stopSync} title={'停止定时同步数据到后台'} />
          </View>
        </View>
        <View style={styles.pullData}>
          <Text style={{ ...styles.bold, ...styles.center }}>
            {'----中枢数据----'}
          </Text>
          <Text style={{ ...styles.bold, ...styles.center }}>
            {temperatureHistory.length ? '温度' : ''}
          </Text>
          {temperatureHistory.map((temp) => (
            <Text
              style={{
                ...styles.center,
                color: temp.value > 26 ? `black` : `red`
              }}
              key={temp.time}
            >
              {temp.value + '°C ---- ' + temp.time}
            </Text>
          ))}
        </View>
        <View style={styles.pullData}>
          <Text style={{ ...styles.bold, ...styles.center }}>
            {humidityHistory.length ? '湿度' : ''}
          </Text>
          {humidityHistory.map((humi) => (
            <Text style={styles.center} key={humi.time}>
              {humi.value + '% ---- ' + humi.time}
            </Text>
          ))}
        </View>
        <View style={styles.pullData}>
          <Text style={{ ...styles.bold, ...styles.center }}>
            {moveHistory.length ? '是否有人' : ''}
          </Text>
          {moveHistory.map((move) => (
            <Text
              style={{ ...styles.center, color: move.value ? `black` : `red` }}
              key={move.time}
            >
              {(move.value ? move.value + '秒无人移动' : '有人移动') +
                ' ---- ' +
                move.time}
            </Text>
          ))}
        </View>
        <View style={styles.pullData}>
          <Text style={{ ...styles.bold, ...styles.center }}>
            {lightHistory.length ? '光照强弱' : ''}
          </Text>
          {lightHistory.map((light) => (
            <Text
              style={{ ...styles.center, color: light.value ? `red` : `black` }}
              key={light.time}
            >
              {(light.value ? '光照强' : '光照弱') + ' ---- ' + light.time}
            </Text>
          ))}
        </View>
        <Separator />
        <View style={styles.debugInfo}>
          <TextInput
            placeholder={'修改后台同步地址'}
            onChangeText={(text) => {
              this.setState((state) => {
                return {
                  config: Object.assign({}, state.config, { server: text })
                };
              });
            }}
          />
          <Text style={styles.textStyle}>
            当前后台同步地址：{this.state.config.server}
          </Text>
          <Text style={styles.textStyle}>当前设备:{Device.name}</Text>
          <TextInput
            placeholder={'修改最新数据条数展示'}
            onChangeText={(value) => {
              this.setState((state) => {
                return {
                  config: Object.assign({}, state.config, {
                    limit: /^\d+$/.test(value) ? +value : 30
                  })
                };
              });
            }}
          />
          <Text style={styles.textStyle}>
            展示最新{this.state.config.limit}条数据
          </Text>
          <TextInput
            placeholder={'拉取设备数据间隔(s)'}
            onChangeText={(value) => {
              this.setState((state) => {
                return {
                  config: Object.assign({}, state.config, {
                    pullInterval: /^\d+$/.test(value) ? +value : 30
                  })
                };
              });
            }}
          />
          <Text style={styles.textStyle}>
            每隔{this.state.config.pullInterval}s拉取一次
          </Text>
          <TextInput
            placeholder={'同步设备数据间隔(s)'}
            onChangeText={(value) => {
              this.setState((state) => {
                return {
                  config: Object.assign({}, state.config, {
                    syncInterval: /^\d+$/.test(value) ? +value : 30
                  })
                };
              });
            }}
          />
          <Text style={styles.textStyle}>
            每隔{this.state.config.syncInterval}s同步一次
          </Text>
          <Text style={styles.textStyle}>
            设备类型:{this.state.specInfo.type}
          </Text>
          <Text style={styles.textStyle}>
            设备did:{this.state.specValue.did}
          </Text>
          <Text style={styles.textStyle}>
            设备siid:{this.state.specValue.siid}
          </Text>
          <Text style={styles.textStyle}>
            设备piid:{this.state.specValue.piid}
          </Text>
          <Text style={styles.textStyle}>
            设备code:{this.state.specValue.code}
          </Text>
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
      </ScrollView>
    );
  }

  componentWillUnmount() {
    // 取消监听
    this.packageAuthorizationAgreed && this.packageAuthorizationAgreed.remove();
    // 完成产品属性的订阅后，若开发者退出扩展程序的界面，需释放已调用的资源，如取消订阅或取消监听
    this.subcription && this.subcription.remove(); // 取消订阅
    this.deviceReceivedMessages && this.deviceReceivedMessages.remove(); // 取消监听
  }
}
