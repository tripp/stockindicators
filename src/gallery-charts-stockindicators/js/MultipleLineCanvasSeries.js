/**
 * Provides functionality for creating a line series with alternating colors based on thresholds.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The MultipleLineCanvasSeries class renders quantitative data on a graph by connecting relevant data points and
 * using different colors based on a defined threshold value.
 *
 * @class MultipleLineCanvasSeries
 * @extends CartesianSeries
 * @uses Lines
 * @uses ThresholdLines
 * @uses MultipleLineSeries
 * @uses ThresholdCanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.MultipleLineCanvasSeries = Y.Base.create("multipleLineCanvasSeries", Y.CartesianSeries, [
    Y.Lines,
    Y.ThresholdLines,
    Y.MultipleLineSeries,
    Y.ThresholdCanvasLines
]);
