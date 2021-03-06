YUI.add('gallery-charts-stockindicators', function (Y, NAME) {

/**
 * Provides functionality for a chart.
 *
 * @module gallery-charts-stockindicators
 */
    var WINDOW = Y.config.win,
        DOCUMENT = Y.config.doc,
        Y_Color = Y.Color,
        TOHEX = Y_Color.toHex;
    Y.Axis.prototype.getLabel = function(styles)
    {
        var i,
            label,
            labelCache = this._labelCache,
            customStyles = {
                rotation: "rotation",
                margin: "margin",
                alpha: "alpha",
                align: "align"
            };
        if(labelCache && labelCache.length > 0)
        {
            label = labelCache.shift();
        }
        else
        {
            label = DOCUMENT.createElement("span");
            label.className = Y.Lang.trim([label.className, "axisLabel"].join(' '));
            this.get("contentBox").append(label);
        }
        if(!DOCUMENT.createElementNS)
        {
            if(label.style.filter)
            {
                label.style.filter = null;
            }
        }
        label.style.display = "block";
        label.style.whiteSpace = "nowrap";
        label.style.position = "absolute";
        for(i in styles)
        {
            if(styles.hasOwnProperty(i) && !customStyles.hasOwnProperty(i))
            {
                label.style[i] = styles[i];
            }
        }
        return label;
    };

    Y.Axis.prototype._setCanvas = function() {
        var cb = this.get("contentBox"),
            bb = this.get("boundingBox"),
            p = this.get("position"),
            pn = this._parentNode,
            w = this.get("width"),
            h = this.get("height");
        bb.setStyle("position", "absolute");
        w = w ? w + "px" : pn.getStyle("width");
        h = h ? h + "px" : pn.getStyle("height");
        if(p === "top" || p === "bottom")
        {
            cb.setStyle("width", w);
        }
        else
        {
            cb.setStyle("height", h);
        }
        cb.setStyle("position", "relative");
        cb.setStyle("left", "0px");
        cb.setStyle("top", "0px");
        this.set("graphic", new Y.Graphic());
        this.get("graphic").render(cb);
    };

    Y.LeftAxisLayout.prototype.positionLabel = function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("leftTickOffset"),
            totalTitleSize = this._totalTitleSize,
            leftOffset = pt.x + totalTitleSize - tickOffset,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelStyles = styles.label,
            maxLabelSize = host._maxLabelSize,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(rot === 0)
        {
            leftOffset -= labelWidth;
            if(labelStyles.align && labelStyles.align === "left") {
                leftOffset -= maxLabelSize - labelWidth;
            }
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else
        {
            leftOffset -= labelWidth + (labelHeight * absRot/360);
            topOffset -= labelHeight * offset;
        }
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(maxLabelSize + leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    };

    Y.RightAxisLayout.prototype.positionLabel = function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("rightTickOffset"),
            labelStyles = styles.label,
            margin = 0,
            leftOffset = pt.x,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(labelStyles.margin && labelStyles.margin.left)
        {
            margin = labelStyles.margin.left;
        }
        if(rot === 0)
        {
            if(labelStyles.align === "right") {
                leftOffset += host._maxLabelSize - labelWidth;
            }
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
            leftOffset -= labelWidth * 0.5;
        }
        else
        {
            topOffset -= labelHeight * offset;
            leftOffset += labelHeight/2 * absRot/90;
        }
        leftOffset += margin;
        leftOffset += tickOffset;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    };

/**
 * Provides logic for an intraday axis.
 *
 * @module gallery-charts-stockindicators
 * @class IntradayAxisBase
 * @extends CategoryAxisBase
 * @constructor
 */
Y.IntradayAxisBase = function() {
    Y.IntradayAxisBase.superclass.constructor.apply(this, arguments);
};

Y.IntradayAxisBase.NAME = "intradayAxisBase";

Y.extend(Y.IntradayAxisBase, Y.CategoryAxisBase, {
    /**
     * Getter method for maximum attribute.
     *
     * @method _maximumGetter
     * @return Number
     * @private
     */
    _maximumSetter: function(val) {
        var max = val,
            dataGranularity = this.get("dataGranularity"),
            interval,
            allData = this.get("dataProvider"),
            last = allData[allData.length - 1].Timestamp;
        if(dataGranularity) {
            interval = parseFloat(dataGranularity) * 60000;
            max = +new Date(max);
            last = +new Date(last);

            if(max > last) {
                while(max > last) {
                    last = last + interval;
                    allData.push({Timestamp: last});
                }
                this.set("dataProvider", allData);
            }
        }
    }
}, {
    ATTRS: {
        /**
         * The granularity of the data in the axis.
         *
         * @attribute dataGranularity
         * @type String
         */
        dataGranularity: {
            lazyAdd: false
        }
    }
});

/**
 * Displays an intraday axis.
 *
 * @module gallery-charts-stockindicators
 * @class IntradayAxis
 * @extends CategoryAxisBase
 * @uses IntradayAxisBase
 * @constructor
 */
Y.IntradayAxis = Y.Base.create("intradayAxis", Y.CategoryAxis, [Y.IntradayAxisBase]);
    
/**
 * Provides functionality for a canvas axis.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Canvas implementation of an axis.
 *
 * @class CanvasAxis
 * @extends AxisBase
 * @uses Renderer
 * @uses Axis
 * @constructor
 */
Y.CanvasAxis = Y.Base.create("canvasAxis", Y.AxisBase, [Y.Renderer], Y.merge(Y.Axis.prototype, {
    /**
     * Rotates and positions a text field.
     *
     * @method _rotate
     * @param {HTMLElement} label text field to rotate and position
     * @param {Object} props properties to be applied to the text field.
     * @private
     */
    _rotate: function(label, props)
    {
        var x = props.x + this._xOffset,
            y = props.y + this._yOffset;
        this._context.fillText(label, x, y);
    },

    /**
     * Draws an axis.
     *
     * @method _drawAxis
     * @private
     */
    _drawAxis: function () {
        if(this._layout)
        {
            var styles = this.get("styles"),
                margin = styles.margin,
                marginLeft,
                marginRight,
                marginTop,
                marginBottom,
                line = styles.line,
                labelStyles = styles.label,
                majorTickStyles = styles.majorTicks,
                drawTicks = majorTickStyles.display !== "none",
                len,
                i = 0,
                layout = this._layout,
                layoutLength,
                lineStart,
                lineEnd,
                label,
                labelWidth,
                labelHeight,
                labelFunction = this.get("labelFunction"),
                labelFunctionScope = this.get("labelFunctionScope"),
                labelFormat = this.get("labelFormat"),
                path = this.get("path"),
                pathContext = path.getContext("2d"),
                explicitlySized,
                position = this.get("position"),
                labelData,
                labelValues,
                formattedValue,
                formattedValues = [],
                point,
                points,
                firstPoint,
                lastPoint,
                firstLabel,
                lastLabel,
                staticCoord,
                dynamicCoord,
                edgeOffset,
                defaultMargins = layout._getDefaultMargins(),
                explicitLabels = this._labelValuesExplicitlySet ? this.get("labelValues") : null,
                direction = (position === "left" || position === "right") ? "vertical" : "horizontal";
            if(margin) {
                marginLeft = typeof margin.left === "number" && isFinite(margin.left) ? margin.left : 0;
                marginRight = typeof margin.right === "number" && isFinite(margin.right) ? margin.right : 0;
                marginTop = typeof margin.top === "number" && isFinite(margin.top) ? margin.top : 0;
                marginBottom = typeof margin.bottom === "number" && isFinite(margin.bottom) ? margin.bottom : 0;
            }
            //need to defaultMargins method to the layout classes.
            for(i in defaultMargins)
            {
                if(defaultMargins.hasOwnProperty(i))
                {
                    labelStyles.margin[i] = labelStyles.margin[i] === undefined ? defaultMargins[i] : labelStyles.margin[i];
                }
            }
            this._context = pathContext;
            this._labelWidths = [];
            this._labelHeights = [];
            this._labels = [];
            pathContext.clearRect(0, 0, path.width, path.height);
            pathContext.strokeStyle = line.color;
            pathContext.strokeWidth = line.weight;
            this._labelRotationProps = this._getTextRotationProps(labelStyles);
            this._labelRotationProps.transformOrigin = layout._getTransformOrigin(this._labelRotationProps.rot);
            layout.setTickOffsets.apply(this);
            layoutLength = this.getLength();

            len = this.getTotalMajorUnits();
            edgeOffset = this.getEdgeOffset(len, layoutLength);
            this.set("edgeOffset", edgeOffset);
            lineStart = layout.getLineStart.apply(this);
            lineEnd = this.getLineEnd(lineStart);

            if(direction === "vertical")
            {
                staticCoord = "x";
                dynamicCoord = "y";
            }
            else
            {
                staticCoord = "y";
                dynamicCoord = "x";
            }

            labelData = this._getLabelData(
                lineStart[staticCoord],
                staticCoord,
                dynamicCoord,
                this.get("minimum"),
                this.get("maximum"),
                edgeOffset,
                layoutLength - edgeOffset - edgeOffset,
                len,
                explicitLabels
            );

            points = labelData.points;
            labelValues = labelData.values;
            len = points.length;
            if(!this._labelValuesExplicitlySet)
            {
                this.set("labelValues", labelValues, {src: "internal"});
            }

            //Don't create the last label or tick.
            if(this.get("hideFirstMajorUnit"))
            {
                firstPoint = points.shift();
                firstLabel = labelValues.shift();
                len = len - 1;
            }

            //Don't create the last label or tick.
            if(this.get("hideLastMajorUnit"))
            {
                lastPoint = points.pop();
                lastLabel = labelValues.pop();
                len = len - 1;
            }

            if(len >= 1)
            {
                pathContext.moveTo(lineStart.x, lineStart.y);
                pathContext.lineTo(lineEnd.x, lineEnd.y);
                pathContext.stroke();
                if(drawTicks)
                {
                    pathContext.strokeStyle = majorTickStyles.color;
                    pathContext.strokeWidth = majorTickStyles.weight;
                    for(i = 0; i < len; i = i + 1)
                    {
                        point = points[i];
                        if(point)
                        {
                            layout.drawTick.apply(this, [pathContext, points[i], majorTickStyles]);
                        }
                    }
                }
                this._maxLabelSize = 0;
                this._totalTitleSize = 0;
                this._titleSize = 0;
                explicitlySized = layout.getExplicitlySized.apply(this, [styles]);
                for(i = 0; i < len; i = i + 1)
                {
                    point = points[i];
                    if(point)
                    {
                        label = this.getLabel(labelStyles);
                        this._labels.push(label);
                        formattedValue = labelFunction.apply(labelFunctionScope, [labelValues[i], labelFormat]);
                        this.get("appendLabelFunction")(label, formattedValue);
                        labelWidth = Math.round(label.offsetWidth);
                        labelHeight = Math.round(label.offsetHeight);
                        if(!explicitlySized)
                        {
                            this._layout.updateMaxLabelSize.apply(this, [labelWidth, labelHeight]);
                        }
                        this._removeChildren(label);
                        label.parentNode.removeChild(label);
                        this._labels.pop();
                        this._labelWidths.push(labelWidth);
                        this._labelHeights.push(labelHeight);
                        formattedValues.push(formattedValue);
                    }
                }

                this._xOffset = 0;
                this._yOffset = 0;
                this._widthOffset = 0;
                this._heightOffset = 0;
                switch(position) {
                    case "left" :
                        if(this._explicitWidth)
                        {
                            this.set("calculatedWidth", this._explicitWidth);
                        } else {
                            this.set("calculatedWidth",
                                Math.round(this._totalTitleSize + styles.get("leftTickOffset") + this._maxLabelSize + labelStyles.margin.right)
                            );
                        }
                        this._yOffset = marginTop;
                        this._heightOffset = marginTop + marginBottom;
                    break;
                    case "right" :
                        if(this._explicitWidth) {
                            this.set("calculatedWidth", this._explicitWidth);
                        } else {
                            this.set(
                                "calculatedWidth",
                                Math.round(this.get("rightTickOffset") + this._maxLabelSize + this._totalTitleSize + labelStyles.margin.left)
                            );
                        }
                        this._yOffset = marginTop;
                        this._heightOffset = marginTop + marginBottom;
                    break;
                    case "top" :
                        if(this._explicitHeight) {
                           this.set("calculatedHeight", this._explicitHeight);
                        } else {
                            this.set(
                                "calculatedHeight",
                                Math.round(this.get("topTickOffset") + this._maxLabelSize + labelStyles.margin.bottom + this._totalTitleSize)
                            );
                        }
                        this._xOffset = marginLeft;
                        this._widthOffset = marginLeft + marginRight;
                    break;
                    case "bottom" :
                        if(this._explicitHeight) {
                            this.set("calculatedHeight", this._explicitHeight);
                        } else {
                            this.set(
                                "calculatedHeight",
                                Math.round(this.get("bottomTickOffset") + this._maxLabelSize + labelStyles.margin.top + this._totalTitleSize)
                            );
                        }
                        this._xOffset = marginLeft;
                        this._widthOffset = marginLeft + marginRight;
                    break;
                }
                path.style.left = (this.get("x") - this._xOffset) + "px";
                path.style.top = (this.get("y") - this._yOffset) + "px";
                pathContext.font = labelStyles.fontSize + " " + labelStyles.fontFamily.toString(); //.replace(/,/g, " ");
                pathContext.textBaseline = "top";
                len = formattedValues.length;
                for(i = 0; i < len; ++i) {
                    layout.positionLabel.apply(this, [formattedValues[i], points[i], styles, i]);
                }
                if(firstPoint) {
                    points.unshift(firstPoint);
                }
                if(lastPoint) {
                    points.push(lastPoint);
                }
                if(firstLabel) {
                    labelValues.unshift(firstLabel);
                }
                if(lastLabel) {
                    labelValues.push(lastLabel);
                }
                this._tickPoints = points;
            }
        }
    },

    /**
     * Destructor implementation for the CanvasAxis class.
     *
     * @method destructor
     * @protected
     */
    destructor: function() {
        var parentNode;
        if(this._path) {
            if(this._context) {
                this._context.clearRect(
                    0,
                    0,
                    this.get("width") + this._widthOffset,
                    this.get("height") + this._heightOffset
                );
            }
            parentNode = this._path.parentNode;
            if(parentNode) {
                parentNode.removeChild(this._path);
            }
        }
    }
}), {
    ATTRS: Y.merge(Y.Axis.ATTRS, {
        /**
         * Indicates the x position of axis.
         *
         * @attribute x
         * @type Number
         */
        x: {
            value: 0
        },

        /**
         * Indicates the y position of axis.
         *
         * @attribute y
         * @type Number
         */
        y: {
            value: 0
        },

        /**
         * The calculated width of the axis.
         *
         * @attribute calculatedWidth
         * @type Number
         * @readOnly
         */
        calculatedWidth: {
            setter: function(val)
            {
                this._calculatedWidth = val;
                this._path.width = val + this._widthOffset;
                this._path.height = this.get("height") + this._heightOffset;
                return val;
            }
        },

        /**
         * The calculated height of the axis.
         *
         * @attribute calculatedHeight
         * @type Number
         * @readOnly
         */
        calculatedHeight: {
            setter: function(val)
            {
                this._calculatedHeight = val;
                this._path.height = val + this._heightOffset;
                this._path.width = this.get("width") + this._widthOffset;
                return val;
            }
        },

        render: {},

        /**
         * The element in which the axis will be attached
         *
         * @attribute contentBox
         * @type Node|HTMLElement
         */
        contentBox: {
            getter: function() {
                return this.get("render") || Y.one(DOCUMENT.body);
            }
        },

        /**
         *  @attribute path
         *  @type Shape
         *  @readOnly
         *  @private
         */
        path: {
            readOnly: true,

            getter: function()
            {
                var node;
                if(!this._path)
                {
                    this._path = DOCUMENT.createElement("canvas");
                    this._path.style.position = "absolute";
                    node = this.get("render");
                    if(node) {
                        node._node.appendChild(this._path);
                    }
                }
                return this._path;
            }
        },

        /**
         *  @attribute tickPath
         *  @type Shape
         *  @readOnly
         *  @private
         */
        tickPath: null

        /**
         * Contains the contents of the axis.
         *
         * @attribute node
         * @type HTMLCanvasElement
         */
    })
});

/**
 * Provides functionality for a canvas numeric axis.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Canvas implementation of a numeric axis.
 *
 * @class NumericCanvasAxis
 * @extends CanvasAxis
 * @uses NumericImpl
 * @uses NumericAxis
 * @constructor
 */
Y.NumericCanvasAxis = Y.Base.create("numericCanvasAxis", Y.CanvasAxis, [Y.NumericImpl], Y.NumericAxis.prototype);
/**
 * Provides functionality for a canvas category axis.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Canvas implementation of a category axis.
 *
 * @class CategoryCanvasAxis
 * @extends CanvasAxis
 * @uses CategoryImpl
 * @uses CategoryAxis
 * @constructor
 */
Y.CategoryCanvasAxis = Y.Base.create("categoryCanvasAxis", Y.CanvasAxis, [Y.CategoryImpl], Y.CategoryAxis.prototype, {
    ATTRS: {
        labelFormat: {}
    }
});
/**
 * Canvas implementation of  an intraday axis.
 *
 * @module gallery-charts-stockindicators
 * @class IntradayCanvasAxis
 * @extends CategoryCanvasAxis
 * @uses IntradayAxisBase
 * @constructor
 */
Y.IntradayCanvasAxis = Y.Base.create("intradayCanvasAxis", Y.CategoryCanvasAxis, [Y.IntradayAxisBase]);
/**
 * Draws a volume based column chart.
 *
 * @module gallery-charts-stockindicators
 * @class VolumeColumn
 * @extends RangeSeries
 * @constructor
 */
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
            styles = this.get("styles"),
            padding = styles.padding,
            dataWidth = this.get("width") - (padding.left + padding.right),
            width = this._calculateMarkerWidth(dataWidth, len, styles.spacing),
            halfwidth = width/2,
            previousClose = this.get("previousClose");
        styles.upPath.fill.opacity = styles.upPath.fill.alpha;
        styles.downPath.fill.opacity = styles.downPath.fill.alpha;
        this._drawColumns(upPath, downPath, styles, valueData, previousClose, xcoords, volumeCoords, width, halfwidth);
    },

    /**
     * Draws the columns.
     *
     * @method _drawColumns
     * @private
     */
    _drawColumns: function(
        upPath,
        downPath,
        styles,
        valueData,
        previousClose,
        xcoords,
        volumeCoords,
        width,
        halfwidth
    ) {
        var bottomOrigin = this._bottomOrigin,
            top,
            left,
            height,
            selectedPath,
            i,
            len = xcoords.length,
            hasUpPath = false,
            hasDownPath = false;
        upPath.set(styles.upPath);
        downPath.set(styles.downPath);
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
     * @param {Boolean} visible indicates visibility
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
     * Draws a circle based on a circumference param.
     *
     * @method _drawCircleByCircumference
     * @param {Context} context Reference to the context in which to draw the rectangle.
     * @param {Number} x y-coordinate
     * @param {Number} y x-coordinate
     * @param {Number} circum Circumference of the circle.
     * return Context
     * @private
     */
    _drawCircleByCircumference: function(context, x, y, circum) {
        var startAngle = 0,
            endAngle = 2 * Math.PI,
            radius =  circum/2;
        context.moveTo(x, y);
        context.arc(x + radius, y + radius, radius, startAngle, endAngle, false);
        return context;
    },

    /**
     * Draws a diamond.
     *
     * @method _drawDiamond
     * @param {Context} context Reference to the context in which to draw the rectangle.
     * @param {Number} x y-coordinate
     * @param {Number} y x-coordinate
     * @param {Number} width width
     * @param {Number} height height
     * return Context
     * @private
     */
    _drawDiamond: function(context, x, y, width, height)
    {
        var midWidth = width * 0.5,
            midHeight = height * 0.5;
        context.moveTo(x + midWidth, y);
        context.lineTo(x + width, y + midHeight);
        context.lineTo(x + midWidth, y + height);
        context.lineTo(x, y + midHeight);
        context.lineTo(x + midWidth, y);
        return context;
    },

    /**
     * Draws an ellipse.
     *
     * @method _drawEllipse
     * @param {Context} context Reference to the context in which to draw the rectangle.
     * @param {Number} x x-coordinate
     * @param {Number} y y-coordinate
     * @param {Number} w width
     * @param {Number} h height
     * return Context
     * @private
     */
	_drawEllipse: function(context, x, y, w, h) {
        var l = 8,
            theta = -(45/180) * Math.PI,
            angle = 0,
            angleMid,
            radius = w/2,
            yRadius = h/2,
            i,
            centerX = x + radius,
            centerY = y + yRadius,
            ax, ay, bx, by, cx, cy;

        ax = centerX + Math.cos(0) * radius;
        ay = centerY + Math.sin(0) * yRadius;
        context.moveTo(ax, ay);
        for(i = 0; i < l; i++)
        {
            angle += theta;
            angleMid = angle - (theta / 2);
            bx = centerX + Math.cos(angle) * radius;
            by = centerY + Math.sin(angle) * yRadius;
            cx = centerX + Math.cos(angleMid) * (radius / Math.cos(theta / 2));
            cy = centerY + Math.sin(angleMid) * (yRadius / Math.cos(theta / 2));
            context.quadraticCurveTo(cx, cy, bx, by);
        }
        return context;
    },

    /**
     * Destructor implementation for canvas implementations of graphs.
     *
     * @method destructor
     * @private
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
/**
 * Provides functionality for drawing lines in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing lines.
 *
 * @class CanvasLines
 * @extends Lines
 * @constructor
 */
Y.CanvasLines = function() {};
Y.extend(Y.CanvasLines, Y.Lines, {
    /*
     * Draws lines for the series.
     *
     * @method drawLines
     * @protected
     */
    drawLines: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var isNumber = Y.Lang.isNumber,
            xcoords,
            ycoords,
            direction = this.get("direction"),
            len,
            lastPointValid,
            pointValid,
            noPointsRendered = true,
            lastValidX,
            lastValidY,
            nextX,
            nextY,
            i,
            styles = this.get("styles").line,
            lineType = styles.lineType,
            lc = styles.color || this._getDefaultColor(this.get("graphOrder"), "line"),
            lineAlpha = styles.alpha,
            dashLength = styles.dashLength,
            gapSpace = styles.gapSpace,
            connectDiscontinuousPoints = styles.connectDiscontinuousPoints,
            discontinuousType = styles.discontinuousType,
            discontinuousDashLength = styles.discontinuousDashLength,
            discontinuousGapSpace = styles.discontinuousGapSpace,
            path = this.get("linePath"),
            context = path.context,
            width = this.get("width"),
            height = this.get("height");
        path.canvas.width = width;
        path.canvas.height = height;
        if(this._stacked)
        {
            xcoords = this.get("stackedXCoords");
            ycoords = this.get("stackedYCoords");
        }
        else
        {
            xcoords = this.get("xcoords");
            ycoords = this.get("ycoords");
        }
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        this._clearPaths(path);
        context.strokeStyle = isNumber(lineAlpha) ? this._toRGBA(lc, lineAlpha) : lc;
        context.lineWidth = styles.weight;
        for(i = 0; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                lastPointValid = pointValid;
                continue;
            }
            if(noPointsRendered)
            {
                noPointsRendered = false;
                context.moveTo(nextX, nextY);
            }
            else if(lastPointValid)
            {
                if(lineType !== "dashed")
                {
                    context.lineTo(nextX, nextY);
                }
                else
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                dashLength,
                                                gapSpace);
                }
            }
            else if(!connectDiscontinuousPoints)
            {
                context.moveTo(nextX, nextY);
            }
            else
            {
                if(discontinuousType !== "solid")
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                discontinuousDashLength,
                                                discontinuousGapSpace);
                }
                else
                {
                    context.lineTo(nextX, nextY);
                }
            }
            lastValidX = nextX;
            lastValidY = nextY;
            lastPointValid = true;
        }
        context.stroke();
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
        Y.CanvasLines.superclass.drawDashedLine.apply(this, [
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
});
/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasLinesSeries class renders quantitative data on a graph by connecting relevant data points.
 *
 * @class CanvasLinesSeries
 * @extends LineSeries
 * @uses CanvasSeriesImpl
 * @uses CanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasLineSeries = Y.Base.create("lineSeries", Y.LineSeries, [Y.CanvasSeriesImpl, Y.CanvasLines], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["linePath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasLine
         */
        type: "canvasLine"
    }
});
/**
 * Provides functionality for drawing plots in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing plots.
 *
 * @class CanvasPlots
 * @extends Plots
 * @constructor
 */
