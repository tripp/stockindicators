YUI.add('charts-stockindicators-tests', function(Y) {
    var suite = new Y.Test.Suite("Charts-StockIndicators"),
        parentDiv = Y.DOM.create('<div style="position:absolute;top:50px;left:0px;width:' + WIDTH + 'px;height:' + HEIGHT + 'px" id="testdiv"></div>'),
        DOC = Y.config.doc,
        WIDTH = 1200,
        HEIGHT = 600,
        StockIndicatorChartTests;
    DOC.body.appendChild(parentDiv),

    StockIndicatorChartTests = new Y.Test.Case({
        name: "StockIndicatorCharts Tests",
       
        setUp: function() {
            this.chart = new Y.StockIndicatorsChart({
                charts: [],
                dataProvider: [],
                width: WIDTH,
                height: HEIGHT,
                render: parentDiv
            });
        },

        "test: initChart" : function() {
            this.chart.initializer.apply(this.chart);
            Y.Assert.isNotNull(this.chart._charts, "There should be a charts array.");
            Y.Assert.isNotNull(this.chart._axes, "There should be a axes array.");
            Y.Assert.isNotNull(this.chart._graphs, "There should be a graphs array.");
            Y.Assert.isNotNull(this.chart._graphics, "There should be a graphics array.");
            Y.Assert.isNotNull(this.chart._crosshairs, "There should be a crosshairs array.");
            Y.Assert.isNotNull(this.chart._hotspots, "There should be a hotspots array.");
            Y.Assert.isNotNull(this.chart._legends, "There should be a legends array.");
        },

        "test: _getGraph" : function() {
            Y.Assert.areEqual(
                Y.LineSeries,
                this.chart._getGraph("line"),
                'The _getGraph method should return Y.LineSeries when "line" is the argument.'
            );
            Y.Assert.areEqual(
                Y.ColumnSeries,
                this.chart._getGraph("column"),
                'The _getGraph method should return Y.ColumnSeries when "column" is the argument.'
            );
            Y.Assert.areEqual(
                Y.MarkerSeries,
                this.chart._getGraph("marker"),
                'The _getGraph method should return Y.MarkerSeries when "marker" is the argument.'
            );
            Y.Assert.areEqual(
                Y.CandlestickSeries,
                this.chart._getGraph("candlestick"),
                'The _getGraph method should return Y.CandlestickSeries when "candlestick" is the argument.'
            );
        },
        
        "test: dataProvider" : function() {
            var dataProviderValue = [
                    {timestamp: "1/1/2014", value: 1000},
                    {timestamp: "1/2/2014", value: 2200}
                ],
                chart = this.chart;
            chart.set("dataProvider", dataProviderValue);
            Y.Assert.areEqual(dataProviderValue, chart.get("dataProvider"), "The dataProvider should equal " + dataProviderValue + ".");
        },
        
        "test: drawCharts()" : function() {
            var DrawChartsMockCharts = Y.Base.create("drawChartsMockCharts", Y.StockIndicatorsChart, [], {
                    _removeAll: function() {
                        this._allRemoved = true;
                        this._charts = [];
                    },

                    drawChart: function(config, cb) {
                        return {
                            chart: config,
                            contentBox: cb
                        };
                    },

                    _allRemoved: false
                }),
                configs = [
                    "chart1",
                    "chart2",
                    "chart3"
                ],
                i,
                len = configs.length,
                mockCharts = new DrawChartsMockCharts({
                    render: parentDiv,
                    charts: configs   
                }),
                contentBox = mockCharts.get("contentBox");
            this.chart.drawCharts.apply(mockCharts);
            Y.Assert.isTrue(mockCharts._allRemoved, "The _removeAll function should have executed.");
            for(i = 0; i < len; i = i + 1) {
                Y.Assert.areEqual(configs[i], mockCharts._charts[i].chart, "The charts should be " + configs[i] + ".");
                Y.Assert.areEqual(contentBox, mockCharts._charts[i].contentBox, "The content box should be " + contentBox + ".");
            }
        },

        "test: drawChart()" : function() {
            var testDateConfig = {
                },
                testNumericConfig = {
                },
                returnObj,
                key,
                chart = this.chart,
                chartObj,
                cb = Y.Node.create('<div>'),
                compareObjects = function(test, actual) {
                    var key;
                    for(key in test) {
                        if(test.hasOwnProperty(key)) {
                            Y.Assert.areEqual(text[key], actual[key], "The values should be equal.");   
                        }
                    }
                };
            chartObj = chart.drawChart(MOCK6M, cb);
            Y.Assert.isNotNull(chartObj, "The chartObj should reference and object.");
            Y.Assert.isInstanceOf(Object, chartObj.axes, "There should be an axes object.");
            Y.Assert.isInstanceOf(Y.CategoryAxis, chartObj.axes.date, "The date axis should be of type Y.CategoryAxis.");
            Y.Assert.isInstanceOf(Y.NumericAxis, chartObj.axes.numeric, "The numeric axis should be of type Y.NumericAxis.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig, "The axesConfig should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig.date, "The axesConfig.date should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig.numeric, "The axesConfig.numeric should be an object.");
            Y.Assert.isInstanceOf(Y.Crosshair, chartObj.crosshair, "The crosshair property should be of type Y.Crosshair.");
            Y.Assert.isInstanceOf(Y.Graphic, chartObj.graphic, "The graphic property should be for type Y.Graphic.");
            Y.Assert.isInstanceOf(Object, chartObj.graphs, "The graphs property should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.gridlines, "The gridlines property should be an object.");
            Y.Assert.isInstanceOf(Y.Gridlines, chartObj.gridlines.horizontal, "The gridlines.horizontal property should be of type Y.Gridlines.");
            Y.Assert.isInstanceOf(Y.Gridlines, chartObj.gridlines.vertical, "The gridlines.vertical property should be of type Y.Gridlines.");
            Y.Assert.isInstanceOf(Object, chartObj.gridlinesConfig, "The gridlinesConfig property should be an object.");
            Y.Assert.isInstanceOf(Y.StockIndicatorsAxisLegend, chartObj.legend, "The legend property should be of type Y.StockIndicatorsAxisLegend.");
            Y.Assert.isInstanceOf(Object, chartObj.legendConfig, "The legendConfig property should be an object.");
            Y.Assert.isInstanceOf(Array, chartObj.seriesCollection, "The seriesCollection property should be an array.");
            chartObj = chart.drawChart(MOCK1D, cb);
            Y.Assert.isNotNull(chartObj, "The chartObj should reference and object.");
            Y.Assert.isInstanceOf(Object, chartObj.axes, "There should be an axes object.");
            Y.Assert.isInstanceOf(Y.CategoryAxis, chartObj.axes.date, "The date axis should be of type Y.CategoryAxis.");
            Y.Assert.isInstanceOf(Y.NumericAxis, chartObj.axes.numeric, "The numeric axis should be of type Y.NumericAxis.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig, "The axesConfig should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig.date, "The axesConfig.date should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.axesConfig.numeric, "The axesConfig.numeric should be an object.");
            Y.Assert.isInstanceOf(Y.Crosshair, chartObj.crosshair, "The crosshair property should be of type Y.Crosshair.");
            Y.Assert.isInstanceOf(Y.Graphic, chartObj.graphic, "The graphic property should be for type Y.Graphic.");
            Y.Assert.isInstanceOf(Object, chartObj.graphs, "The graphs property should be an object.");
            Y.Assert.isInstanceOf(Object, chartObj.gridlines, "The gridlines property should be an object.");
            Y.Assert.isInstanceOf(Y.Gridlines, chartObj.gridlines.horizontal, "The gridlines.horizontal property should be of type Y.Gridlines.");
            Y.Assert.isInstanceOf(Y.Gridlines, chartObj.gridlines.vertical, "The gridlines.vertical property should be of type Y.Gridlines.");
            Y.Assert.isInstanceOf(Object, chartObj.gridlinesConfig, "The gridlinesConfig property should be an object.");
            Y.Assert.isInstanceOf(Y.StockIndicatorsAxisLegend, chartObj.legend, "The legend property should be of type Y.StockIndicatorsAxisLegend.");
            Y.Assert.isInstanceOf(Object, chartObj.legendConfig, "The legendConfig property should be an object.");
            Y.Assert.isInstanceOf(Array, chartObj.seriesCollection, "The seriesCollection property should be an array.");
        },

        "test: getDataURI()" : function() {
            var chart = this.chart,
                chartObj,
                dataURI;
            chart.set("charts", [MOCK6M]);
            chartObj = chart.drawCharts();
            dataURI = chart.getDataURI();
            Y.Assert.areEqual("string", typeof dataURI, "The dataURI should be a string.");
            chart.set("charts", [GRIDFILLCONFIG]);
            chartObj = chart.drawCharts();
            dataURI = chart.getDataURI();
            Y.Assert.areEqual("string", typeof dataURI, "The dataURI should be a string.");
        },

        "test: getChartCanvas()" : function() {
            var chart = this.chart,
                chartObj,
                chartCanvas;
            chart.set("charts", [MOCK1D]);
            chartObj = chart.drawCharts();
            chartCanvas = chart.getChartCanvas();
            Y.Assert.isInstanceOf(Object, chartCanvas, "The canvas instance should be an object.");
            Y.Assert.isNotNull(chartCanvas.getContext('2d'), "The canvas instance should have a 2d context.");
        },

        "test: updatesLegendsCrosshair()" : function() {
            var MockCrosshair = Y.Base.create("mockCrosshair", Y.Crosshair, [], {
                    _setTargetArgs: null,
                    setTarget: function(pageX, autoDraw) {
                        this._setTargetArgs = {},
                        this._setTargetArgs.pageX = pageX;
                        this._setTargetArgs.autoDraw = autoDraw;
                        return MockCrosshair.superclass.setTarget.apply(this, arguments);
                    }
                }), 
                UpdateLegendsCrosshairMockAxisLegend = Y.Base.create("updateLegendsCrosshairMockAxisLegend", Y.StockIndicatorsAxisLegend,[], {
                    _updateArgs: null, 
                    update: function(cfg) {
                        this._updateArgs = {
                            dataProvider: cfg.dataProvider,
                            dataIndex: cfg.dataIndex,
                            pageX: cfg.pageX,
                            pageY: cfg.pageY
                        };
                        return UpdateLegendsCrosshairMockAxisLegend.superclass.update.apply(this, arguments);
                    }
                }),
                UpdateLegendsCrosshairMockLegend = Y.Base.create("updateLegendsCrosshairMockLegend", Y.StockIndicatorsLegend,[], {
                    _updateArgs: null, 
                    update: function(cfg) {
                        this._updateArgs = {
                            dataProvider: cfg.dataProvider,
                            dataIndex: cfg.dataIndex,
                            pageX: cfg.pageX,
                            pageY: cfg.pageY
                        };
                        return UpdateLegendsCrosshairMockLegend.superclass.update.apply(this, arguments);
                    }
                }),
                UpdateLegendsCrosshairMockChart = Y.Base.create("updateLegendsCrosshairMockChart", Y.StockIndicatorsChart, [], {
                    _legendMap: {
                        basic: UpdateLegendsCrosshairMockLegend,
                        axis: UpdateLegendsCrosshairMockAxisLegend
                    },
                    
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
                            validKeys = config.keys;
                        for(key in graphs) {
                            if(graphs.hasOwnProperty(key)){
                                crosshairKey = key === "quote" ? "close" : key;
                                graph = graphs[key];
                                color = colors[crosshairKey];
                                if(color && typeof color === "object" && graph.get("type") === "combo") {
                                    color = color.line;
                                }
                                if(Y.Array.indexOf(validKeys, crosshairKey) > -1) {
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
                            crosshair = new MockCrosshair({
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
                    }
                }),
                chart = this.chart,
                evt = {
                    pageX: 601,
                    pageY: 333
                },
                mockChart,
                mockCrosshair,
                mockAxisLegend,
                currentChart;
            mockChart = new UpdateLegendsCrosshairMockChart({ 
                dataProvider: MOCKDATA,
                charts: [MOCK1D]
            });
            mockChart.drawCharts();
            currentChart = mockChart._charts[0];
            mockCrosshair = currentChart.crosshair;
            mockAxisLegend = currentChart.legend;
            dataIndex = Math.floor((evt.pageX - currentChart.xy[0]) / currentChart.graphWidth * MOCKDATA.length);
            chart.updatesLegendsCrosshair.apply(mockChart, [evt]);
            
            Y.Assert.areEqual(evt.pageX, mockCrosshair._setTargetArgs.pageX, "The pageX argument should be " + evt.pageX + ".");
            Y.Assert.areEqual(mockChart._autoDraw, mockCrosshair._setTargetArgs.autoDraw, "The autoDraw argument should be " + mockChart._autoDraw + ".");

            Y.Assert.areEqual(MOCKDATA, mockAxisLegend._updateArgs.dataProvider, "The dataProvider value should be " + MOCKDATA + ".");
            Y.Assert.areEqual(evt.pageX, mockAxisLegend._updateArgs.pageX, "The pageX value should be " + evt.pageX + ".");
            Y.Assert.areEqual(evt.pageY, mockAxisLegend._updateArgs.pageY, "The pageY value should be " + evt.pageY + ".");
            Y.Assert.areEqual(dataIndex, mockAxisLegend._updateArgs.dataIndex, "The dataIndex value should be " + dataIndex + ".");
            
            mockChart.destroy();

            mockChart = new UpdateLegendsCrosshairMockChart({ 
                dataProvider: DESKTOPDATAPROVIDER,
                charts: [MOCKLEGENDTOP]
            });
            mockChart.drawCharts();
            currentChart = mockChart._charts[0];
            mockCrosshair = currentChart.crosshair;
            mockAxisLegend = currentChart.legend;
            dataIndex = Math.floor((evt.pageX - currentChart.xy[0]) / currentChart.graphWidth * MOCKDATA.length);
            chart.updatesLegendsCrosshair.apply(mockChart, [evt]);
            
            Y.Assert.areEqual(DESKTOPDATAPROVIDER, mockAxisLegend._updateArgs.dataProvider, "The dataProvider value should be " + MOCKDATA + ".");
            Y.Assert.areEqual(evt.pageX, mockAxisLegend._updateArgs.pageX, "The pageX value should be " + evt.pageX + ".");
            Y.Assert.areEqual(evt.pageY, mockAxisLegend._updateArgs.pageY, "The pageY value should be " + evt.pageY + ".");
            Y.Assert.areEqual(dataIndex, mockAxisLegend._updateArgs.dataIndex, "The dataIndex value should be " + dataIndex + ".");
          
            mockChart.destroy();
        },

        "test:_eventDispatcher()" : function() {
            var EventDispatcherMockChart = Y.Base.create("eventDispatcherMockChart", Y.StockIndicatorsChart, [], {
                clearTracker: function() {
                    this._tracker = {
                        startTimeline: false,
                        stopTimeline: false,
                        fire: false
                    };
                },

                _tracker: null,

                stopTimeline: function() {
                    this._tracker.stopTimeline = true;
                },

                startTimeline: function() {
                    this._tracker.startTimeline = true;
                },

                fire: function(type, payload) {
                    this._tracker.eventType = type;
                    this._tracker.originEvent = payload.originEvent;
                    this._tracker.pageX = payload.pageX;
                    this._tracker.pageY = payload.pageY;
                    this._tracker.isTouch = payload.isTouch;
                }


            }),
            MockEvent = function(config) {
                var key;
                this._halted = false;
                for(key in config) {
                    if(config.hasOwnProperty(key)) {
                        this[key] = config[key];   
                    }
                }
            },
            chart = this.chart,
            mockChart = new EventDispatcherMockChart(),
            mockEvent,
            runMockEventTests = function(eventConfig) {
                var mockEvent = new MockEvent(eventConfig),
                    eventType = "chartEvent:" + eventConfig.type,   
                    stopTimeline = eventConfig.type === "mouseleave" || eventConfig.type === "touchend",
                    startTimeline = eventConfig.type === "mouseenter" || eventConfig.type === "touchstart",
                    isTouch = eventConfig && eventConfig.hasOwnProperty("changedTouches"),
                    pageX = isTouch ? eventConfig.changedTouches[0].pageX : eventConfig.pageX,
                    pageY = isTouch ? eventConfig.changedTouches[0].pageY : eventConfig.pageY;
                mockChart.clearTracker();
                chart._eventDispatcher.apply(mockChart, [mockEvent]);
                
                Y.Assert.areEqual(
                    stopTimeline,
                    mockChart._tracker.stopTimeline,
                    "The _tracker.stopTimeline property should be " + stopTimeline + "."
                );
                Y.Assert.areEqual(
                    startTimeline,
                    mockChart._tracker.startTimeline,
                    "The _tracker.startTimeline property should be " + startTimeline + "."
                );
                Y.Assert.areEqual(pageX, mockChart._tracker.pageX, "The pageX should be " + pageX + ".");
                Y.Assert.areEqual(pageX, mockChart._tracker.pageX, "The pageY should be " + pageY + ".");
                Y.Assert.areEqual(eventType, mockChart._tracker.eventType, "The event type should be " + eventType + ".");
                Y.Assert.areEqual(mockEvent, mockChart._tracker.originEvent, "The origin event should be " + mockEvent + ".");
            };

            MockEvent.prototype = {
                halt: function() {
                    this._halted = true;
                }
            };

            runMockEventTests({
                pageX: 100,
                pageY: 200,
                type: "mouseenter"
            });

            runMockEventTests({
                pageX: 100,
                pageY: 200,
                type: "mousemove"
            });
            
            runMockEventTests({
                pageX: 100,
                pageY: 200,
                type: "mouseleave"
            });

            runMockEventTests({
                changedTouches: [{
                    pageX: 300,
                    pageY: 350
                }],
                type: "touchstart"
            });

            runMockEventTests({
                changedTouches: [{
                    pageX: 300,
                    pageY: 350
                }],
                type: "touchmove"
            });

            runMockEventTests({
                changedTouches: [{
                    pageX: 300,
                    pageY: 350
                }],
                type: "touchend"
            });
        },

        "test: startTimeline()" : function() {
            var MockStartTimelineChart = Y.Base.create("mockStartTimelineChart", Y.StockIndicatorsChart, [], {
                    _runTimeline: false,

                    resetVals: function() {
                        this._redrawn = false;
                        this._timelineStart = null;
                    },
                    redraw: function() {
                        this._redrawn = true;
                    }
                }),
                chart = this.chart,
                mockChart = new MockStartTimelineChart();
                mockChart.resetVals();
                mockChart.startTimeline.apply(mockChart);
                Y.Assert.isTrue(mockChart._redrawn, "The redraw method should have been called."); 
                Y.Assert.isTrue(mockChart._runTimeline, "The _runTimeline property should be true.");
                Y.Assert.isNotNull(mockChart._timelineStart, "The _timelinestart property should be a number."); 
                mockChart.resetVals();
                mockChart.startTimeline.apply(mockChart);
                Y.Assert.isFalse(mockChart._redrawn, "The redraw method should not have been called."); 
                Y.Assert.isNull(mockChart._timelineStart, "The _timelinestart property should be null."); 
        },

        "test: stopTimeline()" : function() {
            var MockStopTimelineChart = Y.Base.create("mockStopTimelineChart", Y.StockIndicatorsChart, [], {
                _timelineId: "myID"
            }),
            chart = this.chart,
            mockChart = new MockStopTimelineChart();
            chart.stopTimeline.apply(mockChart);
            Y.Assert.isFalse(mockChart._runTimeline, "The _runTimeline property should be false.");
            Y.Assert.isNull(mockChart._timelineId, "The _timelineId property should be null.");
            chart.stopTimeline.apply(mockChart);
            Y.Assert.isFalse(mockChart._runTimeline, "The _runTimeline property should be false.");
            Y.Assert.isNull(mockChart._timelineId, "The _timelineId property should be null.");
        },

        "test: redraw()" : function() {
            var MockRedrawChart = Y.Base.create("mockRedrawChart", Y.StockIndicatorsChart, [], {
                    _runTimeline: false
                }),
                chart = this.chart,
                mockChart = new MockRedrawChart(),
                MockInteractiveItem = function() {},
                legend,
                crosshair;
            MockInteractiveItem.prototype = {
                _redrawn: false,
                
                redraw: function() {
                    this._redrawn = true;
                }
            };
            legend = new MockInteractiveItem();
            crosshair = new MockInteractiveItem();
            mockChart._charts = [{
                legend: legend,
                crosshair: crosshair   
            }];
            mockChart._timelineStart = new Date().valueOf() + 1000;
            chart.redraw.apply(mockChart);
            Y.Assert.isFalse(legend._redrawn, "The redraw method should not have been called on the legend.");
            Y.Assert.isFalse(crosshair._redrawn, "The redraw method should not have been called on the crosshair.");
            mockChart._timelineStart = mockChart._timelineStart - 2000;
            chart.redraw.apply(mockChart);
            Y.Assert.isTrue(legend._redrawn, "The redraw method should have been called on the legend.");
            Y.Assert.isTrue(crosshair._redrawn, "The redraw method should have been called on the crosshair.");
            

        },

        tearDown: function() {
            this.chart.destroy(true);
            Y.Event.purgeElement(DOC, false);
        }
        
    });

    suite.add(StockIndicatorChartTests);

    Y.Test.Runner.add(suite);
}, '@VERSION@' ,{requires:['gallery-charts-stockindicators']});
