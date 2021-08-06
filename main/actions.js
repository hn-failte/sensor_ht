import { Service } from 'miot';
import { Bluetooth } from 'miot';

export const doAction = (params) => {
  if (params.type === 'spec') {
    // 请求调用使用 MIoT-Spec 定义产品功能的产品的方法
    return Service.spec
      .doAction(params)
      .then((res) => {
        console.log('res', res);
      })
      .catch((error) => {
        console.log('error', error);
      });
  } else if (params.type === 'ble') {
    // 请求调用 BLE 设备的方法
    let mac = 'aa:bb:cc:dd:ee:ff';
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
  }
  return Promise.reject('params need type');
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
    let mac = 'aa:bb:cc:dd:ee:ff';

    Bluetooth.spec
      .getPropertiesValue(mac)
      .then((res) => console.log(JSON.stringify(res)))
      .catch((err) => console.log(JSON.stringify(err)));
  }
};

export const setBleProp = (params) => {
  // 修改BLE 设备的属性值，调用前确保已建立蓝牙连接
  let mac = 'aa:bb:cc:dd:ee:ff';
  let data = { objects: [{ siid: 1, piid: 2, value: 'abc', type: 10 }] };
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
