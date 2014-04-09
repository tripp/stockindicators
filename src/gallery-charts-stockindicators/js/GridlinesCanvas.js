/**
 * GridlinesCanvas draws gridlines on a Graph.
 *
 * @module gallery-charts-stockindicators
 * @class GridlinesCanvas
 * @constructor
 * @extends Base
 * @uses Renderer
 * @param {Object} config (optional) Configuration parameters.
 */
Y.GridlinesCanvas = Y.Base.create("gridlinesCanvas", Y.Gridlines, [], {
    /**
     * Reference to the `Path` element used for drawing GridlinesCanvas.
     *
     * @property _path
     * @type Path
     * @private
     */
    _path: null,

    /**
     * Removes the GridlinesCanvas.
     *
     * @method remove
     * @private
     */
    remove: function()
    {
        var path = this._path,
            width = this.get("width"),
            height = this.get("height"),
            parentNode;
        if(path)
        {
            path.context.clearRect(0, 0, width, height);
            parentNode = path.canvas.parentNode;
            if(parentNode) {
                parentNode.removeChild(path.canvas);
            }
        }
    },

    /**
     * Draws the gridlines
     *
     * @method draw
     * @param {Number} width The width of the area in which the gridlines will be drawn.
     * @param {Number} height The height of the area in which the gridlines will be drawn.
     * @param {Number} startIndex The index in which to start drawing fills (if specified). The default
     * value is 0.
     * @param {Number} interval The number gaps between fills (if specified). The default value is 2. A value of 1
     * would result in a solid fill across the area.
     * @protected
     */
    draw: function(w, h, startIndex, interval)
    {
        if(this.get("axis"))
        {
            this._drawGridlines(w, h, startIndex, interval);
        }
    },

    /**
     * Ends the path element.
     *
     * @method _endPath
     * @param {Path} The path element.
     * @return
     */
    _endPath: function(path) {
        if(path.fill) {
            path.context.fillStyle = path.fill.color;
            path.context.closePath();
            path.context.fill();
        }
        if(path.stroke) {
            path.context.strokeStyle = path.stroke.color;
            path.context.lineWidth = path.stroke.weight;
            path.context.stroke();
        }
    },

    /**
     * Creates a canvas and returns an object containing a reference to
     * the canvas, its context and style properties.
     *
     * @method _getPath
     * @param {Number} width width for the path.
     * @param {Number} height height for the path.
     * @param {Number} x x-coordinate for the path.
     * @param {Number} y y-coordinate for the path.
     * @param {Object} stroke Stroke properties for the path.
     * @param {Object} fill Fill properties for the fill.
     * @return Object
     * @private
     */
    _getPath: function(w, h, x, y, stroke, fill) {
        var path,
            node = this.get("node"),
            canvas = DOCUMENT.createElement("canvas"),
            context = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        canvas.style.position = "absolute";
        canvas.style.left = x + "px";
        canvas.style.top = y + "px";
        canvas.className = "yui3-gridlines";
        if(node) {
            node.appendChild(canvas);
        }
        path = {
            canvas: canvas,
            context: context
        };
        if(stroke) {
            path.stroke = stroke;
        }
        if(fill && fill.color) {
            path.fill = fill;
        }
        return path;
    },

    /**
     * Sets the styles and dimensions for the canvas.
     *
     * @method _stylePath
     * @param {Object} path Reference to the path object.
     * @param {Number} w Width of the path.
     * @param {Number} h Height of the path.
     * @param {Object} stroke Stroke properties for the path.
     * @param {Object} fill Fill properties for the path.
     * @param {Number} x x-coordinate for the path
     * @param {Number} y y-coordinate for the path
     * @return Path
     * @private
     */
    _stylePath: function(path, w, h, x, y, stroke, fill) {
        path.canvas.width =  w;
        path.canvas.height = h;
        path.canvas.style.position = "absolute";
        path.canvas.style.left = x + "px";
        path.canvas.style.top = y + "px";
        if(stroke) {
            path.stroke = stroke;
        }
        if(fill && fill.color) {
            path.fill = fill;
        }
        return path;
    },

    /**
     * Calculates the coordinates for the gridlines based on a count.
     *
     * @method _getPoints
     * @param {Number} count Number of gridlines
     * @return Array
     * @private
     */
    _getPoints: function(count, w, h)
    {
        var i,
            points = [],
            multiplier,
            divisor = count - 1;
        for(i = 0; i < count; i = i + 1)
        {
            multiplier = i/divisor;
            points[i] = {
                x: w * multiplier,
                y: h * multiplier
            };
        }
        return points;
    },

    /**
     * Algorithm for horizontal lines.
     *
     * @method _horizontalLine
     * @param {Object} path Reference to path object containing references to the
     * canvas, its context and properties.
     * @param {Object} pt Coordinates corresponding to a major unit of an axis.
     * @param {Number} w Width of the Graph
     * @private
     */
    _horizontalLine: function(path, points, width, styles)
    {
        var i = styles.showFirst ? 0 : 1,
            len = styles.showLast ? points.length : points.length - 1,
            y;
        for(; i < len; i = i + 1)
        {
            y = points[i].y;
            path.context.moveTo(0, y);
            path.context.lineTo(width, y);
        }
    },

    /**
     * Algorithm for vertical lines.
     *
     * @method _verticalLine
     * @param {Object} path Reference to path object containing references to the
     * canvas, its context and properties.
     * @param {Object} pt Coordinates corresponding to a major unit of an axis.
     * @param {Number} h Height of the Graph
     * @private
     */
    _verticalLine: function(path, points, height, styles)
    {
        var i = styles.showFirst ? 0 : 1,
            len = styles.showLast ? points.length : points.length - 1,
            x;
        for(; i < len; i = i + 1)
        {
            x = points[i].x;
            path.context.moveTo(x, 0);
            path.context.lineTo(x, height);
        }
    },

    /**
     * Algorithm for horizontal fills.
     *
     * @method _horizontalFill
     * @param {Path} path Reference to the path element
     * @param {Object} points Coordinates corresponding to a major unit of an axis.
     * @param {Number} width Width of the fill.
     * @param {Number} startIndex Indicates the index in which to start drawing fills.
     * @param {Number} interval Indicates the interval between fills.
     * @param {Number} height Height of the graph.
     * @private
     */
    _horizontalFill: function(path, points, width, startIndex, interval, height)
    {
        var i,
            y1,
            y2,
            len = points.length;
        for(i = startIndex; i < len; i = i + interval)
        {
            y1 = points[i].y;
            y2 = i < len - 1 ? points[i + 1].y : height;
            path.context.moveTo(0, y1);
            path.context.lineTo(0, y2);
            path.context.lineTo(width, y2);
            path.context.lineTo(width, y1);
            path.context.lineTo(0, y1);
        }
    },

    /**
     * Algorithm for vertical fills.
     *
     * @method _verticalFill
     * @param {Path} path Reference to the path element
     * @param {Object} points Coordinates corresponding to a major unit of an axis.
     * @param {Number} height Height of the fill.
     * @param {Number} startIndex Indicates the index in which to start drawing fills.
     * @param {Number} interval Indicates the interval between fills.
     * @param {Number} width Width of the graph.
     * @private
     */
    _verticalFill: function(path, points, height, startIndex, interval, width)
    {
        var i,
            x1,
            x2,
            len = points.length;
        for(i = startIndex; i < len; i = i + interval)
        {
            x1 = points[i].x;
            x2 = i < len - 1 ? points[i + 1].x : width;
            path.context.moveTo(x1, 0);
            path.context.lineTo(x2, 0);
            path.context.lineTo(x2, height);
            path.context.lineTo(x1, height);
            path.context.lineTo(x1, 0);
        }
    }
},
{
    ATTRS: {
        /**
         * Indicates the `Graphic` in which the gridlines
         * are drawn.
         *
         * @attribute graphic
         * @type Graphic
         */
        node: {},

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
                    if(node._node) {
                        node = node._node;
                    }
                    this.set("node", node);
                }
                return val;
            }
        }
    }
});
