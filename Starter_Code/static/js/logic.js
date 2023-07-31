
// generating map
var map = L.map("map", {
    center: [37.5, -97], //centered on america
    zoom: 3.5,
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
// var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"

// need a function to calculate the color of any given earthquake
function getColor(depth) {

// variables to help with modifying color
var minDepth = 0;
var maxDepth = 100; //100 seems to scale well  for hourly data

var percentage = (depth - minDepth) / (maxDepth - minDepth);

// use the percentage to calculate the color
var r = Math.floor((1 - percentage) * 255);
var g = Math.floor(percentage * 255);
var b = 0;

// generate and return the rgb color
return "rgb(" + r + "," + g + "," + b + ")";
}

// converts unix time to noraml time
function formatTime(timestamp) {
    var date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    }).format(date);
}

// create legend and calculate the color for the values used for the legend
function createLegend() {
    var legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    var depths = [20, 40, 60, 80, 100]; // Customize these depth ranges as needed
    var labels = [];

    // Add legend title
    div.innerHTML += '<h4>Depth (km)</h4>';

    // Loop through the depth ranges and generate legend labels with color markers
    for (var i = 0; i < depths.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + (depths[i + 1] - 1) + '<br>' : '+');
    }

    return div;
};

    return legend;
}

// add legend to map
var legend = createLegend();
legend.addTo(map);

// create a loop for the data using D3
d3.json(url).then(function(response) {
    
    // create a loop to iterate through all eathrquakes to create the circles, the size, the color and the popup information
    for (var i = 0; i < response.features.length; i++) {
    var coordinates = response.features[i].geometry.coordinates;
    var magni = response.features[i].properties.mag;
    var time = response.features[i].properties.time
    var depth = response.features[i].geometry.coordinates[2];
    var color = getColor(depth)

    // adding a variable to list popup for future custumization
    var popup = "Earthquake Magnitude: " + magni +
    "<br>Earthquake Depth: " + depth +
    "<br>Time: " + formatTime(time);
    // placing map markers
    L.circleMarker([coordinates[1], coordinates[0]], {
        radius : Math.sqrt(magni) * 3, // weekly needs 3 but hourly looked better with 6+
        fillColor  : color,
        color: color,
        opacity: 1,
        fillOpacity: .8

    }).addTo(map).bindPopup(popup);
    }
});
