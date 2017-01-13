/*  ConfigurableMapViewerCMV
 *  version 2.0.0-beta.1
 *  Project: http://cmv.io/
 */

define(["dojo/_base/declare","dijit/_WidgetBase","dijit/_TemplatedMixin","dijit/_WidgetsInTemplateMixin","dijit/MenuItem","dojo/_base/lang","dojo/_base/array","dojo/promise/all","dojo/topic","dojo/query","dojo/dom-style","dojo/dom-class","dojo/dnd/Moveable","dojo/store/Memory","esri/tasks/IdentifyTask","esri/tasks/IdentifyParameters","esri/dijit/PopupTemplate","esri/layers/FeatureLayer","esri/TimeExtent","dojo/text!./Identify/templates/Identify.html","dojo/i18n!./Identify/nls/resource","./Identify/Formatters","dijit/form/Form","dijit/form/FilteringSelect","xstyle/css!./Identify/css/Identify.css"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v){return a([b,c,d],{widgetsInTemplate:!0,templateString:t,baseClass:"gis_IdentifyDijit",i18n:u,mapClickMode:null,identifies:{},infoTemplates:{},featureLayers:{},ignoreOtherGraphics:!0,createDefaultInfoTemplates:!0,draggable:!1,layerSeparator:"||",allLayersId:"***",excludedFields:["objectid","esri_oid","shape","shape.len","shape_length","shape_len","shape.stlength()","shape.area","shape_area","shape.starea()"],defaultFormatters:{esriFieldTypeSmallInteger:v.formatInt,esriFieldTypeInteger:v.formatInt,esriFieldTypeSingle:v.formatFloat,esriFieldTypeDouble:v.formatFloat,esriFieldTypeDate:v.formatDate},postCreate:function(){this.inherited(arguments),this.identifies||(this.identifies={}),this.layers=[],this.addLayerInfos(this.layerInfos),this.own(i.subscribe("mapClickMode/currentSet",f.hitch(this,"setMapClickMode"))),this.own(i.subscribe("identify/addLayerInfos",f.hitch(this,"addLayerInfos"))),this.map.on("click",f.hitch(this,function(a){"identify"===this.mapClickMode&&this.executeIdentifyTask(a)})),this.mapRightClickMenu&&this.addRightClickMenu(),this.parentWidget&&(this.createIdentifyLayerList(),this.map.on("update-end",f.hitch(this,function(){this.createIdentifyLayerList()}))),this.draggable&&this.setupDraggable()},addLayerInfos:function(a){g.forEach(a,f.hitch(this,"addLayerInfo"))},addLayerInfo:function(a){var b,c=a.layer.id,d=this.map.getLayer(c);if(d){var e=d.url;if("esri.layers.FeatureLayer"===d.declaredClass){if(d.capabilities&&g.indexOf(d.capabilities.toLowerCase(),"data")<0&&!d.infoTemplate&&(b=this.getInfoTemplate(d,d.layerId))){d.setInfoTemplate(b);var h=b.info.fieldInfos,i=g.filter(h,function(a){return a.formatter});return void(i.length>0&&d.on("graphic-draw",f.hitch(this,"getFormattedFeature",d.infoTemplate)))}var j=e.lastIndexOf("/"+d.layerId);j>0&&(e=e.substring(0,j))}else d.layerInfos&&g.forEach(d.layerInfos,f.hitch(this,function(b){var c=b.id;(null===a.layerIds||g.indexOf(a.layerIds,c)>=0)&&this.getFeatureLayerForDynamicSublayer(d,c)}));this.layers.push({ref:d,layerInfo:a,identifyTask:new o(e)}),this.parentWidget&&d.on("visibility-change",f.hitch(this,function(a){a.visible===!1&&this.createIdentifyLayerList()}))}},addRightClickMenu:function(){this.map.on("MouseDown",f.hitch(this,function(a){this.mapRightClick=a})),this.mapRightClickMenu.addChild(new e({label:this.i18n.rightClickMenuItem.label,onClick:f.hitch(this,"handleRightClick")}))},setupDraggable:function(){var a,b,c,d;a=j("div.esriPopup"),b=j("div.esriPopup div.titlePane div.title"),c=j("div.esriPopup div.outerPointer, div.esriPopup div.pointer"),a.length>0&&b.length>0&&(k.set(b[0],"cursor","move"),d=new m(a[0],{handle:b[0]}),c.length>0&&(d.onMoveStart=function(){g.forEach(c,function(a){l.remove(a,"left right top bottom topLeft topRight bottomLeft bottomRight")})}))},executeIdentifyTask:function(a){if(this.checkForGraphicInfoTemplate(a)&&(this.map.infoWindow.hide(),this.map.infoWindow.clearFeatures(),!(a.shiftKey||a.ctrlKey||a.altKey))){var b=a.mapPoint,c=this.createIdentifyParams(b),d=[],e=[],i=this.getSelectedLayer();g.forEach(this.layers,f.hitch(this,function(a){var b=this.getLayerIds(a,i);if(b.length>0){var g=f.clone(c);g.layerDefinitions=a.ref.layerDefinitions,g.layerIds=b,a.ref.timeInfo&&a.ref.timeInfo.timeExtent&&this.map.timeExtent&&(g.timeExtent=new s(this.map.timeExtent.startTime,this.map.timeExtent.endTime)),d.push(a.identifyTask.execute(g)),e.push(a)}})),d.length>0&&(this.map.infoWindow.setTitle(this.i18n.mapInfoWindow.identifyingTitle),this.map.infoWindow.setContent('<div class="loading"></div>'),this.map.infoWindow.show(b),h(d).then(f.hitch(this,"identifyCallback",e),f.hitch(this,"identifyError")))}},checkForGraphicInfoTemplate:function(a){if(a.graphic){var b=a.graphic._layer;if(b.infoTemplate||b.capabilities&&g.indexOf(b.capabilities.toLowerCase(),"data")<0)return!1;if(!this.ignoreOtherGraphics){if(!this.identifies.hasOwnProperty(b.id))return!1;if(isNaN(b.layerId)||!this.identifies[b.id].hasOwnProperty(b.layerId))return!1}}return!0},createIdentifyParams:function(a){var b=new p;return b.tolerance=this.identifyTolerance,b.returnGeometry=!0,b.layerOption=p.LAYER_OPTION_VISIBLE,b.geometry=a,b.mapExtent=this.map.extent,b.width=this.map.width,b.height=this.map.height,b.spatialReference=this.map.spatialReference,b},getSelectedLayer:function(){var a=this.allLayersId;if(this.parentWidget){var b=this.identifyFormDijit.get("value");b.identifyLayer&&""!==b.identifyLayer?a=b.identifyLayer:this.identifyLayerDijit.set("value",a)}return a},getLayerIds:function(a,b){var c=b.split(this.layerSeparator),d=this.allLayersId,e=a.ref,f=a.layerInfo.layerIds,h=[];return e.visible&&(c[0]!==d&&e.id!==c[0]||(c.length>1&&c[1]?h=[c[1]]:"esri.layers.FeatureLayer"!==e.declaredClass||isNaN(e.layerId)?e.layerInfos&&(h=this.getLayerInfos(e,f)):e.capabilities&&g.indexOf(e.capabilities.toLowerCase(),"data")>=0&&(h=[e.layerId]))),h},getLayerInfos:function(a,b){var c=[];return g.forEach(a.layerInfos,f.hitch(this,function(d){this.includeSubLayer(d,a,b)&&c.push(d.id)})),c},identifyCallback:function(a,b){var c=[];g.forEach(b,function(b,d){var e=a[d].ref;g.forEach(b,function(a){if(a.feature.geometry.spatialReference=this.map.spatialReference,void 0===a.feature.infoTemplate){var b=this.getInfoTemplate(e,null,a);if(!b)return;a.layerId&&e.layerInfos&&b.info.showAttachments&&(a.feature._layer=this.getFeatureLayerForDynamicSublayer(e,a.layerId)),a.feature.setInfoTemplate(b)}var d=this.getFormattedFeature(a.feature.infoTemplate,a.feature);c.push(d)},this)},this),this.map.infoWindow.setFeatures(c)},getFormattedFeature:function(a,b){return b.graphic&&(b=b.graphic),b&&a&&a.info&&g.forEach(a.info.fieldInfos,function(a){"function"==typeof a.formatter&&(b.attributes[a.fieldName]=a.formatter(b.attributes[a.fieldName],b.attributes,f.clone(b.geometry)))}),b},identifyError:function(a){this.map.infoWindow.hide(),i.publish("viewer/handleError",{source:"Identify",error:a})},handleRightClick:function(){this.executeIdentifyTask(this.mapRightClick)},getInfoTemplate:function(a,b,c){var d,e;c?b=c.layerId:null===b&&(b=a.layerId);var g=this.identifies;if(g.hasOwnProperty(a.id)){if(g[a.id].hasOwnProperty(b)&&(d=g[a.id][b],d instanceof q))return d}else g[a.id]={};return e=f.mixin(this.createDefaultInfoTemplate(a,b,c),g[a.id][b]||{}),d=g[a.id][b]=new q(e),e.content&&d.setContent(e.content),g[a.id][b]},createDefaultInfoTemplate:function(a,b,c){var d=null,e=[],h=this.getLayerName(a);if(c&&(h=c.layerName),c&&c.feature){var i=c.feature.attributes;if(i)for(var j in i)i.hasOwnProperty(j)&&this.addDefaultFieldInfo(e,{fieldName:j,label:this.makeSentenceCase(j),visible:!0})}else if(a._outFields&&a._outFields.length&&"*"!==a._outFields[0]){var k=a.fields;g.forEach(a._outFields,f.hitch(this,function(a){var b=g.filter(k,function(b){return b.name===a});b.length>0&&this.addDefaultFieldInfo(e,{fieldName:b[0].name,label:b[0].alias,visible:!0})}))}else a.fields&&g.forEach(a.fields,f.hitch(this,function(a){this.addDefaultFieldInfo(e,{fieldName:a.name,label:a.alias===a.name?this.makeSentenceCase(a.name):a.alias,visible:!0})}));return e.length>0&&(d={title:h,fieldInfos:e,showAttachments:a.hasAttachments}),d},makeSentenceCase:function(a){if(!a.length)return"";a=a.toLowerCase().replace(/_/g," ").split(" ");for(var b=0;b<a.length;b++)a[b]=a[b].charAt(0).toUpperCase()+(a[b].substr(1).length?a[b].substr(1):"");return a.length?a.join(" "):a},addDefaultFieldInfo:function(a,b){var c=b.fieldName.toLowerCase();g.indexOf(this.excludedFields,c)<0&&a.push(b)},createIdentifyLayerList:function(){var a=null,b=[],c=this.identifyLayerDijit.get("value"),d=this.layerSeparator;g.forEach(this.layers,f.hitch(this,function(e){var h=e.ref,i=e.layerInfo.layerIds;if(h.visible){var j=this.getLayerName(e);"esri.layers.FeatureLayer"!==h.declaredClass||isNaN(h.layerId)?g.forEach(h.layerInfos,f.hitch(this,function(e){this.includeSubLayer(e,h,i)&&(b.push({name:j+" \\ "+e.name,id:h.id+d+e.id}),h.id+d+e.id===c&&(a=c))})):(b.push({name:j,id:h.id+d+h.layerId}),h.id+d+h.layerId===c&&(a=c))}})),b.sort(function(a,b){return a.name>b.name?1:b.name>a.name?-1:0}),this.identifyLayerDijit.set("disabled",b.length<1),b.length>0&&(b.unshift({name:this.i18n.labels.allVisibleLayers,id:"***"}),a||(a=b[0].id));var e=new n({data:b});this.identifyLayerDijit.set("store",e),this.identifyLayerDijit.set("value",a)},includeSubLayer:function(a,b,c){if(null!==a.subLayerIds)return!1;if(this.isDefaultLayerVisibility(b)&&!this.checkVisibilityRecursive(b,a.id))return!1;if(g.indexOf(b.visibleLayers,a.id)<0)return!1;if(!this.layerVisibleAtCurrentScale(a))return!1;if(c&&g.indexOf(c,a.id)<0)return!1;if(!this.createDefaultInfoTemplates){var d=this.getInfoTemplate(b,a.id);if(!d)return!1}return!0},checkVisibilityRecursive:function(a,b){var c=g.filter(a.layerInfos,function(a){return a.id===b});if(c.length>0){var d=c[0];if(a.visibleLayers.indexOf(b)!==-1&&(d.parentLayerId===-1||this.checkVisibilityRecursive(a,d.parentLayerId)))return!0}return!1},isDefaultLayerVisibility:function(a){for(var b=0;b<a.layerInfos.length;b++){var c=a.layerInfos[b];if(c.defaultVisibility&&a.visibleLayers.indexOf(c.id)===-1)return!1}return!0},getLayerName:function(a){var b=null;return a.layerInfo&&(b=a.layerInfo.title),b||g.forEach(this.layers,function(c){if(c.ref.id===a.id)return void(b=c.layerInfo.title)}),b||(b=a.name,!b&&a.ref&&(b=a.ref._titleForLegend)),b},getFeatureLayerForDynamicSublayer:function(a,b){if(!a.layerInfos)return!1;var c=a.url+"/"+b;return this.featureLayers.hasOwnProperty(c)||(this.featureLayers[c]=new r(c)),this.featureLayers[c]},layerVisibleAtCurrentScale:function(a){var b=this.map.getScale();return!(0!==a.maxScale&&b<a.maxScale||0!==a.minScale&&b>a.minScale)},setMapClickMode:function(a){this.mapClickMode=a;var b=this.map;g.forEach(b.graphicsLayerIds,function(c){var d=b.getLayer(c);d&&("identify"===a?this.infoTemplates[d.id]&&(d.infoTemplate=f.clone(this.infoTemplates[d.id])):d.infoTemplate&&(this.infoTemplates[d.id]=f.clone(d.infoTemplate),d.infoTemplate=null))},this)}})});
//# sourceMappingURL=Identify.js.map