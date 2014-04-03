/**
 * Provides functionality for drawing fills in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing area fills.
 *
 * @class CanvasFills
 * @extends Fills
 * @constructor
 */
Y.CanvasFills = function() {};
Y.extend(Y.CanvasFills, Y.Fills, {
    /**
     * Draws fill
     *
     * @method drawFill
     * @param {Array} xcoords The x-coordinates for the series.
     * @param {Array} ycoords The y-coordinates for the series.
     * @protected
     */
    drawFill: function(xcoords, ycoords)
    {
        if(xcoords.length < 1)
        {
            return;
        }
        var isNumber = Y.Lang.isNumber,
            len = xcoords.length,
            firstX = xcoords[0],
            firstY = ycoords[0],
            lastValidX = firstX,
            lastValidY = firstY,
            nextX,
            nextY,
            pointValid,
            noPointsRendered = true,
            i = 0,
            styles = this.get("styles").area,
            path = this.get("areaPath"),
            color = styles.color || this._getDefaultColor(this.get("graphOrder"), "slice"),
            alpha = styles.alpha,
            context = path.context,
            width = this.get("width"),
            height = this.get("height");
        path.canvas.width = width;
        path.canvas.height = height;
        this._clearPaths(path);
        context.fillStyle = isNumber(alpha) ? this._toRGBA(color, alpha) : color;
        context.beginPath();
        for(; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                continue;
            }
            if(noPointsRendered)
            {
                this._firstValidX = nextX;
                this._firstValidY = nextY;
                noPointsRendered = false;
                context.moveTo(nextX, nextY);
            }
            else
            {
                context.lineTo(nextX, nextY);
            }
            lastValidX = nextX;
            lastValidY = nextY;
        }
        this._lastValidX = lastValidX;
        this._lastValidY = lastValidY;
        context.closePath();
        context.fill();
    }
});
