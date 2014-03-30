/**
 * Provides functionality for creating threshold lines.
 *
 * @module charts
 * @submodule series-threshold-line-util
 */
/**
 * The ThresholdLines class contains methods for drawing lines relative to a y-coordinate on a cartesian
 * scale.
 *
 * @class ThresholdLines
 * @extends Lines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-threshold-line-util
 */
Y.ThresholdLines = function() {
    Y.ThresholdLines.superclass.constructor.apply(this, arguments);
};

Y.ThresholdLines.NAME = "thresholdLines";

Y.ThresholdLines.ATTRS =  {
    /**
     * An array of thresholds. Used to define where lines would change colors.
     *
     * @attribute thresholds
     * @type Array
     */
    thresholds: {}
};

Y.extend(Y.ThresholdLines, Y.Lines, {
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
            color,
            alpha,
            weight,
            hasAlphaArray,
            hasColorArray;
        if(!paths) {
            graphic = this.get("graphic") || this.get("graph").get("graphic");
            paths = [];
            color = styles.color;
            alpha = styles.alpha;
            weight = styles.weight;
            hasAlphaArray = typeof alpha === "object" && alpha.length && alpha.length > 0;
            hasColorArray = typeof color === "object" && color.length && color.length > 0;
            for(i = 0; i < len; i = i + 1) {
                path = graphic.addShape({
                    type: "path",
                    stroke: {
                        color: hasColorArray ?  color[i % color.length] : color,
                        opacity: hasAlphaArray ? alpha[i % alpha.length] : alpha,
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

    /**
     * Returns the coordinates corresponding to a value on the y-axis.
     *
     * @method _getThresholdCoords
     * @param {Array} thresholds An array of values corresponding to a threshold.
     * @param {Number} len The number of items in the threshold array.
     * @param {Object} styles Styles for the graph.
     * @param {Number} min The minimum value on the axis.
     * @param {Number} max The maximum value on the axis.
     * @param {Number} edgeOffset The distance offset from the edge of the axis.
     * @return Array
     */
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

    /**
     * Draws lines on a graph based on threshold coordinates.
     *
     * @method _drawThresholLines
     * @param {Array} paths An array of path instances in which to use for drawing the lines.
     * @param {Array} thresholdCoords An array of coordinates in which to plot the lines.
     * @param {Number} len The length of the thresholdCoords array.
     * @param {Object} styles Style properties for the lines.
     * @private
     */
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
        if(Y.Lang.isArray(path)) {
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
                thresholds: {
                    color: "#999",
                    alpha: 1,
                    weight: 1,
                    lineType: "dashed",
                    dashLength:5,
                    gapSpace:5
                }
            };
        return Y.merge(Y.Renderer.prototype._getDefaultStyles(), styles);
    },
    
    /**
     * Destructor implementation for ThresholdLines.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        var path,
            width = this.get("width"),
            height = this.get("height");
        if(this._paths) {
            while(this._paths.length > 0) {
                path = this._paths.pop();
                if(path instanceof Y.Shape) {
                    path.destroy();
                } else {
                     if(path.context) {
                        path.context.clearRect(0, 0, width, height);
                     }
                     if(path.canvas) {
                        path.canvas.parentNode.removeChild(path.canvas);
                     }
                }
            }
        }
    }
});
