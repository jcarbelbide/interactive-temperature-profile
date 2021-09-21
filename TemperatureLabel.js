import { getChartTemperatureArray, getChartPointCoordinateArray, getChartScaleRanges, getChartLabelArray } from './chartjs-api-interactions.js'
import { determineChartData, saveChartDataToLocalStorage } from './chart-local-storage.js'

export class TemperatureLabel {
    constructor(chartArg, labelNum, labelVal=10) {
        
        this.labelNum = labelNum;
        this.point = getChartPointCoordinateArray(chartArg)[this.labelNum];
        this.chart = chartArg;

        //init HTML
        const currentDiv = document.getElementById(TemperatureLabel.HTML_PARENT_DIV_TAG);
        const newDiv = document.createElement("input");
        currentDiv.insertBefore(newDiv, null);  //insert div at the end of the temperature boxes
        this.element = newDiv;
        this.labelVal = labelNum;
        this.element.value = `${this.labelVal}`
        this.element.oninput = this.updateLabelValue.bind(this);
        $(this.element).numeric();              // jquery.alphanum lib. Only allow numeric chars in text box. 
        
        //init CSS style
        this.element.id = `temperature-label-${this.labelNum}`
        this.element.className = 'label-class';
        this.updateLabelPosition()
        
    }

    updateLabelPosition() {
        this.moveTemperatureLabel();
    }
    
    moveTemperatureLabel() {
        const boxWidth = this.element.offsetWidth;
        const boxHeight = this.element.offsetHeight;
        let chartBottom = this.chart.height;
        let x = this.point.x - boxWidth/4;
        let y = chartBottom + boxHeight/2;

        this.element.style.left = `${String(x)}px`;
        this.element.style.top = `${String(y)}px`;
    }
    
    updateLabelValue() {
        this.labelVal = this.element.value
        saveChartDataToLocalStorage(getChartTemperatureArray(window.chart), window.temperatureLabels)
    }   

    static get HTML_PARENT_DIV_TAG() {
        return "temperature-labels"
    }

}

export function hideTemperatureLabels(hiddenTime, temperatureLabelsHTMLParent) {
    temperatureLabelsHTMLParent.style.display = "none";
    setTimeout( () => {
        temperatureLabelsHTMLParent.style.display = "block";
    }, hiddenTime)
}

export function addTemperatureLabel(chartPointCoordArray, labelNum, temperatureLabels) {
    temperatureLabels.splice(labelNum, 0, new TemperatureLabel(chart, labelNum));
    updateTemperatureLabelPositionAll(temperatureLabels, chartPointCoordArray);
}

export function removeTemperatureLabel(chartPointCoordArray, labelNum, temperatureLabels) {
    temperatureLabels[labelNum].element.remove();
    temperatureLabels.splice(labelNum, 1);
    updateTemperatureLabelPositionAll(temperatureLabels, chartPointCoordArray);
}


export function updateTemperatureLabelPosition(labelsArray, existingPointsArray, pointNum) {
    labelsArray[pointNum].updateLabelPosition(existingPointsArray[pointNum])
}

export function updateTemperatureLabelPositionAll(labelsArray, existingPointsArray) {
    for (let pointNum = 0; pointNum < existingPointsArray.length; pointNum++) {
        updateTemperatureLabelPosition(labelsArray, existingPointsArray, pointNum)
    }
}

export function initializeRenderTemperatureLabels(chart, temperatureLabelsValues) {
    let existingPointsArray = getChartPointCoordinateArray(chart);
    let temperatureLabels = []
    if (temperatureLabelsValues) {
        for (let i = 0; i < existingPointsArray.length; i++) {
            temperatureLabels.push(new TemperatureLabel(chart, i, temperatureLabelsValues[i-1]));
        }
    } else {
        for (let i = 0; i < existingPointsArray.length; i++) {
            temperatureLabels.push(new TemperatureLabel(chart, i));
        }
    }
    return temperatureLabels
}

