/**
 * Provides logic for an intraday axis.
 *
 * @module gallery-charts-stockindicators
 * @class IntradayAxisBase
 * @extends CategoryAxisBase
 * @constructor
 */
Y.IntradayAxisBase = function() {
    Y.IntradayAxisBase.superclass.constructor.apply(this, arguments);
};

Y.IntradayAxisBase.NAME = "intradayAxisBase";

Y.extend(Y.IntradayAxisBase, Y.CategoryAxisBase, {
    /**
     * Getter method for maximum attribute.
     *
     * @method _maximumGetter
     * @return Number
     * @private
     */
    _maximumSetter: function(val) {
        var max = val,
            dataGranularity = this.get("dataGranularity"),
            interval,
            allData = this.get("dataProvider"),
            last = allData[allData.length - 1].Timestamp;
        if(dataGranularity) {
            interval = parseFloat(dataGranularity) * 60000;
            max = new Date(max).valueOf();
            last = new Date(last).valueOf();

            if(max > last) {
                while(max > last) {
                    last = last + interval;
                    allData.push({Timestamp: last});
                }
                this.set("dataProvider", allData);
            }
        }
    }
}, {
    ATTRS: {
        /**
         * The granularity of the data in the axis.
         *
         * @attribute dataGranularity
         * @type String
         */
        dataGranularity: {
            lazyAdd: false
        }
    }
});

