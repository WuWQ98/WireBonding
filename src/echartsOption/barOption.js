import * as echarts from 'echarts/core';
import {TooltipComponent, GridComponent} from 'echarts/components';
import {BarChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';

echarts.use([TooltipComponent, GridComponent, BarChart, CanvasRenderer]);

let option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [
        {
            type: 'category',
            nameLocation: "center",
            data: [],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis: [
        {
            type: 'value',
            nameTextStyle: {
                padding: [0, 0, 0, 50],
            }
        }
    ],
    series: [
        {
            name: 'data',
            type: 'bar',
            barWidth: '60%',
            data: []
        }
    ]
};

export default option;