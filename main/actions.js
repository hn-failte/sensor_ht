import { Bluetooth, Device, Service } from 'miot';

/**
 * 判断当前设备是否通过蓝牙网关扫描到了
 * @param {String} mac
 * @returns {Boolean}
 */
export const isBleGatewayConnected = (mac) => {
  return Bluetooth.isBleGatewayConnected(mac);
};

/**
 * 同步与时间相关的设备数据
 * @returns
 */
export const getDeviceDataWithTime = (params) => {
  return Service.smarthome
    .getDeviceData(params)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * 同步与时间无关的设备数据
 * @param {*} params
 * @returns
 */

export const getDeviceData = async (params) => {
  return Service.smarthome
    .batchGetDeviceDatas(params)
    .then((res) => {
      console.log('getDeviceData_res', res);
      return res;
    })
    .catch((err) => {
      Service.smarthome.reportLog(
        Device.model,
        `Service.smarthome.batchGetDeviceDatas error: ${JSON.stringify(error)}`
      );
    });
};

export const doSpecAction = (params) => {
  // 请求调用使用 MIoT-Spec 定义产品功能的产品的方法
  return Service.spec
    .doAction(params)
    .then((res) => {
      console.log('res', res);
    })
    .catch((error) => {
      console.log('error', error);
    });
};

export const doBLEAction = (params) => {
  // 请求调用 BLE 设备的方法
  let mac = params.mac || 'aa:bb:cc:dd:ee:ff';
  let data = {
    siid: 1,
    aiid: 2,
    objects: [{ piid: 2, value: 'abc', type: 10 }]
  };
  data = JSON.stringify(data);
  return Bluetooth.spec
    .doAction(mac, data)
    .then((res) => console.log(JSON.stringify(res)))
    .catch((err) => console.log(JSON.stringify(err)));
};

export const getDeviceProp = (params) => {
  if (params.type === 'spec') {
    // 请求获取使用MIoT-Spec 定义产品功能的产品属性值
    Service.spec
      .getPropertiesValue(params)
      .then((res) => {
        console.log('res', res);
      })
      .catch((error) => {
        console.log('error', error);
      });
  } else if (params.type === 'ble') {
    // 获取或修改BLE 设备的属性值，调用前确保已建立蓝牙连接
    let mac = params.mac || 'aa:bb:cc:dd:ee:ff';

    return Bluetooth.spec
      .getPropertiesValue(mac)
      .then((res) => console.log(JSON.stringify(res)))
      .catch((err) => console.log(JSON.stringify(err)));
  }
};

export const setBleProp = (params) => {
  // 修改BLE 设备的属性值，调用前确保已建立蓝牙连接
  let mac = params.mac || 'aa:bb:cc:dd:ee:ff';
  let data = {
    objects: [
      {
        siid: params.siid || 1,
        piid: params.piid || 2,
        value: params.value || 'abc',
        type: params.type || 10
      }
    ]
  };
  data = JSON.stringify(data);

  Bluetooth.spec
    .setPropertiesValue(mac, data)
    .then((res) => console.log(JSON.stringify(res)))
    .catch((err) => console.log(JSON.stringify(err)));

  Bluetooth.spec
    .getPropertiesValue(mac, data)
    .then((res) => console.log(JSON.stringify(res)))
    .catch((err) => console.log(JSON.stringify(err)));
};
