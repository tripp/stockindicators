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
