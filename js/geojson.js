/* Map of GeoJSON data from emission.geojson */

//function to instantiate the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0]
    }).setView([39.111151,-102.388723], 5);

    //add Mapbox base tilelayer
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
//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to for symbol size evenly
    var scaleFactor = 0.00002;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

function createPropSymbols(data, map){

    var attribute = "1990 Co2";

    //create marker geojsonMarkerOptions
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
             //For each feature, determine its value for the selected attribute
             var attValue = Number(feature.properties[attribute]);

             //Give each feature's circle marker a radius based on its attribute value
             geojsonMarkerOptions.radius = calcPropRadius(attValue);
 
            //create circle marker layer
            var layer = L.circleMarker(latlng, geojsonMarkerOptions);

            //build popup content string
            var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p><p>Values of Carbon are in Metric tons</p><p><b>Energy Source: </b>"+ feature.properties.Energy+ "</p><p><b>";

            //bind the popup to the circle marker
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,- geojsonMarkerOptions.radius) 
            });

            //event listeners to open popup on hover
            layer.on({
                mouseover: function(){
                    this.openPopup();
                },
                mouseout: function(){
                    this.closePopup();
                }
            });

            //return the circle marker to the L.geoJson pointToLayer option
            return layer;
        }
    }).addTo(map);
};


//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/emission.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

$('#panel').append('<input class="range-slider" style="margin: 10px 10px 10px 10px;width: 93%;" type="range">');
$('#panel').append('<button class="skip btn-sm btn btn-outline-danger" id="reverse">Reverse</button>');
$('#panel').append('<button class="skip btn-sm btn btn-outline-warning" id="forward">Skip</button>');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });

$(document).ready(createMap); // calling create map function on document ready