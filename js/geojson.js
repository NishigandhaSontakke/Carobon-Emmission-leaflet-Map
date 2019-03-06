/* Map of GeoJSON data from emission.geojson */

// Global variable to hold layer
var searchLayer;

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



function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("Co2") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};
function createPropSymbols(data, map, attributes){

    // var attribute = "1990 Co2";
   searchLayer= L.geoJson(data, {
     pointToLayer: function(feature, latlng){
         return pointToLayer(feature, latlng, attributes);
     }
 }).addTo(map);
 };
 
 function pointToLayer(feature, latlng,attributes){
 
     var attribute = attributes[0];
     console.log(attribute);
     //create marker geojsonMarkerOptions
     var options = {
         radius: 8,
         fillColor: "#ff7800",
         color: "#000",
         weight: 1,
         opacity: 1,
         fillOpacity: 0.8
     };
     var attValue = Number(feature.properties[attribute]);
 
     //Give each feature's circle marker a radius based on its attribute value
     options.radius = calcPropRadius(attValue);
 
     //create circle marker layer
     var layer = L.circleMarker(latlng, options);
 
     //build popup content string
     var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p><p>Values of Carbon are in Metric tons</p><p><b>Energy Source: </b>"+ feature.properties.Energy+ "</p><p><b>";
 
     //bind the popup to the circle marker
     layer.bindPopup(popupContent, {
         offset: new L.Point(0,- options.radius) 
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
 
 };
//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/emission.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
            SearchLayer(response, map,searchLayer);
        }
    });
};
// function for serach layer, taking input layer form the createPropSymbols function output
function SearchLayer(response, map,searchLayer){
    var searchControl = new  L.control.search({
        layer: searchLayer ,
        propertyName: 'Name',// Specify which property is searched into.
        marker: false, //setting marker to false so that they do not display on the map.
        initial: false,
        zoom: 11, 
        textPlaceholder: 'Search...'
      });
      searchControl.on('search:locationfound', function(e) {
		
		//console.log('search:locationfound', );
		//map.removeLayer(this._markerSearch)
		//e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
		if(e.layer._popup)
			e.layer.openPopup();
	}).on('search:collapsed', function(e) {
		featuresLayer.eachLayer(function(layer) {	//restore feature color
			featuresLayer.resetStyle(layer);
		});	
	});
      map.addControl( searchControl );
};


function createSequenceControls(map,attributes){
$('#panel').append('<input class="range-slider" style="margin: 10px 10px 10px 10px;width: 93%;" type="range">');
$('#panel').append('<button class="skip btn-sm btn btn-outline-danger" id="reverse"><i class="fas fa-angle-double-left"> Reverse</i></button>');
$('#panel').append('<button class="skip btn-sm btn btn-outline-warning" id="forward">Skip <i class="fas fa-angle-double-right"></i></button>');

    //set slider attributes
    $('.range-slider').attr({
        max: 6,
        min: 0,
        value: 0,
        step: 1
    });
 //input listener for slider
    $('.range-slider').on('input', function(){
        //sequence
        var index = $(this).val();
        updatePropSymbols(map, attributes[index]);
    });
    $('.skip').click(function(){
         //get the old index value
         var index = $('.range-slider').val();
         //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            // if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        // update slider
        $('.range-slider').val(index);
        updatePropSymbols(map, attributes[index]);
       
    });

   
};
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layers){
        if (layers.feature && layers.feature.properties[attribute]){
            //access feature properties
            var props = layers.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layers.setRadius(radius);

            //add formatted attribute to panel content string
            var popupContent = "<p><b>State:</b> " + props.State + "</p><p><b>" + attribute + ":</b> " + props[attribute] + "</p><p>Values of Carbon are in Metric tons</p><p><b>Energy Source: </b>"+ props.Energy+ "</p><p><b>";

            //replace the layer popup
            layers.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};



$(document).ready(createMap); // calling create map function on document ready