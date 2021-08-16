import { fetch as fetchPolyfill } from 'whatwg-fetch';
import qs from 'qs';

export const request = (type, url, data) =>
  fetchPolyfill(`${url}?${type === 'get' ? qs.stringify(data) : ''}`, {
    method: type,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: type === 'post' && data ? JSON.stringify(data) : ''
  }).then((response) => {
    console.log('fetch-data:', data);
    console.log('fetch-response:', response);
    if (response.status >= 200 && response.status < 300) {
      return response;
    } else {
      console.error(`${response.status}: ${response.statusText}`);
      return {};
    }
  });

export const post = (url, data) => request('post', url, data);

export const get = (url, data) => request('get', url, data);
