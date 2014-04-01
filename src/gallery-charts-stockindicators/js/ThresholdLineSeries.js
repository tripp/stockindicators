/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdLineSeries class renders lines corresponding to values across a y-axis.
 *
 * @class ThresholdLineSeries
 * @extends SeriesBase
 * @uses ThresholdLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.ThresholdLineSeries = Y.Base.create("thresholdLineSeries", Y.SeriesBase, [Y.Lines, Y.ThresholdLines],  {
    /**
     * Draws the series.
     *
     * @method draw
     * @protected
     */
    initializer: function()
    {
        var w = this.get("width"),
            h = this.get("height"),
            yAxis = this.get("yAxis");
        if((isFinite(w) && isFinite(h) && w > 0 && h > 0) && yAxis) {
            this.draw();
        }
    },

    /**
     * Draws lines for the series.
     *
     * @method drawSeries
     * @private
     */
    draw: function()
    {
        var thresholds = this.get("thresholds"),
            thresholdsLength = thresholds ? thresholds.length : 0,
            styles = this.get("styles"),
            yAxis = this.get("yAxis"),
            yMin = yAxis.get("minimum"),
            yMax = yAxis.get("maximum"),
            yEdgeOffset = yAxis.get("edgeOffset"),
            thresholdCoords = this._getThresholdCoords(thresholds, thresholdsLength, styles, yMin, yMax, yEdgeOffset),
            thresholdPaths = this._getPaths(this._paths, styles.thresholds, thresholdsLength);
        this._drawThresholdLines(thresholdPaths, thresholdCoords, thresholdsLength, styles);
        this._paths = thresholdPaths;
    }
}, {
    ATTRS: {
        xAxis: {},

        yAxis: {}
    }
});
