/**
 * Provides functionality for a canvas numeric axis.
 *
 * @module gallery-charts-stockindicators
 */
/**
 * Canvas implementation of a numeric axis.
 *
 * @class NumericCanvasAxis
 * @extends CanvasAxis
 * @uses NumericImpl
 * @uses NumericAxis
 * @constructor
 */
Y.NumericCanvasAxis = Y.Base.create("numericCanvasAxis", Y.CanvasAxis, [Y.NumericImpl], Y.NumericAxis.prototype);
