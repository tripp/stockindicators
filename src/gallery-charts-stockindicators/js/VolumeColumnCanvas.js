/**
 * Canvas implementation of a volume based column chart.
 *
 * @module gallery-charts-stockindicators
 * @class VolumeColumnCanvas
 * @extends VolumeColumn
 * @uses CanvasSeriesImpl
 * @constructor
 */
Y.VolumeColumnCanvas = Y.Base.create("volumeColumnCanvas", Y.VolumeColumn, [Y.CanvasSeriesImpl],  {
    drawSeries: function() {
        var valueData = this.get("yAxis").get("dataProvider"),
            xcoords = this.get("xcoords"),
            volumeCoords = this.get("ycoords"),
            upPath = this.get("upPath"),
            downPath = this.get("downPath"),
            len = xcoords.length,
            styles = this.get("styles"),
            padding = styles.padding,
            dataWidth = this.get("width") - (padding.left + padding.right),
            width = this._calculateMarkerWidth(dataWidth, len, styles.spacing),
            halfwidth = width/2,
            previousClose = this.get("previousClose");
        styles.upPath.fill.opacity = styles.upPath.fill.alpha;
        styles.downPath.fill.opacity = styles.downPath.fill.alpha;
        this._drawColumns(upPath, downPath, styles, valueData, previousClose, xcoords, volumeCoords, width, halfwidth);
    },

    /**
     * Draws the columns.
     *
     * @method _drawColumns
     * @private
     */
    _drawColumns: function(
        upPath,
        downPath,
        styles,
        valueData,
        previousClose,
        xcoords,
        volumeCoords,
        width,
        halfwidth
    ) {
        var bottomOrigin = this._bottomOrigin,
            top,
            left,
            height,
            selectedPath,
            i,
            len = xcoords.length,
            hasUpPath = false,
            hasDownPath = false,
            canvasWidth = this.get("width"),
            canvasHeight = this.get("height"),
            x = this.get("x"),
            y = this.get("y");

        upPath.canvas.style.left = x + "px";
        upPath.canvas.style.top = y + "px";
        downPath.canvas.style.left = x + "px";
        downPath.canvas.style.top = y + "px";
        upPath.canvas.width = canvasWidth;
        upPath.canvas.height = canvasHeight;
        downPath.canvas.width = canvasWidth;
        downPath.canvas.height = canvasHeight;
        upPath.context.fillStyle = styles.upPath.fill.color;
        downPath.context.fillStyle = styles.downPath.fill.color;
        upPath.context.strokeStyle = styles.upPath.stroke.color;
        downPath.context.strokeStyle = styles.downPath.stroke.color;
        upPath.context.lineWidth = styles.upPath.stroke.weight;
        downPath.context.lineWidth = styles.downPath.stroke.weight;
        upPath.context.clearRect(0, 0, canvasWidth, canvasHeight);
        downPath.context.clearRect(0, 0, canvasWidth, canvasHeight);
        for(i = 0; i < len; i = i + 1) {
            if(previousClose && valueData[i].close < previousClose) {
                selectedPath = downPath.context;
                hasDownPath = true;
            } else {
                selectedPath = upPath.context;
                hasUpPath = true;
            }
            left = xcoords[i] - halfwidth;
            top = volumeCoords[i];
            height = bottomOrigin - top;
            if(height > 0 && !isNaN(left) && !isNaN(top)) {
                selectedPath.moveTo(left, top);
                selectedPath.lineTo(left + width, top);
                selectedPath.lineTo(left + width, top + height);
                selectedPath.lineTo(left, top + height);
                selectedPath.lineTo(left, top);
            }
            previousClose = valueData[i].close;
        }
        if(hasUpPath) {
            upPath.context.closePath();
            upPath.context.fill();
        }
        if(hasDownPath) {
            downPath.context.closePath();
            downPath.context.fill();
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
        return ["upPath", "downPath"];
    }
}, {
    ATTRS: {
        /**
         * Read-only attribute indicating the type of series.
         *
         * @attribute type
         * @type String
         * @readOnly
         * @default volumeColumnCanvas
         */
        type: {
            value: "volumeColumnCanvas"
        }
    }
});
