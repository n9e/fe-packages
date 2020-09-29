import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { InjectIntlContext } from '../hooks/useFormatMessage';
import { ConfigProvider } from 'antd';
import antdZhCN from 'antd/lib/locale/zh_CN';
import antdEnUS from 'antd/lib/locale/en_US';
import { IntlProvider } from 'react-intl';
import intlZhCN from '../../locales/zh';
import intlEnUS from '../../locales/en';

interface LocaleMap {
  [index: string]: any,
}

const localeMap: LocaleMap = {
  zh: {
    antd: antdZhCN,
    intl: 'zh',
    intlMessages: intlZhCN,
  },
  en: {
    antd: antdEnUS,
    intl: 'en',
    intlMessages: intlEnUS,
  },
};

export interface ModalWrapProps {
  title?: string | React.ReactNode,
  visible: boolean,
  data?: any,
  destroy: () => void,
  onOk: (...args: any[]) => void,
  onCancel: () => void,
}

export default function ModalControlWrap(Component: typeof React.Component) {
  return function ModalControl(config: any) {
    const div = document.createElement('div');
    document.body.appendChild(div);

    function destroy() {
      const unmountResult = ReactDOM.unmountComponentAtNode(div);
      if (unmountResult && div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    function render(props: any) {
      ReactDOM.render(
        <IntlProvider
          locale={_.get(localeMap[config.language], 'intl', 'zh')}
          messages={_.get(localeMap[config.language], 'intlMessages', intlZhCN)}
        >
          <ConfigProvider locale={_.get(localeMap[config.language], 'antd', antdZhCN)}>
            <InjectIntlContext>
              <Component {...props} />
            </InjectIntlContext>
          </ConfigProvider>
        </IntlProvider>,
        div,
      );
    }

    render({ ...config, visible: true, destroy });

    return {
      destroy,
    };
  };
}
