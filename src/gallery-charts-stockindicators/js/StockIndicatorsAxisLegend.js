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
            minText = this._labelFunction.apply(this, [this._minimum, this._labelFormat]),
            maxText = this._labelFunction.apply(this, [this._maximum, this._labelFormat]),
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
            text = this._labelFunction.apply(this, [value, this._labelFormat]),
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
                text = this._labelFunction.apply(this, [value, this._labelFormat]),
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
