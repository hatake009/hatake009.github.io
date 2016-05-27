var mapPanel, datastore, gridPanel, mainPanel;
 
Ext.onReady(function() {
 
// 座標系の設定
var epsg4326 = new OpenLayers.Projection("EPSG:4326");
var epsg3857 = new OpenLayers.Projection("EPSG:3857");
 
var map = new OpenLayers.Map();
 
// openstreetmapの作成
var osmLayer = new OpenLayers.Layer.OSM("OSM");
 
map.displayProjection = epsg4326;
 
// controlの設定
map.addControl(new OpenLayers.Control.MousePosition({
id : "ll_mouse",
formatOutput : formatLonlats
}));
map.addControl(new OpenLayers.Control.ScaleLine());
 
map.addControl(new OpenLayers.Control.LayerSwitcher());
map.addControl(new OpenLayers.Control.MousePosition());
map.addControl(new OpenLayers.Control.OverviewMap());
 
// create vector layer
var context = {
getColor : function(feature) {
var index;
if (feature.attributes.name.indexOf("横浜") > -1) {
return 'green';
} else if (feature.attributes.name.indexOf("川崎") > -1) {
return 'orange';
} else if (feature.attributes.name.indexOf("相模原") > -1) {
return 'yellow';
} else {
return 'red';
}
}
};
 
// polygon template
var template = {
fillOpacity : 0.5,
fillColor : "${getColor}",
strokeWidth : 1,
strokeOpacity : 1,
strokeColor : "${getColor}"
};
 
var style = new OpenLayers.Style(template, {
context : context
});
 
// 神奈川県の市区町村行政界
var vecLayer = new OpenLayers.Layer.Vector("行政界", {
strategies : [new OpenLayers.Strategy.Fixed()],
styleMap : new OpenLayers.StyleMap({
'default' : style
}),
protocol : new OpenLayers.Protocol.HTTP({
url : "../data/c14_region.json",
format : new OpenLayers.Format.GeoJSON()
})
 
});
 
// layerの追加
map.addLayers([osmLayer, vecLayer]);
 
map.setCenter(new OpenLayers.LonLat(139.4, 35.4).transform(
epsg4326, epsg3857), 9);
 
// create map panel
mapPanel = new GeoExt.MapPanel({
title : "Map OpenStreetMapとGeoJSONデータ",
region : "center",
height : 400,
width : 500,
map : map,
// center: new OpenLayers.LonLat(139.4, 35.4),
zoom : 9
});
 
// create feature store, binding it to the vector layer
datastore = new GeoExt.data.FeatureStore({
layer : vecLayer,
fields : [{
name : 'name',
type : 'string'
}, {
name : 'code',
type : 'integer'
}],
autoLoad : true
});
 
// create grid panel configured with feature store
gridPanel = new Ext.grid.GridPanel({
title : "Feature Grid",
region : "east",
store : datastore,
width : 270,
columns : [{
header : "市区町村名",
width : 150,
dataIndex : "name",
sortable: true
}, {
header : "行政コード",
width : 100,
dataIndex : "code",
sortable: true
}],
sm : new GeoExt.grid.FeatureSelectionModel()
});
 
// create a panel and add the map panel and grid panel
// inside it
mainPanel = new Ext.Panel({
renderTo : "mainpanel",
layout : "border",
height : 400,
width : 770,
items : [mapPanel, gridPanel]
});
 
// マウス座標の緯度経度変換
function formatLonlats(lonLat) {
var lat = lonLat.lat;
var long = lonLat.lon;
var ns = OpenLayers.Util.getFormattedLonLat(lat);
var ew = OpenLayers.Util.getFormattedLonLat(long, 'lon');
return ns + ', ' + ew + ' ('
+ (Math.round(lat * 100000) / 100000) + ', '
+ (Math.round(long * 100000) / 100000) + ')';
}
 
});
