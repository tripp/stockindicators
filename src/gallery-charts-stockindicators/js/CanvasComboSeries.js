/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasComboSeries class renders a combination of lines, plots and area fills in a single series.
 * Each series type has a corresponding boolean attribute indicating if it is rendered. By default,
 * lines and plots are rendered and area is not.
 *
 * @class CanvasCombosSeries
 * @extends ComboSeries
 * @uses Fills
 * @uses CanvasSeriesImpl
 * @uses CanvasLines
 * @uses CanvasFills
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasComboSeries = Y.Base.create("canvasComboSeries", Y.ComboSeries, [Y.Fills, Y.CanvasSeriesImpl, Y.CanvasLines, Y.CanvasFills], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["linePath", "areaPath"];
    }
}, {
    /**
     * Read-only attribute indicating the type of series.
     *
     * @attribute type
     * @type String
     * @default canvasCombo
     */
    ATTRS: {
        type: "canvasCombo"
    },

    /**
     * Indicates whether a fill is displayed.
     *
     * @attribute showAreaFill
     * @type Boolean
     * @default false
     */
    showAreaFill: {
        value: false
    },

    /**
     * Indicates whether lines are displayed.
     *
     * @attribute showLines
     * @type Boolean
     * @default true
     */
    showLines: {
        value: true
    },

    /**
     * Indicates whether markers are displayed.
     *
     * @attribute showMarkers
     * @type Boolean
     * @default true
     */
    showMarkers: {
        value: true
    }
});
