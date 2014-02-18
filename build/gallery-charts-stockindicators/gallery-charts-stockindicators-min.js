YUI.add("gallery-charts-stockindicators",function(e,t){function i(){this.init.apply(this,arguments)}var n=e.config.win,r=e.config.doc;e.Axis.prototype.getLabel=function(t){var n,i,s=this._labelCache,o={rotation:"rotation",margin:"margin",alpha:"alpha",align:"align"};s&&s.length>0?i=s.shift():(i=r.createElement("span"),i.className=e.Lang.trim([i.className,"axisLabel"].join(" ")),this.get("contentBox").append(i)),r.createElementNS||i.style.filter&&(i.style.filter=null),i.style.display="block",i.style.whiteSpace="nowrap",i.style.position="absolute";for(n in t)t.hasOwnProperty(n)&&!o.hasOwnProperty(n)&&(i.style[n]=t[n]);return i},e.Axis.prototype._setCanvas=function(){var t=this.get("contentBox"),n=this.get("boundingBox"),r=this.get("position"),i=this._parentNode,s=this.get("width"),o=this.get("height");n.setStyle("position","absolute"),s=s?s+"px":i.getStyle("width"),o=o?o+"px":i.getStyle("height"),r==="top"||r==="bottom"?t.setStyle("width",s):t.setStyle("height",o),t.setStyle("position","relative"),t.setStyle("left","0px"),t.setStyle("top","0px"),this.set("graphic",new e.Graphic),this.get("graphic").render(t)},e.LeftAxisLayout.prototype.positionLabel=function(e,t,n,r){var i=this,s=parseFloat(n.label.offset),o=i.get("leftTickOffset"),u=this._totalTitleSize,a=t.x+u-o,f=t.y,l=this._labelRotationProps,c=l.rot,h=l.absRot,p=n.label,d=i._maxLabelSize,v=this._labelWidths[r],m=this._labelHeights[r];c===0?(a-=v,p.align&&p.align==="left"&&(a-=d-v),f-=m*s):c===90?(a-=v*.5,f=f+v/2-v*s):c===-90?(a-=v*.5,f=f-m+v/2-v*s):(a-=v+m*h/360,f-=m*s),l.labelWidth=v,l.labelHeight=m,l.x=Math.round(d+a),l.y=Math.round(f),this._rotate(e,l)},e.RightAxisLayout.prototype.positionLabel=function(e,t,n,r){var i=this,s=parseFloat(n.label.offset),o=i.get("rightTickOffset"),u=n.label,a=0,f=t.x,l=t.y,c=this._labelRotationProps,h=c.rot,p=c.absRot,d=this._labelWidths[r],v=this._labelHeights[r];u.margin&&u.margin.left&&(a=u.margin.left),h===0?(u.align==="right"&&(f+=i._maxLabelSize-d),l-=v*s):h===90?(f-=d*.5,l=l-v+d/2-d*s):h===-90?(l=l+d/2-d*s,f-=d*.5):(l-=v*s,f+=v/2*p/90),f+=a,f+=o,c.labelWidth=d,c.labelHeight=v,c.x=Math.round(f),c.y=Math.round(l),this._rotate(e,c)},e.IntradayAxis=function(){e.IntradayAxis.superclass.constructor.apply(this,arguments)},e.IntradayAxis.ATTRS={dataGranularity:{lazyAdd:!1}},e.IntradayAxis.NAME="intradayAxis",e.extend(e.IntradayAxis,e.CategoryAxis,{_maximumSetter:function(e){var t=e,n=this.get("dataGranularity"),r,i=this.get("dataProvider"),s=i[i.length-1].Timestamp;if(n){r=parseFloat(n)*6e4,t=(new Date(t)).valueOf(),s=(new Date(s)).valueOf();if(t>s){while(t>s)s+=r,i.push({Timestamp:s});this.set("dataProvider",i)}}}}),e.VolumeColumn=function(){e.VolumeColumn.superclass.constructor.apply(this,arguments)},e.VolumeColumn.NAME="volumeColumn",e.extend(e.VolumeColumn,e.RangeSeries,{drawSeries:function(){var e=this.get("yAxis").get("dataProvider"),t=this.get("xcoords"),n=this.get("ycoords"),r=this.get("upPath"),i=this.get("downPath"),s=t.length,o,u=this.get("styles"),a=u.padding,f=this.get("width")-(a.left+a.right),l=this._calculateMarkerWidth(f,s,u.spacing),c=l/2,h=this._bottomOrigin,p,d,v,m,g=this.get("previousClose"),y=!1,b=!1,w=u.drawInBackground;u.upPath.fill.opacity=u.upPath.fill.alpha,u.downPath.fill.opacity=u.downPath.fill.alpha,r.set(u.upPath),i.set(u.downPath),w&&(r.toBack(),i.toBack()),r.clear(),i.clear();for(o=0;o<s;o+=1)g&&e[o].close<g?(m=i,b=!0):(m=r,y=!0),d=t[o]-c,p=n[o],v=h-p,v>0&&!isNaN(d)&&!isNaN(p)&&m.drawRect(d,p,l,v),g=e[o].close;y&&r.end(),b&&i.end()},_toggleVisible:function(e){this.get("upPath").set("visible",e),this.get("downPath").set("visible",e)},_getDefaultStyles:function(){var t={upPath:{shapeRendering:"crispEdges",fill:{color:"#00aa00",alpha:1},stroke:{color:"#000000",alpha:1,weight:0}},downPath:{shapeRendering:"crispEdges",fill:{color:"#aa0000",alpha:1},stroke:{color:"#000000",alpha:1,weight:0}},drawInBackground:!0};return this._mergeStyles(t,e.VolumeColumn.superclass._getDefaultStyles())}},{ATTRS:{ohlcKeys:{value:null},type:{value:"volumecolumn"},graphic:{lazyAdd:!1,setter:function(e){return this.get("rendered")||this.set("rendered",!0),this.set("upPath",e.addShape({type:"path"})),this.set("downPath",e.addShape({type:"path"})),e}},upPath:{},downPath:{},previousClose:{lazyAdd:!1}}}),e.MultipleLineSeries=e.Base.create("multipleLineSeries",e.CartesianSeries,[e.Lines],{drawSeries:function(){this._drawLines()},_getPaths:function(e,t,n){var r,i,s,o,u,a;if(!e){r=this.get("graphic")||this.get("graph").get("graphic"),e=[],o=t.colors,u=t.alphas,a=t.weight;for(s=0;s<n;s+=1)i=r.addShape({type:"path",stroke:{color:o[s%o.length],opacity:u[s%u.length],weight:a}}),e.push(i)}else{n=e.length;for(s=0;s<n;s+=1)e[s].clear()}return e},_getThresholdCoords:function(e,t,n,r,i,s){var o=this.get("yAxis"),u,a=this.get("height"),f=n.padding,l=f.top+s,c=[];a=a-f.top-f.bottom-s*2,l=a-l;for(u=0;u<t;u+=1)c.push(Math.round(o._getCoordFromValue(r,i,a,e[u],l,!0)*1e3)/1e3);return c},_drawThresholdLines:function(e,t,n,r){var i,s,o=this.get("xAxis"),u=o.get("edgeOffset"),a=this.get("width"),f=r.thresholds,l=f.lineType,c=f.dashLength,h=f.gapSpace,p=r.padding.left+u,d=a-u-r.padding.right,v;for(s=0;s<n;s+=1)v=t[s],i=e[s],i.clear(),i.moveTo(p,v),l==="dashed"?this.drawDashedLine(i,p,v,d,v,c,h):i.lineTo(d,v),i.end()},_drawLines:function(){if(this.get("xcoords").length<1)return;var t=e.Lang.isNumber,n=this.get("direction"),r,i,s,o=!0,u,a,f,l,c,h,p,d,v=this.get("thresholds"),m=v?v.length:0,g,y,b,w=this.get("styles"),E=this._getPaths(this._paths,w,m+1),S=this.get("yAxis"),x=S.get("minimum"),T=S.get("maximum"),N=S.get("edgeOffset"),C=this._getThresholdCoords(v,m,w,x,T,N),k=this._getPaths(this._thresholdPaths,w.thresholds,m),L=this.get("xcoords"),A=this.get("ycoords");this._drawThresholdLines(k,C,m,w),this._paths=E,this._thresholdPaths=k,r=n==="vertical"?A.length:L.length;for(p=0;p<r;p+=1){f=Math.round(L[p]*1e3)/1e3,l=Math.round(A[p]*1e3)/1e3,s=t(f)&&t(l);if(s){b=0;if(v)for(g=0;g<m;g+=1){if(l<=C[g])break;b=g}else g=0;o?(o=!1,E[g
].moveTo(f,l)):(g!==y&&(d=Math.round((l-a)/(f-u)*1e3)/1e3,c=(C[b]-l)/d+f,h=C[b],t(y)&&E[y].lineTo(c,h),E[g].moveTo(c,h)),E[g].lineTo(f,l)),u=f,a=l,i=!0,y=g}else i=s}r=E.length;for(p=0;p<r;p+=1)E[p].end()},_getDefaultStyles:function(){var t={alphas:[1],weight:6,colors:this._defaultLineColors.concat(),thresholds:{colors:["#999"],alphas:[1],weight:1,lineType:"dashed",dashLength:5,gapSpace:5}};return e.merge(e.Renderer.prototype._getDefaultStyles(),t)}},{ATTRS:{thresholds:{}}}),e.Crosshair=function(){this.initializer.apply(this,arguments)},e.Crosshair.prototype={initializer:function(t){var n=new e.Graphic({render:t.render,autoDraw:!1,width:t.width,height:t.height,x:t.x,y:t.y}),r=t.width,i=t.height,s=t.series,o,u=t.category,a,f,l=s.length;a=n.addShape({shapeRendering:"crispEdges",type:"path",stroke:u.stroke}).moveTo(0,0).lineTo(0,i).end(),this._xcoords=u.coords,this._yline=a,this.width=t.width,this.height=t.height;if(s){for(f=0;f<l;f+=1)o=s[f],o.line&&(o.xLine=n.addShape({shapeRendering:"crispEdges",type:"path",stroke:o.line.stroke}).moveTo(0,0).lineTo(r,0).end()),o.marker&&(o.marker.y=o.marker.height/-2,o.marker.x=o.marker.width/-2,o.marker.type=o.marker.type||o.marker.shape,o.marker=n.addShape(o.marker));this._series=s}this._xy=n.getXY(),this.graphic=n},setTarget:function(e,t){var n=this._xy,r=e-n[0],i,s=this._series,o,u,a=Math.floor(r/this.width*this._xcoords.length),f=s.length;this._yline.set("transform","translate("+r+")");if(s)for(u=0;u<f;u+=1)o=s[u],i=o.coords[a],o.marker&&o.marker.set("transform","translate("+r+", "+i+")"),o.line&&o.xLine.set("transform","translateY("+i+")");this.updateFlag=!0,t&&this.graphic._redraw()},redraw:function(){this.updateFlag&&(this.graphic._redraw(),this.updateFlag=!1)},destroy:function(){this.graphic&&this.graphic.destroy()}},e.Gridlines=e.Base.create("gridlines",e.Base,[e.Renderer],{_path:null,remove:function(){var e=this._path;e&&e.destroy()},draw:function(){this.get("axis")&&this.get("graphic")&&this._drawGridlines.apply(this,arguments)},_drawGridlines:function(e,t,n,r){var i=this._path,s=this.get("axis"),o=s.get("position"),u,a=this.get("direction"),f=this.get("graphic"),l=this.get("styles"),c=l.fill,h=l.border,p=l.line,d=c&&h?h:p,v=this.get("x"),m=this.get("y"),g;n=n||0,r=r||2,isFinite(e)&&isFinite(t)&&e>0&&t>0&&(o!=="none"&&s&&s.get("tickPoints")?u=s.get("tickPoints"):u=this._getPoints(s.get("styles").majorUnit.count,e,t),i?(i.set("width",e),i.set("height",t),i.set("stroke",d),i.set("x",v),i.set("y",m),c&&i.set("fill",c)):(g={type:"path",width:e,stroke:d,height:t,x:v,y:m},c&&(g.fill=c),i=f.addShape(g),i.addClass("yui3-gridlines"),this._path=i),a==="vertical"?c?this._verticalFill(i,u,t,n,r,e):this._verticalLine(i,u,t,l):c?this._horizontalFill(i,u,e,n,r,t):this._horizontalLine(i,u,e,l),i.end())},_getPoints:function(e,t,n){var r,i=[],s,o=e-1;for(r=0;r<e;r+=1)s=r/o,i[r]={x:t*s,y:n*s};return i},_horizontalLine:function(e,t,n,r){var i=r.showFirst?0:1,s=r.showLast?t.length:t.length-1,o;for(;i<s;i+=1)o=t[i].y,e.moveTo(0,o),e.lineTo(n,o)},_verticalLine:function(e,t,n,r){var i=r.showFirst?0:1,s=r.showLast?t.length:t.length-1,o;for(;i<s;i+=1)o=t[i].x,e.moveTo(o,0),e.lineTo(o,n)},_horizontalFill:function(e,t,n,r,i,s){var o,u,a,f=t.length;for(o=r;o<f;o+=i)u=t[o].y,a=o<f-1?t[o+1].y:s,e.moveTo(0,u),e.lineTo(0,a),e.lineTo(n,a),e.lineTo(n,u),e.lineTo(0,u),e.closePath()},_verticalFill:function(e,t,n,r,i,s){var o,u,a,f=t.length;for(o=r;o<f;o+=i)u=t[o].x,a=o<f-1?t[o+1].x:s,e.moveTo(u,0),e.lineTo(a,0),e.lineTo(a,n),e.lineTo(u,n),e.lineTo(u,0),e.closePath()},_getDefaultStyles:function(){var e={line:{color:"#f0efe9",weight:1,alpha:1},fill:null,showFirst:!0,showLast:!0};return e}},{ATTRS:{x:{value:0},y:{value:0},direction:{},axis:{},graphic:{},count:{}}}),i.prototype={init:function(t){var n,r,i,s=t.valueKeys,o=t.displayKeys,u,a,f,l=this.items||{},c;this.x=t.x,this.y=t.y,this.width=t.width,this.height=t.height,this.dataProvider=t.dataProvider,this.contentDiv=e.DOM.create('<div style="position:absolute;top:'+t.y+"px;"+t.x+"0px;height: "+t.height+"px; width: "+t.width+'px;" class="l-hbox">'),this.dateLabelFunction=t.dateLabelFunction,this.dateLabelFormat=t.dateLabelFormat,this.dateLabelScope=t.dateLabelScope||this,t.render.getDOMNode().appendChild(this.contentDiv),i=s.length,r=e.DOM.create('<ul  style="vertical-align: middle; line-height: '+this.height+'px;padding:0px 0px 0px 0px;margin:0px 0px 0px 0px;" class="layout-item-modules pure-g">'),this.contentDiv.appendChild(r),this.dateItem={li:e.DOM.create('<li class="layout-item-module pure-u" style="display:inline-block; margin: 0px 4px 0px 0px;">'),value:e.DOM.create('<span style="border-left:'+t.swatchWidth+"px solid #fff;font-size:"+t.fontSize+";font-family:"+t.font+';" id="dateitem";font-color:'+t.dateColor+'" ></span>')},this.dateItem.li.appendChild(this.dateItem.value),r.appendChild(this.dateItem.li);for(n=0;n<i;n+=1)f=s[n],u=o[n],a={},c=t.colors[f],a.li=e.DOM.create('<li id="'+f+'" class="layout-item-module pure-u" style="display:inline-block; margin: 0px 4px 0px 0px;">'),a.bullet=e.DOM.create('<div style="display: inline-block;width:3px; height: '+this.height+"px; background-color:"+c+';"></div>'),a.label=e.DOM.create('<span style="font-size:'+t.fontSize+";font-family:"+t.font+";color:"+c+';display:inline:margin: 0px 0px 0px 0px;" id="'+f+'" >'+t.delim+u+" : </span>"),a.value=e.DOM.create('<span style="font-size:'+t.fontSize+";font-family:"+t.font+';display:inline:margin: 0px 0px 0px 0px;" id="'+f+'Value" ></span>'),r.appendChild(a.li),a.li.appendChild(a.bullet),a.li.appendChild(a.label),a.li.appendChild(a.value),l[f]=a,a.li.style.display="none";this.list=r,this.seriesQueue=s,this.items=l,this.priceUpColor=t.priceUpColor,this.priceDownColor=t.priceDownColor,this.valueLabelFormat=t.valueLabelFormat,this.formatDate=t.formatDate,this._xy=e.DOM.getXY(this.contentDiv)},destroy:function(){this._removeChildren(this.list),this._removeChildren(this.contentDiv),this.contentDiv&&this.contentDiv.parentNode&&this.contentDiv.parentNode
.removeChild(this.contentDiv)},_removeChildren:function(e){if(e&&e.hasChildNodes()){var t;while(e.firstChild)t=e.firstChild,this._removeChildren(t),e.removeChild(t)}},update:function(e,t){this._dataItem=e.dataProvider[e.dataIndex],t&&this.redraw()},redraw:function(){var t=this.seriesQueue,n,r=t.length,i,s=this.items,o,u,a=this.dateLabelFunction,f=this.dateLabelScope,l=this.dateLabelFormat,c,h=this._dataItem;if(h){u=h.Date||h.Timestamp,a&&(c=[u],l&&c.push(l),u=a.apply(f,c)),this.dateItem.value.innerHTML=e.Escape.html(u);for(o=0;o<r;o+=1)n=t[o],i=s[n],h.hasOwnProperty(n)?(i.li.style.display="inline-block",u=h[n],i.value.innerHTML=e.Number.format(parseFloat(u),this.valueLabelFormat),e.DOM.setStyle(i.value,"color",u>0?this.priceUpColor:this.priceDownColor)):i.li.style.display="none";h=this._dataItem=null}}},e.StockIndicatorsLegend=i,e.StockIndicatorsAxisLegend=function(){this.initializer.apply(this,arguments)},e.StockIndicatorsAxisLegend.prototype={initializer:function(e){var t=e.previousClose,n=e.indicatorItems,r=e.interactiveItem,i=e.axis,s,o=this._getDefaultStyles(),u;for(s in e.styles)e.styles.hasOwnProperty(s)&&(o[s]=e.styles[s]);this._y=e.y,this._contentBox=e.render,this._styles=o,this._maximum=i.get("maximum"),this._minimum=i.get("minimum"),this._dataProvider=e.dataProvider,this._axis=i,this._labelFormat=e.labelFormat||i.get("labelFormat"),this._labelFunction=e.labelFunction||i.get("labelFunction"),this.height=e.height||i.get("height"),this._labels=[],u=this._getDimensions(),this.width=u.width,this.itemWidth=this.width,this.itemHeight=u.height,this._contentWidth=e.contentWidth;for(s in u.arrow)u.arrow.hasOwnProperty(s)&&(this._styles.arrow[s]=u.arrow[s]);t&&(this._previousClose=this._getPreviousClose(t)),n&&(this._indicatorItems=this._initalizeIndicatorItems(n)),r&&(this._interactiveItem=this._getInteractiveItem(r))},_getDimensions:function(){var t=this._styles,n=t.label,i=t.arrow,s=this._axis,o=r.createElement("span"),u=r.createElement("span"),a,f,l=this._labelFunction.apply(this,[this._minimum,this._labelFormat]),c=this._labelFunction.apply(this,[this._maximum,this._labelFormat]),h=r.createElement("div"),p=r.createElement("span"),d,v,m,g,y,b;for(d in n)n.hasOwnProperty(d)&&(u.style[d]=n[d],o.style[d]=n[d]);if(i)for(d in i)i.hasOwnProperty(d)&&(p.style[d]=i[d]);return u.appendChild(r.createTextNode(l)),o.appendChild(r.createTextNode(c)),this._contentBox.appendChild(h),h.style.position="absolute",h.appendChild(o),h.appendChild(u),m=parseFloat(o.offsetWidth),v=parseFloat(u.offsetWidth),a=Math.max(parseFloat(o.offsetHeight),parseFloat(u.offsetHeight)),m>=v?(s._removeChildren(u),e.Event.purgeElement(u,!0),u.parentNode.removeChild(u),f=m):(s._removeChildren(o),e.Event.purgeElement(o,!0),o.parentNode.removeChild(o),f=v),f=Math.max(parseFloat(o.offsetWidth),parseFloat(u.offsetWidth)),b=a/13*7+"px",g=parseFloat(b)+"px",y=g,p.style.borderRightWidth=b,p.style.borderTopWidth=g,p.style.borderBottomWidth=y,h.appendChild(p),f+=parseFloat(p.offsetWidth),s._removeChildren(h),e.Event.purgeElement(h,!0),h.parentNode.removeChild(h),{width:f,height:a,arrow:{borderRightWidth:b,borderBottomWidth:y,borderTopWidth:g}}},_getPreviousClose:function(e){var t="stockIndicatorsPreviousClose",n=this._axis,i=this._styles,s=i.label,o=i.arrow,u=u,a=e.background,f=e.value,l=r.createElement("div"),c=r.createElement("span"),h=r.createElement("span"),p,d=this._labelFunction.apply(this,[f,this._labelFormat]),v=e.ycoord||n._getCoordFromValue(this._minimum,this._maximum,this.height,f,this.height,!0);v+=this._y,h.id=e.id||t,e.className&&(t=t+" "+e.className),h.className=t;if(s)for(p in s)s.hasOwnProperty(p)&&(h.style[p]=s[p]);if(o)for(p in o)o.hasOwnProperty(p)&&(c.style[p]=o[p]);return a&&(h.style.background=a,c.style.borderRightColor=a),l.style.position="absolute",h.appendChild(r.createTextNode(d)),this._contentBox.appendChild(l),l.appendChild(c),l.appendChild(h),l.style.left=this._contentWidth-this.itemWidth+"px",l.style.top=v-this.itemHeight/2+"px",e.node=l,e.textNode=h,this._labels.push(l),e},_getInteractiveItem:function(e){var t="stockIndicatorsInteractiveItem",n=this._styles,i=n.label,s=n.arrow,o=o,u=e.background,a=r.createElement("div"),f=r.createElement("span"),l=r.createElement("span"),c;l.id=e.id||t,e.className&&(t=t+" "+e.className),l.className=t;if(i)for(c in i)i.hasOwnProperty(c)&&(l.style[c]=i[c]);if(s)for(c in s)s.hasOwnProperty(c)&&(f.style[c]=s[c]);return u&&(l.style.background=u,f.style.borderRightColor=u),a.style.position="absolute",this._contentBox.appendChild(a),a.appendChild(f),a.style.left=this._contentWidth-this.itemWidth+"px",a.style.top=0-this.itemHeight/2+"px",a.appendChild(l),a.style.visibility="hidden",e.node=a,e.label=l,this._labels.push(a),e},_initalizeIndicatorItems:function(e){var t="stockIndicatorsIndicatorLabel",n=this._styles,i=n.label,s=n.arrow,o=this._axis,u,a,f,l,c,h,p,d=this._dataProvider,v=d[d.length-1],m,g,y,b=this._contentBox._node;for(u in e)if(e.hasOwnProperty(u)){f=e[u],l=r.createElement("div"),c=r.createElement("span"),h=r.createElement("span"),h.id=f.id||t+"_"+u,h.className=f.className?t+" "+f.className:t,p=f.background;if(i)for(a in i)i.hasOwnProperty(a)&&(h.style[a]=i[a]);if(s)for(a in s)s.hasOwnProperty(a)&&(c.style[a]=s[a]);p&&(h.style.background=p,c.style.borderRightColor=p),m=v[u],y=this._labelFunction.apply(this,[m,this._labelFormat]),g=this._y+o._getCoordFromValue(this._minimum,this._maximum,this.height,m,this.height,!0),h.appendChild(r.createTextNode(y)),l.style.position="absolute",l.style.left=this._contentWidth-this.itemWidth+"px",l.style.top=g-this.itemHeight/2+"px",b.appendChild(l),l.appendChild(c),l.appendChild(h),this._labels.push(l),f.node=l,f.label=h,this._labels.push(l)}return e},update:function(t){var n=this._interactiveItem;this._dataItem=t.dataProvider[t.dataIndex],this._dataItem&&(n.value=this._dataItem[n.key],n.ycoord=this._y+this._axis._getCoordFromValue(this._minimum,this._maximum,this.height,n.value,this.height,!0)),isNaN(n.value)?n.node.style.visibility="hidden"
:(n.node.style.visibility="visible",n.label.innerHTML=e.Escape.html(this._labelFunction(n.value,this._labelFormat)),r.createElementNS?e.DOM.setStyle(n.node,"transform","translateY("+n.ycoord+"px)"):n.node.style.top=n.ycoord-this.itemHeight/2+"px")},redraw:function(){},_getDefaultStyles:function(){return{arrow:{borderTopColor:"transparent",display:"inline-block",borderBottomColor:"transparent",borderTopStyle:"solid",borderRightStyle:"solid",borderBottomStyle:"solid",height:"0px",width:"0px"},previousClose:{color:"#eee"},label:{display:"inline-block",whiteSpace:"nowrap",position:"absolute",backgroundColor:"#9aa",color:"#fff",fontFamily:"Helvetica Neue, Helvetica, Arial",fontWeight:"bold",fontSize:"10pt",paddingLeft:"3pt",paddingRight:"3pt",borderTopRightRadius:"10% 10%",borderBottomRightRadius:"10% 10%"}}},destroy:function(){var t=this._labels,n;while(t&&t.length>0)n=t.pop(),this._axis._removeChildren(n),e.Event.purgeElement(n,!0),n.parentNode&&n.parentNode.removeChild(n)}},e.StockIndicatorsChart=e.Base.create("stockIndicatorsChart",e.Widget,[e.Renderer],{initializer:function(){var t=this.get("contentBox");t.setStyle("position","relative"),this._axes=[],this._graphs=[],this._graphics=[],this._crosshairs=[],this._hotspots=[],this._legends=[],this._runTimeline=!1,this._onEnterFrame=n.requestAnimationFrame||n.mozRequestAnimationFrame||n.webkitRequestAnimationFrame||n.msRequestAnimationFrame,this._autoDraw=this._onEnterFrame?!1:!0,e.StockIndicatorsChart.superclass.initializer.apply(this,arguments)},bindUI:function(){this._addEvents()},_addEvents:function(){var t=n&&"ontouchstart"in n&&!(e.UA.chrome&&e.UA.chrome<6),r=".yui3-hotspot";t?(this._startHandle=e.on("touchstart",e.bind(this._eventDispatcher,this),r),this._moveHandle=e.on("touchmove",e.bind(this._eventDispatcher,this),r),this._endHandle=e.on("touchend",e.bind(this._eventDispatcher,this),r)):(this._startHandle=e.on("mouseenter",e.bind(this._eventDispatcher,this),r),this._moveHandle=e.on("mousemove",e.bind(this._eventDispatcher,this),r),this._endHandle=e.on("mouseleave",e.bind(this._eventDispatcher,this),r))},drawCharts:function(){var e=[],t=this.get("charts"),n=this.get("contentBox"),r,i=t.length;this._removeAll();for(r=0;r<i;r+=1)e[r]=this.drawChart(t[r],n);this._charts=e,this._addEvents()},_eventDispatcher:function(e){var t=e.type,n=e&&e.hasOwnProperty("changedTouches"),r=n?e.changedTouches[0].pageX:e.pageX,i=n?e.changedTouches[0].pageY:e.pageY;t==="mouseenter"||t==="touchstart"?this.startTimeline():(t==="mouseleave"||t==="touchend")&&this.stopTimeline(),e.halt(),this.fire("chartEvent:"+t,{originEvent:e,pageX:r,pageY:i,isTouch:n})},updatesLegendsCrosshair:function(e){var t=this._charts,n,r,i=t.length,s=e.pageX,o=e.pageY,u,a=this._dataProvider,f,l,c,h;if(s%1===0&&o%1===0&&this.curX!==s)for(h=0;h<i;h+=1)u=t[h],l=u.xy,c=s-l[0],f=Math.floor(c/u.graphWidth*a.length),n=u.crosshair,r=u.legend,n&&n.setTarget(s,this._autoDraw),r&&r.update({dataProvider:a,dataIndex:f,pageX:s,pageY:o},this._autoDraw);this.curX=s},startTimeline:function(){this._runTimeline||(this._runTimeline=!0,this._timelineStart=(new Date).valueOf()-17,this.redraw())},stopTimeline:function(){var e,t=this._timelineId;this._runTimeline=!1,t&&(e=[t],this._timelineId=null)},redraw:function(){var e=this,t,r,i=this._charts,s,o,u=i.length,a=(new Date).valueOf();if(a>=this._timelineStart+17){for(o=0;o<u;o+=1)s=i[o],t=s.crosshair,r=s.legend,t&&t.redraw(),r&&r.redraw();this._timelineStart=(new Date).valueOf()}this._runTimeline&&!this._autoDraw&&(this._timelineId=this._onEnterFrame.apply(n,[function(){e.redraw()}]))},_graphMap:{line:e.LineSeries,marker:e.MarkerSeries,column:e.ColumnSeries,candlestick:e.CandlestickSeries,multipleline:e.MultipleLineSeries,volumecolumn:e.VolumeColumn},_getGraph:function(e){return this._graphMap[e]},_getSeriesCollection:function(t){var n=[],r,i,s=t.indicators,o,u,a=s.length,f,l,c,h,p=["candlestick","line","ohlc","volumecolumn","multipleline"];for(u=0;u<a;u+=1){i=s[u],c=i.valueKey,o=i.type;if(o==="candlestick"||typeof c=="string")h=e.Array.indexOf(p,o)===-1&&i.groupMarkers,r={groupMarkers:h,type:i.type,xKey:t.categoryKey,yKey:i.valueKey},n.push(r);else{l=c.length;for(f=0;f<l;f+=1)o=i.type,r={xKey:t.categoryKey,yKey:i.valueKey[f]},typeof o=="string"?(r.groupMarkers=e.Array.indexOf(p,o)===-1&&i.groupMarkers,r.type=o):(r.groupMarkers=e.Array.indexOf(p,o[f])===-1&&i.groupMarkers,r.type=o[f],o[f]==="multipleline"&&t.threshold?r.thresholds=[parseFloat(i.previousClose)]:o[f]==="volumecolumn"&&(r.previousClose=parseFloat(i.previousClose),r.yAxis=new e.NumericAxisBase(i.yAxis))),n.push(r)}}return n},_getSeriesStyles:function(e,t){var n,r=t.colors,i,s,o,u,a,f=e.length;for(a=0;a<f;a+=1){n=e[a];switch(n.type){case"volumecolumn":n.styles={upPath:{fill:{color:r.volumeColumnUp}},downPath:{fill:{color:r.volumeColumnDown}},padding:{top:200}};break;case"line":n.styles={line:{weight:t.lineWidth,color:r[n.yKey]}};break;case"multipleline":n.styles={weight:t.lineWidth,colors:t.range==="1d"?[r.quoteLineUp,r.quoteLineDown]:[r.quoteLine],threshold:t.threshold};break;case"candlestick":n.styles={upcandle:{fill:{color:r.priceUp}},downcandle:{fill:{color:r.priceDown}}};break;case"marker":o=this.get("dataProvider"),i=Math.min(t.dotDiameter,t.width/o.length),n.styles={marker:{width:i,height:i,border:{color:r[n.yKey],weight:0},fill:{color:r[n.yKey]}}};break;case"column":o=this.get("dataProvider"),u=t.rangeType,s=t.width/o.length,s=Math.min(10,Math.round(s-s*.4)),s-=2,s=Math.max(1,s),n.styles={marker:{width:s,border:{weight:0},fill:{color:r[n.yKey]}}}}}return e},_drawGraphs:function(e,t,n){var r=this._getSeriesStyles(this._getSeriesCollection(e),e),i,s,o,u={},a=t.date,f=t.numeric,l,c,h=r.length;for(c=0;c<h;c+=1)i=r[c],i.xAxis=a,i.yAxis||(i.yAxis=f),i.graphic=n,l=this._getGraph(i.type),o=new l(i),o.draw(),s=i.yKey,typeof s!="string"&&(s="quote"),u[s]=o;return this._graphs.push(o),u},_drawGridlines:function(t,n,r,i){var s,o;return t&&(s=new e.Gridlines({graphic:i,direction:"horizontal",axis:r.numeric
,x:t.x,y:t.y,styles:t})),n&&(o=new e.Gridlines({graphic:i,direction:"vertical",axis:r.date,styles:n})),s.draw(t.width,t.height),o.draw(n.width,n.height),s._path.toBack(),o._path.toBack(),{horizontal:s,vertical:o}},_axesClassMap:{numeric:e.NumericAxis,numericbase:e.NumericAxisBase,category:e.CategoryAxis,categorybase:e.CategoryAxisBase,intraday:e.IntradayAxis},_drawAxes:function(e,t){var n,r,i=e.axes.numeric,s=e.axes.date,o,u,a=this._axesClassMap[i.type],f=this._axesClassMap[s.type];return i.y=t.y,i.x=e.width-i.width,i.height=t.height,s.x=t.x,s.y=e.y+e.height-s.height,s.width=t.width,o=new a(i),u=new f(s),r=u.get("boundingBox"),r.setStyle("left","0px"),r.setStyle("top",e.y+e.height-s.height+"px"),r=o.get("boundingBox"),r.setStyle("left",i.x+"px"),r.setStyle("top",i.y+"px"),n={numeric:o,date:u},this._axes.push(n),n},_drawHotspot:function(t,n){var r=e.Node.create('<div class="yui3-hotspot" id="fincharthotspot_'+this._hotspots.length+'" style="width:'+t.width+"px;height:"+t.height+"px;position:absolute;left:"+t.x+"px;top:"+t.y+'px;opacity:0;background:#fff;z-index:4"></div>');r.setStyle("opacity",0),n.append(r),this._hotspots.push(r)},_createGraphic:function(t,n){var r=new e.Graphic({render:n,width:t.width,height:t.height,x:t.x,y:t.y,autoDraw:!1});return this._graphics.push(r),r},_getGraphicDimensions:function(e,t){var n,r=e.axes.numeric.width,i=e.axes.date.height,s=e.axes.numeric.position,o=e.axes.date.position,u,a,f=e.width,l=e.height,c;n=e[t]?this._copyObject(e[t]):{},u=n.x||0,a=n.y||e.y,c=n.margin,c&&(c.top&&(a+=c.top,l-=c.top),c.left&&(u+=c.left,f-=c.left),c.bottom&&(l-=c.bottom),c.right&&(f-=c.right)),e.legend&&e.legend.type!=="axis"&&(a+=e.legend.height,l-=e.legend.height);if(!n||!n.overlapXAxis)l-=i,o==="top"&&(a+=i);if(!n||!n.overlapYAxis)f-=r,s==="left"&&(u+=r);return n.width=f,n.height=l,n.x=u,n.y=a,n},_addCrosshair:function(t,n,r,i){var s,o={stroke:{color:t.lineColor,weight:t.lineWidth}},u=[],a,f=t.drawHorizontal,l,c,h,p=t.keys;for(c in r)r.hasOwnProperty(c)&&(h=c==="quote"?"close":c,l=r[c],e.Array.indexOf(p,h)>-1&&(a={marker:{shape:"circle",width:t.dotDiameter,height:t.dotDiameter,fill:{color:t.color?t.color:n[h]},stroke:{weight:0}},coords:c==="quote"?l.get("ycoords").close:l.get("ycoords")},f&&(a.line={stroke:{color:t.color?t.color:n[h]}}),u.push(a),o.coords=l.get("xcoords")));return u.length>0&&(s=new e.Crosshair({width:t.width,height:t.height,x:t.x,y:t.y,render:i,series:u,category:o}),this._crosshairs.push(s)),s},_legendMap:{basic:e.StockIndicatorsLegend,axis:e.StockIndicatorsAxisLegend},_addLegend:function(e,t){var n,r=e.legend,i=this._legendMap[r.type];return r.colors=e.colors,r.render=t,i&&(n=new i(r),this._legends.push(n)),n},_getGridlinesDimensions:function(e,t){return{x:Math.min(e.x,t.x),y:Math.min(e.y,t.y),width:Math.max(e.width,t.width),height:Math.max(e.height,t.height)}},drawChart:function(e,t){var n,r,i,s,o,u,a,f,l,c=this._getGraphicDimensions(e,"graphs"),h,p;return e.horizontalGridlines.y=c.y,e.verticalGridlines.x=c.x,h=this._getGraphicDimensions(e,"horizontalGridlines"),p=this._getGraphicDimensions(e,"verticalGridlines"),r=this._drawAxes(e,c,t),r.numeric.render(t),r.date.render(t),s=this._createGraphic(this._getGridlinesDimensions(h,p),t),i=this._createGraphic(c,t),o=this._drawGridlines(h,p,r,s),u=this._drawGraphs(e,r,i),a=this._drawHotspot(c,t),f=this._addCrosshair(this._mergeStyles(c,e.crosshair),e.colors,u,t),e.legend.type==="axis"?(e.legend.axis=r.numeric,e.legend.y=c.y,e.legend.contentWidth=this.get("width")):(e.legend.x=c.x,e.legend.y=e.y,e.legend.width=c.width),l=this._addLegend(e,t),n={axes:r,graphic:i,gridlines:o,graphs:u,hotspot:a,crosshair:f,legend:l,xy:i.getXY(),graphWidth:c.width,graphHeight:c.height},i._redraw(),s._redraw(),n},_destroyCrosshairs:function(){var e,t=this._charts.length,n;while(this._crosshairs.length>0)n=this._crosshairs.pop(),n&&n.destroy();for(e=0;e<t;e+=1)delete this._charts[e].crosshair},_destroyHotspots:function(){var e,t=this._charts.length,n;while(this._hotspots.length>0)n=this._hotspots.pop(),n.empty(),n.remove(!0);for(e=0;e<t;e+=1)delete this._charts[e].hotspot},_destroyAxes:function(){var e,t=this._charts.length,n;while(this._axes.length>0)n=this._axes.pop(),n.date.destroy(!0),n.numeric.destroy(!0);for(e=0;e<t;e+=1)delete this._charts[e].axes},_destroyGraphs:function(){var e,t=this._charts.length,n;while(this._graphs.length>0)n=this._graphs.pop(),n.destroy(!0);for(e=0;e<t;e+=1)delete this._charts[e].graph},_destroyLegends:function(){var e,t=this._charts.length,n;while(this._legends.length>0)n=this._legends.pop(),n.destroy();for(e=0;e<t;e+=1)delete this._charts[e].legend},_destroyGraphics:function(){var e,t=this._charts.length,n;while(this._graphics.length>0)n=this._graphics.pop(),n.destroy();for(e=0;e<t;e+=1)delete this._charts[e].graphic},_removeAll:function(){var e,t;if(this._charts){this._destroyCrosshairs(),this._destroyHotspots(),this._destroyLegends(),this._destroyGraphs(),this._destroyAxes(),this._destroyGraphics();while(this._charts.length>0){e=this._charts.pop();for(t in e)e.hasOwnProperty(t)&&delete e[t]}}this._startHandle&&this._startHandle.detach(),this._moveHandle&&this._moveHandle.detach(),this._endHandle&&this._endHandle.detach()},destructor:function(){this._removeAll()}},{ATTRS:{charts:{},dataProvider:{lazyAdd:!1,getter:function(){return this._dataProvider},setter:function(e){return this._dataProvider=e,e}}}}),e.StockIndicatorsSpark=function(){return this._init.apply(this,arguments),this},e.StockIndicatorsSpark.prototype={_graphMap:{line:e.LineSeries,marker:e.MarkerSeries,column:e.ColumnSeries,area:e.AreaSeries},_styleMap:{line:"line",marker:"marker",column:"marker",area:"area"},_init:function(t){var n=t.styles,r=document.createElement("div"),i=document.createElement("div"),s=t.render,o=t.type||"line",u=o==="column"?"marker":o,a=this._graphMap[o];this.dataProvider=t.dataProvider,this.xKey=t.xKey,this.yKey=t.yKey,n||(n={},t[u]?n[u]=t[u]:(n[u]={},t.color&&(n.line.color=t.color),t.alpha&&(n.line.alpha=t.alpha),o==="line"&&
(n.line.weight=isNaN(t.weight)?1:t.weight))),this.xAxis=new e.CategoryAxisBase({dataProvider:this.dataProvider,keys:[this.xKey]}),this.yAxis=new e.NumericAxisBase({dataProvider:this.dataProvider,keys:[this.yKey],alwaysShowZero:!1}),r.style.position="absolute",e.DOM.setStyle(r,"inlineBlock"),i.style.position="relative",s=document.getElementById(s),s.appendChild(r),r.appendChild(i),i.style.width=e.DOM.getComputedStyle(s,"width"),i.style.height=e.DOM.getComputedStyle(s,"height"),this.graphic=new e.Graphic({render:i,autoDraw:!1}),this.graph=new a({rendered:!0,dataProvider:t.dataProvider,graphic:this.graphic,styles:n,xAxis:this.xAxis,yAxis:this.yAxis,xKey:this.xKey,yKey:this.yKey}),this.contentBox=i,this.boundingBox=r,this.graph.validate(),this.graphic._redraw()},destroy:function(){var e;this.xAxis&&this.xAxis.destroy(!0),this.yAxis&&this.yAxis.destroy(!0),this.graph&&this.graph.destroy(),this.graphic&&this.graphic.destroy(),this.contentBox&&(e=this.contentBox.parentNode,e&&e.removeChild(this.contentBox)),this.boundingBox&&(e=this.boundingBox.parentNode,e&&e.removeChild(this.boundingBox))}}},"@VERSION@",{requires:["escape","graphics-group","axis-numeric","axis-category","series-line","series-marker","series-column","series-candlestick","series-area"]});
