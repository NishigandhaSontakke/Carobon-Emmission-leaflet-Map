/* Map of GeoJSON data from MegaCities.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });

    //add OSM base tilelayer
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18, // setting min amd max level of zoom
        minZoom: 2,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1IjoibmlzaGlkaWxpcHNvbnRha2tlIiwiYSI6ImNqY3FucHJ4azAzNXgzM3MwbGRvM3M2YWsifQ.Mwh9X4xZhkSBBCTfBlZHEQ'
    }).addTo(map);
    //call getData function
    getData(map);
};
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/megacity.geojson", {
        dataType: "json",
        success: function(response){
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                },
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};

$(document).ready(createMap); // calling create map function on document ready