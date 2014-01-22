/**
 * Allows for the creation of a visualization based on financial
 * indicators..
 *
 * @module gallery-charts-stockindicators
 */
var defaultAxisLabelFormat = {
    value: null
};

Y.CategoryAxisBase.ATTRS.labelFormat = defaultAxisLabelFormat;
Y.CategoryAxis.ATTRS.labelFormat = defaultAxisLabelFormat;
//patch CartesianSeries destructor bug
Y.CartesianSeries.prototype.destructor = function() {
    if(this.get("rendered"))
    {
        if(this._xDataReadyHandle)
        {
            this._xDataReadyHandle.detach();
        }
        if(this._xDataUpdateHandle)
        {
            this._xDataUpdateHandle.detach();
        }
        if(this._yDataReadyHandle)
        {
            this._yDataReadyHandle.detach();
        }
        if(this._yDataUpdateHandle)
        {
            this._yDataUpdateHandle.detach();
        }
        if(this._xAxisChangeHandle)
        {
            this._xAxisChangeHandle.detach();
        }
        if(this._yAxisChangeHandle)
        {
            this._yAxisChangeHandle.detach();
        }
    }
};

if(Y.VMLShape) {
    Y.VMLShape.ATTRS.stroke.setter = function(val) {
        var i,
            stroke,
            wt,
            tmpl = this.get("stroke") || this._getDefaultStroke();
        if(val)
        {
            if(val.hasOwnProperty("weight"))
            {
                wt = parseInt(val.weight, 10);
                if(!isNaN(wt))
                {
                    val.weight = wt;
                }
            }
            for(i in val)
            {
                if(val.hasOwnProperty(i))
                {
                    tmpl[i] = val[i];
                }
            }
        }
        if(tmpl.color && tmpl.color.toLowerCase().indexOf("rgba") > -1)
        {
           tmpl.opacity = Y.Color._getAlpha(tmpl.color);
           tmpl.color =  Y.Color.toHex(tmpl.color);
        }
        stroke = tmpl;
        this._strokeFlag = true;
        return stroke;
    };
    Y.VMLShape.ATTRS.fill.setter = function(val) {
        var i,
            fill,
            tmpl = this.get("fill") || this._getDefaultFill();

        if(val)
        {
            //ensure, fill type is solid if color is explicitly passed.
            if(val.hasOwnProperty("color"))
            {
                val.type = "solid";
            }
            for(i in val)
            {
                if(val.hasOwnProperty(i))
                {
                    tmpl[i] = val[i];
                }
            }
        }
        fill = tmpl;
        if(fill && fill.color)
        {
            if(fill.color === undefined || fill.color === "none")
            {
                fill.color = null;
            }
            else
            {
                if(fill.color.toLowerCase().indexOf("rgba") > -1)
                {
                    fill.opacity = Y.Color._getAlpha(fill.color);
                    fill.color =  Y.Color.toHex(fill.color);
                }
            }
        }
        this._fillFlag = true;
        return fill;
    };
}

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
            len = series.length;
        yline = graphic.addShape({
            shapeRendering: "crispEdges",
            type: "path",
            stroke: category.stroke
        }).moveTo(0, 0).lineTo(0, height).end();
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
                        stroke: graph.stroke,
                        fill: graph.fill
                    }).moveTo(0, 0).lineTo(width, 0).end();
                }
                if(graph.marker) {
                    graph.marker.y = graph.marker.height/-2;
                    graph.marker.x = graph.marker.width/-2;
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
                    graph.marker.set("transform", "translate(" + x + ", " + y + ")");
                }
                if(graph.line) {
                    graph.line.set("transform", "translate(" + x + ", " + y + ")");
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
        var series = this._series,
            yline = this._yline,
            graph,
            i,
            len;
        if(series) {
            len = series.length;
            for(i = 0; i < len; i = i + 1) {
                graph = series[i];
                if(graph.marker) {
                    graph.marker.get("graphic").destroy();
                }
                if(graph.line) {
                    graph.line.get("graphic").destroy();
                }
                if(yline) {
                    yline.get("graphic").destroy();
                }
            }
        }
    }
};
