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
        this.labelVal = labelVal;
        this.element.value = `${this.labelVal}`
        this.element.oninput = this.updateLabelValue.bind(this);
        $(this.element).numeric();              // jquery.alphanum lib. Only allow numeric chars in text box. 
        
        //init CSS style
        this.element.id = `temperature-label-${this.labelNum}`
        this.element.className = 'label-class';
        this.updateLabelPosition()
        
    }

    updateLabelPosition() {
        this.moveRampTimeLabel();
    }
    
    moveRampTimeLabel() {
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
        saveChartDataToLocalStorage(getChartTemperatureArray(window.chart), window.rampTimeLabels)
    }   

    static get HTML_PARENT_DIV_TAG() {
        return "temperature-labels"
    }

}

export function hideRampTimeLabels(hiddenTime, rampTimeLabelsHTMLParent) {
    rampTimeLabelsHTMLParent.style.display = "none";
    setTimeout( () => {
        rampTimeLabelsHTMLParent.style.display = "block";
    }, hiddenTime)
}

export function addRampTimeLabel(chartPointCoordArray, labelNum) {
    window.rampTimeLabels.splice(labelNum, 0, new RampTimeLabel(chart, labelNum));
    updateRampTimeLabelsPositionRotationAll(window.rampTimeLabels, chartPointCoordArray, index);
}

export function removeRampTimeLabel(chartPointCoordArray, labelNum) {
    if (labelNum < chartPointCoordArray.length - 1) {
        window.rampTimeLabels[labelNum].element.remove()
        window.rampTimeLabels.splice(labelNum, 1);    
    } 
    else {
        window.rampTimeLabels[labelNum-1].element.remove()
        window.rampTimeLabels.splice(labelNum-1, 1);
    }
    updateRampTimeLabelsPositionRotationAll(window.rampTimeLabels, chartPointCoordArray, index);
}

export function initializeRenderRampTimeLabels(chart, rampTimeLabelsValues) {
    let existingPointsArray = getChartPointCoordinateArray(chart);
    window.rampTimeLabels = []

    if (rampTimeLabelsValues) {
        // console.log(rampTimeLabelsValues, 'if')
        for (let i = 1; i < existingPointsArray.length; i++) {
            // console.log(rampTimeLabelsValues[i])
            window.rampTimeLabels.push(new RampTimeLabel(chart, i, rampTimeLabelsValues[i-1]));
        }

    } else {
        for (let i = 1; i < existingPointsArray.length; i++) {
            window.rampTimeLabels.push(new RampTimeLabel(chart, i));
        }
    }

    return rampTimeLabels

}

export function updateRampTimeLabelPosition(labelsArray, existingPointsArray, pointNum) {
    if (pointNum === 0) {
        labelsArray[pointNum].updateLabelPositionRotation(existingPointsArray[pointNum], existingPointsArray[pointNum+1])
    } else if(pointNum == existingPointsArray.length - 1) {
        labelsArray[pointNum-1].updateLabelPositionRotation(existingPointsArray[pointNum-1], existingPointsArray[pointNum])
    } else {
        labelsArray[pointNum-1].updateLabelPositionRotation(existingPointsArray[pointNum-1], existingPointsArray[pointNum])
        labelsArray[pointNum].updateLabelPositionRotation(existingPointsArray[pointNum], existingPointsArray[pointNum+1])
    }
    

}

export function updateRampTimeLabelsPositionAll(labelsArray, existingPointsArray, rampLabelsUpdated) {
    for (let pointNum = 0; pointNum < existingPointsArray.length; pointNum++) {
        updateTemperatureLabelPosition(labelsArray, existingPointsArray, pointNum, rampLabelsUpdated)
    }

        
}