Y.CanvasPlots = function() {};
Y.extend(Y.CanvasPlots, Y.Plots, {
    /*
     * Draws plots for the series.
     *
     * @method drawPlots
     * @protected
     */
    drawPlots: function() {
        if(!this.get("xcoords") || this.get("xcoords").length < 1)
		{
			return;
		}
        var isNumber = Y.Lang.isNumber,
            styles = this._copyObject(this.get("styles").marker),
            w = styles.width,
            h = styles.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i,
            len = xcoords.length,
            top = ycoords[0],
            left,
            offsetWidth = w/2,
            offsetHeight = h/2,
            shapeMethod = this._getShapeMethod(styles.shape),
            path = this.get("markerPath"),
            context = path.context,
            canvas = path.canvas,
            shapeDrawn = false,
            fill = styles.fill,
            fillColor = styles.fill.color,
            fillAlpha = styles.fill.alpha,
            stroke = styles.border,
            strokeColor = stroke.color,
            strokeWeight = stroke.weight,
            strokeAlpha = stroke.alpha,
            drawFill = fill && fillColor,
            drawStroke = stroke && strokeWeight && strokeColor;
        this._clearPaths(path);
        canvas.width = this.get("width");
        canvas.height = this.get("height");
        if(shapeMethod) {
            if(drawFill) {
                context.fillStyle = isNumber(fillAlpha) ? this._toRGBA(fillColor, fillAlpha) : fillColor;
            }
            if(drawStroke) {
                context.strokeStyle = isNumber(strokeAlpha) ? this._toRGBA(strokeColor, strokeAlpha) : strokeColor;
                context.lineWidth = strokeWeight;
            }
            context.beginPath();
            for(i = 0; i < len; i = i + 1) {
                top = parseFloat(ycoords[i] - offsetHeight);
                left = parseFloat(xcoords[i] - offsetWidth);
                if(isNumber(left) && isNumber(top))
                {
                    shapeDrawn = true;
                    context = shapeMethod(context, left, top, w, h);
                }
            }
            if(shapeDrawn) {
                if(drawFill) {
                    context.closePath();
                    context.fill();
                }
                if(drawStroke) {
                    context.stroke();
                }
            }
        }
    },

    /**
     * Returns a method to draw a specified shape.
     *
     * @method _getShapeMethod
     * @param {String} shape The shape to be drawn.
     * @return Function
     * @private
     */
    _getShapeMethod: function(shape) {
        var shapes = {
                rect: this._drawRect,
                circle: this._drawCircleByCircumference,
                ellipse: this._drawEllipse
            };
        return shapes[shape];
    }
});
/**
 * Provides functionality for creating a marker series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasMarkersSeries class renders quantitative data on a graph by plotting relevant data points.
 *
 * @class CanvasMarkersSeries
 * @extends MarkerSeries
 * @uses CanvasSeriesImpl
 * @uses CanvasPlots
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasMarkerSeries = Y.Base.create("canvasMarkerSeries", Y.MarkerSeries, [Y.Plots, Y.CanvasSeriesImpl, Y.CanvasPlots], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["markerPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasMarker
         */
        type: "canvasMarker"
    }
});
/**
 * Provides functionality for drawing fills in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing area fills.
 *
 * @class CanvasFills
 * @extends Fills
 * @constructor
 */
Y.CanvasFills = function() {};
Y.extend(Y.CanvasFills, Y.Fills, {
    /**
     * Draws fill
     *
     * @method drawFill
     * @param {Array} xcoords The x-coordinates for the series.
     * @param {Array} ycoords The y-coordinates for the series.
     * @protected
     */
    drawFill: function(xcoords, ycoords)
    {
        if(xcoords.length < 1)
        {
            return;
        }
        var isNumber = Y.Lang.isNumber,
            len = xcoords.length,
            firstX = xcoords[0],
            firstY = ycoords[0],
            lastValidX = firstX,
            lastValidY = firstY,
            nextX,
            nextY,
            pointValid,
            noPointsRendered = true,
            i = 0,
            styles = this.get("styles").area,
            path = this.get("areaPath"),
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "slice"),
            alpha = styles.alpha,
            context = path.context,
            width = this.get("width"),
            height = this.get("height");
        path.canvas.width = width;
        path.canvas.height = height;
        this._clearPaths(path);
        context.fillStyle = isNumber(alpha) ? this._toRGBA(color, alpha) : color;
        context.beginPath();
        for(; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                continue;
            }
            if(noPointsRendered)
            {
                this._firstValidX = nextX;
                this._firstValidY = nextY;
                noPointsRendered = false;
                context.moveTo(nextX, nextY);
            }
            else
            {
                context.lineTo(nextX, nextY);
            }
            lastValidX = nextX;
            lastValidY = nextY;
        }
        this._lastValidX = lastValidX;
        this._lastValidY = lastValidY;
        context.closePath();
        context.fill();
    }
});
/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The AreaSeries class renders quantitative data on a graph by creating a fill between 0
 * and the relevant data points.
 *
 * @class CanvasAreasSeries
 * @extends AreaSeries
 * @uses Fills
 * @uses CanvasSeriesImpl
 * @uses CanvasFills
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasAreaSeries = Y.Base.create("areaSeries", Y.AreaSeries, [Y.Fills, Y.CanvasSeriesImpl, Y.CanvasFills], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["areaPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasArea
         */
        type: "canvasArea"
    }
});
/**
 * Provides functionality for creating a line series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasComboSeries class renders a combination of lines, plots and area fills in a single series.
 * Each series type has a corresponding boolean attribute indicating if it is rendered. By default,
 * lines and plots are rendered and area is not.
 *
 * @class CanvasCombosSeries
 * @extends ComboSeries
 * @uses Fills
 * @uses CanvasSeriesImpl
 * @uses CanvasLines
 * @uses CanvasFills
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasComboSeries = Y.Base.create("canvasComboSeries", Y.ComboSeries, [Y.Fills, Y.CanvasSeriesImpl, Y.CanvasLines, Y.CanvasFills], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["linePath", "areaPath"];
    }
}, {
    /**
     * Read-only attribute indicating the type of series.
     *
     * @attribute type
     * @type String
     * @default canvasCombo
     */
    ATTRS: {
        type: "canvasCombo"
    },

    /**
     * Indicates whether a fill is displayed.
     *
     * @attribute showAreaFill
     * @type Boolean
     * @default false
     */
    showAreaFill: {
        value: false
    },

    /**
     * Indicates whether lines are displayed.
     *
     * @attribute showLines
     * @type Boolean
     * @default true
     */
    showLines: {
        value: true
    },

    /**
     * Indicates whether markers are displayed.
     *
     * @attribute showMarkers
     * @type Boolean
     * @default true
     */
    showMarkers: {
        value: true
    }
});
/**
 * Provides functionality for creating a canvas implementation of a Column series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasColumnSeries class renders columns positioned horizontally along a category or time axis. The columns'
 * lengths are proportional to the values they represent along a vertical axis.
 * and the relevant data points.
 *
 * @class CanvasColumnSeries
 * @extends ColumnSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasColumnSeries = Y.Base.create("canvasColumnSeries", Y.ColumnSeries, [Y.CanvasSeriesImpl], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["columnPath"];
    },

    /**
     * Draws lines for the series.
     *
     * @method drawSeries
     * @private
     */
    drawSeries: function() {
        var isNumber = Y.Lang.isNumber,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            xcoord,
            ycoord,
            styles = this._copyObject(this.get("styles").marker),
            i,
            len = xcoords.length,
            left,
            top = ycoords[0],
            path = this.get("columnPath"),
            context = path.context,
            canvas = path.canvas,
            width = styles.width,
            halfWidth = width/2,
            height,
            fill = styles.fill,
            fillColor = fill.color,
            fillAlpha = fill.alpha,
            stroke = styles.border,
            strokeColor = stroke.color,
            strokeWeight = stroke.weight,
            strokeAlpha = stroke.alpha,
            drawFill = (fill && fillColor),
            drawStroke = (stroke && strokeWeight && strokeColor),
            origin = this._bottomOrigin,
            shapeDrawn = false;
        this._clearPaths(path);
        canvas.width = this.get("width");
        canvas.height = this.get("height");
        if(drawFill) {
            context.fillStyle = isNumber(fillAlpha) ? this._toRGBA(fillColor, fillAlpha) : fillColor;
        }
        if(drawStroke) {
            context.strokeStyle = isNumber(strokeAlpha) ? this._toRGBA(strokeColor, strokeAlpha) : strokeColor;
            context.lineWidth = strokeWeight;
        }
        context.beginPath();
        for(i = 0; i < len; i = i + 1) {
            xcoord = parseFloat(xcoords[i]);
            ycoord = parseFloat(ycoords[i]);
            left = xcoord - halfWidth;
            if(origin >= ycoord) {
                top = ycoord;
                height = origin - top;
            } else {
                top = origin;
                height = ycoord - origin;
            }
            if(isNumber(left) && isNumber(top) && isNumber(width) && isNumber(height)) {
                shapeDrawn = true;
                context.moveTo(left, top);
                context.lineTo(left + width, top);
                context.lineTo(left + width, top + height);
                context.lineTo(left, top + height);
                context.lineTo(left, top);
            }

        }
        if(shapeDrawn) {
            if(drawFill) {
                context.closePath();
                context.fill();
            }
            if(drawStroke) {
                context.stroke();
            }
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasColumn
         */
        type: "canvasColumn"
    }
});
/**
 * Provides functionality for creating a canvas implementation of a Candlestick series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasCandlestickSeries class renders columns (candles) and lines (wicks) representing the open, high, low and close
 * values for a chart.
 *
 * @class CanvasCandlestickSeries
 * @extends CandlestickSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasCandlestickSeries = Y.Base.create("canvasCandlestickSeries", Y.CandlestickSeries, [Y.CanvasSeriesImpl], {
    /**
     * Draws markers for an Candlestick series.
     *
     * @method
     * @param {Array} xcoords The xcoordinates to be plotted.
     * @param {Array} opencoords The coordinates representing the open values.
     * @param {Array} highcoords The coordinates representing the high values.
     * @param {Array} lowcoords The coordinates representing the low values.
     * @param {Array} closecoords The coordinates representing the close values.
     * @param {Number} len The number of x coordinates to plot.
     * @param {Number} width The width of each candlestick marker.
     * @param {Number} halfwidth Half the width of each candlestick marker.
     * @param {Object} styles The styles for the series.
     * @private
     */
    _drawMarkers: function(xcoords, opencoords, highcoords, lowcoords, closecoords, len, width, halfwidth, styles)
    {
        var upcandle = this.get("upcandle"),
            downcandle = this.get("downcandle"),
            candle,
            wick = this.get("wick"),
            wickStyles = styles.wick,
            wickWidth = wickStyles.width,
            hasUpCandle = false,
            hasDownCandle = false,
            hasWick = false,
            cx,
            opencoord,
            highcoord,
            lowcoord,
            closecoord,
            left,
            right,
            top,
            bottom,
            height,
            leftPadding = styles.padding.left,
            up,
            i,
            isNumber = Y.Lang.isNumber,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            x = this.get("x"),
            y = this.get("y");
        upcandle.canvas.style.left = x + "px";
        upcandle.canvas.style.top = y + "px";
        downcandle.canvas.style.left = x + "px";
        downcandle.canvas.style.top = y + "px";
        wick.canvas.style.left = x + "px";
        wick.canvas.style.top = y + "px";

        upcandle.canvas.width = canvasWidth;
        upcandle.canvas.height = canvasHeight;
        downcandle.canvas.width = canvasWidth;
        downcandle.canvas.height = canvasHeight;
        wick.canvas.width = canvasWidth;
        wick.canvas.height = canvasHeight;

        upcandle.context.fillStyle = styles.upcandle.fill.color;
        downcandle.context.fillStyle = styles.downcandle.fill.color;
        upcandle.context.strokeStyle = styles.upcandle.stroke.color;
        downcandle.context.strokeStyle = styles.downcandle.stroke.color;
        upcandle.context.lineWidth = styles.upcandle.stroke.weight;
        downcandle.context.lineWidth = styles.downcandle.stroke.weight;
        wick.context.fillStyle = styles.wick.fill.color;
        wick.context.lineWidth = styles.wick.stroke.weight;

        upcandle.context.clearRect(0, 0, canvasWidth, canvasHeight);
        downcandle.context.clearRect(0, 0, canvasWidth, canvasHeight);
        wick.context.clearRect(0, 0, canvasWidth, canvasHeight);

        for(i = 0; i < len; i = i + 1)
        {
            cx = Math.round(xcoords[i] + leftPadding);
            left = cx - halfwidth;
            right = cx + halfwidth;
            opencoord = Math.round(opencoords[i]);
            highcoord = Math.round(highcoords[i]);
            lowcoord = Math.round(lowcoords[i]);
            closecoord = Math.round(closecoords[i]);
            up = opencoord > closecoord;
            if(up) {
                top = closecoord;
                bottom = opencoord;
                candle = upcandle;
                hasUpCandle = true;
            } else {
                top = opencoord;
                bottom = closecoord;
                candle = downcandle;
                hasDownCandle = true;
            }
            height = bottom - top;
            if(candle && isNumber(left) && isNumber(top) && isNumber(width) && isNumber(height))
            {
                candle.context = this._drawRect(candle.context, left, top, width, height);
            }
            if(isNumber(cx) && isNumber(highcoord) && isNumber(lowcoord))
            {
                hasWick = true;
                wick.context = this._drawRect(wick.context, cx - wickWidth/2, highcoord, wickWidth, lowcoord - highcoord);
            }
        }
        if(hasUpCandle) {
            upcandle.context.closePath();
            upcandle.context.fill();
        }
        if(hasDownCandle) {
            downcandle.context.closePath();
            downcandle.context.fill();
        }
        if(hasWick) {
            wick.context.closePath();
            wick.context.fill();
        }
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
        return ["wick", "upcandle", "downcandle"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default canvasCandlestick
         */
        type: {
            value: "canvasCandlestick"
        }
    }
});

