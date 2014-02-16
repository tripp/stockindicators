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
     * @method initializer
     * @private
     */
    initializer: function(cfg) {
        var previousClose = cfg.previousClose,
            interactiveItems = cfg.interactiveItems;
        this._styles = cfg.styles;
        this._axis = cfg.axis;
        this._maximum = axis.get("maximum"),
        this._minimum = axis.get("minimum"),
        this._dataProvider = cfg.dataProvider || axis.get("dataProvider"),
        this.height = cfg.height,
        this.width = this._calculateWidth(),
        this._contentBox = cfg.contentBox;
        if(previousClose) {
            this._previousClose = this._getPreviousClose(previousClose);
        }
        if(interactiveItems) {
            this._interactiveItems = this._initalizeInteractiveItems(interactiveItems);
        }
    },
    
    /**
     * Calculates the width for the instance. The width is calculated by comparing the widths of
     * formatted and styled maximum and minimum values from the corresponding axis. The largest 
     * width is then added to user defined paddings and label margins.
     *
     * @method _calculateWidth
     * @return Number
     * @private
     */
    _calculateWidth: function() {
        var styles = this._styles.label,
            axis = this._axis,
            maxLabel = DOCUMENT.createElement("span"),
            minLabel = DOCUMENT.createElement("span"),
            width,
            minText = axis.get("labelFunction").apply(this, [this._maximum, axis.get("labelFormat")]), 
            maxText = axis.get("labelFunction").apply(this, [this._maximum, axis.get("labelFormat")]); 
        for(key in styles) {
            minLabel.styles[key] = styles[key];
            maxLabel.styles[key] = styles[key];
        }
        minLabel.appendChild(DOCUMENT.createTextNode(minText));
        maxLabel.appendChild(DOCUMENT.createTextNode(maxText));
        DOCUMENT.body.appendChild(maxLabel);
        DOCUMENT.body.appendChild(minLabel);
        width = Math.max(parseFloat(maxLabel.offsetWidth), parseFloat(minLabel.offsetWidth));
        axis._removeChildren(minLabel);
        axis._removeChildren(maxLabel);
        Y.Event.purgeElement(minLabel, true);
        Y.Event.purgeElement(maxLabel, true);
        minLabel.parentNode.removeChild(minLabel);
        maxLabel.parentNode.removeChild(maxLabel);
        return width;
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
            styles = this._styles.label,
            previousCloseStyles = previousCloseStyles,
            background = previousClose.background,
            value = previousClose.value,
            DOCUMENT = Y.config.doc,
            label = DOCUMENT.createElement("span"),
            key,
            text = axis.get("labelFunction").apply(this, [value, axis.get("labelFormat")]),
            ycoord = previousClose.ycoord ||
                axis._getCoordFromValue(this._minimum, this._maximum, this._height, value, 0, true);
        label.id = previousClose.id || className;
        if(previousClose.className) {
            className = className + " " + previousClose.className;
        }
        label.className = className;
        if(styles) {
            for(key in styles) {
                if(styles.hasOwnProperty(key)) {
                    label.styles[key] = styles[key];
                }
            }
        }
        if(background) {
            label.style.background = background;
        }
        label.appendChild(DOCUMENT.createTextNode(text));
        this._contentBox.appendChild(label);
        label.styles.left = (this.width - (parseFloat(label.offsetWidth) + styles.padding)) + "px";
        label.styles.top = (ycoord - parseFloat(label.offsetHeight)/2) + "px";
        previousClose.node = label;
        returns previousClose;
    },

    /**
     * Creates dom nodes for each specified item. The method accepts an object containing key value
     * pairs in which the key represents the data key of the item and the value is an object containing
     * necessary infortion for the label. The created dom nodes are attached to their respective value
     * objects and returned.
     *
     * @method _initializeInteractiveItems
     * @param {Object} interactiveItems The key value pairs to be used for creating necessary elements.
     * @return Object
     * @private
     */ 
    _initalizeInteractiveItems: function(interactiveItems) {
        var className = "stockIndicatorsInteractiveLabel",
            axis = this.axis,
            styles = this._styles.label,
            background,
            value,
            DOCUMENT = Y.config.doc,
            key,
            styleKey,
            text,
            item,
            label,
            itemClass,
            contentBox = this._contentBox._node;
        for(key in interactiveItems) {
            if(interactiveItems.hasOwnProperty(key)) {
                item = interactiveItems[key];
                label = DOCUMENT.createElement("span");
                label.id = item.id || className + "_" + key;
                label.className = item.className ? className + " " + item.className : className;
                if(styles) {
                    for(stylesKey in styles) {
                        if(styles.hasOwnProperty(stylesKey) {
                            label.styles[stylesKey] = styles[stylesKey];
                        }
                    }
                }
                if(item.background) {
                    label.styles.background = item.background;
                }
                label.styles.left = "0px";
                label.styles.top = "0px";
                label.styles.visibility = "hidden";
                contentBox.appendChild(label);
                item.node = label;
            }
        }
        return interactiveItems;
    },

    update: function() {

    },

    /**
     * Gets the default value used for building the `_styles` property.
     *
     * @method _getDefaultStyles
     * @return Object
     * @private
     */
    _getDefaultStyles: function() {
        previousClose: {
            color: "#eee"
        },
        label: {
            display: "block",
            whiteSpace: "nowrap",
            position: "absolute",
            backgroundColor: "#9aa",
            color: "#fff",
            fontFamily: "Helvetica Neue, Helvetica, Arial",
            fontWeight: "bold",
            fontSize: "10pt",
            paddingRight: "5pt",
            paddingLeft: "10pt",
            marginRight: "3pt"
        }
    }
};
