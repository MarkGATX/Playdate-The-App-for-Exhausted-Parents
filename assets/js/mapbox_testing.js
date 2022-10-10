//set global variables
var lat;
var long;
var map;
var playDateMapBoxToken = 'pk.eyJ1IjoibWFya2dhdHgiLCJhIjoiY2w5MndoNDVqMDEwZDN5bXBiOTZseTYyMSJ9.-ZUmZXLJEzZyTkCwSBMGuw';
var goodWeatherCodes = [800,801,802, 803,804,741]
var goodWeatherSearches = ['playground_', 'hike_', 'lake_', 'zoo_']
var badWeatherSearches = ['museum_', 'movie_', 'library_', 'craft_']


//Check for geolocation in browser
if ('geolocation' in navigator) {
    console.log( 'geolocation is available' ); 
    // continue with using geolocation 
  } else {
    console.log(' geolocation IS NOT available ');
    // send to function to simply search for location
  };

function noGeoSearchMap() {
    console.log('ping');
    //need input to city city data.
    // noGeoCitySearch = input.value -- pass to fetch request
    fetchURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/boston.json?&access_token=' + playDateMapBoxToken;
    fetch(fetchURL, {
        method: 'GET', //GET is the default.
        credentials: 'same-origin', // include, *same-origin, omit
        redirect: 'follow', // manual, *follow, error
    })
        .then(function (response) {
        return response.json();
    })
        .then(function (data) {
         console.log(data);
        long=data.features[0].geometry.coordinates[0];
        lat=data.features[0].geometry.coordinates[1];
        buildMaps();
  });
};



function success(lat, long) {
    logLatLong(lat, long);
    testFetch();
    buildMaps();
  }
  
function error() {
    alert(`Sorry, no position available. ERROR(${error.code}): ${error.message}. \nLet's try a search option instead.`);
    noGeoSearchMap();
  }
  
const options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 27000
  };
  
  //grabs position once -- seems more accurate
navigator.geolocation.getCurrentPosition((position) => {
    success(position.coords.latitude, position.coords.longitude);
  }, error,options);

  // regularly updates position -- 
//   const watchID = navigator.geolocation.watchPosition(success, error, options);



//   navigator.geolocation.clearWatch(watchID); --- stop watching position

function logLatLong (latitude, longitude) {
    lat= latitude;
    long = longitude;
    buildMaps();
  }


// # Prioritizes Peet's locations in San Francisco
// https://api.mapbox.com/geocoding/v5/mapbox.places/{search terms}.json?proximity={lat},{long}&access_token=pk.eyJ1IjoibWFya2dhdHgiLCJhIjoiY2w5MndoNDVqMDEwZDN5bXBiOTZseTYyMSJ9.-ZUmZXLJEzZyTkCwSBMGuw


function buildMaps() {
mapboxgl.accessToken = playDateMapBoxToken;
   map = new mapboxgl.Map({
    container: 'map', // Container ID
    style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
    center: [long, lat], // Starting position [lng, lat]
    zoom: 12, // Starting zoom level
  });

  //set new marker to map
  const marker = new mapboxgl.Marker() // initialize a new marker
  .setLngLat([long, lat]) // Marker [lng, lat] coordinates
  .addTo(map); // Add the marker to the map

  const geocoder = new MapboxGeocoder({
    // Initialize the geocoder
    accessToken: playDateMapBoxToken, // Set the access token
    placeholder: 'Search for nearby places',
    mapboxgl: mapboxgl, // Set the mapbox-gl instance
    marker: false,  // Do not use the default marker style
    // bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary for Berkeley
    proximity: {
    longitude: long,
    latitude: lat
  } //local coordinates
  });

  // Add the geocoder to the map
// map.addControl(geocoder);


// map.on('load', () => {
//     map.addSource('single-point', {
//       type: 'geojson',
//       data: {
//         type: 'FeatureCollection',
//         features: []
//       }
//     });
  
//     map.addLayer({
//       id: 'point',
//       source: 'single-point',
//       type: 'circle',
//       paint: {
//         'circle-radius': 10,
//         'circle-color': '#448ee4'
//       }
//     });
  
//     // Listen for the `result` event from the Geocoder
//     // `result` event is triggered when a user makes a selection
//     //  Add a marker at the result's coordinates
//     geocoder.on('result', (event) => {
//       map.getSource('single-point').setData(event.result.geometry);
//     });
//   });


// }
function testFetch() {
fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/donut.json?type=poi&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`, {
  method: 'GET', //GET is the default.
  credentials: 'same-origin', // include, *same-origin, omit
  redirect: 'follow', // manual, *follow, error
})
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    testMarker(data);
  });
}





function testMarker (data) {
    console.log(data)
    var locationLong = data.features[0].center[0];
    console.log(locationLong)
    var locationLat = data.features[0].center[1]
    console.log(locationLat);
    marker = new mapboxgl.Marker() // initialize a new marker
    .setLngLat([locationLong, locationLat]) // Marker [lng, lat] coordinates
    .addTo(map); // Add the marker to the map
}






// elements, links, and scripts required
//   <link href='https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.css' rel='stylesheet' />
{/* <link rel='stylesheet' href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.css' type='text/css' /> */}


//   <script src='https://api.mapbox.com/mapbox-gl-js/v2.9.2/mapbox-gl.js'></script>
// /* <script src='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.7.0/mapbox-gl-geocoder.min.js'></script> ----MUST BE IN HEAD*/
//  <div id='map'></map>

//Adding marker to map
// const marker = new mapboxgl.Marker() // initialize a new marker
//   .setLngLat([-122.25948, 37.87221]) // Marker [lng, lat] coordinates
//   .addTo(map); // Add the marker to the map



// mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
//   const map = new mapboxgl.Map({
//     container: 'map', // Container ID
//     style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
//     center: [-122.25948, 37.87221], // Starting position [lng, lat]
//     zoom: 12, // Starting zoom level
//   });

// const geocoder = new MapboxGeocoder({
//     // Initialize the geocoder
//     accessToken: mapboxgl.accessToken, // Set the access token
//     mapboxgl: mapboxgl, // Set the mapbox-gl instance
//     marker: false // Do not use the default marker style
//     placeholder: 'Search for places in Berkeley', // Placeholder text for the search bar
//     bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary for Berkeley
//     proximity: {
//     longitude: -122.25948,
//     latitude: 37.87221
//   } // Coordinates of UC Berkeley
//   });
  
//   // Add the geocoder to the map
//   map.addControl(geocoder);

// After the map style has loaded on the page,
// add a source layer and default styling for a single point
// map.on('load', () => {
//     map.addSource('single-point', {
//       type: 'geojson',
//       data: {
//         type: 'FeatureCollection',
//         features: []
//       }
//     });
  
//     map.addLayer({
//       id: 'point',
//      source: 'single-point',
//     type: 'circle',
//     paint: {
//       'circle-radius': 10,
//       'circle-color': '#448ee4'
//     }
//   });

//   // Listen for the `result` event from the Geocoder
//   // `result` event is triggered when a user makes a selection
//   //  Add a marker at the result's coordinates
//   geocoder.on('result', (event) => {
//     map.getSource('single-point').setData(event.result.geometry);
//   });
// });
}