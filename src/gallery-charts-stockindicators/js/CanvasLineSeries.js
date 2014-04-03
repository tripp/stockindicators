/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasLinesSeries class renders quantitative data on a graph by connecting relevant data points.
 *
 * @class CanvasLinesSeries
 * @extends LineSeries
 * @uses CanvasSeriesImpl
 * @uses CanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasLineSeries = Y.Base.create("lineSeries", Y.LineSeries, [Y.CanvasSeriesImpl, Y.CanvasLines], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["linePath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasLine
         */
        type: "canvasLine"
    }
});
