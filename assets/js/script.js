//set global variables
var lat;
var long;
var playDateMapBoxToken = 'pk.eyJ1IjoibWFya2dhdHgiLCJhIjoiY2w5MndoNDVqMDEwZDN5bXBiOTZseTYyMSJ9.-ZUmZXLJEzZyTkCwSBMGuw';


//Check for geolocation in browser
if ('geolocation' in navigator) {
    console.log( 'geolocation is available' ); 
    // continue with using geolocation 
  } else {
    console.log(' geolocation IS NOT available ');
    // send to function to simply search for location, maybe noGeoSearchMap();
  };

function success(lat, long) {
    logLatLong(lat, long);
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
  
  //grabs position once 
navigator.geolocation.getCurrentPosition((position) => {
    success(position.coords.latitude, position.coords.longitude);
  }, error,options);

  // regularly updates position -- if we want to constantly update location
//   const watchID = navigator.geolocation.watchPosition(success, error, options);

//   navigator.geolocation.clearWatch(watchID); --- stop watching position

function logLatLong (latitude, longitude) {
    lat= latitude;
    long = longitude;
  }

  function noGeoSearchMap(){

  };