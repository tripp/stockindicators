/**
 * Provides functionality for creating a canvasOHLC series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasOHLCSeries class renders lines representing the open, high, low and close
 * values for a chart.
 *
 * @class CanvasOHLCSeries
 * @extends OHLCSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasOHLCSeries = Y.Base.create("canvasOHLCSeries", Y.OHLCSeries, [Y.CanvasSeriesImpl], {
    /**
     * Draws markers for an OHLC series.
     *
     * @method
     * @param {Array} xcoords The xcoordinates to be plotted.
     * @param {Array} opencoords The coordinates representing the open values.
     * @param {Array} highcoords The coordinates representing the high values.
     * @param {Array} lowcoords The coordinates representing the low values.
     * @param {Array} closecoords The coordinates representing the close values.
     * @param {Number} len The number of x coordinates to plot.
     * @param {Number} width The width of each ohlc marker.
     * @param {Number} halfwidth Half the width of each ohlc marker.
     * @param {Object} styles The styles for the series.
     * @private
     */
    _drawMarkers: function(xcoords, opencoords, highcoords, lowcoords, closecoords, len, width, halfwidth, styles)
    {
        var upmarker = this.get("upmarker"),
            downmarker = this.get("downmarker"),
            opencoord,
            highcoord,
            lowcoord,
            closecoord,
            left,
            right,
            leftPadding = styles.padding.left,
            context,
            up,
            cx,
            i,
            height,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            upContext = upmarker.context,
            downContext = downmarker.context,
            upStyles = styles.upmarker.stroke,
            downStyles = styles.downmarker.stroke,
            upColor = upStyles.color,
            upAlpha = upStyles.alpha,
            downColor = downStyles.color,
            downAlpha = downStyles.alpha;

        upmarker.canvas.width = canvasWidth;
        upmarker.canvas.height = canvasHeight;
        downmarker.canvas.width = canvasWidth;
        downmarker.canvas.height = canvasHeight;

        this._clearPaths(upmarker);
        this._clearPaths(downmarker);

        upContext.lineWidth = upStyles.weight;
        upContext.strokeStyle = Y.Lang.isNumber(upAlpha) ? this._toRGBA(upColor, upAlpha) : upColor;
        downContext.lineWidth = downStyles.weight;
        downContext.strokeStyle = Y.Lang.isNumber(downAlpha) ? this._toRGBA(downColor, downAlpha) : downColor;
        for(i = 0; i < len; i = i + 1)
        {
            cx = xcoords[i] + leftPadding;
            left = cx - halfwidth;
            right = cx + halfwidth;
            opencoord = opencoords[i];
            highcoord = highcoords[i];
            lowcoord = lowcoords[i];
            closecoord = closecoords[i];
            up = opencoord > closecoord;
            height = lowcoord - highcoord;
            context = up ? upContext : downContext;
            context.moveTo(left, opencoord);
            context.lineTo(cx, opencoord);
            context.moveTo(cx, highcoord);
            context.lineTo(cx, lowcoord);
            context.moveTo(cx, closecoord);
            context.lineTo(right, closecoord);
        }

        upContext.stroke();
        downContext.stroke();
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
        return ["upmarker", "downmarker"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default canvasOHLC
         */
        type: {
            value: "canvasOHLC"
        }
    }
});

