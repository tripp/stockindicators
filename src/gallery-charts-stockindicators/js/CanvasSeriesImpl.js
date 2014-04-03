/**
 * Provides common functionality for canvas graphs.
 *
 * @module gallery-charts-stockindicators
 * @class CanvasSeriesImpl
 * @constructor
 */
Y.CanvasSeriesImpl = function() {};
Y.CanvasSeriesImpl.ATTRS = {
    /**
     * Indicates the x position of gridlines.
     *
     * @attribute x
     * @type Number
     */
    x: {},

    /**
     * Indicates the y position of gridlines.
     *
     * @attribute y
     * @type Number
     */
    y: {},

    /*
     * Width of the instance
     *
     * @attribute width
     * @type Number
     */
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

    /*
     * Height of the instance
     *
     * @attribute height
     * @type Number
     */
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

    /**
     * The graphic in which drawings will be rendered.
     *
     * @attribute graphic
     * @type HTMLElement
     */
    graphic: {
        lazyAdd: false,

        setter: function(val) {
            var node = val,
                pathAttrs = this._getPathAttrs(),
                i,
                len;
            //woraround for Attribute order of operations bug
            if(!this.get("rendered")) {
                this.set("rendered", true);
            }

            if(node && node._node) {
                node = node._node;
            }

            if(pathAttrs) {
                len = pathAttrs.length;
                for(i = 0; i < len; i = i + 1) {
                    this.set(pathAttrs[i], this._getPath(node));
                }
            }
            return val;
        }
    }
};
Y.CanvasSeriesImpl.prototype = {
    /**
     * Creates an object container a reference to a canvas instance and its
     * 2d context.
     *
     * @param {Object} This can be a graphic instance Node instance or HTMLElement.
     * @return Object
     * @private
     */
    _getPath: function(node) {
        var canvas = DOCUMENT.createElement("canvas"),
            context = canvas.getContext("2d"),
            path,
            paths = this._paths || [];
        if(node) {
            node.appendChild(canvas);
        }
        canvas.style.position = "absolute";
        path =  {
            canvas: canvas,
            context: context
        };
        paths.push(path);
        this._paths = paths;
        return path;
    },

    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return null;
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
     * Toggles visibility
     *
     * @method _toggleVisible
     * @param {Boolean} visible indicates visibility
     * @private
     */
    _toggleVisible: function(visible)
    {
        var visibility = visible ? "visible" : "hidden",
            paths = this._paths,
            path,
            i,
            len;
         if(paths) {
            len = paths.length;
            for(i = 0; i < len; i = i + 1) {
                path = this._paths[i];
                path.canvas.style.visibility = visibility;
            }
         }
    },

    /**
     * Parses hex color string and alpha value to rgba
     *
     * @method _toRGBA
     * @param {Object} val Color value to parse. Can be hex string, rgb or name.
     * @param {Number} alpha Numeric value between 0 and 1 representing the alpha level.
     * @private
     */
    _toRGBA: function(val, alpha) {
        alpha = (alpha !== undefined) ? alpha : 1;
        if (!Y_Color.re_RGB.test(val)) {
            val = TOHEX(val);
        }

        if(Y_Color.re_hex.exec(val)) {
            val = 'rgba(' + [
                parseInt(RegExp.$1, 16),
                parseInt(RegExp.$2, 16),
                parseInt(RegExp.$3, 16)
            ].join(',') + ',' + alpha + ')';
        }
        return val;
    },

   /**
    * Draws a rectangle.
    *
    * @method _drawRect
    * @param {Context} context Reference to the context in which to draw the rectangle.
    * @param {Number} x The x-coordinate in which to start the drawing.
    * @param {Number} y The y-coordinate in which to start the drawing.
    * @param {Number} width The width of the rectangle.
    * @param {Number} height The height of the rectangle.
    * return Context
    * @private
    */
    _drawRect: function(context, x, y, width, height) {
        context.moveTo(x, y);
        context.lineTo(x + width, y);
        context.lineTo(x + width, y + height);
        context.lineTo(x, y + height);
        context.lineTo(x, y);
        return context;
    },

    /**
     * Destructor implementation for canvas implementations of graphs.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        var path,
            context,
            canvas,
            paths = this._paths,
            pathAttrs = this._getPathAttrs(),
            i,
            len,
            width = this.get("width"),
            height = this.get("height"),
            parentNode;
        if(paths) {
            len = paths.length;
            for(i = 0; i < len; i = i + 1) {
                path = paths[i];
                context = path.context;
                if(context) {
                    context.clearRect(0, 0, width, height);
                }
                canvas = path.canvas;
                if(canvas) {
                    parentNode = canvas.parentNode;
                    Y.Event.purgeElement(canvas, true);
                    if(parentNode) {
                        parentNode.removeChild(canvas);
                    }
                }
            }
        }
        if(pathAttrs) {
            len = pathAttrs.length;
            for(i = 0; i < len; i = i + 1) {
                this.set(pathAttrs[i], null);
            }
        }
    }
};
