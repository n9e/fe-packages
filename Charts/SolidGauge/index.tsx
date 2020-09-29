import React, { useEffect, useRef } from 'react';
import { arc } from 'd3';
import './style.less';

interface Iprops {
  className?: string;
  style?: any;
  width?: number; // 宽度必须是高度的两倍，否则可能导致图形被截断
  height?: number;
  color?: string;
  bgColor?: string;
  fanAngle?: number; // 扇形两边角度
  fanWidth?: number; // 扇形宽度，不能把大于图形高度，建议是高度的二分之一
  rangeText?: number[];
  rangeTextClassName?: string;
  valueClassName?: string;
  value: number;
  valueUnit?: string;
}

const RATIO = window.devicePixelRatio || 1;

export default function index(props: Iprops) {
  const style = props.style || {};
  const width = props.width || 120;
  const height = props.height || 60;
  const fanWidth = props.fanWidth || 30;
  const color = props.color || '#178BCA';
  const bgColor = props.bgColor || '#EEEEEE';
  const fanAngle = props.fanAngle || Math.PI / 10;
  const rangeText = props.rangeText || [0, 100];
  const value = props.value;
  const valueUnit = props.valueUnit || ''
  const radius = height;
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current! as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;
      canvas.width = width * RATIO;
      canvas.height = height * RATIO;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.translate(width * RATIO / 2, height * RATIO);
      context.scale(RATIO, RATIO);

      // draw background
      context.beginPath();
      arc()
      .outerRadius(radius)
      .innerRadius(radius - fanWidth)
      .context(context)({
        startAngle: - Math.PI / 2 + fanAngle,
        endAngle: Math.PI / 2 - fanAngle,
      });
      context.fillStyle = bgColor;
      context.fill();

      // draw active
      context.beginPath();
      arc()
      .outerRadius(radius)
      .innerRadius(radius - fanWidth)
      .context(context)({
        startAngle: - Math.PI / 2 + fanAngle,
        endAngle: Math.PI / 2 - fanAngle - ((Math.PI - fanAngle * 2) * (1 - value / 100)),
      });
      context.fillStyle = color;
      context.fill();
    }
  }, [props]);

  return (
    <div
      style={{ width, ...style }}
      className={props.className ? `d3-charts-solid-gauge ${props.className}` : 'd3-charts-solid-gauge'}
    >
      <div
        className={props.valueClassName ? `d3-charts-solid-gauge-label ${props.valueClassName}` : 'd3-charts-solid-gauge-label'}
      >
        {value.toFixed(3)}
        <span className="d3-charts-solid-gauge-label-unit">{valueUnit}</span>
      </div>
      <canvas ref={canvasRef} />
      <div
        className={props.rangeTextClassName ? `d3-charts-solid-gauge-range ${props.rangeTextClassName}` : 'd3-charts-solid-gauge-range'}
      >
        <span style={{ float: 'left', marginLeft: fanWidth }}>{rangeText[0]}</span>
        <span style={{ float: 'right',  marginRight: fanWidth }}>{rangeText[1]}</span>
      </div>
    </div>
  )
}

