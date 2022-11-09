import * as echarts from 'echarts/core';
import {TooltipComponent, VisualMapComponent} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {Line3DChart} from 'echarts-gl/charts';
import {Grid3DComponent} from 'echarts-gl/components';

echarts.use([
    TooltipComponent,
    VisualMapComponent,
    Grid3DComponent,
    Line3DChart,
    CanvasRenderer
]);

var data = [];
// Parametric curve
for (var t = 0; t < 25; t += 0.001) {
    var x = (1 + 0.25 * Math.cos(75 * t)) * Math.cos(t);
    var y = (1 + 0.25 * Math.cos(75 * t)) * Math.sin(t);
    var z = t + 2.0 * Math.sin(75 * t);
    data.push([x, y, z]);
}


let option = {
    tooltip: {},
    backgroundColor: "151728FF",
    visualMap: {
        show: false,
        dimension: 2,
        // min: 0,
        // max: 30,
        inRange: {
            color: [
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026'
            ]
        },
    },
    xAxis3D: {
        type: 'value',
        axisLine: {
            lineStyle: {
                color: 'red',
            }
        },
        axisLabel: {
            show: true,
            textStyle: {
                color: '#57C0A1',
            }
        }
    },
    yAxis3D: {
        type: 'value',
        axisLine: {
            lineStyle: {
                color: 'green',
            }
        },
        axisLabel: {
            show: true,
            textStyle: {
                color: '#57C0A1',
            }
        }
    },
    zAxis3D: {
        type: 'value',
        axisLine: {
            lineStyle: {
                color: 'blue',
            }
        },
        axisLabel: {
            show: true,
            textStyle: {
                color: '#57C0A1',
            }
        }
    },
    grid3D: {
        viewControl: {
            projection: 'orthographic'
        },
    },
    series: [
        {
            type: 'line3D',
            data: [],
            lineStyle: {
                width: 4
            }
        }
    ]
};
export default option;