/**
 * Provides functionality for creating a canvasOHLC series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasOHLCSeries class renders lines representing the open, high, low and close
 * values for a chart.
 *
 * @class CanvasOHLCSeries
 * @extends OHLCSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasOHLCSeries = Y.Base.create("canvasOHLCSeries", Y.OHLCSeries, [Y.CanvasSeriesImpl], {
    /**
     * Draws markers for an OHLC series.
     *
     * @method
     * @param {Array} xcoords The xcoordinates to be plotted.
     * @param {Array} opencoords The coordinates representing the open values.
     * @param {Array} highcoords The coordinates representing the high values.
     * @param {Array} lowcoords The coordinates representing the low values.
     * @param {Array} closecoords The coordinates representing the close values.
     * @param {Number} len The number of x coordinates to plot.
     * @param {Number} width The width of each ohlc marker.
     * @param {Number} halfwidth Half the width of each ohlc marker.
     * @param {Object} styles The styles for the series.
     * @private
     */
    _drawMarkers: function(xcoords, opencoords, highcoords, lowcoords, closecoords, len, width, halfwidth, styles)
    {
        var upmarker = this.get("upmarker"),
            downmarker = this.get("downmarker"),
            opencoord,
            highcoord,
            lowcoord,
            closecoord,
            left,
            right,
            leftPadding = styles.padding.left,
            context,
            up,
            cx,
            i,
            height,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            upContext = upmarker.context,
            downContext = downmarker.context,
            upStyles = styles.upmarker.stroke,
            downStyles = styles.downmarker.stroke,
            upColor = upStyles.color,
            upAlpha = upStyles.alpha,
            downColor = downStyles.color,
            downAlpha = downStyles.alpha;

        upmarker.canvas.width = canvasWidth;
        upmarker.canvas.height = canvasHeight;
        downmarker.canvas.width = canvasWidth;
        downmarker.canvas.height = canvasHeight;

        this._clearPaths(upmarker);
        this._clearPaths(downmarker);

        upContext.lineWidth = upStyles.weight;
        upContext.strokeStyle = Y.Lang.isNumber(upAlpha) ? this._toRGBA(upColor, upAlpha) : upColor;
        downContext.lineWidth = downStyles.weight;
        downContext.strokeStyle = Y.Lang.isNumber(downAlpha) ? this._toRGBA(downColor, downAlpha) : downColor;
        for(i = 0; i < len; i = i + 1)
        {
            cx = xcoords[i] + leftPadding;
            left = cx - halfwidth;
            right = cx + halfwidth;
            opencoord = opencoords[i];
            highcoord = highcoords[i];
            lowcoord = lowcoords[i];
            closecoord = closecoords[i];
            up = opencoord > closecoord;
            height = lowcoord - highcoord;
            context = up ? upContext : downContext;
            context.moveTo(left, opencoord);
            context.lineTo(cx, opencoord);
            context.moveTo(cx, highcoord);
            context.lineTo(cx, lowcoord);
            context.moveTo(cx, closecoord);
            context.lineTo(right, closecoord);
        }

        upContext.stroke();
        downContext.stroke();
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
        return ["upmarker", "downmarker"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default canvasOHLC
         */
        type: {
            value: "canvasOHLC"
        }
    }
});

/**
 * Canvas implementation of a volume based column chart.
 *
 * @module gallery-charts-stockindicators
 * @class VolumeColumnCanvas
 * @extends VolumeColumn
 * @uses CanvasSeriesImpl
 * @constructor
 */
Y.VolumeColumnCanvas = Y.Base.create("volumeColumnCanvas", Y.VolumeColumn, [Y.CanvasSeriesImpl],  {
    drawSeries: function() {
        var valueData = this.get("yAxis").get("dataProvider"),
            xcoords = this.get("xcoords"),
            volumeCoords = this.get("ycoords"),
            upPath = this.get("upPath"),
            downPath = this.get("downPath"),
            len = xcoords.length,
            styles = this.get("styles"),
            padding = styles.padding,
            dataWidth = this.get("width") - (padding.left + padding.right),
            width = this._calculateMarkerWidth(dataWidth, len, styles.spacing),
            halfwidth = width/2,
            previousClose = this.get("previousClose");
        styles.upPath.fill.opacity = styles.upPath.fill.alpha;
        styles.downPath.fill.opacity = styles.downPath.fill.alpha;
        this._drawColumns(upPath, downPath, styles, valueData, previousClose, xcoords, volumeCoords, width, halfwidth);
    },

    /**
     * Draws the columns.
     *
     * @method _drawColumns
     * @private
     */
    _drawColumns: function(
        upPath,
        downPath,
        styles,
        valueData,
        previousClose,
        xcoords,
        volumeCoords,
        width,
        halfwidth
    ) {
        var bottomOrigin = this._bottomOrigin,
            top,
            left,
            height,
            selectedPath,
            i,
            len = xcoords.length,
            hasUpPath = false,
            hasDownPath = false,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            x = this.get("x"),
            y = this.get("y");

        upPath.canvas.style.left = x + "px";
        upPath.canvas.style.top = y + "px";
        downPath.canvas.style.left = x + "px";
        downPath.canvas.style.top = y + "px";
        upPath.canvas.width = canvasWidth;
        upPath.canvas.height = canvasHeight;
        downPath.canvas.width = canvasWidth;
        downPath.canvas.height = canvasHeight;
        upPath.context.fillStyle = styles.upPath.fill.color;
        downPath.context.fillStyle = styles.downPath.fill.color;
        upPath.context.strokeStyle = styles.upPath.stroke.color;
        downPath.context.strokeStyle = styles.downPath.stroke.color;
        upPath.context.lineWidth = styles.upPath.stroke.weight;
        downPath.context.lineWidth = styles.downPath.stroke.weight;
        upPath.context.clearRect(0, 0, canvasWidth, canvasHeight);
        downPath.context.clearRect(0, 0, canvasWidth, canvasHeight);
        for(i = 0; i < len; i = i + 1) {
            if(previousClose && valueData[i].close < previousClose) {
                selectedPath = downPath.context;
                hasDownPath = true;
            } else {
                selectedPath = upPath.context;
                hasUpPath = true;
            }
            left = xcoords[i] - halfwidth;
            top = volumeCoords[i];
            height = bottomOrigin - top;
            if(height > 0 && !isNaN(left) && !isNaN(top)) {
                selectedPath.moveTo(left, top);
                selectedPath.lineTo(left + width, top);
                selectedPath.lineTo(left + width, top + height);
                selectedPath.lineTo(left, top + height);
                selectedPath.lineTo(left, top);
            }
            previousClose = valueData[i].close;
        }
        if(hasUpPath) {
            upPath.context.closePath();
            upPath.context.fill();
        }
        if(hasDownPath) {
            downPath.context.closePath();
            downPath.context.fill();
        }
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
        return ["upPath", "downPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default volumeColumnCanvas
         */
        type: {
            value: "volumeColumnCanvas"
        }
    }
});
/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdLines class contains methods for drawing lines relative to a y-coordinate on a cartesian
 * scale.
 *
 * @class ThresholdLines
 * @extends Lines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
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
            height = this.get("height"),
            context,
            canvas,
            parentNode;
        if(this._paths) {
            while(this._paths.length > 0) {
                path = this._paths.pop();
                if(path instanceof Y.Shape) {
                    path.destroy();
                } else {
                     context = path.context;
                     canvas = path.canvas;
                     if(context) {
                        context.clearRect(0, 0, width, height);
                     }
                     if(canvas) {
                        parentNode = canvas.parentNode;
                        Y.Event.purgeElement(canvas, true);
                        if(parentNode) {
                            parentNode.removeChild(path.canvas);
                        }
                     }
                }
            }
        }
    }
});
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
/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdLineSeries class renders lines corresponding to values across a y-axis.
 *
 * @class ThresholdLineSeries
 * @extends SeriesBase
 * @uses ThresholdLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.ThresholdLineSeries = Y.Base.create("thresholdLineSeries", Y.SeriesBase, [Y.Lines, Y.ThresholdLines],  {
    /**
     * Draws the series.
     *
     * @method draw
     * @protected
     */
    initializer: function()
    {
        var w = this.get("width"),
            h = this.get("height"),
            yAxis = this.get("yAxis");
        if((isFinite(w) && isFinite(h) && w > 0 && h > 0) && yAxis) {
            this.draw();
        }
    },

    /**
     * Draws lines for the series.
     *
     * @method drawSeries
     * @private
     */
    draw: function()
    {
        var thresholds = this.get("thresholds"),
            thresholdsLength = thresholds ? thresholds.length : 0,
            styles = this.get("styles"),
            yAxis = this.get("yAxis"),
            yMin = yAxis.get("minimum"),
            yMax = yAxis.get("maximum"),
            yEdgeOffset = yAxis.get("edgeOffset"),
            thresholdCoords = this._getThresholdCoords(thresholds, thresholdsLength, styles, yMin, yMax, yEdgeOffset),
            thresholdPaths = this._getPaths(this._paths, styles.thresholds, thresholdsLength);
        this._drawThresholdLines(thresholdPaths, thresholdCoords, thresholdsLength, styles);
        this._paths = thresholdPaths;
    }
}, {
    ATTRS: {
        xAxis: {},

        yAxis: {}
    }
});
/**
 * Provides functionality for creating threshold lines.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The ThresholdCanvasLineSeries class renders lines corresponding to values across a y-axis.
 *
 * @class ThresholdCanvasLineSeries
 * @extends ThresholdLineSeries
 * @uses CanvasSeriesImpl
 * @uses CanvasLines
 * @uses ThresholdCanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.ThresholdCanvasLineSeries = Y.Base.create(
    "thresholdCanvasLineSeries",
    Y.ThresholdLineSeries,
    [Y.CanvasSeriesImpl, Y.CanvasLines, Y.ThresholdCanvasLines]
);
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
/**
 * Provides functionality for creating a line series with alternating colors based on thresholds.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The MultipleLineCanvasSeries class renders quantitative data on a graph by connecting relevant data points and
 * using different colors based on a defined threshold value.
 *
 * @class MultipleLineCanvasSeries
 * @extends CartesianSeries
 * @uses Lines
 * @uses ThresholdLines
 * @uses MultipleLineSeries
 * @uses ThresholdCanvasLines
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.MultipleLineCanvasSeries = Y.Base.create("multipleLineCanvasSeries", Y.CartesianSeries, [
    Y.Lines,
    Y.ThresholdLines,
    Y.MultipleLineSeries,
    Y.ThresholdCanvasLines
]);
/**
 * Provides functionality for a crosshair.
 *
 * @module gallery-charts-stockindicators
 */

/**
 * Creates an updatable crosshair on the Graph which can be controlled
 * by mouse and touch events.
 *
 * @class Crosshair
 * @constructor
 * @param {Object} config Configuration parameters.
 *  <dl>
 *      <dt>dotdiameter</dt><dd>The diameter of the circle or dot.</dd>
 *      <dt>drawHorizontal</dt><dd>Indicates whether to draw the horizontal line. The default
 *      value is `false`.</dd>
 *      <dt>drawVertical</dt><dd>Indicates whether to draw the verical line. The default
 *      value is `true`.</dd>
 *      <dt>lineColor</dt><dd>The color to use for lines.</dd>
 *      <dt>lineWidth</dt><dd>The weight of the lines.</dd>
 *      <dt>useCircle</dt><dd>Determines whether to use an empty circle. The default value is
 *      `false`.</dd>
 *      <dt>useDot</dt><dd>Determines whether to use a dot. The default value is `true`.</dd>
 *  </dl>
 */
Y.Crosshair = function() {
    this.initializer.apply(this, arguments);
};
Y.Crosshair.prototype = {
    /**
     * Builds the crosshair.
     *
     * @method initializer
     * @protected
     */
    initializer: function(cfg) {
        var graphic = new Y.Graphic({
                render: cfg.render,
                autoDraw: false,
                width: cfg.width,
                height: cfg.height,
                x: cfg.x,
                y: cfg.y
            }),
            width = cfg.width,
            height = cfg.height,
            series = cfg.series,
            graph,
            category = cfg.category,
            yline,
            i,
            len = series.length,
            graphX = cfg.graphX - cfg.x,
            graphY = cfg.graphY - cfg.y;
        yline = graphic.addShape({
            shapeRendering: "crispEdges",
            type: "path",
            stroke: category.stroke
        }).moveTo(graphX, 0).lineTo(graphX, height).end();
        this._xcoords = category.coords;
        this._yline = yline;
        this.width = cfg.width;
        this.height = cfg.height;
        if(series) {
            for(i = 0; i < len; i = i + 1) {
                graph = series[i];
                if(graph.line) {
                    graph.xLine = graphic.addShape({
                        shapeRendering: "crispEdges",
                        type: "path",
                        stroke: graph.line.stroke
                    }).moveTo(0, graphY).lineTo(width, graphY).end();
                }
                if(graph.marker) {
                    graph.marker.y = graphY - graph.marker.height/2;
                    graph.marker.x = graphX - graph.marker.width/2;
                    graph.marker.type = graph.marker.type || graph.marker.shape;
                    graph.marker = graphic.addShape(graph.marker);
                }
            }
            this._series = series;
        }
        this._xy = graphic.getXY();
        this.graphic = graphic;
    },

    /**
     * Updates the position of the crosshair.
     *
     * @method setTarget
     * @param {Number} pageX The x-coordinate to map in which to map the crosshair.
     */
    setTarget: function(pageX, redraw) {
        var xy = this._xy,
            x = pageX - xy[0],
            y,
            series = this._series,
            graph,
            i,
            index = Math.floor((x / this.width) * this._xcoords.length),
            len = series.length,
            isNumber;

        this._yline.set("transform", "translate(" + x + ")");
        if(series) {
            for(i = 0; i < len; i = i + 1) {
                graph = series[i];
                y = graph.coords[index];
                isNumber = typeof y === "number" && isFinite(y);

                if(graph.marker) {
                    if(isNumber) {
                        graph.marker.set("transform", "translate(" + x + ", " + y + ")");
                    }
                    graph.marker.set("visible", isNumber);
                }
                if(graph.line) {
                    if(isNumber) {
                        graph.xLine.set("transform", "translateY(" + y + ")");
                    }
                    graph.xLine.set("visible", isNumber);
                }
            }
        }
        this.updateFlag = true;
        if(redraw) {
            this.graphic._redraw();
        }
    },

    /**
     * Updates the crosshair items.
     *
     * @method redraw
     */
    redraw: function() {
        if(this.updateFlag) {
            this.graphic._redraw();
            this.updateFlag = false;
        }
    },

    /**
     * Removes all elements of the crosshair.
     *
     * @method destroy
     */
    destroy: function() {
        if(this.graphic) {
            this.graphic.destroy();
        }
    }
};
/**
 * Gridlines draws gridlines on a Graph.
 *
 * @module gallery-charts-stockindicators
 * @class Gridlines
 * @constructor
 * @extends Base
 * @uses Renderer
 * @param {Object} config (optional) Configuration parameters.
 */
