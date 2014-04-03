/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdCanvasLines class contains methods for drawing lines relative to a y-coordinate on a cartesian
 * scale.
 *
 * @class ThresholdCanvasLines
 * @extends ThresholdLines
 * @uses CanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.ThresholdCanvasLines = Y.Base.create("tresholdCanvasLines", Y.ThresholdLines, [Y.CanvasLines],  {
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
