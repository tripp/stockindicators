/**
 * Provides functionality for creating a canvas implementation of a Column series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * The CanvasColumnSeries class renders columns positioned horizontally along a category or time axis. The columns'
 * lengths are proportional to the values they represent along a vertical axis.
 * and the relevant data points.
 *
 * @class CanvasColumnSeries
 * @extends ColumnSeries
 * @uses CanvasSeriesImpl
 * @constructor
 * @param {Object} config (optional) Configuration parameters.
 */
Y.CanvasColumnSeries = Y.Base.create("canvasColumnSeries", Y.ColumnSeries, [Y.CanvasSeriesImpl], {
    /**
     * Returns a the name of the attributes that reference path
     * objects.
     *
     * @method _getPathAttrs
     * @return Array
     * @private
     */
    _getPathAttrs: function() {
        return ["columnPath"];
    },

    /**
     * Draws lines for the series.
     *
     * @method drawSeries
     * @private
     */
    drawSeries: function() {
        var isNumber = Y.Lang.isNumber,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            xcoord,
            ycoord,
            styles = this._copyObject(this.get("styles").marker),
            i,
            len = xcoords.length,
            left,
            top = ycoords[0],
            path = this.get("columnPath"),
            context = path.context,
            canvas = path.canvas,
            width = styles.width,
            halfWidth = width/2,
            height,
            fill = styles.fill,
            fillColor = fill.color,
            fillAlpha = fill.alpha,
            stroke = styles.border,
            strokeColor = stroke.color,
            strokeWeight = stroke.weight,
            strokeAlpha = stroke.alpha,
            drawFill = (fill && fillColor),
            drawStroke = (stroke && strokeWeight && strokeColor),
            origin = this._bottomOrigin,
            shapeDrawn = false;
        this._clearPaths(path);
        canvas.width = this.get("width");
        canvas.height = this.get("height");
        if(drawFill) {
            context.fillStyle = isNumber(fillAlpha) ? this._toRGBA(fillColor, fillAlpha) : fillColor;
        }
        if(drawStroke) {
            context.strokeStyle = isNumber(strokeAlpha) ? this._toRGBA(strokeColor, strokeAlpha) : strokeColor;
            context.lineWidth = strokeWeight;
        }
        context.beginPath();
        for(i = 0; i < len; i = i + 1) {
            xcoord = parseFloat(xcoords[i]);
            ycoord = parseFloat(ycoords[i]);
            left = xcoord - halfWidth;
            if(origin >= ycoord) {
                top = ycoord;
                height = origin - top;
            } else {
                top = origin;
                height = ycoord - origin;
            }
            if(isNumber(left) && isNumber(top) && isNumber(width) && isNumber(height)) {
                shapeDrawn = true;
                context.moveTo(left, top);
                context.lineTo(left + width, top);
                context.lineTo(left + width, top + height);
                context.lineTo(left, top + height);
                context.lineTo(left, top);
            }

        }
        if(shapeDrawn) {
            if(drawFill) {
                context.closePath();
                context.fill();
            }
            if(drawStroke) {
                context.stroke();
            }
        }
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @default canvasColumn
         */
        type: "canvasColumn"
    }
});
