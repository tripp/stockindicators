YUI.add('gridlines-stockindicators-tests', function(Y) {
    var suite = new Y.Test.Suite("StockIndicators: Gridlines"),
        WIDTH = 1100,
        HEIGHT = 600,
        parentDiv = Y.DOM.create('<div style="position:absolute;top:50px;left:0px;width:' + WIDTH + 'px;height:' + HEIGHT + 'px" id="testdiv"></div>'),
        DOC = Y.config.doc,
        GridlinesTests,
        MockPathElement = function() {
            this._destroyed = false;    
        };
    MockPathElement.prototype = {
        set: function(prop, val) {
            this[prop] = val;
        },

        destroy: function() {
            this._destroyed = true;
        }
    };
    DOC.body.appendChild(parentDiv);

    GridlinesTests = new Y.Test.Case({
        name: "StockIndicators Gridlines Tests",
        setUp: function() {
            this.gridlines  = new Y.Gridlines();
        },

        "test: remove()" : function() {
            var mockPath = new MockPathElement();
            this.gridlines.remove();
            Y.Assert.isFalse(mockPath._destroyed, "The mockPath element should be destroyed.");
            this.gridlines._path = mockPath;
            this.gridlines.remove();
            Y.Assert.isTrue(mockPath._destroyed, "The mockPath element should be destroyed.");
        },

        "test: draw()" : function() {
            var DrawMockGridlines = Y.Base.create("drawMockGridlines", Y.Gridlines, [], {
                   _drawGridlinesArgs: null,

                   _drawGridlines: function(w, h, startIndex, interval) {
                        this._drawGridlinesArgs = {
                            w: w,
                            h: h,
                            startIndex: startIndex,
                            interval: interval  
                        };
                   }
                }),
                mockGridlines = new DrawMockGridlines(),
                startIndex = 0,
                interval = 2;
            this.gridlines.draw.apply(mockGridlines, [WIDTH, HEIGHT, startIndex, interval]);
            Y.Assert.isNull(mockGridlines._drawGridlinesArgs, "The _drawGridlines method should not have been called.");
            mockGridlines.set("axis", true);
            mockGridlines.set("graphic", true); 
            this.gridlines.draw.apply(mockGridlines, [WIDTH, HEIGHT, startIndex, interval]);
            Y.Assert.isInstanceOf(Object, mockGridlines._drawGridlinesArgs, "The _drawGridlines method should have been called.");
            Y.Assert.areEqual(WIDTH, mockGridlines._drawGridlinesArgs.w, "The w argument should be " + WIDTH + "."); 
            Y.Assert.areEqual(HEIGHT, mockGridlines._drawGridlinesArgs.h, "The h argument should be " + HEIGHT + "."); 
            Y.Assert.areEqual(startIndex, mockGridlines._drawGridlinesArgs.startIndex, "The startIndex argument should be " + startIndex + "."); 
            Y.Assert.areEqual(interval, mockGridlines._drawGridlinesArgs.interval, "The interval argument should be " + interval + "."); 
        },

        "test: _stylePath()" : function() {
            var path = new MockPathElement(),
                stroke = "stroke",
                x = 5,
                y = 10,
                fill = "fill";
            this.gridlines._stylePath(path, WIDTH, HEIGHT, x, y, stroke);
            Y.Assert.areEqual(WIDTH, path.width, "The width of the path should be " + WIDTH + ".");
            Y.Assert.areEqual(HEIGHT, path.height, "The height of the path should be " + HEIGHT + ".");
            Y.Assert.areEqual(x, path.x, "The x of the path should be " + x + ".");
            Y.Assert.areEqual(y, path.y, "The y of the path should be " + y + ".");
            Y.Assert.areEqual(stroke, path.stroke, "The stroke of the path should be " + stroke + ".");
            Y.Assert.isUndefined(path.fill, "The fill of the path is undefined.");
            this.gridlines._stylePath(path, WIDTH, HEIGHT, x, y, stroke, fill);
            Y.Assert.areEqual(WIDTH, path.width, "The width of the path should be " + WIDTH + ".");
            Y.Assert.areEqual(HEIGHT, path.height, "The height of the path should be " + HEIGHT + ".");
            Y.Assert.areEqual(x, path.x, "The x of the path should be " + x + ".");
            Y.Assert.areEqual(y, path.y, "The y of the path should be " + y + ".");
            Y.Assert.areEqual(stroke, path.stroke, "The stroke of the path should be " + stroke + ".");
            Y.Assert.areEqual(fill, path.fill, "The fill of the path should be " + fill + ".");
        },

        "test: _getPoints()" : function() {
            var getPoints = function(count, w, h) {
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
                i,
                num = 10,
                testPoints = getPoints(num, WIDTH, HEIGHT),
                len = testPoints.length,
                testPoint,
                point,
                points = this.gridlines._getPoints(num, WIDTH, HEIGHT);
            for(i = 0; i < len; i = i + 1) {
                testPoint = testPoints[i];
                point = points[i];
                Y.Assert.areEqual(
                    testPoint.x,
                    point.x,
                    "The x property of the " + i + " index of the points array should equal " + testPoint.x + "."
                ); 
                Y.Assert.areEqual(
                    testPoint.y,
                    point.y,
                    "The y property of the " + i + " index of the points array should equal " + testPoint.y + "."
                ); 
            }
        },

        tearDown: function() {
            this.gridlines.destroy();
        }
    });


    suite.add(GridlinesTests);

    Y.Test.Runner.add(suite);
}, '@VERSION@' ,{requires:['gallery-charts-stockindicators']});
