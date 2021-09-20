export function determineChartData() {
    // Presets
    let localStorageDataJSONString = window.localStorage.getItem("driftOvenControllerSavedData");
    let localStorageData
    if (localStorageDataJSONString !== 'undefined') {
        localStorageData = JSON.parse(localStorageDataJSONString);
    }

    let chartData;
    let chartXAxisLabels;
    let rampTimeLabelsValues;
    if (localStorageData && localStorageData.savedChartData && localStorageData.savedRampTimeLabels) {
        chartData = localStorageData.savedChartData;
        rampTimeLabelsValues = localStorageData.savedRampTimeLabels;
    } else {
        let presets = {
            tempCo: [48, 0, -40, 25, 85, 125],
            nationalMethodHysteresis: [-40, 25, 125, 25],
            tiMethodHysteresis: [-40, 125, 25],
        }
        chartData = presets.tempCo;
        
    }
    
    
    chartXAxisLabels = chartData.map( (val, index) => {
        return String(index + 1);
    })

    return [chartData, chartXAxisLabels, rampTimeLabelsValues]
}

export function saveChartDataToLocalStorage(chartData, rampTimeLabels) {
    let rampTimeLabelsValues; 
    if (rampTimeLabels) {
        rampTimeLabelsValues = rampTimeLabels.map( (label) => {
            return String(label.labelVal);
        })
    }
    
    let driftOvenControllerSavedData = {
        savedChartData: chartData,
        savedRampTimeLabels: rampTimeLabelsValues
    }

    localStorage.setItem("driftOvenControllerSavedData", JSON.stringify(driftOvenControllerSavedData))
}
