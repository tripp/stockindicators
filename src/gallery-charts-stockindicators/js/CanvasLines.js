/**
 * Provides functionality for drawing lines in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing lines.
 *
 * @class CanvasLines
 * @extends Lines
 * @constructor
 */
Y.CanvasLines = function() {};
Y.extend(Y.CanvasLines, Y.Lines, {
    /*
     * Draws lines for the series.
     *
     * @method drawLines
     * @protected
     */
    drawLines: function()
    {
        if(this.get("xcoords").length < 1)
        {
            return;
        }
        var isNumber = Y.Lang.isNumber,
            xcoords,
            ycoords,
            direction = this.get("direction"),
            len,
            lastPointValid,
            pointValid,
            noPointsRendered = true,
            lastValidX,
            lastValidY,
            nextX,
            nextY,
            i,
            styles = this.get("styles").line,
            lineType = styles.lineType,
            lc = styles.color || this._getDefaultColor(this.get("graphOrder"), "line"),
            lineAlpha = styles.alpha,
            dashLength = styles.dashLength,
            gapSpace = styles.gapSpace,
            connectDiscontinuousPoints = styles.connectDiscontinuousPoints,
            discontinuousType = styles.discontinuousType,
            discontinuousDashLength = styles.discontinuousDashLength,
            discontinuousGapSpace = styles.discontinuousGapSpace,
            path = this.get("linePath"),
            context = path.context,
            width = this.get("width"),
            height = this.get("height");
        path.canvas.width = width;
        path.canvas.height = height;
        if(this._stacked)
        {
            xcoords = this.get("stackedXCoords");
            ycoords = this.get("stackedYCoords");
        }
        else
        {
            xcoords = this.get("xcoords");
            ycoords = this.get("ycoords");
        }
        len = direction === "vertical" ? ycoords.length : xcoords.length;
        this._clearPaths(path);
        context.strokeStyle = isNumber(lineAlpha) ? this._toRGBA(lc, lineAlpha) : lc;
        context.lineWidth = styles.weight;
        for(i = 0; i < len; i = ++i)
        {
            nextX = xcoords[i];
            nextY = ycoords[i];
            pointValid = isNumber(nextX) && isNumber(nextY);
            if(!pointValid)
            {
                lastPointValid = pointValid;
                continue;
            }
            if(noPointsRendered)
            {
                noPointsRendered = false;
                context.moveTo(nextX, nextY);
            }
            else if(lastPointValid)
            {
                if(lineType !== "dashed")
                {
                    context.lineTo(nextX, nextY);
                }
                else
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                dashLength,
                                                gapSpace);
                }
            }
            else if(!connectDiscontinuousPoints)
            {
                context.moveTo(nextX, nextY);
            }
            else
            {
                if(discontinuousType !== "solid")
                {
                    this.drawDashedLine(path, lastValidX, lastValidY, nextX, nextY,
                                                discontinuousDashLength,
                                                discontinuousGapSpace);
                }
                else
                {
                    context.lineTo(nextX, nextY);
                }
            }
            lastValidX = nextX;
            lastValidY = nextY;
            lastPointValid = true;
        }
        context.stroke();
    },

    /**
     * Draws a dashed line between two points.
     *
     * @method drawDashedLine
     * @param {Object} path Reference to the object in which the line will be drawn.
     * @param {Number} xStart	The x position of the start of the line
     * @param {Number} yStart	The y position of the start of the line
     * @param {Number} xEnd		The x position of the end of the line
     * @param {Number} yEnd		The y position of the end of the line
     * @param {Number} dashSize	the size of dashes, in pixels
     * @param {Number} gapSize	the size of gaps between dashes, in pixels
     * @private
     */
    drawDashedLine: function(path, xStart, yStart, xEnd, yEnd, dashSize, gapSize) {
        var context = path.context;
        Y.CanvasLines.superclass.drawDashedLine.apply(this, [
            context,
            xStart,
            yStart,
            xEnd,
            yEnd,
            dashSize,
            gapSize
        ]);
    },

    /**
     * Executes moveTo.
     *
     * @method _moveTo
     * @param {Object} Object containing a reference to the canvas and context.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _moveTo: function(path, x, y) {
        path.context.moveTo(x, y);
    },

    /**
     * Draws a line.
     *
     * @method _lineTo
     * @param {Object} Object containing a reference to the canvas and context.
     * @param {Number} x The x coordinate.
     * @param {Number} y The y coordinate.
     * @private
     */
    _lineTo: function(path, x, y) {
        path.context.lineTo(x, y);
    },

    /**
     * Closes path instances.
     *
     * @method _endPaths
     * @param {Path|Array} path A path element or an array of path elements.
     * @private
     */
    _endPaths: function(path) {
        var i,
            len;
        if(Y.Lang.isArray(path)) {
            len = path.length;
            for(i = 0; i < len; i = i + 1) {
                path[i].context.lineWidth = path[i].lineWidth;
                path[i].context.strokeStyle = path[i].strokeStyle;
                path[i].context.stroke();
            }
        } else {
            path.context.lineWidth = path.lineWidth;
            path.context.strokeStyle = path.strokeStyle;
            path.context.stroke();
        }
    }
});
