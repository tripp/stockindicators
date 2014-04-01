/**
 * Provides functionality for a crosshair.
 *
 * @module gallery-charts-stockindicators
 */

/**
 * Creates an updatable crosshair on the Graph which can be controlled
 * by mouse and touch events.
 *
 * @class Crosshair
 * @constructor
 * @param {Object} config Configuration parameters.
 *  <dl>
 *      <dt>dotdiameter</dt><dd>The diameter of the circle or dot.</dd>
 *      <dt>drawHorizontal</dt><dd>Indicates whether to draw the horizontal line. The default
 *      value is `false`.</dd>
 *      <dt>drawVertical</dt><dd>Indicates whether to draw the verical line. The default
 *      value is `true`.</dd>
 *      <dt>lineColor</dt><dd>The color to use for lines.</dd>
 *      <dt>lineWidth</dt><dd>The weight of the lines.</dd>
 *      <dt>useCircle</dt><dd>Determines whether to use an empty circle. The default value is
 *      `false`.</dd>
 *      <dt>useDot</dt><dd>Determines whether to use a dot. The default value is `true`.</dd>
 *  </dl>
 */
Y.Crosshair = function() {
    this.initializer.apply(this, arguments);
};
Y.Crosshair.prototype = {
    /**
     * Builds the crosshair.
     *
     * @method initializer
     * @protected
     */
    initializer: function(cfg) {
        var graphic = new Y.Graphic({
                render: cfg.render,
                autoDraw: false,
                width: cfg.width,
                height: cfg.height,
                x: cfg.x,
                y: cfg.y
            }),
            width = cfg.width,
            height = cfg.height,
            series = cfg.series,
            graph,
            category = cfg.category,
            yline,
            i,
            len = series.length,
            graphX = cfg.graphX - cfg.x,
            graphY = cfg.graphY - cfg.y;
        yline = graphic.addShape({
            shapeRendering: "crispEdges",
            type: "path",
            stroke: category.stroke
        }).moveTo(graphX, 0).lineTo(graphX, height).end();
        this._xcoords = category.coords;
        this._yline = yline;
        this.width = cfg.width;
        this.height = cfg.height;
        if(series) {
            for(i = 0; i < len; i = i + 1) {
                graph = series[i];
                if(graph.line) {
                    graph.xLine = graphic.addShape({
                        shapeRendering: "crispEdges",
                        type: "path",
                        stroke: graph.line.stroke
                    }).moveTo(0, graphY).lineTo(width, graphY).end();
                }
                if(graph.marker) {
                    graph.marker.y = graphY - graph.marker.height/2;
                    graph.marker.x = graphX - graph.marker.width/2;
                    graph.marker.type = graph.marker.type || graph.marker.shape;
                    graph.marker = graphic.addShape(graph.marker);
                }
            }
            this._series = series;
        }
        this._xy = graphic.getXY();
        this.graphic = graphic;
    },

    /**
     * Updates the position of the crosshair.
     *
     * @method setTarget
     * @param {Number} pageX The x-coordinate to map in which to map the crosshair.
     */
    setTarget: function(pageX, redraw) {
        var xy = this._xy,
            x = pageX - xy[0],
            y,
            series = this._series,
            graph,
            i,
            index = Math.floor((x / this.width) * this._xcoords.length),
            len = series.length;
        this._yline.set("transform", "translate(" + x + ")");
        if(series) {
            for(i = 0; i < len; i = i + 1) {
                graph = series[i];
                y = graph.coords[index];
                if(graph.marker) {
                    if(Y.Lang.isNumber(y)) {
                        graph.marker.set("visible", true);
                        graph.marker.set("transform", "translate(" + x + ", " + y + ")");
                    } else {
                        graph.marker.set("visible", false);
                    }
                }
                if(graph.line) {
                    if(Y.Lang.isNumber(y)) {
                        graph.xLine.set("visible", true);
                        graph.xLine.set("transform", "translateY(" + y + ")");
                    } else {
                        graph.xLine.set("visible", false);
                    }
                }
            }
        }
        this.updateFlag = true;
        if(redraw) {
            this.graphic._redraw();
        }
    },

    /**
     * Updates the crosshair items.
     *
     * @method redraw
     */
    redraw: function() {
        if(this.updateFlag) {
            this.graphic._redraw();
            this.updateFlag = false;
        }
    },

    /**
     * Removes all elements of the crosshair.
     *
     * @method destroy
     */
    destroy: function() {
        if(this.graphic) {
            this.graphic.destroy();
        }
    }
};
