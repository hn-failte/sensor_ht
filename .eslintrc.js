export default {
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    'react-native': 'readonly',
    miot: 'readonly'
  }
};
