//set global variables
var lat;
var long;
var map;
var playDateMapBoxToken = 'pk.eyJ1IjoibWFya2dhdHgiLCJhIjoiY2w5MndoNDVqMDEwZDN5bXBiOTZseTYyMSJ9.-ZUmZXLJEzZyTkCwSBMGuw';
var goodWeatherCodes = [800, 801, 802, 803, 804, 741]
//replace spaces with %20 when in production
var goodWeatherSearches = ['playground%20', 'hike%20', 'lake%20', 'zoo%20', 'ice%20cream%20', 'pastry%20', 'track', 'state%20park%20', 'play']
var badWeatherSearches = ['museum%20', 'movie%20', 'library%20', 'craft%20', 'theater%20']
var iconCode = 800;
var activityFetchUrls = [];
var fullActivityList = [];


//functions for geolocation, have to be initialized before called in geolocation
function success(lat, long) {
    logLatLong(lat, long);
    // testFetch();
    // buildMaps();
}


function error() {
    alert(`Sorry, no position available. ERROR(${error.code}): ${error.message}.`);
    // noGeoSearchMap();
}


const options = {
    enableHighAccuracy: false,
    maximumAge: 30000,
    timeout: 27000
};


//Check for geolocation in browser
if ('geolocation' in navigator) {
    console.log('geolocation is available');
    // continue with using geolocation 
    navigator.geolocation.getCurrentPosition((position) => {
        success(position.coords.latitude, position.coords.longitude);
    }, error, options);

} else {
    console.log(' geolocation IS NOT available ');
    // send to location search... not necessary for basic function
    noGeoSearchMap();
};


// if no geolocation available (need to redirect to different page) or if declined permission -- beyond basic functionality so may not need
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
            long = data.features[0].geometry.coordinates[0];
            lat = data.features[0].geometry.coordinates[1];
            buildMaps();
        });
};


//populate searches based on weather codes
async function getSearchTopicsFromWeather() {
    if (goodWeatherCodes.includes(iconCode)) {
        //get unique random numbers
        let goodWeatherIndexArray = [];
        for (let i = 0; i < goodWeatherCodes.length; i++) {
            goodWeatherIndexArray.push(i);
        }
        for (let i = goodWeatherIndexArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [goodWeatherIndexArray[i], goodWeatherIndexArray[j]] = [goodWeatherIndexArray[j], goodWeatherIndexArray[i]];
        }
        //get results to pass to page for good weather.
        for (let i = 0; i < 5; i++) {
            activityIndex = goodWeatherIndexArray[i];
            let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${goodWeatherSearches[activityIndex]}.json?type=poi&limit=5&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`;
            console.log(fetchUrl)
            activityFetchUrls.push(fetchUrl);
        }
    } else {
        //get unique random numbers
        let badWeatherIndexArray = [];
        for (let i = 0; i < badWeatherCodes.length; i++) {
            badWeatherIndexArray.push(i);
        }
        for (let i = badWeatherIndexArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [badWeatherIndexArray[i], badWeatherIndexArray[j]] = [badWeatherIndexArray[j], badWeatherIndexArray[i]];
        }
        for (let i = 0; i < 5; i++) {
            activityIndex = badWeatherIndexArray[i];
            let fetchUrl2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${goodWeatherSearches[activityIndex]}.json?type=poi&limit=5&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`;
            activityFetchUrls.push(fetchUrl2);
        }
    }
    console.log(activityFetchUrls);
    fetchAllTheThings();
    // randomizeActivityList(allThings);
}


//fetch results for each random topic, randomize full list, save full list to local storage so don't need another fetch request
// async function fetchAllTheThings() {
//     for (let i = 0; i < activityFetchUrls.length; i++) {
//         console.log(activityFetchUrls[i])
//         fetch(activityFetchUrls[i], {
//             method: 'GET', //GET is the default.
//             credentials: 'same-origin', // include, *same-origin, omit
//             redirect: 'follow', // manual, *follow, error)
//         })
//             .then(function (response) {

//                 return response.json();
//             })
//             .then(function (data) {
//                 console.log(data)

//                 fullActivityList.push(data);
//                 console.log(fullActivityList)
//             });
//     } 
//     return fullActivityList;
// }

