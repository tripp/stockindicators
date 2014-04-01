/**
 * Provides functionality for a canvas category axis.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Canvas implementation of a category axis.
 *
 * @class CategoryCanvasAxis
 * @extends CanvasAxis
 * @uses CategoryImpl
 * @uses CategoryAxis
 * @constructor
 */
Y.CategoryCanvasAxis = Y.Base.create("categoryCanvasAxis", Y.CanvasAxis, [Y.CategoryImpl], Y.CategoryAxis.prototype, {
    ATTRS: {
        labelFormat: {}
    }
});
