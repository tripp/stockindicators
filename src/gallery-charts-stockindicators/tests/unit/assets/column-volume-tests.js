YUI.add('column-volume-tests', function(Y) {
    var suite = new Y.Test.Suite("Charts: VolumeColumn"),
        parentDiv = Y.DOM.create('<div style="position:absolute;top:50px;left:0px;width:1000px;height:800px" id="testdiv"></div>'),
        DOC = Y.config.doc,
        VolumeColumnTests;
    DOC.body.appendChild(parentDiv),

    VolumeColumnTests = new Y.Test.Case({
        name: "StockIndicators VolumeColumn Tests",
       
        setUp: function() {
            this.volumeColumn = new Y.VolumeColumn();
        },

        "test: instanceOf()" : function() {
            Y.Assert.isInstanceOf(
                Y.VolumeColumn,
                this.volumeColumn,
                "The this.volumeColumn variable  should be an instance of VolumeColumn."
            );
        },

        "test: drawSeries()" : function() {
            var dataProvider = [
                    {close: 27.78, volume: 14591100},
                    {close: 28.07, volume: 8880500},
                    {close: 28.23, volume: 8989600},
                    {close: 28.17, volume: 10807500},
                    {close: 29.24, volume: 21178000},
                    {close: 29.48, volume: 13007600},
                    {close: 29.19, volume: 10374600},
                    {close: 29.65, volume: 22060700},
                    {close: 29.26, volume: 13836600},
                    {close: 29.62, volume: 15748700}
                ],
                previousClose = 23,
                yAxis = {
                    get: function() {
                        return dataProvider; 
                    }
                },
                mockSelectedPath = [],
                MockVolumeSeries = Y.Base.create("mockVolumeSeries", Y.VolumeColumn, [], {
                    _bottomOrigin: 500
                }, {
                    ATTRS: {
                        previousClose: {
                            getter: function() {
                                return previousClose;
                            }
                        },
                        yAxis: {
                            getter: function() {
                                return yAxis;
                            }
                        },
                        width: {
                            getter: function() {
                                return 500;
                            }
                        },
                        height: {
                            getter: function() {
                                return 400;
                            }
                        },
                        xcoords: {
                            getter: function() {
                                return [0, 50, 100, 150, 250, 300, 350, 400, 450, 500];
                            }
                        },
                        ycoords: {
                            getter: function() {
                                return [215, 485, 475, 150, 75, 310, 405, 400, 285, 175];
                            }
                        },
                        upPath: {
                            getter: function() {
                                return {
                                    set: function() {
                                        //do nothing
                                    },
                                    clear: function() {
                                        //do nothing
                                    },
                                    drawRect: function() {
                                        mockSelectedPath.push("upPath");
                                    },
                                    toBack: function() {
                                        //do  nothing
                                    },
                                    end: function() {
                                        //do  nothing
                                    }
                                };
                            }
                        },
                        downPath: {
                            getter: function(){
                                return {
                                    set: function() {
                                        //do nothing
                                    },
                                    clear: function() {
                                        //do nothing
                                    },
                                    drawRect: function() {
                                        mockSelectedPath.push("downPath");
                                    },
                                    toBack: function() {
                                        //do  nothing
                                    },
                                    end: function() {
                                        //do  nothing
                                    }
                                };
                            }
                        }
                    }
                }),
                mockVolumeColumn = new MockVolumeSeries(),
                i,
                len = dataProvider.length,
                selectedPath;
            this.volumeColumn.drawSeries.apply(mockVolumeColumn);
            for(i = 0; i < len; i = i + 1) {
                selectedPath = previousClose > dataProvider[i].close ? "downPath" : "upPath";
                Y.Assert.areEqual(
                    selectedPath,
                    mockSelectedPath[i],
                    "The " + selectedPath + " instance should have been used to draw the rectangle at the " + i + "index."
                );
                previousClose = dataProvider[i].close;
            }
        },

        "test: _getDefaultStyles()" : function() {
            var upPath = {
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
                downPath = {
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
                styles = this.volumeColumn._getDefaultStyles(),
                key,
                compareStyles = function(test, actual) {
                    var key;
                    for(key in test) {
                        if(test.hasOwnProperty(key)) {
                            Y.Assert.areEqual(test[key], actual[key], "The " + key + " property should equal " + test[key] + ".");   
                        }
                    }
                };
            Y.Assert.isInstanceOf(Object, styles.upPath, "The upPath property should be an object.");
            Y.Assert.isInstanceOf(Object, styles.upPath.fill, "The upPath.fill property should be an object.");
            Y.Assert.isInstanceOf(Object, styles.upPath.stroke, "The upPath.stroke property should be an object.");
            Y.Assert.areEqual(
                upPath.shapeRendering,
                styles.upPath.shapeRendering,
                "The upPath.shapeRendering property should equal " + upPath.shapeRendering + "."
            );
            compareStyles(upPath.fill, styles.upPath.fill);
            compareStyles(upPath.stroke, styles.upPath.stroke);
            
            Y.Assert.isInstanceOf(Object, styles.downPath, "The downPath property should be an object.");
            Y.Assert.isInstanceOf(Object, styles.downPath.fill, "The downPath.fill property should be an object.");
            Y.Assert.isInstanceOf(Object, styles.downPath.stroke, "The downPath.stroke property should be an object.");
            Y.Assert.areEqual(
                downPath.shapeRendering,
                styles.downPath.shapeRendering,
                "The downPath.shapeRendering property should equal " + downPath.shapeRendering + "."
            );
            compareStyles(downPath.fill, styles.downPath.fill);
            compareStyles(downPath.stroke, styles.downPath.stroke);
        }
    });

    suite.add(VolumeColumnTests);

    Y.Test.Runner.add(suite);
}, '@VERSION@' ,{requires:['gallery-charts-stockindicators']});