Y.Gridlines = Y.Base.create("gridlines", Y.Base, [Y.Renderer], {
    /**
     * Reference to the `Path` element used for drawing Gridlines.
     *
     * @property _path
     * @type Path
     * @private
     */
    _path: null,

    /**
     * Removes the Gridlines.
     *
     * @method remove
     * @private
     */
    remove: function()
    {
        var path = this._path;
        if(path)
        {
            path.destroy();
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
        if(this.get("axis") && this.get("graphic"))
        {
            this._drawGridlines(w, h, startIndex, interval);
        }
    },

    /**
     * Algorithm for drawing gridlines
     *
     * @method _drawGridlines
     * @param {Number} width The width of the area in which the gridlines will be drawn.
     * @param {Number} height The height of the area in which the gridlines will be drawn.
     * @param {Number} startIndex The index in which to start drawing fills (if specified). The default
     * value is 0.
     * @param {Number} interval The number gaps between fills (if specified). The default value is 2. A value of 1
     * would result in a solid fill across the area.
     * @private
     */
    _drawGridlines: function(w, h, startIndex, interval)
    {
        var path = this._path,
            axis = this.get("axis"),
            axisPosition = axis.get("position"),
            points,
            direction = this.get("direction"),
            styles = this.get("styles"),
            fill = styles.fill,
            border = styles.border,
            line = styles.line,
            stroke = fill && border ? border : line,
            x = this.get("x"),
            y = this.get("y");
        startIndex = startIndex || 0;
        interval = interval || 2;
        if(isFinite(w) && isFinite(h) && w > 0 && h > 0)
        {
            if(axisPosition !== "none" && axis && axis.get("tickPoints"))
            {
                points = axis.get("tickPoints");
            }
            else
            {
                points = this._getPoints(axis.get("styles").majorUnit.count, w, h);
            }
            if(path)
            {
                path = this._stylePath.apply(this, [path, w, h, x, y, stroke, fill]);
            }
            else
            {
                path = this._getPath.apply(this, [w, h, x, y, stroke, fill]);
                this._path = path;
            }
            if(direction === "vertical")
            {
                if(fill) {
                    this._verticalFill.apply(this, [path, points, h, startIndex, interval, w]);
                } else {
                    this._verticalLine.apply(this, [path, points, h, styles]);
                }
            }
            else
            {
                if(fill) {
                    this._horizontalFill.apply(this, [path, points, w, startIndex, interval, h]);
                } else {
                    this._horizontalLine.apply(this, [path, points, w, styles]);
                }
            }
            this._endPath.apply(this, [path]);
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
        path.end();
    },

    /**
     * Creates a path element.
     *
     * @method _getPath
     * @param {Number} width width for the path.
     * @param {Number} height height for the path.
     * @param {Number} x x-coordinate for the path.
     * @param {Number} y y-coordinate for the path.
     * @param {Object} stroke Stroke properties for the path.
     * @param {Object} fill Fill properties for the fill.
     * @return path
     * @private
     */
    _getPath: function(w, h, x, y, stroke, fill) {
        var path,
            graphic = this.get("graphic"),
            cfg = {
                type: "path",
                width: w,
                stroke: stroke,
                height: h,
                x: x,
                y: y
            };
        if(fill) {
            cfg.fill = fill;
        }
        path = graphic.addShape(cfg);
        path.addClass("yui3-gridlines");
        return path;
    },

    /**
     * Sets the styles and dimensions for the path.
     *
     * @method _stylePath
     * @param {Path} path Reference to the path instance.
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
        path.set("width", w);
        path.set("height", h);
        path.set("stroke", stroke);
        path.set("x", x);
        path.set("y", y);
        if(fill) {
            path.set("fill", fill);
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
     * @param {Path} path Reference to path element
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
            path.moveTo(0, y);
            path.lineTo(width, y);
        }
    },

    /**
     * Algorithm for vertical lines.
     *
     * @method _verticalLine
     * @param {Path} path Reference to path element
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
            path.moveTo(x, 0);
            path.lineTo(x, height);
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
            path.moveTo(0, y1);
            path.lineTo(0, y2);
            path.lineTo(width, y2);
            path.lineTo(width, y1);
            path.lineTo(0, y1);
            path.closePath();
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
            path.moveTo(x1, 0);
            path.lineTo(x2, 0);
            path.lineTo(x2, height);
            path.lineTo(x1, height);
            path.lineTo(x1, 0);
            path.closePath();
        }
    },

    /**
     * Gets the default value for the `styles` attribute. Overrides
     * base implementation.
     *
     * @method _getDefaultStyles
     * @return Object
     * @protected
     */
    _getDefaultStyles: function()
    {
        var defs = {
            line: {
                color:"#f0efe9",
                weight: 1,
                alpha: 1
            },
            fill: null,
            showFirst: true,
            showLast: true
        };
        return defs;
    }
},
{
    ATTRS: {
        /**
         * Indicates the x position of gridlines.
         *
         * @attribute x
         * @type Number
         */
        x: {
            value: 0
        },

        /**
         * Indicates the y position of gridlines.
         *
         * @attribute y
         * @type Number
         */
        y: {
            value: 0
        },

        /**
         * Indicates the direction of the gridline.
         *
         * @attribute direction
         * @type String
         */
        direction: {},

        /**
         * Indicate the `Axis` in which to bind
         * the gridlines.
         *
         * @attribute axis
         * @type Axis
         */
        axis: {},

        /**
         * Indicates the `Graphic` in which the gridlines
         * are drawn.
         *
         * @attribute graphic
         * @type Graphic
         */
        graphic: {},

        /**
         * Indicates the number of gridlines to display. If no value is set, gridlines will equal the number of ticks in
         * the corresponding axis.
         *
         * @attribute count
         * @type Number
         */
        count: {}
    }
});
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
/**
 * Provides functionality for a legend.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Displays a legend when the user interacts with the corresponding chart
 * application.
 *
 * @class StockIndicatorsLegend
 * @constructor
 * @param {Object} config Configuration parameters.
 *  <dl>
 *      <dt>dataProvider</dt><dd>Reference to the application's `dataProvider` attribute.</dd>
 *      <dt>dateColor</dt><dd>The color to be used for the date text in the legend.</dd>
 *      <dt>delim</dt><dd>String value prefixing the display name of each legend item.</dd>
 *      <dt>dateLabelFunction</dt><dd>The function used for formatting the date label.</dd>
 *      <dt>dateLabelFormat</dt><dd>The strf format used to format the date label.</dd>
 *      <dt>dateLabelScope</dt><dd>The scope for the dateLabelFunction</dd>
 *      <dt>displayKeys</dt><dd>An array of displayKeys to be used in the legend. Each display key
 *      is the text to be displayed in the legend for the corresponding value key.</dd>
 *      <dt>displayName</dt><dd>Indicates whether to display the display name. The default
 *      value is `true`.</dd>
 *      <dt>displayValue</dt><dd>Indicates whether to display the value. The default value
 *      is `true`.</dd>
 *      <dt>drawSwatch</dt><dd>Indicates whether or no to draw a colored swatch by the display
 *      name. The default value is `true`.</dd>
 *      <dt>font</dt><dd>The font to use for all text in the legend.</dd>
 *      <dt>fontSize</dt><dd>The font size to use for all text in the legend.</dd>
 *      <dt>height</dt><dd>The height of the legend.</dd>
 *      <dt>priceDownColor</dt><dd>The color to be used for the value text when the value is negative.</dd>
 *      <dt>priceUpColor</dt><dd>The color to be used for value text when the value is positive.</dd>
 *      <dt>swatchWidth</dt><dd>The width of the swatch for each legend item.</dd>
 *      <dt>valueKeys</dt><dd>The value keys, in order, to be used in the legend.</dd>
 *      <dt>valueLabelFormat</dt><dd>Object literal indicating how to format the legend values.
 *          <dl>
 *              <dt>prefix</dt><dd>The prefix.</dd>
 *              <dt>suffix</dt><dd>The suffix.</dd>
 *              <dt>thousandsSeparator</dt><dd>The thousands separator.</dd>
 *              <dt>decimalPlaces</dt><dd>The number of decimals to display.</dd>
 *              <dt>decimalsSeparator</dt><dd>The decimal separator.</dd>
 *          </dl>
 *      </dd>
 *      <dt>width</dt><dd>The width of the legend.</dd>
 *      <dt>x</dt><dd>The x-coordinate for the legend</dd>
 *      <dt>y</dt><dd>The y-coordinate for the legend</dd>
 *  </dl>
 */
function StockIndicatorsLegend() {
    this.init.apply(this, arguments);
}
StockIndicatorsLegend.prototype = {
    init: function(cfg) {
        var i,
            myul,
            len,
            seriesQueue = cfg.valueKeys,
            displayNameQueue = cfg.displayKeys,
            displayName,
            item,
            indicator,
            items = this.items || {},
            indicatorColor;
            this.x = cfg.x;
            this.y = cfg.y;
            this.width = cfg.width;
            this.height = cfg.height;
            this.dataProvider = cfg.dataProvider;
            this.contentDiv = Y.DOM.create('<div style="position:absolute;top:' +
                cfg.y + 'px;' + cfg.x + '0px;height: ' + cfg.height + 'px; width: ' +
                cfg.width + 'px;" class="l-hbox">'
            );
            this.dateLabelFunction = cfg.dateLabelFunction;
            this.dateLabelFormat = cfg.dateLabelFormat;
            this.dateLabelScope = cfg.dateLabelScope || this;
            cfg.render._node.appendChild(this.contentDiv);

            len = seriesQueue.length;
            myul = Y.DOM.create(
                '<ul  style="vertical-align: middle; line-height: ' + this.height +
                'px;padding:0px 0px 0px 0px;margin:0px 0px 0px 0px;" class="layout-item-modules pure-g">'
            );
            this.contentDiv.appendChild(myul);
            this.dateItem = {
                li: Y.DOM.create('<li class="layout-item-module pure-u" style="display:inline-block; margin: 0px 4px 0px 0px;">'),
                value: Y.DOM.create(
                    '<span style="border-left:' + cfg.swatchWidth + 'px solid #fff;font-size:' + cfg.fontSize + ';font-family:' + cfg.font +
                    ';" id="dateitem";font-color:' + cfg.dateColor +'" ></span>'
                )
            };
            this.dateItem.li.appendChild(this.dateItem.value);
            myul.appendChild(this.dateItem.li);
            for(i = 0; i < len; i = i + 1) {
                indicator = seriesQueue[i];
                displayName = displayNameQueue[i];
                item = {};
                indicatorColor = cfg.colors[indicator];
                item.li = Y.DOM.create(
                    '<li id="' + indicator + '" class="layout-item-module pure-u" style="display:inline-block; margin: 0px 4px 0px 0px;">'
                 );
                item.bullet = Y.DOM.create(
                    '<div style="display: inline-block;width:3px; height: ' + this.height + 'px; background-color:' + indicatorColor + ';"></div>'
                );
                item.label = Y.DOM.create(
                    '<span style="font-size:' + cfg.fontSize +
                    ';font-family:' + cfg.font + ';color:' + indicatorColor + ';display:inline:margin: 0px 0px 0px 0px;" id="' +
                    indicator + '" >' + cfg.delim + displayName +
                    ' : </span>'
                );
                item.value = Y.DOM.create(
                    '<span style="font-size:' + cfg.fontSize + ';font-family:' + cfg.font +
                    ';display:inline:margin: 0px 0px 0px 0px;" id="' + indicator + 'Value" ></span>'
                );
                myul.appendChild(item.li);
                item.li.appendChild(item.bullet);
                item.li.appendChild(item.label);
                item.li.appendChild(item.value);
                items[indicator] = item;
                item.li.style.display = "none";
            }
            this.list = myul;
            this.seriesQueue = seriesQueue;
            this.items = items;
            this.priceUpColor = cfg.priceUpColor;
            this.priceDownColor = cfg.priceDownColor;
            this.valueLabelFormat = cfg.valueLabelFormat;
            this.formatDate = cfg.formatDate;
            this._xy = Y.DOM.getXY(this.contentDiv);
    },
   
    /**
     * Removes all elements of the legend.
     *
     * @method destroy
     */
    destroy: function() {
        this._removeChildren(this.list);
        this._removeChildren(this.contentDiv);
        if(this.contentDiv && this.contentDiv.parentNode) {
            this.contentDiv.parentNode.removeChild(this.contentDiv);
        }
    },

    /**
     * Removes all DOM elements from an HTML element. Used to clear out labels during detruction
     * phase.
     *
     * @method _removeChildren
     * @private
     */
    _removeChildren: function(node)
    {
        if(node && node.hasChildNodes())
        {
            var child;
            while(node.firstChild)
            {
                child = node.firstChild;
                this._removeChildren(child);
                node.removeChild(child);
            }
        }
    },
   
    /**
     * Updates the legend.
     *
     * @method update
     * @param {Number} pageX
     * @param {Array} dataProvider
     */
    update: function(props, redraw) {
        this._dataItem = props.dataProvider[props.dataIndex];
        if(redraw) {
            this.redraw();
        }
    },

  
    /**
     * Draws the legend.
     *
     * @method redraw
     */
    redraw: function() {
        var queue = this.seriesQueue,
            key,
            len = queue.length,
            item,
            items = this.items,
            i,
            val,
            dateLabelFunction = this.dateLabelFunction,
            dateLabelScope = this.dateLabelScope,
            dateLabelFormat = this.dateLabelFormat,
            dateLabelArgs,
            dataItem = this._dataItem;
        if(dataItem) {
            val = dataItem.Date || dataItem.Timestamp;
            if(dateLabelFunction) {
                dateLabelArgs = [val];
                if(dateLabelFormat) {
                    dateLabelArgs.push(dateLabelFormat);
                }
                val = dateLabelFunction.apply(dateLabelScope, dateLabelArgs);
            }
            this.dateItem.value.innerHTML = Y.Escape.html(val);
            for(i = 0; i < len; i = i + 1) {
                key = queue[i];
                item = items[key];
                if(dataItem.hasOwnProperty(key)) {
                    item.li.style.display = "inline-block";
                    val = dataItem[key];
                    item.value.innerHTML = Y.Number.format(parseFloat(val), this.valueLabelFormat);
                    item.value.style.color = val > 0 ? this.priceUpColor : this.priceDownColor;
                } else {
                    item.li.style.display = "none";
                }
            }
            dataItem = this._dataItem = null;
        }
    }
};
Y.StockIndicatorsLegend = StockIndicatorsLegend;
/**
 * Provides functionality for a legend.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Displays a legend for a corresponding chart
 * application.
 *
 * @class StockIndicatorsAxisLegend
 * @constructor
 */
Y.StockIndicatorsAxisLegend = function() {
    this.initializer.apply(this,arguments);
};

Y.StockIndicatorsAxisLegend.prototype = {
    /**
     * The maximum value of the corresponding axis.
     *
     * @property _maximum
     * @type Number
     * @private
     */

    /**
     * The minimum value of the corresponding axis.
     *
     * @property _minimum
     * @type Number
     * @private
     */

    /**
     * Reference to the corresponding axis.
     *
     * @property _axis
     * @type NumericAxis
     * @private
     */

    /**
     * Styles to be applied to labels.
     *
     * @property _styles
     * @type Object
     * @private
     */

    /**
     * Width of the StockIndicatorsAxisLegend instance.
     *
     * @property width
     * @type Number
     */

    /**
     * Height of the StockIndicatorsAxisLegend instance.
     *
     * @property height
     * @type Number
     */

    /**
     * Pointer to the dataProvider for the axis.
     *
     * @property _dataProvider
     * @type Array
     * @private
     */

    /**
     * Reference to the parent Node instance.
     *
     * @property _contentBox
     * @type Node
     * @private
     */

    /**
     * Reference to the format object used to format label strings.
     *
     * @property _labelFormat
     * @type Object
     * @private
     */

    /**
     * Reference to the method used to format label strings.
     * @property _labelFunction
     * @type Function
     * @private
     */

    /**
     * Array containing label containers.
     *
     * @property _labels
     * @type Array
     * @private
     */

    /**
     * @method initializer
     * @private
     */
    initializer: function(cfg) {
        var axis = cfg.axis,
            key,
            styles = this._getDefaultStyles(),
            newStyles;
        for(key in cfg.styles) {
            if(cfg.styles.hasOwnProperty(key)) {
                styles[key] = cfg.styles[key];
            }
        }
        this._y = cfg.y;
        this._contentBox = cfg.render;
        this._styles = styles;
        this._maximum = axis.get("maximum");
        this._minimum = axis.get("minimum");
        this._dataProvider = cfg.dataProvider;
        this._axis = axis;
        this._labelFormat = cfg.labelFormat || axis.get("labelFormat");
        this._labelFunction = cfg.labelFunction || axis.get("labelFunction");
        this.height = cfg.height || axis.get("height");
        this._labels = [];
        newStyles  = this._getDimensions();
        this.width = newStyles.width;
        this.itemWidth = this.width;
        this.itemHeight = newStyles.height;
        this._contentWidth = cfg.contentWidth;
        this._contentHeight = cfg.contentHeight;
        for(key in newStyles.arrow) {
            if(newStyles.arrow.hasOwnProperty(key)) {
                this._styles.arrow[key] = newStyles.arrow[key];
            }
        }
        this._biggestText = newStyles.biggestText;
        this._createIndicators(cfg);
    },

    /**
     * Creates the indicator items for legend.
     *
     * @method _createIndicators
     * @param {Object} cfg The configuration object
     * @private
     */
    _createIndicators: function(cfg) {
        var previousClose = cfg.previousClose,
            indicatorItems = cfg.indicatorItems,
            interactiveItem = cfg.interactiveItem;
        if(previousClose) {
            this._previousClose = this._getPreviousClose(previousClose);
        }
        if(indicatorItems) {
            this._indicatorItems = this._initializeIndicatorItems(indicatorItems);
        }
        if(interactiveItem) {
            this._interactiveItem = this._getInteractiveItem(interactiveItem);
        }
    },

    /**
     * Calculates the key dimensions for the instance including the width and height of the display
     * items. Values are calculated by comparing the widths of formatted and styled maximum and minimum
     * values from the corresponding axis. The largest width is then used to calculate the overal size
     * of the items.
     *
     * @method _getDimensions
     * @return Number
     * @private
     */
    _getDimensions: function() {
        var styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            arrowWidth,
            axis = this._axis,
            maxLabel = DOCUMENT.createElement("span"),
            minLabel = DOCUMENT.createElement("span"),
            height,
            width,
            minText = this._labelFunction(this._minimum, this._labelFormat),
            maxText = this._labelFunction(this._maximum, this._labelFormat),
            container = DOCUMENT.createElement("div"),
            arrow = DOCUMENT.createElement("span"),
            key,
            biggestText,
            minLabelWidth,
            maxLabelWidth,
            borderTopWidth,
            borderBottomWidth,
            borderRightWidth;
        for(key in labelStyles) {
            if(labelStyles.hasOwnProperty(key)) {
                minLabel.style[key] = labelStyles[key];
                maxLabel.style[key] = labelStyles[key];
            }
        }
        if(arrowStyles) {
            for(key in arrowStyles) {
                if(arrowStyles.hasOwnProperty(key)) {
                    arrow.style[key] = arrowStyles[key];
                }
            }
        }

        minLabel.appendChild(DOCUMENT.createTextNode(minText));
        maxLabel.appendChild(DOCUMENT.createTextNode(maxText));

        this._contentBox.appendChild(container);
        container.style.position = "absolute";
        container.appendChild(maxLabel);
        container.appendChild(minLabel);
        maxLabelWidth = parseFloat(maxLabel.offsetWidth);
        minLabelWidth = parseFloat(minLabel.offsetWidth);
        height = Math.max(parseFloat(maxLabel.offsetHeight), parseFloat(minLabel.offsetHeight));
        if(maxLabelWidth >= minLabelWidth ) {
            axis._removeChildren(minLabel);
            Y.Event.purgeElement(minLabel, true);
            minLabel.parentNode.removeChild(minLabel);
            width = maxLabelWidth;
            biggestText = maxText;
        } else {
            axis._removeChildren(maxLabel);
            Y.Event.purgeElement(maxLabel, true);
            maxLabel.parentNode.removeChild(maxLabel);
            width = minLabelWidth;
            biggestText = minText;
        }
        width = Math.max(parseFloat(maxLabel.offsetWidth), parseFloat(minLabel.offsetWidth));
        borderRightWidth = (height/13 * 7) + "px";
        borderTopWidth = parseFloat(borderRightWidth) + "px";
        borderBottomWidth = borderTopWidth;

        arrow.style.borderRightWidth = borderRightWidth;
        arrow.style.borderTopWidth = borderTopWidth;
        arrow.style.borderBottomWidth = borderBottomWidth;

        container.appendChild(arrow);
        arrowWidth = parseFloat(arrow.offsetWidth);
        width = width + arrowWidth;
        axis._removeChildren(container);
        Y.Event.purgeElement(container, true);
        container.parentNode.removeChild(container);

        return {
            width: width,
            height: height,
            arrow: {
                borderRightWidth: borderRightWidth,
                borderBottomWidth: borderBottomWidth,
                borderTopWidth: borderTopWidth,
                width: arrowWidth
            },
            biggestText: biggestText
        };
    },

    /**
     * Creates a label for the previousClose, adds it to the dom. The method receives
     * an object with necessary information for rendering the label and returns that
     * object with a `node` property referencing the create dom element.
     *
     * @method _getPreviousClose
     * @param {Object} previousClose Object containing the dataValue, background, and optionally
     * coordinate for the label.
     * @return Object.
     * @private
     */
    _getPreviousClose: function(previousClose) {
        var className = "stockIndicatorsPreviousClose",
            axis = this._axis,
            styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            previousCloseStyles = previousCloseStyles,
            background = previousClose.background,
            value = previousClose.value,
            container = DOCUMENT.createElement("div"),
            arrow = DOCUMENT.createElement("span"),
            label = DOCUMENT.createElement("span"),
            key,
            text = this._labelFunction(value, this._labelFormat),
            ycoord = previousClose.ycoord ||
                axis._getCoordFromValue(this._minimum, this._maximum, this.height, value, this.height, true);
        ycoord = ycoord + this._y;
        label.id = previousClose.id || className;
        if(previousClose.className) {
            className = className + " " + previousClose.className;
        }
        label.className = className;
        if(labelStyles) {
            for(key in labelStyles) {
                if(labelStyles.hasOwnProperty(key)) {
                    label.style[key] = labelStyles[key];
                }
            }
        }
        if(arrowStyles) {
            for(key in arrowStyles) {
                if(arrowStyles.hasOwnProperty(key)) {
                    arrow.style[key] = arrowStyles[key];
                }
            }
        }
        if(background) {
            label.style.background = background;
            arrow.style.borderRightColor = background;
        }
        container.style.position = "absolute";
        label.appendChild(DOCUMENT.createTextNode(text));
        this._contentBox.appendChild(container);
        container.appendChild(arrow);
        container.appendChild(label);
        container.style.left = (this._contentWidth - this.itemWidth) + "px";
        container.style.top = (ycoord - this.itemHeight/2) + "px";
        previousClose.node = container;
        previousClose.textNode = label;
        this._labels.push(container);
        return previousClose;
    },

    /**
     * Takes an object representing and containing properties of the interactive label,
     * creates the dom nodes used, appends them to the object and returns the updated object.
     *
     * @method _getInteractiveItem
     * @param {Object} interactiveItem Object containing propertis for the item.
     * @return Object
     */
    _getInteractiveItem: function(interactiveItem) {
        var className = "stockIndicatorsInteractiveItem",
            styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            interactiveItemStyles = interactiveItemStyles,
            background = interactiveItem.background,
            container = DOCUMENT.createElement("div"),
            arrow = DOCUMENT.createElement("span"),
            label = DOCUMENT.createElement("span"),
            key;
        label.id = interactiveItem.id || className;
        if(interactiveItem.className) {
            className = className + " " + interactiveItem.className;
        }
        label.className = className;
        if(labelStyles) {
            for(key in labelStyles) {
                if(labelStyles.hasOwnProperty(key)) {
                    label.style[key] = labelStyles[key];
                }
            }
        }
        if(arrowStyles) {
            for(key in arrowStyles) {
                if(arrowStyles.hasOwnProperty(key)) {
                    arrow.style[key] = arrowStyles[key];
                }
            }
        }
        if(background) {
            label.style.background = background;
            arrow.style.borderRightColor = background;
        }
        container.style.position = "absolute";
        this._contentBox.appendChild(container);
        container.appendChild(arrow);
        container.style.left = (this._contentWidth - this.itemWidth) + "px";
        container.style.top = (0 - this.itemHeight/2) + "px";
        container.appendChild(label);
        container.style.visibility = "hidden";
        interactiveItem.node = container;
        interactiveItem.label = label;
        this._labels.push(container);
        return interactiveItem;
    },

    /**
     * Creates dom nodes for each specified item. The method accepts an object containing key value
     * pairs in which the key represents the data key of the item and the value is an object containing
     * necessary infortion for the label. The created dom nodes are attached to their respective value
     * objects and returned.
     *
     * @method _initializeIndicatorItems
     * @param {Object} indicatorItems The key value pairs to be used for creating necessary elements.
     * @return Object
     * @private
     */
    _initializeIndicatorItems: function(indicatorItems) {
        var className = "stockIndicatorsIndicatorLabel",
            styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            axis = this._axis,
            key,
            stylesKey,
            item,
            container,
            arrow,
            label,
            background,
            dataProvider = this._dataProvider,
            lastIndex,
            value,
            ycoord,
            text,
            contentBox = this._contentBox._node;
        for(key in indicatorItems) {
            if(indicatorItems.hasOwnProperty(key)) {
                lastIndex = dataProvider.length - 1;
                while(!Y.Lang.isNumber(dataProvider[lastIndex][key])) {
                    lastIndex = lastIndex - 1;
                }
                value = dataProvider[lastIndex][key];
                item = indicatorItems[key];
                container = DOCUMENT.createElement("div");
                arrow = DOCUMENT.createElement("span");
                label = DOCUMENT.createElement("span");
                label.id = item.id || className + "_" + key;
                label.className = item.className ? className + " " + item.className : className;
                background = item.background;
                if(labelStyles) {
                    for(stylesKey in labelStyles) {
                        if(labelStyles.hasOwnProperty(stylesKey)) {
                            label.style[stylesKey] = labelStyles[stylesKey];
                        }
                    }
                }
                if(arrowStyles) {
                    for(stylesKey in arrowStyles) {
                        if(arrowStyles.hasOwnProperty(stylesKey)) {
                            arrow.style[stylesKey] = arrowStyles[stylesKey];
                        }
                    }
                }
                if(background) {
                    if(Y.Lang.isArray(background)) {
                        if(key === "close" && item.range === "1d") {
                            background = value < this._previousClose.value && background.length > 1  ? background[1] : background[0];
                        } else {
                            background = background[0];
                        }
                    }
                    label.style.background = background;
                    arrow.style.borderRightColor = background;
                }
                text = this._labelFunction(value, this._labelFormat),
                ycoord = this._y + axis._getCoordFromValue(this._minimum, this._maximum, this.height, value, this.height, true);
                label.appendChild(DOCUMENT.createTextNode(text));
                container.style.position = "absolute";
                container.style.left = (this._contentWidth - this.itemWidth) + "px";
                container.style.top = (ycoord - this.itemHeight/2) + "px";
                contentBox.appendChild(container);
                container.appendChild(arrow);
                container.appendChild(label);
                this._labels.push(container);
                item.node = container;
                item.label = label;
                this._labels.push(container);
            }
        }
        return indicatorItems;
    },

    /**
     * Updates the interactive items based on events.
     *
     * @method update
     * @param {Object} props Properties from the event payload.
     * @param {Boolean} redraw Indicates whether to update the dom now or on
     * the next frame.
     */
    update: function(props) {
        var item = this._interactiveItem;
        this._dataItem = props.dataProvider[props.dataIndex];
        if(this._dataItem) {
            item.value = this._dataItem[item.key];
            item.ycoord = this._y + this._axis._getCoordFromValue(
                this._minimum,
                this._maximum,
                this.height,
                item.value,
                this.height,
                true
            );
        }
        if(!isNaN(item.value)) {
            item.node.style.visibility = "visible";
            item.label.innerHTML = Y.Escape.html(this._labelFunction(item.value, this._labelFormat));
            if(DOCUMENT.createElementNS) {
                Y.DOM.setStyle(
                    item.node,
                    "transform",
                    "translateY(" + item.ycoord + "px)"
                );
            } else {
                item.node.style.top = (item.ycoord - this.itemHeight/2) + "px";
            }
        } else {
            item.node.style.visibility = "hidden";
        }
    },

    /**
     * Update all dom elements
     *
     * @method redraw
     */
    redraw: function() {
        //just a placeholder
    },

    /**
     * Gets the default value used for building the `_styles` property.
     *
     * @method _getDefaultStyles
     * @return Object
     * @private
     */
    _getDefaultStyles: function() {
        return {
            arrow: {
                borderTopColor: "transparent",
                display: "inline-block",
                borderBottomColor: "transparent",
                borderTopStyle: "solid",
                borderRightStyle: "solid",
                borderBottomStyle: "solid",
                height: "0px",
                width: "0px"
            },
            previousClose: {
                color: "#eee"
            },
            label: {
                display: "inline-block",
                whiteSpace: "nowrap",
                position: "absolute",
                backgroundColor: "#9aa",
                color: "#fff",
                fontFamily: "Helvetica Neue, Helvetica, Arial",
                fontWeight: "bold",
                fontSize: "10pt",
                paddingLeft: "3pt",
                paddingRight: "3pt",
                borderTopRightRadius: "10% 10%",
                borderBottomRightRadius: "10% 10%"
            }
        };
    },

    /**
     * Removes all elements of the legend.
     *
     * @method destroy
     */
    destroy: function() {
        var labels = this._labels,
            label;
        while(labels && labels.length > 0) {
            label = labels.pop();
            this._axis._removeChildren(label);
            Y.Event.purgeElement(label, true);
            if(label.parentNode) {
                label.parentNode.removeChild(label);
            }
        }
    }
};
/**
 * Provides functionality for a legend.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Displays a legend for a corresponding chart
 * application.
 *
 * @class StockIndicatorsCanvasAxisLegend
 * @extends StockIndicatorsLegend
 * @constructor
 */
Y.StockIndicatorsCanvasAxisLegend = function() {
    this.initializer.apply(this,arguments);
};

Y.extend(Y.StockIndicatorsCanvasAxisLegend, Y.StockIndicatorsAxisLegend, {
    /**
     * Creates the indicator items for legend.
     *
     * @method _createIndicators
     * @param {Object} cfg The configuration object
     * @private
     */
    _createIndicators: function(cfg) {
        var previousClose = cfg.previousClose,
            indicatorItems = cfg.indicatorItems,
            interactiveItem = cfg.interactiveItem,
            styles = this._styles,
            labelStyles = styles.label,
            canvas  = DOCUMENT.createElement("canvas");
        canvas.width = this._contentWidth;
        canvas.height = this._contentHeight;
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        canvas.style.position = "absolute";
        this._context = canvas.getContext("2d");
        this._contentBox.appendChild(canvas);
        this._canvas = canvas;
        this._context.font = labelStyles.fontSize + " " + labelStyles.fontFamily.toString() + " " + labelStyles.fontWeight;
        this._maxTextMetrics = this._context.measureText(this._biggestText);
        if(previousClose) {
            this._previousClose = this._getPreviousClose(previousClose);
        }
        if(indicatorItems) {
            this._indicatorItems = this._initializeIndicatorItems(indicatorItems);
        }
        if(interactiveItem) {
            this._interactiveItem = this._getInteractiveItem(interactiveItem);
        }
    },

    /**
     * Creates a label for the previousClose, adds it to the dom. The method receives
     * an object with necessary information for rendering the label and returns that
     * object with a `node` property referencing the create dom element.
     *
     * @method _getPreviousClose
     * @param {Object} previousClose Object containing the dataValue, background, and optionally
     * coordinate for the label.
     * @return Object.
     * @private
     */
    _getPreviousClose: function(previousClose) {
        var styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            previousCloseStyles = previousCloseStyles,
            background = previousClose.background,
            value = previousClose.value,
            arrowWidth = arrowStyles.width;
        this._drawIndicator(this._context, value, labelStyles, arrowWidth, background);
        return previousClose;
    },

    /**
     * Takes an object representing and containing properties of the interactive label,
     * creates the dom nodes used, appends them to the object and returns the updated object.
     *
     * @method _getInteractiveItem
     * @param {Object} interactiveItem Object containing propertis for the item.
     * @return Object
     */
    _getInteractiveItem: function(interactiveItem) {
        var canvas = DOCUMENT.createElement("canvas");
        canvas.width = this._contentWidth;
        canvas.height = this.height;
        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        this._interactiveContext = canvas.getContext("2d");
        this._contentBox.appendChild(canvas);
        this._interactiveCanvas = canvas;
        interactiveItem.canvas = canvas;
        return interactiveItem;
    },

    /**
     * Creates dom nodes for each specified item. The method accepts an object containing key value
     * pairs in which the key represents the data key of the item and the value is an object containing
     * necessary infortion for the label. The created dom nodes are attached to their respective value
     * objects and returned.
     *
     * @method _initializeIndicatorItems
     * @param {Object} indicatorItems The key value pairs to be used for creating necessary elements.
     * @return Object
     * @private
     */
    _initializeIndicatorItems: function(indicatorItems) {
        var styles = this._styles,
            labelStyles = styles.label,
            arrowStyles = styles.arrow,
            key,
            item,
            background,
            dataProvider = this._dataProvider,
            lastIndex,
            value,
            arrowWidth = arrowStyles.width;
        for(key in indicatorItems) {
            if(indicatorItems.hasOwnProperty(key)) {
                lastIndex = dataProvider.length - 1;
                while(!Y.Lang.isNumber(dataProvider[lastIndex][key])) {
                    lastIndex = lastIndex - 1;
                }
                value = dataProvider[lastIndex][key];
                item = indicatorItems[key];
                background = item.background;
                if(background) {
                    if(Y.Lang.isArray(background)) {
                        if(key === "close" && item.range === "1d") {
                            background = value < this._previousClose.value && background.length > 1  ? background[1] : background[0];
                        } else {
                            background = background[0];
                        }
                    }
                }
                this._drawIndicator(this._context, value, labelStyles, arrowWidth, background);
            }
        }
        return indicatorItems;
    },

    /**
     * Draws an indicator arrow.
     *
     * @method _drawIndicator
     * @param {2dContext} context The context in which to draw the indicator.
     * @param {Number} value The value to which the inicator corresponds.
     * @param {Object} labelStyles Style properties for the text.
     * @param {Object} background Color of the background.
     * @private
     */
    _drawIndicator: function(context, value, labelStyles, arrowWidth, background) {
        var axis = this._axis,
            text = this._labelFunction.apply(this, [value, this._labelFormat]),
            ycoord = this._y + axis._getCoordFromValue(this._minimum, this._maximum, this.height, value, this.height, true),
            textMetrics,
            itemWidth,
            x = this._contentWidth - this.itemWidth,
            y = ycoord - this.itemHeight/2,
            boxLeft = x + arrowWidth,
            boxRight,
            boxBottom = y + this.itemHeight,
            ellipseWidth,
            ellipseHeight = this.itemHeight/10;
        context.font = labelStyles.fontSize + " " + labelStyles.fontFamily.toString() + " " + labelStyles.fontWeight;
        textMetrics = context.measureText(text);
        itemWidth = this.itemWidth - arrowWidth - (this._maxTextMetrics.width - textMetrics.width);
        boxRight = boxLeft + itemWidth;
        ellipseWidth = itemWidth/10;
        context.beginPath();
        context.fillStyle = background;
        context.moveTo(boxLeft, y);
        context.lineTo(x, y + this.itemHeight/2);
        context.lineTo(boxLeft, boxBottom);
        context.lineTo(boxRight - ellipseWidth, boxBottom);
        context.quadraticCurveTo(boxRight, boxBottom, boxRight, boxBottom - ellipseHeight);
        context.lineTo(boxRight, y + ellipseHeight);
        context.quadraticCurveTo(boxRight, y, boxRight - ellipseWidth, y);
        context.lineTo(boxLeft, y);
        context.closePath();
        context.fill();
        context.fillStyle = labelStyles.color;
        context.font = labelStyles.fontSize + " " + labelStyles.fontFamily.toString() + " " + labelStyles.fontWeight;
        textMetrics = this._context.measureText(text);
        context.fillText(text, x + arrowWidth + (itemWidth/2 - textMetrics.width/2), y + (this.itemHeight * 3/4));
    },

    /**
     * Updates the interactive items based on events.
     *
     * @method update
     * @param {Boolean} redraw Indicates whether to update the dom now or on
     * the next frame.
     */
    update: function(props) {
        var item = this._interactiveItem,
            styles = this._styles,
            labelStyles = styles.label,
            arrowWidth = styles.arrow.width;
        this._dataItem = props.dataProvider[props.dataIndex];
        if(this._dataItem) {
            item.value = this._dataItem[item.key];
        }
        if(!isNaN(item.value)) {
            this._interactiveContext.clearRect(0, 0, this._contentWidth, this.height);
            this._drawIndicator(this._interactiveContext, item.value, labelStyles, arrowWidth, item.background);
        }
    },

    /**
     * Removes all elements of the legend.
     *
     * @method destroy
     */
    destroy: function() {
        var parentNode,
            canvas = this._canvas,
            context = this._context;
        if(context) {
            context.clearRect(0, 0, this._contentWidth, this._contentHeight);
        }
        if(canvas) {
            Y.Event.purgeElement(canvas, true);
            parentNode = canvas.parentNode;
            parentNode.removeChild(canvas);
        }
        canvas = this._interactiveCanvas;
        context = this._interactiveContext;
        if(context) {
            context.clearRect(0, 0, this._contentWidth, this._contentHeight);
        }
        if(canvas) {
            Y.Event.purgeElement(canvas, true);
            parentNode = canvas.parentNode;
            parentNode.removeChild(canvas);
        }
    }
});
Y.StockIndicatorsPrinter = function() {
    this._init.apply(this, arguments);
};

Y.StockIndicatorsPrinter.NAME = "stockIndicatorsPrinter";

Y.StockIndicatorsPrinter.prototype = {
   /**
    * Look up table for axis classes.
    *
    * @property _axesClassMap
    * @type Object
    * @private
    */
    _axesClassMap: {
        numeric: Y.NumericCanvasAxis,
        category: Y.CategoryCanvasAxis,
        intraday: Y.IntradayCanvasAxis
    },

    /**
     * Look up table for graph classes.
     *
     * @property _graphClassMap
     * @type Object
     * @private
     */
    _graphClassMap: {
        thresholdline: Y.ThresholdCanvasLineSeries,
        multipleline: Y.MultipleLineCanvasSeries,
        volumecolumn: Y.VolumeColumnCanvas,
        candlestick: Y.CanvasCandlestickSeries,
        ohlc: Y.CanvasOHLCSeries,
        line: Y.CanvasLineSeries,
        area: Y.CanvasAreaSeries,
        combo: Y.CanvasComboSeries,
        marker: Y.CanvasMarkerSeries,
        column: Y.CanvasColumnSeries
    },

    /**
     * Sets up properties.
     *
     * @method _init
     * @private
     */
    _init: function(charts, width, height) {
        this._width = width,
        this._height = height,
        this._charts = charts;
    },

    /**
     * Builds canvas based chart components, renders them into a canvas and generates a data uri for an
     * image representation of the chart.
     *
     * @method getDataURI
     * @return String
     */
    getDataURI: function() {
        var canvas = this.getChartCanvas();
        return canvas.toDataURL();
    },

    /**
     * Builds canvas based chart components and renders them into a canvas.
     *
     * @method getChartCanvas
     * @return Canvas
     */
    getChartCanvas: function() {
        var charts = this._charts,
            chart,
            i,
            len = charts.length,
            canvas = DOCUMENT.createElement("canvas"),
            context = canvas.getContext("2d"),
            gridlinesConfigs = [],
            axesConfigs = [],
            graphConfigs = [],
            graphDimensions = [],
            legendConfigs = [],
            axes,
            gridlines,
            legends,
            graphs;

        canvas.width = this._width;
        canvas.height = this._height;
        for(i = 0; i < len; i = i + 1) {
            chart = charts[i];
            gridlinesConfigs.push(chart.gridlinesConfig);
            axesConfigs.push(chart.axesConfig);
            graphConfigs.push(chart.seriesCollection);
            legendConfigs.push(chart.legendConfig);
            graphDimensions.push({
                x: chart.graphX,
                y: chart.graphY,
                width: chart.graphWidth,
                height: chart.graphHeight
            });
        }

        axes = this._getAxes(axesConfigs);
        gridlines = this._getGridlines(gridlinesConfigs, axes);
        legends = this._getLegends(legendConfigs);
        graphs = this._getGraphs(graphConfigs, graphDimensions);
        canvas = this._printItems(axes, gridlines, legends, graphs, canvas, context, len);
        this._destroyItems(axes, gridlines, legends, graphs);
        return canvas;
    },

    /**
     * Draws canvas instances into a master canvas for use in generating a dataURI.
     *
     * @method _printItems
     * @param {Array} axes An array of object, each of which contain a numeric and date  axis instance.
     * @param {Gridlines} gridlines An array of objects, each of which contain a horizontal and vertical canvas
     * based gridlines instance.
     * @param {Array} legends An array containing a legend for each chart instance.
     * @param {Array} graphs An array containing arrays of graphs for each chart instance.
     * @param {Canvas} canvas A canvas instance in which the other canvases will be added to.
     * @param {2dContext} context The 2d context for the canvas instance.
     * @param {Number} len The number of charts in the application.
     * @return Canvas
     * @private
     */
    _printItems: function(axes,  gridlines, legends, graphs, canvas, context, len) {
        var i,
            j,
            pathLen,
            axis,
            dateAxis,
            numericAxis,
            gridline,
            legend,
            graph,
            x,
            y,
            width,
            height,
            horizontalGridlines,
            verticalGridlines;
        for(i = 0; i < len; i = i + 1) {
            axis = axes[i];
            gridline = gridlines[i];
            legend = legends[i];
            dateAxis = axis.date;
            numericAxis = axis.numeric;
            if(gridline) {
                horizontalGridlines = gridline.horizontal;
                verticalGridlines = gridline.vertical;
                if(horizontalGridlines) {
                    context.drawImage(horizontalGridlines._path.canvas, horizontalGridlines.get("x"), horizontalGridlines.get("y"));
                }
                if(verticalGridlines) {
                    context.drawImage(verticalGridlines._path.canvas, verticalGridlines.get("x"), horizontalGridlines.get("y"));
                }
            }
            if(axis) {
                if(dateAxis) {
                    context.drawImage(dateAxis._path, dateAxis.get("x") - dateAxis._xOffset, dateAxis.get("y") - dateAxis._yOffset);
                }
                if(numericAxis) {
                    context.drawImage(numericAxis._path, numericAxis.get("x") - numericAxis._xOffset, numericAxis.get("y") - numericAxis._yOffset);
                }
            }
            if(legend) {
                context.drawImage(legend._canvas, 0, 0);
            }
        }
        len = graphs.length;
        for(i = 0; i < len; i = i + 1) {
            graph = graphs[i];
            if(graph) {
                x = graph.get("x");
                y = graph.get("y");
                if(graph._paths) {
                    pathLen = graph._paths.length;
                    width = graph.get("width");
                    height = graph.get("height");
                    for(j = 0; j < pathLen; j = j + 1) {
                        context.drawImage(graph._paths[j].canvas, x, y, width, height);
                    }
                }
            }
        }
        return canvas;
    },

    /**
     * Destroys items used in printing image.
     *
     * @method _destroyItems
     * @param {Array} An array of objects container references to axis instances.
     * @param {Array} An array of objects containing references to gridlines instances.
     * @param {Array} An array of legend instances.
     * @param {Array} An array of graph instances.
     * @private
     */
    _destroyItems: function(axes, gridlines, legends, graphs) {
        var i,
            len = axes.length,
            gridline,
            horizontalGridlines,
            verticalGridlines,
            axis,
            dateAxis,
            numericAxis,
            graph,
            legend;
        for(i = 0; i < len; i = i + 1) {
            axis = axes[i];
            numericAxis = axis.numeric;
            dateAxis = axis.date;
            if(numericAxis) {
                numericAxis.destroy();
            }
            if(dateAxis) {
                dateAxis.destroy();
            }
        }
        len = gridlines.length;
        for(i = 0; i < len; i = i + 1) {
            gridline = gridlines[i];
            horizontalGridlines = gridline.horizontal;
            verticalGridlines = gridline.vertical;
            if(horizontalGridlines) {
                horizontalGridlines.remove();
            }
            if(verticalGridlines) {
                verticalGridlines.remove();
            }
        }
        len = graphs.length;
        for(i = 0; i < len; i = i + 1) {
            graph = graphs[i];
            if(graph) {
                graph.destroy();
            }
        }
        len = legends.length;
        for(i = 0; i < len; i = i + 1) {
            legend = legends[i];
            if(legend) {
                legend.destroy();
            }
        }
    },

    /**
     * Returns an array of canvas based axes to for use in image conversion.
     *
     * @method _getAxes
     * @param {Array} configs An array of configuration properties for the axes.
     * @return Array
     * @private
     */
    _getAxes: function(configs) {
        var i,
            len = configs.length,
            axes = [],
            dateAxis,
            numericAxis,
            config,
            AxisClass;
        for(i = 0; i < len; i = i + 1) {
            config = configs[i];
            AxisClass = this._axesClassMap[config.date.type];
            dateAxis = new AxisClass(config.date);
            dateAxis._drawAxis();
            AxisClass = this._axesClassMap[config.numeric.type];
            numericAxis = new AxisClass(config.numeric);
            numericAxis._drawAxis();
            axes.push({
                date: dateAxis,
                numeric: numericAxis
            });
        }
        return axes;
    },

    /**
     * Returns an array of canvas based gridline for use in image conversion.
     *
     * @method _getGridlines
     * @param {Array} configs An array of configuration properties for the gridlines.
     * @param {Array} axes An array of axis instances.
     * @return Array
     * @private
     */
    _getGridlines: function(configs, axes) {
        var horizontalConfig,
            verticalConfig,
            horizontalGridlines,
            verticalGridlines,
            config,
            i,
            width,
            height,
            len = configs.length,
            gridlines = [];
        for(i = 0; i < len; i = i + 1) {
            config = configs[i];
            horizontalConfig = config.horizontal;
            verticalConfig = config.vertical;
            horizontalConfig.axis = axes[i].numeric;
            verticalConfig.axis = axes[i].date;
            horizontalGridlines = new Y.GridlinesCanvas(horizontalConfig);
            width = horizontalConfig.width;
            height = horizontalConfig.height;
            horizontalGridlines.draw(width, height);
            verticalGridlines = new Y.GridlinesCanvas(verticalConfig);
            width = verticalConfig.width;
            height = verticalConfig.height;
            verticalGridlines.draw(width, height);
            gridlines.push({
                horizontal: horizontalGridlines,
                vertical: verticalGridlines
            });
        }
        return gridlines;
    },

    /**
     * Returns an array of canvas based legends for use in image conversion.
     *
     * @method _getLegends
     * @param {Array} configs An array of legend config objects.
     * @return Array
     * @private
     */
    _getLegends: function(configs) {
        var legend,
            legends = [],
            i,
            len = configs.length,
            config;
        for(i = 0; i < len; i = i + 1) {
            config = configs[i];
            if(config.type === "axis") {
                legend = new Y.StockIndicatorsCanvasAxisLegend(config);
                legends.push(legend);
            }
        }
        return legends;
    },

    /**
     * Returns and a array of canvas based graphs for use in image conversion.
     *
     * @method _getGraphs
     * @param {Array} configs An array of graph config objects.
     * @param {Array} dimensions An array containing the graph x, y, width and height for each chart.
     * @return Array
     * @private
     */
    _getGraphs: function(configs, dimensions) {
        var i,
            j,
            seriesLen,
            series,
            len = configs.length,
            config,
            graph,
            dimension,
            GraphClass,
            graphs = [];
        for(i = 0; i < len; i = i + 1) {
            series = configs[i];
            seriesLen = series.length;
            for(j = 0; j < seriesLen; j = j + 1) {
                config = series[j];
                dimension = dimensions[i];
                config.x = dimension.x;
                config.y = dimension.y;
                config.width = dimension.width;
                config.height = dimension.height;
                GraphClass = this._graphClassMap[config.type];
                if(GraphClass) {
                    config.graphic = Y.Node.create('<div>');
                    graph = new GraphClass(config);
                    graph.set("width", config.width);
                    graph.set("height", config.height);
                    graph.draw();
                    graphs.push(graph);
                }
            }
        }
        return graphs;
    }
};

/**
 * StockIndicatorsChart is an application that generates a chart or charts based on a key indexed array of data and an
 * array of charts configuration data.
 *
 * @class StockIndicatorsChart
 * @constructor
 * @extends Widget
 * @uses Renderer
 * @param {Object} config An object literal contain properties defined in the <a href="#attr_charts">charts</a> attribute.
 */
Y.StockIndicatorsChart = Y.Base.create("stockIndicatorsChart",  Y.Widget, [Y.Renderer],  {
    /**
     * @method initializer
     * @private
     */
    initializer: function() {
        var cb = this.get("contentBox");
        cb._node.style.position = "relative";
        this._axes = [];
        this._graphs = [];
        this._graphics = [];
        this._crosshairs = [];
        this._hotspots = [];
        this._legends = [];
        this._runTimeline = false;
        this._onEnterFrame = WINDOW.requestAnimationFrame ||
                            WINDOW.mozRequestAnimationFrame ||
                            WINDOW.webkitRequestAnimationFrame ||
                            WINDOW.msRequestAnimationFrame;
        this._autoDraw = this._onEnterFrame ? false : true;
    },

    /**
     * @method bindUI
     * @private
     */
    bindUI: function() {
        this._addEvents();
    },

    /**
     * Adds event listeners.
     *
     * @method _addEvents
     * @private
     */
    _addEvents: function() {
        var isTouch = ((WINDOW && ("ontouchstart" in WINDOW)) && !(Y.UA.chrome && Y.UA.chrome < 6)),
            className = ".yui3-hotspot";

            if(isTouch) {
                this._startHandle = Y.on('touchstart', Y.bind(this._eventDispatcher, this), className);
                this._moveHandle = Y.on('touchmove', Y.bind(this._eventDispatcher, this), className);
                this._endHandle = Y.on('touchend', Y.bind(this._eventDispatcher, this), className);
            } else {
                this._startHandle = Y.on('mouseenter', Y.bind(this._eventDispatcher, this), className);
                this._moveHandle = Y.on('mousemove', Y.bind(this._eventDispatcher, this), className);
                this._endHandle = Y.on('mouseleave', Y.bind(this._eventDispatcher, this), className);
            }
    },

    /**
     * Draws a charts based on a config object.
     *
     * @method drawCharts
     * @param {Array} An array of configuration objects for the charts.
     */
    drawCharts: function() {
        var charts = [],
            configs = this.get("charts"),
            cb = this.get("contentBox"),
            i,
            len = configs.length,
            canvas = DOCUMENT.createElement("canvas");
        this._removeAll();
        for(i = 0; i < len; i = i + 1) {
            charts[i] = this.drawChart(configs[i], cb);
        }
        this._charts = charts;
        this._addEvents();
        if(canvas && canvas.getContext("2d")) {
            this._printStockIndicators = new Y.StockIndicatorsPrinter(charts, this.get("width"), this.get("height"));
        }
    },

    /**
     * Returns a data uri for an image of the chart.
     *
     * @method getDataURI
     * @return String
     */
    getDataURI: function() {
        var uri;
        if(this._printStockIndicators) {
            uri = this._printStockIndicators.getDataURI();
        }
        return uri;
    },

    /**
     * Returns a Canvas with the chart drawn into it.
     *
     * @method getChartCanvas
     * @return Canvas
     */
    getChartCanvas: function() {
        var canvas;
        if(this._printStockIndicators) {
            canvas = this._printStockIndicators.getChartCanvas();
        }
        return canvas;
    },

    /**
     * Event handler for mouse and touch events.
     *
     * @method _eventDispatcher
     * @param {Object} e Event object.
     * @private
     */
    _eventDispatcher: function(e) {
        var type = e.type,
            isTouch = e && e.hasOwnProperty("changedTouches"),
            pageX = isTouch ? e.changedTouches[0].pageX : e.pageX,
            pageY = isTouch ? e.changedTouches[0].pageY : e.pageY;
        if(type === "mouseenter" || type === "touchstart") {
            this.startTimeline();
        } else if(type === "mouseleave" || type === "touchend") {
            this.stopTimeline();
        }
        e.halt();
        /**
         * Broadcasts when the application has received a mouseenter event.
         *
         * @event chartEvent:mouseenter
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when the application has received a mousemove event.
         *
         * @event chartEvent:mousemove
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when the application has received a mouseleave event.
         *
         * @event chartEvent:mouseleave
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when the application has received a touchstart event.
         *
         * @event chartEvent:touchstart
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when the application has received a touchmove event.
         *
         * @event chartEvent:touchmove
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        /**
         * Broadcasts when the application has received a touchend event.
         *
         * @event chartEvent:touchend
         * @preventable false
         * @param {EventFacade} e Event facade with the following properties:
         *  <dl>
         *      <dt>originEvent</dt><dd>The underlying event payload.</dd>
         *      <dt>pageX</dt><dd>The x location of the event on the page (including scroll)</dd>
         *      <dt>pageY</dt><dd>The y location of the event on the page (including scroll)</dd>
         *      <dt>isTouch</dt><dd>Indicates whether the event is a touch event.</dd>
         *  </dl>
         */
        this.fire("chartEvent:" + type, {
            originEvent: e,
            pageX:pageX,
            pageY:pageY,
            isTouch: isTouch
        });
    },

    /**
     * Updates the position of the crosshair based on the event payload.
     *
     * @method updatesLegendsCrosshair
     * @param {Object} e Event payload
     */
    updatesLegendsCrosshair: function(e) {
        var charts = this._charts,
            crosshair,
            legend,
            len = charts.length,
            pageX = e.pageX,
            pageY = e.pageY,
            chart,
            dataProvider = this._dataProvider,
            dataIndex,
            xy,
            x,
            i;
        if(pageX % 1 === 0 && pageY % 1 === 0 && this.curX !== pageX) {
            for(i = 0; i < len; i = i + 1) {
                chart = charts[i];
                xy = chart.xy,
                x = pageX - xy[0],
                dataIndex = Math.floor(x / chart.graphWidth * dataProvider.length);
                crosshair = chart.crosshair;
                legend = chart.legend;
                if(crosshair) {
                    crosshair.setTarget(pageX, this._autoDraw);
                }
                if(legend) {
                    legend.update({
                        dataProvider: dataProvider,
                        dataIndex: dataIndex,
                        pageX: pageX,
                        pageY: pageY
                    }, this._autoDraw);
                }
            }
        }
        this.curX = pageX;
    },

    /**
     * Starts a timeline used to manage redraws based on requestAnimationFrame.
     *
     * @method startTimeline
     */
    startTimeline: function() {
        if(!this._runTimeline) {
            this._runTimeline = true;
            this._timelineStart = +new Date() - 17;
            this.redraw();
        }
    },

    /**
     * Ends a timeline.
     *
     * @method stopTimeline
     */
    stopTimeline: function() {
        var args,
            timelineId = this._timelineId;
        this._runTimeline = false;
        if(timelineId) {
            args = [timelineId];
            this._timelineId = null;
        }
    },

    /**
     * Draws chart elements based on the timeline.
     *
     * @method redraw
     */
    redraw: function() {
        var scope = this,
            crosshair,
            legend,
            charts = this._charts,
            chart,
            i,
            len = charts.length,
            endTime = +new Date();
        if(endTime >= this._timelineStart + 17) {
            for(i = 0; i < len; i = i + 1) {
                chart = charts[i];
                crosshair = chart.crosshair;
                legend = chart.legend;
                if(crosshair) {
                    crosshair.redraw();
                }
                if(legend) {
                    legend.redraw();
                }
            }
            this._timelineStart = +new Date();
        }
        if(this._runTimeline && !this._autoDraw) {
            this._timelineId = this._onEnterFrame.apply(WINDOW, [function() {
                scope.redraw();
            }]);
        }
    },

    /**
     * Maps string values to a graph class.
     *
     * @property _graphMap
     * @type Object
     * @private
     */
    _graphMap: {
        ohlc: Y.OHLCSeries,
        area: Y.AreaSeries,
        line: Y.LineSeries,
        combo: Y.ComboSeries,
        marker: Y.MarkerSeries,
        column: Y.ColumnSeries,
        candlestick: Y.CandlestickSeries,
        multipleline: Y.MultipleLineSeries,
        volumecolumn: Y.VolumeColumn,
        thresholdline: Y.ThresholdLineSeries
    },

    /**
     * Returns the correct graph class based on a value. If a class is passed,
     * it will be returned. If a string is passed, the appropriate class
     * will be returned.
     *
     * @method _getGraph
     * @param {Object} Graph type needed.
     * @return SeriesBase
     * @private
     */
    _getGraph: function(type) {
        return this._graphMap[type];
    },

    /**
     * Creates an array of series configuration arguments for each graph in a chart.
     *
     * @method _getSeriesCollection
     * @param {Object} config The chart configuration object.
     * @return Array
     * @private
     */
    _getSeriesCollection: function(config) {
        var seriesCollection = [],
            seriesConfig,
            indicator,
            indicators = config.indicators,
            indicatorType,
            indIter,
            indLen = indicators.length,
            valueIter,
            valueLen,
            valueKey,
            groupMarkers,
            nomarkers = {
                "candlestick": true,
                "line": true,
                "ohlc": true,
                "volumecolumn": true,
                "multipleline": true
            };
        for(indIter = 0; indIter < indLen; indIter = indIter + 1) {
            indicator = indicators[indIter];
            valueKey = indicator.valueKey;
            indicatorType = indicator.type;
            if(indicatorType === "candlestick" || indicatorType === "ohlc" || typeof valueKey === "string") {
                groupMarkers = !nomarkers[indicatorType] && indicator.groupMarkers;
                seriesConfig = {
                    groupMarkers: groupMarkers,
                    type: indicator.type,
                    xKey: config.categoryKey,
                    yKey: indicator.valueKey
                };
                seriesCollection.push(seriesConfig);
            } else {
               valueLen = valueKey.length;
               for(valueIter = 0; valueIter < valueLen; valueIter = valueIter + 1) {
                    indicatorType = indicator.type;
                    seriesConfig = {
                        xKey: config.categoryKey,
                        yKey: indicator.valueKey[valueIter]
                    };
                    if(typeof indicatorType === "string") {
                        seriesConfig.groupMarkers = !nomarkers[indicatorType] && indicator.groupMarkers;
                        seriesConfig.type = indicatorType;
                    } else {
                        seriesConfig.groupMarkers = !nomarkers[indicatorType] && indicator.groupMarkers;
                        seriesConfig.type = indicatorType[valueIter];
                        if(indicatorType[valueIter] === "multipleline" && config.threshold && config.range === "1d") {
                            seriesConfig.thresholds = [parseFloat(indicator.previousClose)];
                        } else if(indicatorType[valueIter] === "volumecolumn") {
                            seriesConfig.previousClose = parseFloat(indicator.previousClose);
                            seriesConfig.yAxis = new Y.NumericAxisBase(indicator.yAxis);
                            seriesConfig.drawInBackground = true;
                        }
                    }
                    if(seriesConfig.drawInBackground) {
                        seriesCollection.unshift(seriesConfig);
                    } else {
                        seriesCollection.push(seriesConfig);
                    }
               }
            }
        }
        return seriesCollection;
    },

    /**
     * Adds styles to each item in an array of graph object literals used as the configuration argument of their
     * respective series instance.
     *
     * @method _getSeriesStyles
     * @param {Array} seriesCollection An array of series configuration objects.
     * @param {Object} config The chart configuration object.
     * @return Array
     * @private
     */
    _getSeriesStyles: function(seriesCollection, config) {
        var series,
            colors = config.colors,
            dotDiameter,
            columnWidth,
            dataProvider,
            rangeType,
            i,
            len = seriesCollection.length;
        for(i = 0; i < len; i = i + 1) {
            series = seriesCollection[i];
            switch(series.type) {
                case "volumecolumn" :
                    series.styles = {
                        upPath: {
                            fill: {
                                color: colors.volumeColumnUp
                            }
                        },
                        downPath: {
                            fill: {
                                color: colors.volumeColumnDown
                            }
                        },
                        padding: {
                            top: 200
                        }
                    };
                break;
                case "line" :
                    series.styles = {
                        line: {
                            weight: config.lineWidth,
                            color: colors[series.yKey]
                        }
                    };
                break;
                case "combo" :
                    series.styles = {
                        line: {
                            weight: config.lineWidth,
                            color: colors[series.yKey].line
                        },
                        area: {
                            color: colors[series.yKey].area
                        }
                    },
                    series.showMarkers = false;
                    series.showAreaFill = true;
                break;
                case "multipleline" :
                    series.styles = {
                        weight: config.lineWidth,
                        color: config.range === "1d" ? [colors.quoteLineUp, colors.quoteLineDown] : [colors.quoteLine],
                        thresholds: config.threshold
                    };
                break;
                case "candlestick" :
                case "ohlc" :
                    series.styles = {
                        upcandle: {
                            fill: {
                                color: colors.priceUp
                            }
                        },
                        downcandle: {
                            fill: {
                                color: colors.priceDown
                            }
                        }
                    };
                break;
                case "marker" :
                    dataProvider = this.get("dataProvider");
                    dotDiameter = Math.min(config.dotDiameter, config.width/dataProvider.length);
                    series.styles = {
                        marker: {
                            width: dotDiameter,
                            height: dotDiameter,
                            border: {
                                color: colors[series.yKey],
                                weight: 0
                            },
                            fill: {
                                color: colors[series.yKey]
                            }
                        }
                    };
                break;
                case "column" :
                    dataProvider = this.get("dataProvider");
                    rangeType = config.rangeType;
                    //columnWidth = rangeType !== "intraday" && rangeType !== "fiveday" ? config.width/dataProvider.length : config.numBars;
                    columnWidth = config.width/dataProvider.length;
                    columnWidth = Math.min(10, Math.round(columnWidth - (columnWidth * 0.4)));
                    columnWidth -= 2;
                    columnWidth = Math.max(1, columnWidth);
                    series.styles = {
                        marker: {
                            width: columnWidth,
                            border: {
                                weight: 0
                            },
                            fill: {
                                color: colors[series.yKey]
                            }
                        }
                    };
                break;
            }
        }
        return seriesCollection;
    },

    /**
     * Renders graph instances into the chart.
     *
     * @method _drawGraphs
     * @param {Array} seriesCollection Array containing configuration objects for each graph.
     * @param {Object} axes Object containing references to the date and numeric axes of the chart.
     * @param {Graphic} graphic Reference to the graphic instance in which the graphs will be rendered.
     * @return Array
     * @private
     */
    _drawGraphs: function(seriesCollection, axes, graphic) {
        var series,
            seriesKey,
            graph,
            graphs = {},
            dateAxis = axes.date,
            numericAxis = axes.numeric,
            GraphClass,
            i,
            len = seriesCollection.length;
        for(i = 0; i < len; i = i + 1) {
            series = seriesCollection[i];
            series.xAxis = dateAxis;
            if(!series.yAxis) {
                series.yAxis = numericAxis;
            }
            series.graphic = graphic;
            GraphClass = this._getGraph(series.type);
            graph = new GraphClass(series);
            graph.draw();
            seriesKey = series.yKey;
            if(typeof seriesKey !== "string") {
                seriesKey = "quote";
            }
            graphs[seriesKey] = graph;
            this._graphs.push(graph);
        }

        return graphs;
    },

    /**
     * Draws gridline background for a chart and returns an object literal with references to
     * the `horizontal` and `vertical` gridlines.
     *
     * @method _drawGridlines
     * @param {Object} config The chart configuration object.
     * @param {Object} axes Object containing references to the date and numeric axes of the chart.
     * @param {Graphic} graphic Reference to the graphic instance in which the graphs will be rendered.
     * @return Object
     * @private
     */
    _drawGridlines: function(horizontalGridlinesConfig, verticalGridlinesConfig, axes, graphic) {
        var horizontalGridlines,
            verticalGridlines;
        if(horizontalGridlinesConfig) {
            horizontalGridlines = new Y.Gridlines({
                graphic: graphic,
                direction: horizontalGridlinesConfig.direction,
                axis: axes.numeric,
                x: horizontalGridlinesConfig.x,
                y: horizontalGridlinesConfig.y,
                styles: horizontalGridlinesConfig
            });
        }
        if(verticalGridlinesConfig) {
            verticalGridlines = new Y.Gridlines({
                graphic:graphic,
                direction: verticalGridlinesConfig.direction,
                axis: axes.date,
                styles: verticalGridlinesConfig
            });
        }
        horizontalGridlines.draw(horizontalGridlinesConfig.width, horizontalGridlinesConfig.height);
        verticalGridlines.draw(verticalGridlinesConfig.width, verticalGridlinesConfig.height);
        return {
            horizontal: horizontalGridlines,
            vertical: verticalGridlines
        };
    },

   /**
    * Maps axis class to key.
    *
    * @property _axesClassMap
    * @type AxisBase
    * @private
    */
    _axesClassMap: {
        numeric: Y.NumericAxis,
        numericbase: Y.NumericAxisBase,
        category: Y.CategoryAxis,
        categorybase: Y.CategoryAxisBase,
        intraday: Y.IntradayAxis
    },

    /**
     * Add the axes to the chart and returns an object literal with references to the
     * `date` and `numeric` axes.
     *
     * @method _drawAxes
     * @param {Object} config The chart configuration object.
     * @return Object
     * @private
     */
    _drawAxes: function(dateConfig, numericConfig) {
        var axes,
            bb,
            numericAxis,
            dateAxis,
            NumericClass = this._axesClassMap[numericConfig.type],
            DateClass = this._axesClassMap[dateConfig.type];
        numericAxis = new NumericClass(numericConfig);
        dateAxis = new DateClass(dateConfig);
        bb = dateAxis.get("boundingBox");
        bb._node.style.left = 0;
        bb._node.style.top = dateConfig.y + "px";

        bb = numericAxis.get("boundingBox");
        bb._node.style.left = numericConfig.x + "px";
        bb._node.style.top = numericConfig.y + "px";
        axes = {
            numeric: numericAxis,
            date: dateAxis
        };
        this._axes.push(axes);
        return axes;
    },

    /**
     * Gets configuration objects for instantiating axes instances.
     *
     * @method _getAxesConfigs
     * @param {Object} config Configuration object for the chart.
     * @param {Object} graphicConfig Configuration object for the graphs' graphic instance.
     * @return Object
     * @private
     */
    _getAxesConfigs: function(config, graphicConfig) {
        var numeric = {},
            date = {},
            key,
            numericConfig = config.axes.numeric,
            dateConfig = config.axes.date;
        for(key in numericConfig) {
            if(numericConfig.hasOwnProperty(key)) {
                numeric[key] = numericConfig[key];
            }
        }
        for(key in dateConfig) {
            if(dateConfig.hasOwnProperty(key)) {
                date[key] = dateConfig[key];
            }
        }
        numeric.y = graphicConfig.y;
        numeric.x = config.width - numericConfig.width;
        numeric.height = graphicConfig.height;
        numeric.styles.margin = graphicConfig.margin;
        date.x = graphicConfig.x;
        date.y = config.y + config.height - dateConfig.height;
        date.width = graphicConfig.width;
        date.styles.margin = graphicConfig.margin;
        return {
            date: date,
            numeric: numeric
        };
    },

    /**
     * Adds an interactive layer for the chart.
     *
     * @method _drawHotspot
     * @param {Object} config The chart configuration object.
     * @param {Node} cb Reference to the node in which the hotspot will be rendered.
     * @return Node
     * @private
     */
    _drawHotspot: function(config, cb) {
        var hotspot = Y.Node.create(
            '<div class="yui3-hotspot" id="fincharthotspot_' + this._hotspots.length +
            '" style="width:' + config.width + 'px;height:' + (config.height) +
            'px;position:absolute;left:' + config.x + 'px;top:' + config.y + 'px;opacity:0;background:#fff;z-index:4"></div>'
        );
        hotspot.setStyle("opacity", 0);
        cb.append(hotspot);
        this._hotspots.push(hotspot);
    },

    /**
     * Creates a graphic instance that will be used to render the gridlines and graphs for the chart.
     *
     * @method _createGraphic
     * @param {Object} config The chart configuration object.
     * @param {Node} cb Reference to the node in which the hotspot will be rendered.
     * @return Graphic
     * @private
     */
    _createGraphic: function(config, cb) {
        var graphic = new Y.Graphic({
            render: cb,
            width: config.width,
            height: config.height,
            x: config.x,
            y: config.y,
            autoDraw: false
        });
        this._graphics.push(graphic);
        return graphic;
    },

    /**
     * Returns the dimensions for a given graphic instance.
     *
     * @method _getGraphicDimensions
     * @param {Object} config The configuration object for the chart.
     * @param {String} type The component for which dimensions are being calculated.
     * @return Object
     * @private
     */
    _getGraphicDimensions: function(config, type) {
        var graphicConfig,
            axisWidth = config.axes.numeric.width,
            axisHeight = config.axes.date.height,
            yAxisPosition = config.axes.numeric.position,
            xAxisPosition = config.axes.date.position,
            graphicX,
            graphicY,
            graphicWidth = config.width,
            graphicHeight = config.height,
            margin;
        graphicConfig = config[type] ? this._copyObject(config[type]) : {};
        graphicX = graphicConfig.x || 0;
        graphicY = graphicConfig.y || config.y;
        margin = graphicConfig.margin;
        if(margin) {
            if(margin.top) {
                graphicY = graphicY + margin.top;
                graphicHeight = graphicHeight - margin.top;
            }
            if(margin.left) {
                graphicX = graphicX + margin.left;
                graphicWidth = graphicWidth - margin.left;
            }
            if(margin.bottom) {
                graphicHeight = graphicHeight - margin.bottom;
            }
            if(margin.right) {
                graphicWidth = graphicWidth - margin.right;
            }
        }
        if(config.legend && config.legend.type !== "axis") {
            graphicY = graphicY + config.legend.height;
            graphicHeight = graphicHeight - config.legend.height;
        }
        if(!graphicConfig || !graphicConfig.overlapXAxis) {
            graphicHeight = graphicHeight - axisHeight;
            if(xAxisPosition === "top") {
                graphicY = graphicY + axisHeight;
            }
        }
        if(!graphicConfig || !graphicConfig.overlapYAxis) {
            graphicWidth = graphicWidth - axisWidth;
            if(yAxisPosition === "left") {
                graphicX = graphicX + axisWidth;
            }
        }
        graphicConfig.width = graphicWidth;
        graphicConfig.height = graphicHeight;
        graphicConfig.x = graphicX;
        graphicConfig.y = graphicY;
        return graphicConfig;
    },

    /**
     * Creates a crosshair to display when the user interacts with the chart.
     *
     * @method _addCrosshair
     * @param {Object} config The chart configuration object.
     * @param {Object} An object literal containing references to the graphs in the chart.
     * @param {Node} cb Reference to the node in which the hotspot will be rendered.
     * @return Crosshair
     * @private
     */
    _addCrosshair: function(config, colors, graphs, cb) {
        var crosshair,
            crosshaircategory = {
                stroke: {
                    color: config.lineColor,
                    weight: config.lineWidth
                }
            },
            crosshairseries = [],
            series,
            drawHorizontal = config.drawHorizontal,
            graph,
            key,
            color,
            crosshairKey,
            validKeys = Y.Array.hash(config.keys);

        for(key in graphs) {
            if(graphs.hasOwnProperty(key)){
                crosshairKey = key === "quote" ? "close" : key;
                graph = graphs[key];
                color = colors[crosshairKey];
                if(color && typeof color === "object" && graph.get("type") === "combo") {
                    color = color.line;
                }
                if(validKeys[crosshairKey]) {
                    series = {
                        marker: {
                            shape: "circle",
                            width: config.dotDiameter,
                            height: config.dotDiameter,
                            fill: {
                                color: config.color ? config.color : color
                            },
                            stroke: {
                                weight: 0
                            }
                        },
                        coords: key === "quote" ? graph.get("ycoords").close : graph.get("ycoords")
                    };
                    if(drawHorizontal) {
                        series.line = {
                            stroke: {
                                color: config.color ? config.color : color
                            }
                        };

                    }
                    crosshairseries.push(series);
                    crosshaircategory.coords = graph.get("xcoords");
                }
            }
        }
        if(crosshairseries.length > 0) {
            crosshair = new Y.Crosshair({
                width: config.width,
                height: config.height,
                x: config.x,
                y: config.y,
                graphX: config.graphX,
                graphY: config.graphY,
                render: cb,
                series: crosshairseries,
                category: crosshaircategory
            });
            this._crosshairs.push(crosshair);
        }
        return crosshair;
    },

    /**
     * Maps string values to legend classes.
     *
     * @property _legenMap
     * @private
     */
    _legendMap: {
        basic: Y.StockIndicatorsLegend,
        axis: Y.StockIndicatorsAxisLegend
    },

    /**
     * Creates a legend for the chart.
     *
     * @method _addLegend
     * @param {Object} config The chart configuration object.
     * @param {Node} cb Reference to the node in which the hotspot will be rendered.
     * @return StockIndicatorsLegend
     * @private
     */
    _addLegend: function(config, cb) {
        var legend,
            legendConfig = config.legend,
            Legend = this._legendMap[legendConfig.type];
        legendConfig.colors = config.colors;
        legendConfig.render = cb;
        if(Legend) {
            legend = new Legend(legendConfig);
            this._legends.push(legend);
        }
        return legend;
    },

    /**
     * Gets the dimensions used for the Gridlines' graphic instance.
     *
     * @method _getGridlinesDimensions
     * @param {Object} horizontalGridlines Configuration object for the horizontal gridlines.
     * @param {Object} verticalGridlines Configuration object for the vertical gridlines.
     * @return Object
     * @private
     */
    _getGridlinesDimensions: function(horizontalGridlines, verticalGridlines) {
        return {
            x: Math.min(horizontalGridlines.x, verticalGridlines.x),
            y: Math.min(horizontalGridlines.y, verticalGridlines.y),
            width: Math.max(horizontalGridlines.width, verticalGridlines.width),
            height: Math.max(horizontalGridlines.height, verticalGridlines.height)
        };
    },

    /**
     * Gets the configuration objects needed to instantiate the gridlines instances.
     *
     * @method _getGridlinesConfig
     * @param {Object} horizontalGridlines Configuration object for the horizontal gridlines.
     * @param {Object} verticalGridlines Configuration object for the vertical gridlines.
     * @return Object
     * @private
     */
    _getGridlinesConfig: function(horizontalGridlinesConfig, verticalGridlinesConfig) {
        var horizontalGridlines,
            verticalGridlines;
        if(horizontalGridlinesConfig) {
            horizontalGridlines = {
                direction: "horizontal",
                x: horizontalGridlinesConfig.x,
                y: horizontalGridlinesConfig.y,
                width: horizontalGridlinesConfig.width,
                height: horizontalGridlinesConfig.height,
                styles: horizontalGridlinesConfig
            };
        }
        if(verticalGridlinesConfig) {
            verticalGridlines = {
                direction: "vertical",
                styles: verticalGridlinesConfig,
                width: verticalGridlinesConfig.width,
                height: verticalGridlinesConfig.height,
                x: verticalGridlinesConfig.x,
                y: verticalGridlinesConfig.y
            };
        }
        return {
            horizontal: horizontalGridlines,
            vertical: verticalGridlines
        };
    },

    /**
     * Generates all elements needed to create a finance chart application using
     * charts.
     *
     * @method drawChart
     * @param {Object} config Data from the chart api
     * @return Array
     */
    drawChart: function(config, cb) {
        var chart,
            axes,
            graphic,
            gridlinesGraphic,
            gridlines,
            graphs,
            hotspot,
            crosshair,
            legend,
            graphConfig = this._getGraphicDimensions(config, "graphs"),
            axesConfig,
            crosshairConfig,
            gridlinesConfig,
            thresholdStyles = config.threshold,
            thresholds,
            previousClose = parseFloat(config.previousClose),
            seriesCollection,
            thresholdConfig;
        config.horizontalGridlines.y = graphConfig.y;
        config.verticalGridlines.x = graphConfig.x;


        axesConfig = this._getAxesConfigs(config, graphConfig);
        axes = this._drawAxes(axesConfig.date, axesConfig.numeric, cb);
        axes.numeric.render(cb);
        axes.date.render(cb);

        gridlinesConfig = this._getGridlinesConfig(
            this._getGraphicDimensions(config, "horizontalGridlines"),
            this._getGraphicDimensions(config, "verticalGridlines")
        );

        gridlinesGraphic = this._createGraphic(
            this._getGridlinesDimensions(gridlinesConfig.horizontal, gridlinesConfig.vertical),
            cb
        );
        graphic = this._createGraphic(graphConfig, cb);
        gridlines = this._drawGridlines(gridlinesConfig.horizontal, gridlinesConfig.vertical, axes, gridlinesGraphic);

        seriesCollection = this._getSeriesStyles(this._getSeriesCollection(config), config);
        graphs = this._drawGraphs(seriesCollection, axes, graphic);
        hotspot = this._drawHotspot(graphConfig, cb);
        crosshairConfig = this._mergeStyles(this._getGraphicDimensions(config, "crosshair"), config.crosshair);
        crosshairConfig.graphX = graphConfig.x;
        crosshairConfig.graphY = graphConfig.y;
        crosshair = this._addCrosshair(
            crosshairConfig,
            config.colors,
            graphs,
            cb
        );
        if(config.legend.type === "axis") {
            config.legend.axis = axes.numeric;
            config.legend.y = graphConfig.y;
            config.legend.contentWidth = this.get("width");
            config.legend.contentHeight = graphConfig.height + axesConfig.date.height;
        } else {
            config.legend.x = graphConfig.x;
            config.legend.y = config.y;
            config.legend.width = graphConfig.width;
        }
        legend = this._addLegend(config, cb);
        if(thresholdStyles && typeof previousClose === "number" && isFinite(previousClose)) {
            thresholdConfig = {
                type: "thresholdline",
                thresholds: [previousClose],
                graphic: graphic,
                yAxis: axes.numeric,
                xAxis: axes.date,
                styles: {
                    thresholds: thresholdStyles
                }
            };
            thresholds = new Y.ThresholdLineSeries(thresholdConfig);
            seriesCollection.push(thresholdConfig);
        }
        chart = {
            axes: axes,
            graphic: graphic,
            gridlines: gridlines,
            graphs: graphs,
            hotspot: hotspot,
            crosshair: crosshair,
            legend: legend,
            xy: graphic.getXY(),
            axesConfig: axesConfig,
            gridlinesConfig: gridlinesConfig,
            graphWidth: graphConfig.width,
            graphHeight: graphConfig.height,
            graphX: graphConfig.x,
            graphY: graphConfig.y,
            legendConfig: config.legend,
            seriesCollection: seriesCollection,
            thresholds: thresholds
        };
        //repaint the gridlines and graph
        graphic._redraw();
        gridlinesGraphic._redraw();
        return chart;
    },

    _destroyCrosshairs: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._crosshairs.length > 0) {
            target = this._crosshairs.pop();
            if(target) {
                target.destroy();
            }
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].crosshair;
        }
    },

    _destroyHotspots: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._hotspots.length > 0) {
            target = this._hotspots.pop();
            target.empty();
            target.remove(true);
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].hotspot;
        }
    },

    _destroyAxes: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._axes.length > 0) {
            target = this._axes.pop();
            target.date.destroy(true);
            target.numeric.destroy(true);
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].axes;
        }
    },

    _destroyGraphs: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._graphs.length > 0) {
            target = this._graphs.pop();
            target.destroy(true);
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].graph;
        }
    },

    _destroyLegends: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._legends.length > 0) {
            target = this._legends.pop();
            target.destroy();
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].legend;
        }
    },

    _destroyGraphics: function() {
        var i,
            len = this._charts.length,
            target;
        while(this._graphics.length > 0) {
            target = this._graphics.pop();
            target.destroy();
        }
        for(i = 0; i < len; i = i + 1) {
            delete this._charts[i].graphic;
        }
    },

    _removeAll: function() {
        var chart,
            key;
        if(this._charts) {
            this._destroyCrosshairs();
            this._destroyHotspots();
            this._destroyLegends();
            this._destroyGraphs();
            this._destroyAxes();
            this._destroyGraphics();
            while(this._charts.length > 0) {
                chart = this._charts.pop();
                for(key in chart) {
                    if(chart.hasOwnProperty(key)) {
                        delete chart[key];
                    }
                }
            }
        }
        this._startHandle.detach();
        this._moveHandle.detach();
        this._endHandle.detach();
    },

    destructor: function() {
        this._removeAll();
    }
}, {
    ATTRS: {
        /**
         * An array of `chart` objects containing necessary data and configuration properties to generate a stock indicator
         * chart application. Each index of the array is represented in the structure below.
         *  <dl>
         *      <dt>axes</dt><dd>
         *          An object literal representing the `axes` for the chart. Each `axes` object contains a `date`
         *          and a `numeric` axis.
         *          <dl>
         *              <dt>date</dt><dd>A <a href="http://yuilibrary.com/yui/docs/api/classes/CategoryAxis.html">CategoryAxis</a>
         *              instance. Possible attributes are listed
         *              <a href="http://yuilibrary.com/yui/docs/api/classes/CategoryAxis.html#attr_appendLabelFunction">here</a>.</dd>
         *              <dt>numeric</dt><dd>A <a href="http://yuilibrary.com/yui/docs/api/classes/NumericAxis.html">NumericAxis</a>
         *              instance. Possible attributes are listed
         *              <a href="http://yuilibrary.com/yui/docs/api/classes/NumericAxis.html#attr_alwaysShowZero">here</a>.</dd>
         *          </dl>
         *      </dd>
         *      <dt>categoryKey</dt><dd>A reference to the key in the `dataProvider` that represents the values
         *      used for the date axis of the chart.</dd>
         *      <dt>colors</dt><dd>An object containing key values pairs in which the key is a reference to the values
         *      of the `dataProvider` and the value is the color associated with each key. This data is used to determine
         *      the colors for the corresponding graphs, legends and crosshair markers.</dd>
         *      <dt>crosshair</dt><dd>Configuration properties for the <a href="Crosshair.html">Crosshair</a>  display that shows when
         *      interacting with a chart. It consists of `marker` shapes that correspond with each series of the
         *      chart, and optional horizontal and vertical lines. By default, the vertical line is displayed and
         *      the horizontal line is not. The colors of each `marker` is determined by its corresponding series
         *      color. Possible configuration values are documented <a href="Crosshair.html">here</a>.</dd>
         *      <dt>dotdiameter</dt><dd>The diameter to be used for marker graphs in the chart.</dd>
         *      <dt>gridcolor</dt><dd>The color to be used for the background grid of the chart.</dd>
         *      <dt>height</dt><dd>The height of the chart including the legend, graph and date axis.</dd>
         *      <dt>indicators</dt><dd>An array of objects in which each object contains data about the financial
         *      indicator that will be represented with a financial graph. Each financial graph may be represented
         *      by one or more actual graph instances. (e.g. One financial may contain multiple line graphs as in the
         *      case of bollinger bands.) Each indicator object contains the following properties:
         *          <dl>
         *              <dt>currency</dt><dd>Reference to the currency used to measure the data.</dd>
         *              <dt>displayKey</dt><dd>A key or array of keys, depending on the indicator mapped to a valueKey
         *              from the `dataProvider` that will be displayed in the corresponding legend.</dd>
         *              <dt>groupMarkers</dt><dd>Indicates whether to draw all markers as a single dom element.</dd>
         *              <dt>indicator</dt><dd>Represents the type of indicator data that will be displayed. (e.g. `quote`,
         *              `bollinger`, `psar`)</dd>
         *              <dt>iscomp</dt><dd>Indicates whether the indicator is a comparison indicator.</dd>
         *              <dt>labels</dt><dd>An array of of values used to create labels on the x-axis.</dd>
         *              <dt>ticker</dt><dd>Indicates the stock ticker of the indicator. (e.g. `yhoo`)</dd>
         *              <dt>type</dt><dd>Indicates the type of financial graph used to display the indicator data.
         *              (e.g. `candlestick`, `line`)
         *              <dt>valueKey</dt>A key or array of keys, depending on the indicator, representing the related
         *              values from the `dataProvider`.</dd>
         *          </dl>
         *      </dd>
         *      <dt>legend</dt><dd>Configuration properties used to construct the <a href="StockIndicatorsLegend.html">StockIndicatorsLegend</a>.
         *      Possible configuration values are documented <a href="StockIndicatorsLegend.html">here</a>. The x and y properties are not
         *      configurable through this object as they are determined by the layout of the charts in this application. </dd>
         *      <dt>lineWidth</dt><dd>The weight to be used for line graphs in the chart.</dd>
         *      <dt>numBar</dt><dd>The value used to calculate the width of the columns in a graph when the `rangeType` is
         *      `daily`. By default, the column width is determined from number of data values across the x axis and the
         *      width of the graph.</dd>
         *      <dt>rangeType</dt><dd>The range type for the chart.
         *          <dl>
         *              <dt>intraday</dt><dd>The date range spans across a single day.</dd>
         *              <dt>daily</dt><dd>The date range spans across multiple days.</dd>
         *          </dl>
         *      </dd>
         *      <dt>width</dt><dd>The width of the chart.</dd>
         *      <dt>y</dt><dd>The y coordinate for the chart in relation to the application.</dd>
         *  </dl>
         *
         *  @attribute charts
         *  @type: Array
         */
        charts: {},

        /**
         * Data used to generate the charts.
         *
         * @attribute dataProvider
         * @type Array
         */
        dataProvider: {
            lazyAdd: false,

            getter: function() {
                return this._dataProvider;
            },

            setter: function(val) {
                this._dataProvider = val;
                return val;
            }
        }
    }
});
/**
 * Creates a spark graph.
 *
 * @module gallery-charts-stockindicators
 * @class StockIndicatorsSpark
 * @constructor
 */
