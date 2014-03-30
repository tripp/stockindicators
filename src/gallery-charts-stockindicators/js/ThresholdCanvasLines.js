/**
 * Provides functionality for creating threshold lines.
 *
 * @module charts
 * @submodule series-threshold-canvas-line-util
 */
/**
 * The ThresholdCanvasLines class contains methods for drawing lines relative to a y-coordinate on a cartesian
 * scale.
 *
 * @class ThresholdCanvasLines
 * @extends Lines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 * @submodule series-threshold-canvas-line-util
 */
Y.ThresholdCanvasLines = function() {
    Y.ThresholdCanvasLines.superclass.constructor.apply(this, arguments);
};

Y.ThresholdCanvasLines.NAME = "thresholdCanvasLines";

Y.extend(Y.ThresholdCanvasLines,  Y.ThresholdLines, {
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
            color,
            weight,
            canvas,
            context,
            width = this.get("width"),
            height = this.get("height"),
            isColorArray,
            x = this.get("x") + "px",
            y = this.get("y") + "px";
        if(!paths) {
            node = this.get("node");
            paths = [];
            color = styles.color;
            weight = styles.weight;
            isColorArray = typeof color === "object" && color.length && color.length > 0;
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
                    strokeStyle: isColorArray ? color[i % color.length] : color,
                    lineWidth: weight
                };
                paths.push(path);
            }

        } else {
            this._clearPaths(paths);
        }
        return paths;
    },

    /**
     * Draws a dashed line between two points.
     *
     * @method drawDashedLine
     * @param {Object} path Reference to the object in which the line will be drawn.
     * @param {Number} xStart	The x position of the start of the line
     * @param {Number} yStart	The y position of the start of the line
     * @param {Number} xEnd		The x position of the end of the line
     * @param {Number} yEnd		The y position of the end of the line
     * @param {Number} dashSize	the size of dashes, in pixels
     * @param {Number} gapSize	the size of gaps between dashes, in pixels
     * @private
     */
    drawDashedLine: function(path, xStart, yStart, xEnd, yEnd, dashSize, gapSize) {
        var context = path.context;
        Y.ThresholdCanvasLines.superclass.drawDashedLine.apply(this, [
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
        if(Y.Lang.isArray(path)) {
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
        if(Y.Lang.isArray(path)) {
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
                        node = node.get("node");
                        node = node ? node.parentNode : null;
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
