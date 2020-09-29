import React, { useEffect, useRef, useState } from 'react';
import { arc, pie, select, event } from 'd3';
import { schemeTableau10 } from 'd3-scale-chromatic';
import './style.less';

interface IProps {
  style?: any;
  className?: string;
  tooltipClassName?: string;
  width?: number; // 建议宽度和高度一致，否则可能会出现截断的情况
  height?: number;
  fanWidth?: number;
  data: any[];
}

interface IPoint {
  x: number;
  y: number;
}

const RATIO = window.devicePixelRatio || 1;
const TOOLTIPSWIDTH = 200;

function getTwoPointDistance(p1: IPoint, p2: IPoint){
  return Math.sqrt(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2));
}
function sumBy(array: any[], key: string) {
  let result = 0;
  array.forEach((item) => {
    result += item[key];
  });
  return result;
}

export default function index(props: IProps) {
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState({x: 0, y: 0});
  const canvasRef = useRef(null);
  const style = props.style || {};
  const width = props.width || 120;
  const height = props.height || 120;
  const radius = height / 2;
  const fanWidth = props.fanWidth || radius;
  const id = `d3-charts-pie-${(new Date()).getTime()}`;

  useEffect(() => {
    if (canvasRef && canvasRef.current) {
      const canvas = canvasRef.current! as HTMLCanvasElement;
      const context = canvas.getContext("2d")!;
      canvas.id = id;
      canvas.width = width * RATIO;
      canvas.height = height * RATIO;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.translate(width * RATIO / 2, height * RATIO / 2);
      context.scale(RATIO, RATIO);

      const arcInstance = arc()
            .outerRadius(radius)
            .innerRadius(radius - fanWidth)
            .context(context);

      const pieInstance = pie()
            .sort(null)
            .value(function(d: any) { return d.value; });

      const arcs = pieInstance(props.data);
      const total = sumBy(props.data, 'value');
      arcs.forEach(function(d: any, i: number) {
        context.beginPath();
        arcInstance({
          ...d,
          padAngle: 0.01,
        });
        context.fillStyle = schemeTableau10[i];
        context.strokeStyle = '#fff';
        context.fill();
      });

      select(`#${id}`).on('mousemove', () => {
        const mouseX = event.layerX || event.offsetX;
        const mouseY = event.layerY || event.offsetY;
        if (mouseX >= 0 && mouseY >= 0) {
          const x = mouseX - width / 2;
          const y = -(mouseY - height / 2);
          const distance = getTwoPointDistance({x, y}, {x: 0, y: 0});
          let angle = Math.atan2(x, y);
          if (angle < 0) angle = Math.PI * 2 + angle;
          if (distance >= (radius - fanWidth) && distance <= radius) {
            arcs.forEach((d: any) => {
              if (
                angle > d.startAngle
                && angle < d.endAngle
              ) {
                setTooltipText(`${d.data.name}: ${d.data.value} (${(d.data.value / total * 100).toFixed(2)} %)`);
                setTooltipVisible(true);
                // 50px 兼容滚动条宽度
                if (event.screenX + TOOLTIPSWIDTH > window.outerWidth - 50) {
                  setTooltipOffset({
                    x: mouseX - TOOLTIPSWIDTH - 20,
                    y: mouseY + 20,
                  });
                } else {
                  setTooltipOffset({
                    x: mouseX + 20,
                    y: mouseY + 20,
                  });
                }
              }
            });
          } else {
            setTooltipVisible(false);
          }
        }
      });
      select(`#${id}`).on('mouseout', () => {
        setTooltipVisible(false);
      });
    }
  }, [props.data]);

  return (
    <div className={props.className} style={{ ...style, width, height, position: 'relative' }}>
      <canvas ref={canvasRef} />
      <div
        className={props.tooltipClassName ? `d3-charts-pie-tooltip ${props.tooltipClassName}` : 'd3-charts-pie-tooltip'}
        style={{
          position: 'absolute',
          display: tooltipVisible ? 'block' : 'none',
          left: tooltipOffset.x,
          top: tooltipOffset.y,
          zIndex: 1000,
          width: TOOLTIPSWIDTH,
        }}
      >
        {tooltipText}
      </div>
    </div>
  )
}
