/**
 * Provides functionality for a chart.
 *
 * @module gallery-charts-stockindicators
 */

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
            len = configs.length;
        this._removeAll();
        for(i = 0; i < len; i = i + 1) {
            charts[i] = this.drawChart(configs[i], cb);
        }
        this._charts = charts;
        this._addEvents();
        this._printStockIndicators = new Y.StockIndicatorsPrinter(charts, this.get("width"), this.get("height"));
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
        line: Y.LineSeries,
        marker: Y.MarkerSeries,
        column: Y.ColumnSeries,
        candlestick: Y.CandlestickSeries,
        multipleline: Y.MultipleLineSeries,
        volumecolumn: Y.VolumeColumn
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
            nomarkers = ["candlestick", "line", "ohlc", "volumecolumn", "multipleline"];
        for(indIter = 0; indIter < indLen; indIter = indIter + 1) {
            indicator = indicators[indIter];
            valueKey = indicator.valueKey;
            indicatorType = indicator.type;
            if(indicatorType === "candlestick" || typeof valueKey === "string") {
                groupMarkers = Y.Array.indexOf(nomarkers, indicatorType) === -1 && indicator.groupMarkers;
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
                        seriesConfig.groupMarkers = Y.Array.indexOf(nomarkers, indicatorType) === -1 && indicator.groupMarkers;
                        seriesConfig.type = indicatorType;
                    } else {
                        seriesConfig.groupMarkers = Y.Array.indexOf(nomarkers, indicatorType[valueIter]) === -1 && indicator.groupMarkers;
                        seriesConfig.type = indicatorType[valueIter];
                        if(indicatorType[valueIter] === "multipleline" && config.threshold) {
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
                case "multipleline" :
                    series.styles = {
                        weight: config.lineWidth,
                        colors: config.range === "1d" ? [colors.quoteLineUp, colors.quoteLineDown] : [colors.quoteLine],
                        threshold: config.threshold
                    };
                break;
                case "candlestick" :
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
    _addCrosshair: function(config, colors, graphs,  cb) {
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
            crosshairKey,
            validKeys = config.keys;
        for(key in graphs) {
            if(graphs.hasOwnProperty(key)){
                crosshairKey = key === "quote" ? "close" : key;
                graph = graphs[key];
                if(Y.Array.indexOf(validKeys, crosshairKey) > -1) {
                    series = {
                        marker: {
                            shape: "circle",
                            width: config.dotDiameter,
                            height: config.dotDiameter,
                            fill: {
                                color: config.color ? config.color : colors[crosshairKey]
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
                                color: config.color ? config.color : colors[crosshairKey]
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
            seriesCollection;
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
        } else {
            config.legend.x = graphConfig.x;
            config.legend.y = config.y;
            config.legend.width = graphConfig.width;
        }
        legend = this._addLegend(config, cb);
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
            seriesCollection: seriesCollection
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
