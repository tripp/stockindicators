/**
 * Provides functionality for creating a line series with alternating colors based on thresholds.
 *
 * @module charts
 * @submodule series-line-multiple
 */
/**
 * The MultipleLineCanvasSeries class renders quantitative data on a graph by connecting relevant data points and
 * using different colors based on a defined threshold value.
 *
 * @class MultipleLineCanvasSeries
 * @extends CartesianSeries
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-line-multiple
 */
Y.MultipleLineCanvasSeries = Y.Base.create("multipleLineCanvasSeries", Y.MultipleLineSeries, [],  {
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
        var node,
            path,
            i,
            colors,
            weight,
            canvas,
            context,
            width = this.get("width"),
            height = this.get("height"),
            x = this.get("x") + "px",
            y = this.get("y") + "px";
        if(!paths) {
            node = this.get("node");
            paths = [];
            colors = styles.colors;
            weight = styles.weight;
            for(i = 0; i < len; i = i + 1) {
                canvas = DOCUMENT.createElement("canvas");
                context = canvas.getContext("2d");
                canvas.width = width;
                canvas.height = height;
                canvas.style.position = "absolute";
                canvas.style.left = x;
                canvas.style.top = y;
                if(node) {
                    node.appendChild(canvas);
                }
                path = {
                    canvas: canvas,
                    context: context,
                    strokeStyle: colors[i % colors.length],
                    lineWidth: weight
                };
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
        var isNumber = Y.Lang.isNumber,
            direction = this.get("direction"),
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
            graphPaths = this._getPaths(this._graphPaths, styles, thresholdsLength + 1),
            yAxis = this.get("yAxis"),
            yMin = yAxis.get("minimum"),
            yMax = yAxis.get("maximum"),
            yEdgeOffset = yAxis.get("edgeOffset"),
            thresholdCoords = this._getThresholdCoords(thresholds, thresholdsLength, styles, yMin, yMax, yEdgeOffset),
            thresholdPaths = this._getPaths(this._thresholdPaths, styles.thresholds, thresholdsLength),
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords");
        this._drawThresholdLines(thresholdPaths, thresholdCoords, thresholdsLength, styles);
        this._graphPaths = graphPaths;
        this._thresholdPaths = thresholdPaths;
        this._paths = this._graphPaths.concat(this._thresholdPaths);
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        for(i = 0; i < len; i = i + 1)
        {
            nextX = Math.round(xcoords[i] * 1000)/1000;
            nextY = Math.round(ycoords[i] * 1000)/1000;
            pointValid = isNumber(nextX) && isNumber(nextY);
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
                        if(isNumber(lastPathIndex)) {
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

    drawDashedLine: function(path, xStart, yStart, xEnd, yEnd, dashSize, gapSize) {
        var context = path.context;
        Y.MultipleLineCanvasSeries.superclass.drawDashedLine.apply(this, [
            context,
            xStart,
            yStart,
            xEnd,
            yEnd,
            dashSize,
            gapSize
        ]);
    },

    /**
     * Executes moveTo.
     *
     * @method _moveTo
     * @param {Object} Object containing a reference to the canvas and context.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _moveTo: function(path, x, y) {
        path.context.moveTo(x, y);
    },

    /**
     * Draws a line.
     *
     * @method _lineTo
     * @param {Object} Object containing a reference to the canvas and context.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _lineTo: function(path, x, y) {
        path.context.lineTo(x, y);
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
            len,
            width = this.get("width"),
            height = this.get("height");
        if(path && path.length >= 0) {
            len = path.length;
            for(i = 0; i < len; i = i + 1) {
                path[i].context.clearRect(0, 0, width, height);
            }
        } else {
            path.context.clearRect(0, 0, width, height);
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
                path[i].context.lineWidth = path[i].lineWidth;
                path[i].context.strokeStyle = path[i].strokeStyle;
                path[i].context.stroke();
            }
        } else {
            path.context.lineWidth = path.lineWidth;
            path.context.strokeStyle = path.strokeStyle;
            path.context.stroke();
        }
    },

    /**
     * Destructor implementation for the MultipleLineCanvasSeries class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        var path,
            width = this.get("width"),
            height = this.get("height");
        while(this._graphPaths.length > 0) {
            path = this._graphPaths.pop();
            path.context.clearRect(0, 0, width, height);
            path.canvas.parentNode.removeChild(path.canvas);
        }
        while(this._thresholdPaths.length > 0) {
            path = this._thresholdPaths.pop();
            path.context.clearRect(0, 0, width, height);
            path.canvas.parentNode.removeChild(path.canvas);
        }
    }
}, {
    ATTRS: {

        x: {},

        y: {},

        width: {
            lazyAdd: false,

            getter: function() {
                return this._width;
            },

            setter: function(val) {
                this._width = val;
                return val;
            }

        },

        height: {
            lazyAdd: false,

            getter: function() {
                return this._height;
            },

            setter: function(val) {
                this._height = val;
                return val;
            }
        },

        node: {
            setter: function(val) {
                //woraround for Attribute order of operations bug
                if(!this.get("rendered")) {
                    this.set("rendered", true);
                }
                return val;
            }
        },

        /**
         * The graphic in which drawings will be rendered.
         *
         * @attribute graphic
         * @type Graphic
         */
        graphic: {
            lazyAdd: false,

            setter: function(val) {
                var node = val;

                if(node) {
                    if(node instanceof Y.Graphic) {
                        this.set("x", node.get("x"));
                        this.set("y", node.get("y"));
                        this.set("width", node.get("width"));
                        this.set("height", node.get("height"));
                        node = node._node ? node.parentNode : null;
                    } else if(node._node) {
                        node = node._node;
                    }
                    if(node) {
                        this.set("node", node);
                    }
                }
                return val;
            }
        }
    }
});
