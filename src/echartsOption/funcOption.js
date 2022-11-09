import * as echarts from "echarts/core";
import { GridComponent, DataZoomComponent } from "echarts/components";
import { LineChart } from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  GridComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

let option = {
  animation: true,
  grid: {
    top: 40,
    left: 50,
    right: 40,
    bottom: 50,
  },
  xAxis: {
    name: "x",
    minorTick: {
      show: true,
    },
    minorSplitLine: {
      show: true,
    },
  },
  yAxis: {
    name: "y",
    minorTick: {
      show: true,
    },
    minorSplitLine: {
      show: true,
    },
  },
  dataZoom: [
    {
      show: true,
      type: "inside",
      filterMode: "none",
      xAxisIndex: [0],
    },
    {
      show: true,
      type: "inside",
      filterMode: "none",
      yAxisIndex: [0],
    },
  ],
  series: [
    {
      type: "line",
      showSymbol: false,
      clip: true,
      data: [],
    },
  ],
};

export default option;
