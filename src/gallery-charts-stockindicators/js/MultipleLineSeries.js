/**
 * Provides functionality for creating a line series with alternating colors based on thresholds.
 *
 * @module charts
 * @submodule series-line-multiple
 */
/**
 * The MultipleLineSeries class renders quantitative data on a graph by connecting relevant data points and
 * using different colors based on a defined threshold value.
 *
 * @class MultipleLineSeries
 * @extends CartesianSeries
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-line-multiple
 */
Y.MultipleLineSeries = Y.Base.create("multipleLineSeries", Y.CartesianSeries, [Y.Lines],  {
    drawSeries: function() {
        this._drawLines();
    },

    /**
     * Returns an array of path elements in which to draw the lines.
     *
     * @method _getPaths
     * @param {Object} styles Reference to the styles attribute for the instance.
     * @return Array
     * @private
     */
    _getPaths: function(paths, styles, len)
    {
        var graphic,
            path,
            i,
            colors,
            alphas,
            weight;
        if(!paths) {
            graphic = this.get("graphic") || this.get("graph").get("graphic");
            paths = [];
            colors = styles.colors;
            alphas = styles.alphas;
            weight = styles.weight;
            for(i = 0; i < len; i = i + 1) {
                path = graphic.addShape({
                    type: "path",
                    stroke: {
                        color: colors[i % colors.length],
                        opacity: alphas[i % alphas.length],
                        weight: weight
                    }
                });
                paths.push(path);
            }

        } else {
            this._clearPaths(paths);
        }
        return paths;
    },

    _getThresholdCoords: function(thresholds, len, styles, min, max, edgeOffset) {
        var yAxis = this.get("yAxis"),
            i,
            height = this.get("height"),
            padding = styles.padding,
            offset = padding.top + edgeOffset,
            thresholdCoords = [];
        height = height -  padding.top - padding.bottom - edgeOffset * 2;
        offset = height - offset;
        for(i = 0; i < len; i = i + 1) {
            thresholdCoords.push(
                Math.round(yAxis._getCoordFromValue(min, max, height, thresholds[i], offset, true) * 1000)/1000
            );
        }
        return thresholdCoords;
    },

    _drawThresholdLines: function(paths, thresholdCoords, len, styles) {
        var path,
            i,
            xAxis = this.get("xAxis"),
            edgeOffset = xAxis.get("edgeOffset"),
            width = this.get("width"),
            thresholdsStyles = styles.thresholds,
            lineType = thresholdsStyles.lineType,
            dashLength = thresholdsStyles.dashLength,
            gapSpace = thresholdsStyles.gapSpace,
            startX = styles.padding.left + edgeOffset,
            endX = width - edgeOffset - styles.padding.right,
            y;
        for(i = 0; i < len; i = i + 1) {
            y = thresholdCoords[i];
            path = paths[i];
            this._clearPaths(path);
            this._moveTo(path, startX, y);
            if(lineType === "dashed") {
                this.drawDashedLine(path, startX, y, endX, y, dashLength, gapSpace);
            } else {
                this._lineTo(path, endX, y);
            }
            this._endPaths(path);
        }
    },

    /**
     * Draws lines for the series.
     *
     * @method drawLines
     * @private
     */
    _drawLines: function()
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
            paths = this._getPaths(this._paths, styles, thresholdsLength + 1),
            yAxis = this.get("yAxis"),
            yMin = yAxis.get("minimum"),
            yMax = yAxis.get("maximum"),
            yEdgeOffset = yAxis.get("edgeOffset"),
            thresholdCoords = this._getThresholdCoords(thresholds, thresholdsLength, styles, yMin, yMax, yEdgeOffset),
            thresholdPaths = this._getPaths(this._thresholdPaths, styles.thresholds, thresholdsLength),
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords");
        this._drawThresholdLines(thresholdPaths, thresholdCoords, thresholdsLength, styles);
        this._paths = paths;
        this._thresholdPaths = thresholdPaths;
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        for(i = 0; i < len; i = i + 1)
        {
            nextX = Math.round(xcoords[i] * 1000)/1000;
            nextY = Math.round(ycoords[i] * 1000)/1000;
            pointValid = typeof nextX === "number" && typeof nextY === "number";
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
                    this._moveTo(paths[pathIndex], nextX, nextY);
                } else {
                    if(pathIndex !== lastPathIndex) {
                        m = Math.round(((nextY - lastValidY) / (nextX - lastValidX)) * 1000)/1000;
                        intersectX = ((thresholdCoords[thresholdIndex] - nextY)/m) + nextX;
                        intersectY = thresholdCoords[thresholdIndex];
                        if(isNumber(lastPathIndex)) {
                            this._lineTo(paths[lastPathIndex], intersectX, intersectY);
                        }
                        this._moveTo(paths[pathIndex], intersectX, intersectY);
                    }
                    this._lineTo(paths[pathIndex], nextX, nextY);
                }
                lastValidX = nextX;
                lastValidY = nextY;
                lastPointValid = true;
                lastPathIndex = pathIndex;
            } else {
                lastPointValid = pointValid;
            }
        }
        this._endPaths(paths);
    },

    /**
     * Executes moveTo.
     *
     * @method _moveTo
     * @param {Path} Path element.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _moveTo: function(path, x, y) {
        path.moveTo(x, y);
    },

    /**
     * Draws a line.
     *
     * @method _lineTo
     * @param {Path} Path element.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _lineTo: function(path, x, y) {
        path.lineTo(x, y);
    },

    /**
     * Clears path instances.
     *
     * @method _clearPaths
     * @param {Path|Array} path A path element or an array of path elements.
     * @private
     */
    _clearPaths: function(path) {
        var i,
            len;
        if(Y.Lang.isArray(path)) {
            len = path.length;
            for(i = 0; i < len; i = i + 1) {
                path[i].clear();
            }
        } else {
            path.clear();
        }
    },

    /**
     * Closes path instances.
     *
     * @method _endPaths
     * @param {Path|Array} path A path element or an array of path elements.
     * @private
     */
    _endPaths: function(path) {
        var i,
            len;
        if(path && path.length >= 0) {
            len = path.length;
            for(i = 0; i < len; i = i + 1) {
                path[i].end();
            }
        } else {
            path.end();
        }
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
                alphas: [1],
                weight: 6,
                colors: this._defaultLineColors.concat(),
                thresholds: {
                    colors: ["#999"],
                    alphas: [1],
                    weight: 1,
                    lineType: "dashed",
                    dashLength:5,
                    gapSpace:5
                }
            };
        return Y.merge(Y.Renderer.prototype._getDefaultStyles(), styles);
    }
}, {
    ATTRS: {
        /**
         * An array of thresholds. Used to define where lines would change colors.
         *
         * @attribute thresholds
         * @type Array
         */
        thresholds: {}
    }
});
