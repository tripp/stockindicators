/**
 * Provides functionality for creating a marker series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasMarkersSeries class renders quantitative data on a graph by plotting relevant data points.
 *
 * @class CanvasMarkersSeries
 * @extends MarkerSeries
 * @uses CanvasSeriesImpl
 * @uses CanvasPlots
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasMarkerSeries = Y.Base.create("canvasMarkerSeries", Y.MarkerSeries, [Y.Plots, Y.CanvasSeriesImpl, Y.CanvasPlots], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["markerPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasMarker
         */
        type: "canvasMarker"
    }
});
