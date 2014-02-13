Y.VolumeColumn = function() {
    Y.VolumeColumn.superclass.constructor.apply(this, arguments);
};

Y.VolumeColumn.NAME = "volumeColumn";

Y.extend(Y.VolumeColumn, Y.RangeSeries, {
    drawSeries: function() {
        var valueData = this.get("yAxis").get("dataProvider"),
            xcoords = this.get("xcoords"),
            volumeCoords = this.get("ycoords"),
            upPath = this.get("upPath"),
            downPath = this.get("downPath"),
            len = xcoords.length,
            i,
            styles = this.get("styles"),
            padding = styles.padding,
            dataWidth = this.get("width") - (padding.left + padding.right),
            width = this._calculateMarkerWidth(dataWidth, len, styles.spacing),
            halfwidth = width/2,
            bottomOrigin = this._bottomOrigin,
            top,
            left,
            height,
            selectedPath,
            previousClose = this.get("previousClose"),
            hasUpPath = false,
            hasDownPath = false,
            drawInBackground = styles.drawInBackground;
        styles.upPath.fill.opacity = styles.upPath.fill.alpha;
        styles.downPath.fill.opacity = styles.downPath.fill.alpha;
        upPath.set(styles.upPath);
        downPath.set(styles.downPath);
        if(drawInBackground) {
            upPath.toBack();
            downPath.toBack();
        }
        upPath.clear();
        downPath.clear();
        for(i = 0; i < len; i = i + 1) {
            if(previousClose && valueData[i].close < previousClose) {
                selectedPath = downPath;
                hasDownPath = true;
            } else {
                selectedPath = upPath;
                hasUpPath = true;
            }
            left = xcoords[i] - halfwidth;
            top = volumeCoords[i];
            height = bottomOrigin - top;
            if(height > 0 && !isNaN(left) && !isNaN(top)) {
                selectedPath.drawRect(left, top, width, height);
            }
            previousClose = valueData[i].close;
        }
        if(hasUpPath) {
            upPath.end();
        }
        if(hasDownPath) {
            downPath.end();
        }
    },

    /**
     * Toggles visibility
     *
     * @method _toggleVisible
     * @param {Boolean} visible indicates visibilitye
     * @private
     */
    _toggleVisible: function(visible)
    {
        this.get("upPath").set("visible", visible);
        this.get("downPath").set("visible", visible);
    },


    /**
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     * @private
     */
    _getDefaultStyles: function()
    {
        var styles = {
            upPath: {
                shapeRendering: "crispEdges",
                fill: {
                    color: "#00aa00",
                    alpha: 1
                },
                stroke: {
                    color: "#000000",
                    alpha: 1,
                    weight: 0
                }
            },
            downPath: {
                shapeRendering: "crispEdges",
                fill: {
                    color: "#aa0000",
                    alpha: 1
                },
                stroke: {
                    color: "#000000",
                    alpha: 1,
                    weight: 0
                }
            },
            drawInBackground: true
        };
        return this._mergeStyles(styles, Y.VolumeColumn.superclass._getDefaultStyles());
    }
}, {
    ATTRS: {
        ohlcKeys: {
            value: null
        },
        
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default volumecolumn
         */
        type: {
            value: "volumecolumn"
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
                //woraround for Attribute order of operations bug
                if(!this.get("rendered")) {
                    this.set("rendered", true);
                }
                this.set("upPath", val.addShape({
                   type: "path"
                }));
                this.set("downPath", val.addShape({
                   type: "path"
                }));
                return val;
            }
        },

        /**
         * The path element in which columns higher that the previous are drawn.
         * This attribute is created by the instance.
         *
         * @attribute upPath
         * @type Path
         */
        upPath: {},

        /**
         * The path element in which columns lower that the previous are drawn.
         * This attribute is created by the instance.
         *
         * @attribute downPath
         * @type Path
         */
        downPath: {},

        /**
         * Attribute for the previous close value. This value represents the last
         * close value before the start of the rendered data set.
         *
         * @attribute previousClose
         * @type Number
         */
        previousClose: {
            lazyAdd: false
        }
    }
});
