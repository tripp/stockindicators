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
                    marginLeft = Y.Lang.isNumber(margin.left) ? margin.left : 0;
                    marginRight = Y.Lang.isNumber(margin.right) ? margin.right : 0;
                    marginTop = Y.Lang.isNumber(margin.top) ? margin.top : 0;
                    marginBottom = Y.Lang.isNumber(margin.bottom) ? margin.bottom : 0;
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
            if(this._path) {
                if(this._context) {
                    this._context.clearRect(
                        0,
                        0,
                        this.get("width") + this._widthOffset,
                        this.get("height") + this._heightOffset
                    );
                }
                this._path.parentNode.removeChild(this._path);
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

