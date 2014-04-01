/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdCanvasLineSeries class renders lines corresponding to values across a y-axis.
 *
 * @class ThresholdCanvasLineSeries
 * @extends ThresholdLineSeries
 * @uses ThresholdCanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.ThresholdCanvasLineSeries = Y.Base.create("thresholdCanvasLineSeries", Y.ThresholdLineSeries, [Y.ThresholdCanvasLines]);
