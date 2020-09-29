import React, { useRef, useEffect } from 'react';
import liquidFillGauge from './liquidFillGauge';

interface Iprops {
  width?: number;
  value: number;
  settings?: {
    minValue?: number;
    maxValue?: number;
    circleThickness?: number;
    circleFillGap?: number;
    circleColor?: string;
    waveHeight?: number;
    waveCount?: number;
    waveRiseTime?: number;
    waveAnimateTime?: number;
    waveRise?: boolean;
    waveHeightScaling?: boolean;
    waveAnimate?: boolean;
    waveColor?: string;
    waveOffset?: number;
    textVertPosition?: number;
    textSize?: number;
    valueCountUp?: boolean;
    displayPercent?: boolean;
    textColor?: string;
    waveTextColor?: string;
  }
}

const { loadLiquidFillGauge, liquidFillGaugeDefaultSettings } = liquidFillGauge;
let settings = {
  ...liquidFillGaugeDefaultSettings(),
  waveRise: false,
  waveHeightScaling: false,
  waveAnimate: false,
  valueCountUp: false,
};

export default function index(props: Iprops) {
  const containerRef = useRef(null);
  const width = props.width || 120;
  useEffect(() => {
    if (containerRef && containerRef.current) {
      const containerEle = containerRef.current! as HTMLDivElement;
      containerEle.id = `liquidFillGauge-${(new Date()).getTime()}`;
      containerEle.innerHTML = '';
      if (props.settings) settings = {...settings, ...props.settings}
      loadLiquidFillGauge(containerEle.id, props.value, settings);
    }
  }, [props]);
  return (
    <svg ref={containerRef} width={width} height={width} />
  )
}
