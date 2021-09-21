import { initializeRenderRampTimeLabels, addRampTimeLabel, updateRampTimeLabelsPositionRotation, updateRampTimeLabelsPositionRotationAll, hideRampTimeLabels, removeRampTimeLabel, RampTimeLabel } from './RampTimeLabel.js'
import { determineChartData, saveChartDataToLocalStorage } from './chart-local-storage.js'
import { getChartTemperatureArray, getChartPointCoordinateArray, getChartScaleRanges, getChartLabelArray } from './chartjs-api-interactions.js'
import { TemperatureLabel, addTemperatureLabel, removeTemperatureLabel, initializeRenderTemperatureLabels } from './TemperatureLabel.js'

let [chartData, chartXAxisLabels, rampTimeLabelsValues, temperatureLabelsValues] = determineChartData()



// window.localStorage.testArray = JSON.stringify({x: 1, y:2})
// console.log(JSON.parse(window.localStorage.testArray))

let options = {
    type: 'line',
    data: {
        labels: chartXAxisLabels,
        datasets: [{
            label: 'Temperature',
            data: chartData,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.0,
            borderWidth: 3,
            pointHitRadius: 25,
            borderColor: "#36a2eb",
            }
        ]
    },
    options: {
        interaction: {
            mode: 'point'
        },
        scales: {
            y: {
                min: -50,
                max: 150
            }
        },
        animation: {
            onComplete: (e) => {
                if (window.chart) {
                    saveChartDataToLocalStorage(getChartTemperatureArray(window.chart), window.rampTimeLabels, window.temperatureLabels)
                }
            },
            onProgress: () => {
                
            }
        },
        onResize: () => {
            if (window.chart) {
                updateRampTimeLabelsPositionRotationAll(window.rampTimeLabels, getChartPointCoordinateArray(window.chart), window.rampLabelsUpdated);
            }
        },
        onHover: function(e) {
            
            const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
            if (point.length) e.native.target.style.cursor = 'grab';
            else e.native.target.style.cursor = 'default';
        },
        onClick: chartOnClickHandler,
        plugins: {
            dragData: {
                round: 0,
                showTooltip: true,
                onDragStart: function(e, datasetIndex, index, value) {

                },
                onDrag: function(e, datasetIndex, index, value) {              
                    e.target.style.cursor = 'grabbing';
                    updateRampTimeLabelsPositionRotation(window.rampTimeLabels, getChartPointCoordinateArray(window.chart), index);
                },
                onDragEnd: function(e, datasetIndex, index, value) {
                    e.target.style.cursor = 'default'; 
                },
            }
        }
    }
}

function chartOnClickHandler(e) {
    // window.rampLabelsUpdated = false;
    if (e.native.detail !== 2) return;     // if not double click return
    if (e.native.target.style.cursor === 'default') {
        handleDoubleClickAddPoint(e);
    }
    else if (e.native.target.style.cursor === 'grab'){
        handleDoubleClickRemovePoint(e);
    }
    
}



function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num))
} 

function calculateNewTempFromClick(e) {
    let [click_x, click_y] = [e.x, e.y];
    let scaleRanges = getChartScaleRanges(window.chart);
    let max_y = e.chart.chartArea.top;
    let min_y = e.chart.chartArea.bottom;
    let chart_max_y = scaleRanges.ymax;
    let chart_min_y = scaleRanges.ymin;
    let pixelPercentageClickLocation = 1 - ((click_y - max_y) / (min_y - max_y))
    let newTemp = Math.round(pixelPercentageClickLocation * (chart_max_y - chart_min_y) + chart_min_y, 0);

    newTemp = clamp(newTemp, chart_min_y, chart_max_y)

    return newTemp
}

function handleDoubleClickAddPoint(e) {
    let newTemp = calculateNewTempFromClick(e);
    let existingPointsArray = getChartPointCoordinateArray(window.chart);
    let sectionX = calculateSectionX(e, existingPointsArray);

    insertDataPoint(getChartTemperatureArray(window.chart), getChartLabelArray(window.chart), sectionX, newTemp)

    window.chart.update();
    
    hideRampTimeLabels(1000, document.getElementById(RampTimeLabel.HTML_PARENT_DIV_TAG));
    setTimeout(() => {
        addRampTimeLabel(getChartPointCoordinateArray(window.chart), sectionX, window.rampTimeLabels)
        addTemperatureLabel(getChartPointCoordinateArray(window.chart), sectionX, window.temperatureLabels)
        
        // console.log(window.rampLabelsUpdated)
        // window.rampLabelsUpdated = true;
    }, 1000)    // must wait for animation to end before properly adding in the label 

}

function handleDoubleClickRemovePoint(e) {
    const point = e.chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)[0].index
    // console.log(point)
    removeDataPoint(getChartTemperatureArray(window.chart), getChartLabelArray(window.chart), point)
    window.chart.update();
    // console.log(point, "point")

    hideRampTimeLabels(1000, document.getElementById(RampTimeLabel.HTML_PARENT_DIV_TAG));
    setTimeout(() => {
        removeRampTimeLabel(getChartPointCoordinateArray(window.chart), point, window.rampTimeLabels)
        removeTemperatureLabel(getChartPointCoordinateArray(window.chart), point, window.temperatureLabels)
        
    }, 1000)    // must wait for animation to end before properly adding in the label 

}

function calculateSectionX(e, existingPointsArray) {
    // let max_x = e.chart.chartArea.right;
    // let max_y = e.chart.chartArea.top;
    // let min_x = e.chart.chartArea.left;
    // let min_y = e.chart.chartArea.bottom;
    // let section_width = 1;
    // let existingPointsArray = e.chart._metasets[0].data
    let [click_x, click_y] = [e.x, e.y];
    
    // let existingPointsArray = chartMetasetData.data;
    let num_sections = existingPointsArray.length - 1;
    
    let i = 0
    while(i < num_sections) {
        if (click_x < existingPointsArray[i].x) {
            break;
        }
        i++;
    }

    return i
}

function removeDataPoint(dataArray, labelsArray, index) {
    // let newArr = [...arr];
    // newArr.splice(index, 0, val)
    // return newArr
    dataArray.splice(index, 1)
    // console.log(labelsArray.length)
    labelsArray.pop()
}

function insertDataPoint(dataArray, labelsArray, index, val) {
    // let newArr = [...arr];
    // newArr.splice(index, 0, val)
    // return newArr
    dataArray.splice(index, 0, val)
    // console.log(labelsArray.length)
    labelsArray.push(String(labelsArray.length + 1))
}

let ctx = document.getElementById('chartJSContainer').getContext('2d');
window.chart = new Chart(ctx, options);
window.chart.render()
setTimeout(() => {
    window.rampTimeLabels = initializeRenderRampTimeLabels(window.chart, rampTimeLabelsValues);
    window.temperatureLabels = initializeRenderTemperatureLabels(window.chart, temperatureLabelsValues);
}, 1000) 


document.getElementById('chartJSContainer').addEventListener('click', (e) => {
    console.log(e.x-10, e.y-294)
})

$("#add-temp-label").click(addTempLabelForTesting)

function addTempLabelForTesting() {
    let l = new TemperatureLabel(window.chart,1,99);
}
