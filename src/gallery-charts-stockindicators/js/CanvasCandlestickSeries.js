/**
 * Provides functionality for creating a canvas implementation of a Candlestick series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasCandlestickSeries class renders columns (candles) and lines (wicks) representing the open, high, low and close
 * values for a chart.
 *
 * @class CanvasCandlestickSeries
 * @extends CandlestickSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasCandlestickSeries = Y.Base.create("canvasCandlestickSeries", Y.CandlestickSeries, [Y.CanvasSeriesImpl], {
    /**
     * Draws markers for an Candlestick series.
     *
     * @method
     * @param {Array} xcoords The xcoordinates to be plotted.
     * @param {Array} opencoords The coordinates representing the open values.
     * @param {Array} highcoords The coordinates representing the high values.
     * @param {Array} lowcoords The coordinates representing the low values.
     * @param {Array} closecoords The coordinates representing the close values.
     * @param {Number} len The number of x coordinates to plot.
     * @param {Number} width The width of each candlestick marker.
     * @param {Number} halfwidth Half the width of each candlestick marker.
     * @param {Object} styles The styles for the series.
     * @private
     */
    _drawMarkers: function(xcoords, opencoords, highcoords, lowcoords, closecoords, len, width, halfwidth, styles)
    {
        var upcandle = this.get("upcandle"),
            downcandle = this.get("downcandle"),
            candle,
            wick = this.get("wick"),
            wickStyles = styles.wick,
            wickWidth = wickStyles.width,
            hasUpCandle = false,
            hasDownCandle = false,
            hasWick = false,
            cx,
            opencoord,
            highcoord,
            lowcoord,
            closecoord,
            left,
            right,
            top,
            bottom,
            height,
            leftPadding = styles.padding.left,
            up,
            i,
            isNumber = Y.Lang.isNumber,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            x = this.get("x"),
            y = this.get("y");
        upcandle.canvas.style.left = x + "px";
        upcandle.canvas.style.top = y + "px";
        downcandle.canvas.style.left = x + "px";
        downcandle.canvas.style.top = y + "px";
        wick.canvas.style.left = x + "px";
        wick.canvas.style.top = y + "px";

        upcandle.canvas.width = canvasWidth;
        upcandle.canvas.height = canvasHeight;
        downcandle.canvas.width = canvasWidth;
        downcandle.canvas.height = canvasHeight;
        wick.canvas.width = canvasWidth;
        wick.canvas.height = canvasHeight;

        upcandle.context.fillStyle = styles.upcandle.fill.color;
        downcandle.context.fillStyle = styles.downcandle.fill.color;
        upcandle.context.strokeStyle = styles.upcandle.stroke.color;
        downcandle.context.strokeStyle = styles.downcandle.stroke.color;
        upcandle.context.lineWidth = styles.upcandle.stroke.weight;
        downcandle.context.lineWidth = styles.downcandle.stroke.weight;
        wick.context.fillStyle = styles.wick.fill.color;
        wick.context.lineWidth = styles.wick.stroke.weight;

        upcandle.context.clearRect(0, 0, canvasWidth, canvasHeight);
        downcandle.context.clearRect(0, 0, canvasWidth, canvasHeight);
        wick.context.clearRect(0, 0, canvasWidth, canvasHeight);

        for(i = 0; i < len; i = i + 1)
        {
            cx = Math.round(xcoords[i] + leftPadding);
            left = cx - halfwidth;
            right = cx + halfwidth;
            opencoord = Math.round(opencoords[i]);
            highcoord = Math.round(highcoords[i]);
            lowcoord = Math.round(lowcoords[i]);
            closecoord = Math.round(closecoords[i]);
            up = opencoord > closecoord;
            if(up) {
                top = closecoord;
                bottom = opencoord;
                candle = upcandle;
                hasUpCandle = true;
            } else {
                top = opencoord;
                bottom = closecoord;
                candle = downcandle;
                hasDownCandle = true;
            }
            height = bottom - top;
            if(candle && isNumber(left) && isNumber(top) && isNumber(width) && isNumber(height))
            {
                candle.context = this._drawRect(candle.context, left, top, width, height);
            }
            if(isNumber(cx) && isNumber(highcoord) && isNumber(lowcoord))
            {
                hasWick = true;
                wick.context = this._drawRect(wick.context, cx - wickWidth/2, highcoord, wickWidth, lowcoord - highcoord);
            }
        }
        if(hasUpCandle) {
            upcandle.context.closePath();
            upcandle.context.fill();
        }
        if(hasDownCandle) {
            downcandle.context.closePath();
            downcandle.context.fill();
        }
        if(hasWick) {
            wick.context.closePath();
            wick.context.fill();
        }
    },

    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["wick", "upcandle", "downcandle"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default canvasCandlestick
         */
        type: {
            value: "canvasCandlestick"
        }
    }
});

