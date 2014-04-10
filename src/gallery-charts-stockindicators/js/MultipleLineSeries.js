/**
 * Provides functionality for creating a line series with alternating colors based on thresholds.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The MultipleLineSeries class renders quantitative data on a graph by connecting relevant data points and
 * using different colors based on a defined threshold value.
 *
 * @class MultipleLineSeries
 * @extends CartesianSeries
 * @uses Lines
 * @uses ThresholdLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.MultipleLineSeries = Y.Base.create("multipleLineSeries", Y.CartesianSeries, [Y.Lines, Y.ThresholdLines],  {
    /**
     * Draws lines for the series.
     *
     * @method drawSeries
     * @private
     */
    drawSeries: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var direction = this.get("direction"),
            len,
            lastPointValid,
            pointValid,
            noPointsRendered = true,
            lastValidX,
            lastValidY,
            nextX,
            nextY,
            intersectX,
            intersectY,
            i,
            m,
            thresholds = this.get("thresholds"),
            thresholdsLength = thresholds ? thresholds.length : 0,
            pathIndex,
            lastPathIndex,
            thresholdIndex,
            styles = this.get("styles"),
            drawThresholdLines = styles.thresholds.drawLines,
            graphPaths = this._getPaths(this._graphPaths, styles, thresholdsLength + 1),
            yAxis = this.get("yAxis"),
            yMin = yAxis.get("minimum"),
            yMax = yAxis.get("maximum"),
            yEdgeOffset = yAxis.get("edgeOffset"),
            thresholdCoords = this._getThresholdCoords(thresholds, thresholdsLength, styles, yMin, yMax, yEdgeOffset),
            thresholdPaths,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords");
        if(drawThresholdLines) {
            thresholdPaths = this._getPaths(this._thresholdPaths, styles.thresholds, thresholdsLength);
            this._drawThresholdLines(thresholdPaths, thresholdCoords, thresholdsLength, styles);
        }
        this._graphPaths = graphPaths;
        this._thresholdPaths = thresholdPaths;
        this._paths = this._graphPaths.concat(this._thresholdPaths ? this._thresholdPaths : []);
     
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        for(i = 0; i < len; i = i + 1)
        {
            nextX = Math.round(xcoords[i] * 1000)/1000;
            nextY = Math.round(ycoords[i] * 1000)/1000;
            pointValid = typeof nextX === "number" && isFinite(nextX)  && typeof nextY === "number" && isFinite(nextY);
            if(pointValid) {
                thresholdIndex = 0;
                if(thresholds) {
                    for(pathIndex = 0; pathIndex < thresholdsLength; pathIndex = pathIndex + 1) {
                        if(nextY <= thresholdCoords[pathIndex]) {
                            break;
                        } else {
                            thresholdIndex = pathIndex;
                        }
                    }
                } else {
                    pathIndex = 0;
                }
                if(noPointsRendered) {
                    noPointsRendered = false;
                    this._moveTo(graphPaths[pathIndex], nextX, nextY);
                } else {
                    if(pathIndex !== lastPathIndex) {
                        m = Math.round(((nextY - lastValidY) / (nextX - lastValidX)) * 1000)/1000;
                        intersectX = ((thresholdCoords[thresholdIndex] - nextY)/m) + nextX;
                        intersectY = thresholdCoords[thresholdIndex];
                        if(typeof lastPathIndex === "number" && isFinite(lastPathIndex)) {
                            this._lineTo(graphPaths[lastPathIndex], intersectX, intersectY);
                        }
                        this._moveTo(graphPaths[pathIndex], intersectX, intersectY);
                    }
                    this._lineTo(graphPaths[pathIndex], nextX, nextY);
                }
                lastValidX = nextX;
                lastValidY = nextY;
                lastPointValid = true;
                lastPathIndex = pathIndex;
            } else {
                lastPointValid = pointValid;
            }
        }
        this._endPaths(graphPaths);
    },

    /**
     * Gets the default value for the `styles` attribute.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function() {
        var styles = {
                alpha: 1,
                weight: 6,
                color: this._defaultLineColors.concat()
            };
        return Y.merge(Y.ThresholdLines.prototype._getDefaultStyles(), styles);
    }
});
