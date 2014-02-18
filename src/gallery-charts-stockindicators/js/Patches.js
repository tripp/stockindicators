    var WINDOW = Y.config.win,
        DOCUMENT = Y.config.doc;
    Y.Axis.prototype.getLabel = function(styles)
    {
        var i,
            label,
            labelCache = this._labelCache,
            customStyles = {
                rotation: "rotation",
                margin: "margin",
                alpha: "alpha",
                align: "align"
            };
        if(labelCache && labelCache.length > 0)
        {
            label = labelCache.shift();
        }
        else
        {
            label = DOCUMENT.createElement("span");
            label.className = Y.Lang.trim([label.className, "axisLabel"].join(' '));
            this.get("contentBox").append(label);
        }
        if(!DOCUMENT.createElementNS)
        {
            if(label.style.filter)
            {
                label.style.filter = null;
            }
        }
        label.style.display = "block";
        label.style.whiteSpace = "nowrap";
        label.style.position = "absolute";
        for(i in styles)
        {
            if(styles.hasOwnProperty(i) && !customStyles.hasOwnProperty(i))
            {
                label.style[i] = styles[i];
            }
        }
        return label;
    };
   
    Y.Axis.prototype._setCanvas = function() {
        var cb = this.get("contentBox"),
            bb = this.get("boundingBox"),
            p = this.get("position"),
            pn = this._parentNode,
            w = this.get("width"),
            h = this.get("height");
        bb.setStyle("position", "absolute");
        w = w ? w + "px" : pn.getStyle("width");
        h = h ? h + "px" : pn.getStyle("height");
        if(p === "top" || p === "bottom")
        {
            cb.setStyle("width", w);
        }
        else
        {
            cb.setStyle("height", h);
        }
        cb.setStyle("position", "relative");
        cb.setStyle("left", "0px");
        cb.setStyle("top", "0px");
        this.set("graphic", new Y.Graphic());
        this.get("graphic").render(cb);
    };

    Y.LeftAxisLayout.prototype.positionLabel = function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("leftTickOffset"),
            totalTitleSize = this._totalTitleSize,
            leftOffset = pt.x + totalTitleSize - tickOffset,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelStyles = styles.label,
            maxLabelSize = host._maxLabelSize,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(rot === 0)
        {
            leftOffset -= labelWidth;
            if(labelStyles.align && labelStyles.align === "left") {
                leftOffset -= maxLabelSize - labelWidth;
            }
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else
        {
            leftOffset -= labelWidth + (labelHeight * absRot/360);
            topOffset -= labelHeight * offset;
        }
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(maxLabelSize + leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    };

    Y.RightAxisLayout.prototype.positionLabel = function(label, pt, styles, i)
    {
        var host = this,
            offset = parseFloat(styles.label.offset),
            tickOffset = host.get("rightTickOffset"),
            labelStyles = styles.label,
            margin = 0,
            leftOffset = pt.x,
            topOffset = pt.y,
            props = this._labelRotationProps,
            rot = props.rot,
            absRot = props.absRot,
            labelWidth = this._labelWidths[i],
            labelHeight = this._labelHeights[i];
        if(labelStyles.margin && labelStyles.margin.left)
        {
            margin = labelStyles.margin.left;
        }
        if(rot === 0)
        {
            if(labelStyles.align === "right") {
                leftOffset += host._maxLabelSize - labelWidth;
            }
            topOffset -= labelHeight * offset;
        }
        else if(rot === 90)
        {
            leftOffset -= labelWidth * 0.5;
            topOffset = topOffset - labelHeight + labelWidth/2 - (labelWidth * offset);
        }
        else if(rot === -90)
        {
            topOffset = topOffset + labelWidth/2 - (labelWidth * offset);
            leftOffset -= labelWidth * 0.5;
        }
        else
        {
            topOffset -= labelHeight * offset;
            leftOffset += labelHeight/2 * absRot/90;
        }
        leftOffset += margin;
        leftOffset += tickOffset;
        props.labelWidth = labelWidth;
        props.labelHeight = labelHeight;
        props.x = Math.round(leftOffset);
        props.y = Math.round(topOffset);
        this._rotate(label, props);
    };
 
