Y.VolumeColumn = function() {
    Y.VolumeColumn.superclass.constructor.apply(this, arguments);
};

Y.VolumeColumn.NAME = "volumeColumn";

Y.extend(Y.VolumeColumn, Y.RangeSeries, {
    drawSeries: function() {
        var valueData = this.get("yAxis").get("dataProvider"),
            xcoords = this.get("xcoords"),
            volumeCoords = this.get("ycoords"),
            positivePath = this.get("positivePath"),
            negativePath = this.get("negativePath"),
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
            threshold = this.get("threshold"),
            hasPositivePath = false,
            hasNegativePath = false;
        styles.positive.fill.opacity = styles.positive.fill.alpha;
        styles.negative.fill.opacity = styles.negative.fill.alpha;
        positivePath.set(styles.positive);
        negativePath.set(styles.negative);
        positivePath.clear();
        negativePath.clear();
        for(i = 0; i < len; i = i + 1) {
            if(threshold && valueData[i].close < threshold) {
                selectedPath = negativePath;
                hasNegativePath = true;
            } else {
                selectedPath = positivePath;
                hasPositivePath = true;
            }
            left = xcoords[i] - halfwidth;
            top = volumeCoords[i];
            height = bottomOrigin - top;
            if(height > 0 && !isNaN(left) && !isNaN(top)) {
                selectedPath.drawRect(left, top, width, height);
            }
        }
        if(hasPositivePath) {
            positivePath.end();
        }
        if(hasNegativePath) {
            negativePath.end();
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
        this.get("positivePath").set("visible", visible);
        this.get("negativePath").set("visible", visible);
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
            positive: {
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
            negative: {
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
            }
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
                this.set("positivePath", val.addShape({
                   type: "path"
                }));
                this.set("negativePath", val.addShape({
                   type: "path"
                }));
                return val;
            }
        },

        positivePath: {},

        negativePath: {},

        threshold: {
            lazyAdd: false
        }
    }
});