Y.StockIndicatorsSpark = function() {
    this._init.apply(this, arguments);
    return this;
};

Y.StockIndicatorsSpark.prototype = {
    /**
     * Maps keys to corresponding class.
     *
     * @property _graphMap
     * @type Object
     * @private
     */
    _graphMap:  {
        line: Y.LineSeries,
        marker: Y.MarkerSeries,
        column: Y.ColumnSeries,
        area: Y.AreaSeries
    },

    /**
     * Maps keys to the property of a style attribute
     * of the corresponding `SeriesBase` instance.
     *
     * @property _styleMap
     * @type Object
     * @private
     */
    _styleMap: {
        line: "line",
        marker: "marker",
        column: "marker",
        area: "area"
    },

    /**
     *  Sets properties for the graph.
     *
     *  @method _init
     *  @param {Object} config Properties for the graph.
     *  @private
     */
    _init: function(config) {
        var styles = config.styles,
            bb = document.createElement('div'),
            cb = document.createElement('div'),
            render = config.render,
            type = config.type || "line",
            style = type === "column" ? "marker" : type,
            SparkClass = this._graphMap[type];
        this.dataProvider = config.dataProvider;
        this.xKey = config.xKey;
        this.yKey = config.yKey;
        if(!styles) {
            styles = {};
            if(config[style]) {
                styles[style] = config[style];
            } else {
                styles[style] = {};
                if(config.color) {
                    styles.line.color = config.color;
                }
                if(config.alpha) {
                    styles.line.alpha = config.alpha;
                }
                if(type === "line") {
                    styles.line.weight = isNaN(config.weight) ? 1 : config.weight;
                }
            }
        }
        this.xAxis = new Y.CategoryAxisBase({
            dataProvider: this.dataProvider,
            keys: [this.xKey]
        });
        this.yAxis = new Y.NumericAxisBase({
            dataProvider: this.dataProvider,
            keys: [this.yKey],
            alwaysShowZero: false
        });
        bb.style.position = "absolute";
        Y.DOM.setStyle(bb, "inlineBlock");
        cb.style.position = "relative";
        render = document.getElementById(render);
        render.appendChild(bb);
        bb.appendChild(cb);
        cb.style.width = Y.DOM.getComputedStyle(render, "width");
        cb.style.height = Y.DOM.getComputedStyle(render, "height");
        this.graphic = new Y.Graphic({
            render: cb,
            autoDraw: false
        });
        this.graph = new SparkClass({
            rendered: true,
            dataProvider: config.dataProvider,
            graphic: this.graphic,
            styles: styles,
            xAxis: this.xAxis,
            yAxis: this.yAxis,
            xKey: this.xKey,
            yKey: this.yKey
        });
        this.contentBox = cb;
        this.boundingBox = bb;
        this.graph.validate();
        this.graphic._redraw();
    },

    /**
     * Removes all elements of the spark.
     *
     * @method destroy
     */
    destroy: function() {
        var parentNode;
        if(this.xAxis) {
            this.xAxis.destroy(true);
        }
        if(this.yAxis) {
            this.yAxis.destroy(true);
        }
        if(this.graph) {
            this.graph.destroy();
        }
        if(this.graphic) {
            this.graphic.destroy();
        }
        if(this.contentBox) {
            parentNode = this.contentBox.parentNode;
            if(parentNode) {
                parentNode.removeChild(this.contentBox);
            }
        }
        if(this.boundingBox) {
            parentNode = this.boundingBox.parentNode;
            if(parentNode) {
                parentNode.removeChild(this.boundingBox);
            }
        }
    }
};


}, '@VERSION@', {
    "requires": [
        "escape",
        "graphics-group",
        "axis-numeric",
        "axis-category",
        "series-line",
        "series-marker",
        "series-column",
        "series-candlestick",
        "series-ohlc",
        "series-area",
        "series-combo"
    ]
});
