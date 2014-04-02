YUI.add('gridlines-canvas-stockindicators-tests', function(Y) {
    var suite = new Y.Test.Suite("StockIndicators: GridlinesCanvas"),
        WIDTH = 1100,
        HEIGHT = 600,
        parentDiv = Y.DOM.create('<div style="position:absolute;top:50px;left:0px;width:' + WIDTH + 'px;height:' + HEIGHT + 'px" id="testdiv"></div>'),
        DOC = Y.config.doc,
        GridlinesCanvasTests,
        MockPathElement = function() {
            this._destroyed = false;
            this.canvas = {
                style: {}
            };    
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

    GridlinesCanvasTests = new Y.Test.Case({
        name: "StockIndicators GridlinesCanvas Tests",
        setUp: function() {
            this.gridlines  = new Y.GridlinesCanvas();
        },

        "test: _stylePath()" : function() {
            var path = new MockPathElement(),
                stroke = "stroke",
                x = 5,
                y = 10,
                left = x + "px",
                top = y + "px",
                fill = {
                    color: "#f00"   
                };
            this.gridlines._stylePath(path, WIDTH, HEIGHT, x, y, stroke);
            Y.Assert.areEqual(WIDTH, path.canvas.width, "The width of the path should be " + WIDTH + ".");
            Y.Assert.areEqual(HEIGHT, path.canvas.height, "The height of the path should be " + HEIGHT + ".");
            Y.Assert.areEqual(left, path.canvas.style.left, "The left of the path should be " + left + ".");
            Y.Assert.areEqual(top, path.canvas.style.top, "The top of the path should be " + top + ".");
            Y.Assert.areEqual(stroke, path.stroke, "The stroke of the path should be " + stroke + ".");
            Y.Assert.isUndefined(path.fill, "The fill of the path is undefined.");
            this.gridlines._stylePath(path, WIDTH, HEIGHT, x, y, stroke, fill);
            Y.Assert.areEqual(WIDTH, path.canvas.width, "The width of the path should be " + WIDTH + ".");
            Y.Assert.areEqual(HEIGHT, path.canvas.height, "The height of the path should be " + HEIGHT + ".");
            Y.Assert.areEqual(left, path.canvas.style.left, "The left of the path should be " + left + ".");
            Y.Assert.areEqual(top, path.canvas.style.top, "The top of the path should be " + top + ".");
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


    suite.add(GridlinesCanvasTests);

    Y.Test.Runner.add(suite);
}, '@VERSION@' ,{requires:['gallery-charts-stockindicators']});
