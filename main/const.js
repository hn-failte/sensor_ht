export const OBJECT_ID_MAP = {
  // 湿度，temperature，长度2，有符号型变量，单位0.1度，示例：1A 01 = 0x011A 表示28.2度
  TEMP: '0x1004',
  // 湿度，humidity，长度2，取值0-1000，例如346表示湿度34.6%
  HUMI: '0x1006',
  // 无人移动，noBodyMove，长度4，无人移动状态的持续时间，单位为秒
  NBM: '0x1017',
  // 超时无人移动，noBodyMoveOverTime，长度1，0表示有人移动，1 表示X 秒无人移动
  NBMOT: '0x101B',
  // 光照强弱，lightIntensity，长度1，光照强（0x01）、光照弱（0x00）
  LIGHT: '0x1018',

  // 事件
  // 有人移动（带光照），长度3，光照强度单位为Lux，取值范围：0-120000
  MOVE: '0x000F'
};

export const TEMP_HUMI_DEVICE_INFO = {
  deviceId: 'blt.3.17fkneipoeg00',
  mac: '17:75:BD:93:38:B6'
};

export const HUMAN_SENSOR_DEVICE_INFO = {
  deviceId: 'blt.3.17fkq5kece800',
  mac: '54:EF:44:E3:48:09'
};
