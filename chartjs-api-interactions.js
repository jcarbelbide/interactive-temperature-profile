export function getChartTemperatureArray(chartArg) {
    return chartArg.getDatasetMeta(0)._dataset.data;
}

export function getChartPointCoordinateArray(chartArg) {
    return chartArg.getDatasetMeta(0).data;
}

export function getChartScaleRanges(chartArg) {
    return chartArg.getDatasetMeta(0)._scaleRanges
}

export function getChartLabelArray(chartArg) {
    return chartArg.data.labels
}