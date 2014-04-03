/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The AreaSeries class renders quantitative data on a graph by creating a fill between 0
 * and the relevant data points.
 *
 * @class CanvasAreasSeries
 * @extends AreaSeries
 * @uses Fills
 * @uses CanvasSeriesImpl
 * @uses CanvasFills
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasAreaSeries = Y.Base.create("areaSeries", Y.AreaSeries, [Y.Fills, Y.CanvasSeriesImpl, Y.CanvasFills], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["areaPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasArea
         */
        type: "canvasArea"
    }
});
