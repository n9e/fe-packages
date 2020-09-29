import React, { useState, useEffect } from 'react';
import { Radio, Button, message } from 'antd';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import less from 'less';
import './index.less';

const themeConf = [
  {
    title: '宝石蓝',
    color: '#2486B9',
  },
  {
    title: '碧玉绿',
    color: '#41B349',
  },
  {
    title: '飞燕蓝',
    color: '#0F59A4',
  },
  {
    title: '钢蓝',
    color: '#142334',
  },
  {
    title: '宫殿绿',
    color: '#20894D',
  },
  {
    title: '火焰橙',
    color: '#FC7930',
  },
  {
    title: '科幻蓝',
    color: '#2070FE',
  },
  {
    title: '孔雀蓝',
    color: '#0EB0C9',
  },
  {
    title: '暖阳红',
    color: '#CC3526',
  },
  {
    title: '熔岩红',
    color: '#F34718',
  },
  {
    title: '星空紫',
    color: '#2E317C',
  },
  {
    title: '炫酷紫',
    color: '#8A2BE2',
  },
];

const initThemeValue = {
  '@primary-color': '#2070FE',
};

export default function Theme() {
  const [themeColor, setThemeColor] = useState('2486B9');
  const initVars = Object.assign(
    {},
    initThemeValue,
    JSON.parse(localStorage.getItem('app-theme') || '{}'),
  );
  const [themeVars, setThemeVars] = useState(initVars);
  const handleThemeChange = (e: RadioChangeEvent) => {
    setThemeColor(e.target.value);
  };

  useEffect(() => {
    less
      .modifyVars(themeVars)
      .then(() => {})
      .catch((e: any) => {
        message.error(`Failed to update theme`);
        console.log(e);
      });
  }, [themeVars]);

  return (
    <div className="theme-modal-body">
      <Radio.Group onChange={handleThemeChange} value={themeColor}>
        {themeConf.map(themeItem => {
          return (
            <Radio key={`theme-${themeItem.color}`} value={themeItem.color}>
              <div className="theme-modal-radio-children">
                <div className="theme-modal-radio-model">
                  <div className="theme-modal-radio-model-header" style={{ background: themeItem.color }} />
                  <div className="theme-modal-radio-model-main">
                    <div className="theme-modal-radio-model-left" />
                    <div className="theme-modal-radio-model-right" />
                  </div>
                </div>
                <span>{themeItem.title}</span>
              </div>
            </Radio>
          );
        })}
      </Radio.Group>
      <Button
        style={{ position: 'relative', top: -50 }}
        type="primary"
        onClick={() => {
          const newThemeVars = {
            '@primary-color': themeColor,
          };
          setThemeVars(newThemeVars);
          localStorage.setItem('app-theme', JSON.stringify(newThemeVars));
        }}
      >
        提交
      </Button>
    </div>
  );
}