function fetchAllTheThings() {
    var promises = [];
    for (let i = 0; i < activityFetchUrls.length; i++) {
        console.log(activityFetchUrls[i])
        promises.push(fetch(activityFetchUrls[i], {
            method: 'GET', //GET is the default.
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error)
        }))
    }
    Promise.all(promises).then(response => Promise.all(response.map(item => item.json()))).then(response => randomizeActivityList(response))
}



//randomize fullActivityList
function randomizeActivityList(allThings) {
    console.log(allThings)

    for (let i = allThings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allThings[i], allThings[j]] = [allThings[j], allThings[i]];
    }
    // save activity list to local storage
    localStorage.setItem("localStorageActivityList", JSON.stringify(allThings));
    selectFiveActivities();
}


//randomly select Five Activities, send to page, and add marker
function selectFiveActivities() {
    fullActivityList = JSON.parse(localStorage.getItem('localStorageActivityList'));

    if (fullActivityList.length <= 0) {
        getSearchTopicsFromWeather();
        return;
    }
    // grab 5 activities
    for (let i = 0; i < 5; i++) {
        //randomly pick activity from array 
        let j = Math.floor(Math.random() * (fullActivityList[i].features.length));
        // console.log(fullActivityList)
        // console.log()
        // console.log(fullActivityList[i])
        // send info to page
        // NEED DOM TO SEND TO PAGE
        //create map marker
        var locationLong = fullActivityList[i].features[j].center[0];
        console.log(locationLong)
        var locationLat = fullActivityList[i].features[j].center[1]
        console.log(locationLat);
        console.log(fullActivityList[i].features[j].place_name)
        marker = new mapboxgl.Marker( {color:"green", rotation:25}) // initialize a new marker
            .setLngLat([locationLong, locationLat]) // Marker [lng, lat] coordinates
            .addTo(map); // Add the marker to the map
        //remove from the array
        fullActivityList[i].features.splice(j, 1);
        console.log(fullActivityList[i])
    }
}


// testing fetch endpoints. delete when not needed
// function testFetch() {
//     fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/donut.json?type=poi&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`, {
//         method: 'GET', //GET is the default.
//         credentials: 'same-origin', // include, *same-origin, omit
//         redirect: 'follow', // manual, *follow, error
//     })
//         .then(function (response) {
//             return response.json();
//         })
//         .then(function (data) {
//             console.log(data);
//             testMarker(data);
//         });
// }

// //testing adding markers. delete when not needed anymore
// function testMarker(data) {
//     console.log(data)
//     var locationLong = data.features[0].center[0];
//     console.log(locationLong)
//     var locationLat = data.features[0].center[1]
//     console.log(locationLat);
//     marker = new mapboxgl.Marker() // initialize a new marker
//         .setLngLat([locationLong, locationLat]) // Marker [lng, lat] coordinates
//         .addTo(map); // Add the marker to the map
// }


// regularly updates position -- Use if want to update position
//   const watchID = navigator.geolocation.watchPosition(success, error, options);



//   navigator.geolocation.clearWatch(watchID); --- stop watching position

function logLatLong(latitude, longitude) {
    lat = latitude;
    long = longitude;
    buildMaps();
}


function buildMaps() {
    mapboxgl.accessToken = playDateMapBoxToken;
    map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
        center: [long, lat], // Starting position [lng, lat]
        zoom: 12, // Starting zoom level
    });

    //set new location marker to map
    const marker = new mapboxgl.Marker() // initialize a new marker
        .setLngLat([long, lat]) // Marker [lng, lat] coordinates
        .addTo(map); // Add the marker to the map

    const geocoder = new MapboxGeocoder({
        // Initialize the geocoder -- allows active search on map
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
    //comment out past here once search terms are set
    // Add the geocoder to the map - allows search terms on map
    map.addControl(geocoder);


    map.on('load', () => {
        map.addSource('single-point', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        map.addLayer({
            id: 'point',
            source: 'single-point',
            type: 'circle',
            paint: {
                'circle-radius': 10,
                'circle-color': '#448ee4'
            }
        });

        // Listen for the `result` event from the Geocoder
        // `result` event is triggered when a user makes a selection
        //  Add a marker at the result's coordinates
        geocoder.on('result', (event) => {
            map.getSource('single-point').setData(event.result.geometry);
        });
    });
    getSearchTopicsFromWeather();
}
