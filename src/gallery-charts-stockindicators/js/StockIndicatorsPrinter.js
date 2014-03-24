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
        multipleline: Y.MultipleLineCanvasSeries,
        volumecolumn: Y.VolumeColumnCanvas
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
            legend = new Y.StockIndicatorsCanvasAxisLegend(config);
            legends.push(legend);
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
                config.graphic = Y.Node.create('<div>');
                graph = new GraphClass(config);
                graph.set("width", config.width);
                graph.set("height", config.height);
                graph.draw();
                graphs.push(graph);
            }
        }
        return graphs;
    }
};

