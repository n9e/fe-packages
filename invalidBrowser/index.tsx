import React from 'react';
import { Modal } from 'antd';
import * as Bowser from 'bowser';
import _ from 'lodash';
import './style.less';

const browser = Bowser.getParser(window.navigator.userAgent);
const supportedBrowser = {
  windows: {
    chrome: '>=80',
    edge: '>=80',
    firefox: '>=80',
    safari: '>=13',
  },
  macos: {
    chrome: '>=80',
    edge: '>=80',
    firefox: '>=80',
    safari: '>=13',
  },
  linux: {
    chrome: '>=80',
    firefox: '>=80',
  }
};
export const isValidBrowser = browser.satisfies(supportedBrowser);

function invalidBrowserModal() {
  Modal.warning({
    width: 600,
    title: <p className="invalid-browse-modal-content-top">Hi~,您的浏览器版本过低</p>,
    content: (
      <div className="invalid-browse-modal-content">
        <p className="invalid-browse-modal-content-center">
          当前浏览器是：
          {browser.getBrowserName()}
          {' '}
          {browser.getBrowserVersion()}
        </p>
        <p className="invalid-browse-modal-content-center">
          页面正常访问需要：
          {
            _.join(_.map(supportedBrowser, (version, name) => `${name} ${version}`), ', ')
          }
        </p>
        <p className="invalid-browse-modal-content-center">建议您对浏览器进行升级，以便获得更好的使用体验。</p>
      </div>
    ),
    okButtonProps: {
      style: {
        display: 'none',
      },
    },
  });
}

export default function invalidBrowser() {
  if (!isValidBrowser) {
    invalidBrowserModal();
  }
}
