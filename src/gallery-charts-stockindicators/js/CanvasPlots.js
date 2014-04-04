/**
 * Provides functionality for drawing plots in a series.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Utility class used for drawing plots.
 *
 * @class CanvasPlots
 * @extends Plots
 * @constructor
 */
Y.CanvasPlots = function() {};
Y.extend(Y.CanvasPlots, Y.Plots, {
    /*
     * Draws plots for the series.
     *
     * @method drawPlots
     * @protected
     */
    drawPlots: function() {
        if(!this.get("xcoords") || this.get("xcoords").length < 1)
		{
			return;
		}
        var isNumber = Y.Lang.isNumber,
            styles = this._copyObject(this.get("styles").marker),
            w = styles.width,
            h = styles.height,
            xcoords = this.get("xcoords"),
            ycoords = this.get("ycoords"),
            i,
            len = xcoords.length,
            top = ycoords[0],
            left,
            offsetWidth = w/2,
            offsetHeight = h/2,
            shapeMethod = this._getShapeMethod(styles.shape),
            path = this.get("markerPath"),
            context = path.context,
            canvas = path.canvas,
            shapeDrawn = false,
            fill = styles.fill,
            fillColor = styles.fill.color,
            fillAlpha = styles.fill.alpha,
            stroke = styles.border,
            strokeColor = stroke.color,
            strokeWeight = stroke.weight,
            strokeAlpha = stroke.alpha,
            drawFill = fill && fillColor,
            drawStroke = stroke && strokeWeight && strokeColor;
        this._clearPaths(path);
        canvas.width = this.get("width");
        canvas.height = this.get("height");
        if(shapeMethod) {
            if(drawFill) {
                context.fillStyle = isNumber(fillAlpha) ? this._toRGBA(fillColor, fillAlpha) : fillColor;
            }
            if(drawStroke) {
                context.strokeStyle = isNumber(strokeAlpha) ? this._toRGBA(strokeColor, strokeAlpha) : strokeColor;
                context.lineWidth = strokeWeight;
            }
            context.beginPath();
            for(i = 0; i < len; i = i + 1) {
                top = parseFloat(ycoords[i] - offsetHeight);
                left = parseFloat(xcoords[i] - offsetWidth);
                if(isNumber(left) && isNumber(top))
                {
                    shapeDrawn = true;
                    context = shapeMethod(context, left, top, w, h);
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
    },

    /**
     * Returns a method to draw a specified shape.
     *
     * @method _getShapeMethod
     * @param {String} shape The shape to be drawn.
     * @return Function
     * @private
     */
    _getShapeMethod: function(shape) {
        var shapes = {
                rect: this._drawRect,
                circle: this._drawCircleByCircumference,
                ellipse: this._drawEllipse
            };
        return shapes[shape];
    }
});
