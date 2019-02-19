var mymap = L.map('mapid').setView([51.505, -0.09], 13);  //creating mymap variable which as mapid and setting the location of map when it loads
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibmlzaGlkaWxpcHNvbnRha2tlIiwiYSI6ImNqY3FucHJ4azAzNXgzM3MwbGRvM3M2YWsifQ.Mwh9X4xZhkSBBCTfBlZHEQ'
}).addTo(mymap); // using mapbox service to upload the map tiles.

var marker = L.marker([51.5, -0.09]).addTo(mymap); // creating marker at the given location 

var circle = L.circle([51.508, -0.11], { // creating circle at the given location and giving it attributes like color, opacity, size 
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap); // adding to the map

var polygon = L.polygon([ //creating polygon at the given location
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap); // adding to the map

marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup(); // using this function to add popup to the marker
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");


var popup = L.popup(); //defining new variable popup, and calling L.popup buildin function. This will call the pop whenever the event is performed.
function onMapClick(e) { // defining click function
    popup    // calling popup
        .setLatLng(e.latlng)  
        .setContent("You clicked the map at " + e.latlng.toString()) // setting the popup content
        .openOn(mymap); // adding it to the map
}

mymap.on('click', onMapClick); // calling click function

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}
// creating geojson feature
var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature //calling this function to bind properties to it.
}).addTo(mymap);  // adding feature to app

// creating geojson feature
var myLines = [{
    "type": "LineString",
    "coordinates": [[-100, 40], [-105, 45], [-110, 55]]
}, {
    "type": "LineString",
    "coordinates": [[-105, 40], [-110, 45], [-115, 55]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};
// adding geojson feature to map and giving it the style defined in mystyle variable.
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

// defining circle marker style attributes
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};
// adding it to map
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(mymap);

// creating geojson 
var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];
// adding featuers with filter
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);