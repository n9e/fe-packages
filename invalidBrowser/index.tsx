import React from 'react';
import { Modal } from 'antd';
import * as Bowser from "bowser";
import api from '../api';
import './style.less';

const browser = Bowser.getParser(window.navigator.userAgent);
export const isValidBrowser = browser.satisfies({
  chrome: '>=80',
  edge: '>=84'
});

function invalidBrowserModal(downloadBrowserUrl?: { edge: string, chrome: string }) {
  Modal.warning({
    width: 600,
    title: <p className="invalid-browse-modal-content-top">Hi~,您的浏览器版本过低</p>,
    content: (
      <div className="invalid-browse-modal-content">
        <p className="invalid-browse-modal-content-center">建议您对浏览器进行升级，以便获得更好的使用体验。</p>
        <p className="invalid-browse-modal-content-backColor" />
        <p className="invalid-browse-modal-content-bottom">推荐以下浏览器和版本</p>
        {
          downloadBrowserUrl ?
            <div className="invalid-browse-modal-bottom">
              <a href={downloadBrowserUrl.edge}>
                <img alt="IE Edge" src={require('./imgs/IE.png')} />
                <p>IE Edge</p>
              </a>
              <a href={downloadBrowserUrl.chrome}>
                <img alt="Google Chrome" src={require('./imgs/google.png')} />
                <p>Google Chrome</p>
              </a>
            </div> : null
        }
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
    fetch(api.downloadBrowser).then((res) => {
      return res.json();
    }).then((res) => {
      invalidBrowserModal(res.dat);
    }).catch((e) => {
      console.log(e);
      invalidBrowserModal();
    });
  }
}
