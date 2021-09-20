import { getChartTemperatureArray, getChartPointCoordinateArray, getChartScaleRanges, getChartLabelArray } from './chartjs-api-interactions.js'
import { determineChartData, saveChartDataToLocalStorage } from './chart-local-storage.js'

export class RampTimeLabel {
    constructor(chartArg, labelNum, labelVal=10) {
        
        this.labelNum = labelNum;
        this.point = getChartPointCoordinateArray(chartArg)[this.labelNum];
        this.chart = chartArg;

        //init HTML
        const currentDiv = document.getElementById(RampTimeLabel.HTML_PARENT_DIV_TAG);
        const newDiv = document.createElement("input");
        currentDiv.insertBefore(newDiv, null);  //insert div at the end of the temperature boxes
        this.element = newDiv;
        this.labelVal = labelVal;
        this.element.value = `${this.labelVal}`
        this.element.oninput = this.updateRampTimeLabelVal.bind(this);
        $(this.element).numeric();
        
        //init CSS style
        this.element.id = `ramp-time-label-${this.labelNum}`
        this.element.className = 'label-class';
        this.updateLabelPositionRotation(getChartPointCoordinateArray(chartArg)[this.labelNum-1], this.point)
        
    }
    
    moveRampTimeLabel(x, y) {
        const width = this.element.offsetWidth / 2;
        const height = this.element.offsetHeight / 2;

        let angle = this.radianRotation;
        let x1 = (width*Math.cos(angle));
        let x2 = Math.abs(height*Math.sin(angle));
        let y1 = Math.abs(-width*Math.sin(angle));
        let y2 = (height*Math.cos(angle));
        // let xPrime = (width*Math.cos(angle) + height*Math.sin(angle));
        // let yPrime = (-width*Math.sin(angle) + height*Math.cos(angle));

        // console.log("Angle: " + Math.round(this.degRotation));
        // console.log(Math.round(x1), Math.round(x2));
        // console.log(Math.round(y1), Math.round(y2));

        let xPrime = (x1 + x2);
        let yPrime = (y1 + y2);

        x -= xPrime;
        y -= yPrime;

        this.element.style.left = `${String(x)}px`;
        this.element.style.top = `${String(y)}px`;
    }
    
    updateLabelPositionRotation(point1, point2) {
        this.calculateLabelRotation(point1, point2)
        this.element.style.transform = `rotate(${this.degRotation}deg)`

        let midpoint = this.calculateMidpoint(point1, point2);
        this.moveRampTimeLabel(midpoint.x, midpoint.y);
    }

    calculateLabelRotation(point1, point2) {
        this.radianRotation = Math.atan((point1.y - point2.y) / (point1.x - point2.x));
        this.degRotation = this.radianRotation * 180 / Math.PI;

    }   
    calculateMidpoint(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2
        }
    }
    updateRampTimeLabelVal() {
        this.labelVal = this.element.value
        saveChartDataToLocalStorage(getChartTemperatureArray(window.chart), window.rampTimeLabels)
    }   

    static get HTML_PARENT_DIV_TAG() {
        return "ramp-time-labels"
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

export function updateRampTimeLabelsPositionRotation(labelsArray, existingPointsArray, pointNum) {
    if (pointNum === 0) {
        labelsArray[pointNum].updateLabelPositionRotation(existingPointsArray[pointNum], existingPointsArray[pointNum+1])
    } else if(pointNum == existingPointsArray.length - 1) {
        labelsArray[pointNum-1].updateLabelPositionRotation(existingPointsArray[pointNum-1], existingPointsArray[pointNum])
    } else {
        labelsArray[pointNum-1].updateLabelPositionRotation(existingPointsArray[pointNum-1], existingPointsArray[pointNum])
        labelsArray[pointNum].updateLabelPositionRotation(existingPointsArray[pointNum], existingPointsArray[pointNum+1])
    }
    

}

export function updateRampTimeLabelsPositionRotationAll(labelsArray, existingPointsArray, rampLabelsUpdated) {
    // if (!rampLabelsUpdated) return;
    
    for (let pointNum = 0; pointNum < existingPointsArray.length; pointNum++) {
        updateRampTimeLabelsPositionRotation(labelsArray, existingPointsArray, pointNum, rampLabelsUpdated)
    }

        
}