YUI.add('spark-stockindicators-tests', function(Y) {
    var suite = new Y.Test.Suite("Charts: Spark"),
        parentDiv = Y.DOM.create('<div style="position:absolute;top:50px;left:0px;width:100px;height:25px" id="testdiv"></div>'),
        DOC = Y.config.doc,
        SparkTests;
    DOC.body.appendChild(parentDiv),

    SparkTests = new Y.Test.Case({
        name: "StockIndicators Spark Tests",
        
        testSpark : function() {
            var spark = new Y.StockIndicatorsSpark({
                    dataProvider: SPARKDATAPROVIDER,
                    yKey: "close",
                    xKey: "Date",
                    render: "testdiv",
                    color: "#f00"
                }),
                xAxis = spark.xAxis,
                yAxis = spark.yAxis,
                graph = spark.graph;
            this.spark = spark;
            Y.Assert.isInstanceOf(
                Y.StockIndicatorsSpark,
                spark,
                "The this.spark variable  should be an instance of StockIndicatorsSpark."
            );
            Y.Assert.isInstanceOf(Y.CategoryAxisBase, xAxis, "The x axis should be a CategoryAxisBase instance.");
            Y.Assert.isInstanceOf(Y.NumericAxisBase, yAxis, "The y axis should be a NumericAxisBase instance.");
            Y.Assert.isInstanceOf(Y.LineSeries, graph, "The graph should be a LineSeries instance.");
        },

        testColumnSpark: function() {
            var spark = new Y.StockIndicatorsSpark({
                type: "column",
                dataProvider: SPARKDATAPROVIDER,
                yKey: "close",
                xKey: "Date",
                render: "testdiv",
                styles: {
                    color: "#f00"
                }
            }),
            xAxis = spark.xAxis,
            yAxis = spark.yAxis,
            graph = spark.graph;
            Y.Assert.isInstanceOf(Y.CategoryAxisBase, xAxis, "The x axis should be a CategoryAxisBase instance.");
            Y.Assert.isInstanceOf(Y.NumericAxisBase, yAxis, "The y axis should be a NumericAxisBase instance.");
            Y.Assert.isInstanceOf(Y.ColumnSeries, graph, "The graph should be a ColumnSeries instance.");
            this.spark = spark;
        },

        testMarkerSpark: function() {
            var spark = new Y.StockIndicatorsSpark({
                type: "marker",
                dataProvider: SPARKDATAPROVIDER,
                yKey: "close",
                xKey: "Date",
                render: "testdiv",
                styles: {
                    color: "#f00"
                }
            }),
            xAxis = spark.xAxis,
            yAxis = spark.yAxis,
            graph = spark.graph;
            Y.Assert.isInstanceOf(Y.CategoryAxisBase, xAxis, "The x axis should be a CategoryAxisBase instance.");
            Y.Assert.isInstanceOf(Y.NumericAxisBase, yAxis, "The y axis should be a NumericAxisBase instance.");
            Y.Assert.isInstanceOf(Y.MarkerSeries, graph, "The graph should be a MarkerSeries instance.");
            this.spark = spark;
        },

        testAreaSpark: function() {
            var spark = new Y.StockIndicatorsSpark({
                type: "area",
                dataProvider: SPARKDATAPROVIDER,
                yKey: "close",
                xKey: "Date",
                render: "testdiv",
                styles: {
                    color: "#f00"
                }
            }),
            xAxis = spark.xAxis,
            yAxis = spark.yAxis,
            graph = spark.graph;
            Y.Assert.isInstanceOf(Y.CategoryAxisBase, xAxis, "The x axis should be a CategoryAxisBase instance.");
            Y.Assert.isInstanceOf(Y.NumericAxisBase, yAxis, "The y axis should be a NumericAxisBase instance.");
            Y.Assert.isInstanceOf(Y.AreaSeries, graph, "The graph should be a AreaSeries instance.");
            this.spark = spark;
        },

        tearDown: function() {
            this.spark.destroy();
        }
    });


    suite.add(SparkTests);

    Y.Test.Runner.add(suite);
}, '@VERSION@' ,{requires:['gallery-charts-stockindicators']});
