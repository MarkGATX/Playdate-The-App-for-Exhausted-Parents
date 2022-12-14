//set global variables
var lat = 0;
var long = 0;
var minLat = 0;
var minLong = 0;
var maxLat = 0;
var maxLong = 0;
var map;
var playDateMapBoxToken = 'pk.eyJ1IjoibWFya2dhdHgiLCJhIjoiY2w5MndoNDVqMDEwZDN5bXBiOTZseTYyMSJ9.-ZUmZXLJEzZyTkCwSBMGuw';
var goodWeatherCodes = [800, 801, 802, 803, 804, 741]
//replace spaces with %20 when in production
var goodWeatherSearches = ['playground%20', 'hike%20', 'lake%20', 'zoo%20', 'ice%20cream%20', 'track', 'state%20park%20', 'play']
var badWeatherSearches = ['museum%20', 'movie%20', 'library%20', 'craft%20', 'theater%20', 'aquarium']
var iconCode;
var activityFetchUrls = [];
var fullActivityList = [];
var savedLocalReviews = [];
var currentReviewTitle = "";
var isCurrentReviewPresent;
// variable for weather icons, to be used for further search terms

//weatherbit.io API retrieval
var weatherAPIKey = "cee3158b81624efdb69c85c5b782d480";

var queryUrl = "https://api.weatherbit.io/v2.0/current?lat=";
//retrieving weather at current location
var weatherIconList = "https://www.weatherbit.io/static/img/icons/";

var coordinateUrl;
var activityListParent = document.querySelector('.activities');
var activeEventInfoEl = document.querySelector('#info')

//create variables for possible marker interactivity
mapMarkers = ['marker0', 'marker1', 'marker2', 'marker3', 'marker4']


//functions for geolocation, have to be initialized before called in geolocation
function success(lat, long) {
    logLatLong(lat, long);
}

function error() {
    alert(`Sorry, no position available. ERROR(${error.code}): ${error.message}.`);
    // noGeoSearchMap();
}

//function to retrieve weather data
function geolocationWeather() {
    fetch(coordinateUrl).then(function (response) {
        if (response.ok) {
            return response.json().then(function getWeatherData(data) {
                //add to display weather section
                var weatherAreaEl = $("#weather-header");
                //obtain weather icons from API
                var weatherIcon = data.data[0].weather.icon;
                var weatherIconUrl = weatherIconList + weatherIcon + '.png';
                //update iconCode
                iconCode = data.data[0].weather.code;
                //create image element for weather icon
                var weatherIconImg = $(`<img>`).attr({
                    id: 'weather-icon',
                    src: weatherIconUrl,
                    alt: 'Image of simple weather icon',
                }).height(35).width(35);
                weatherAreaEl.text("Current temp: ");
                weatherAreaEl.append(weatherIconImg)
                weatherAreaEl.append(data.data[0].temp + "\u00B0 F");
                //create unordered list of weather details
                var weatherListEl = $(`<ul>`);
                var weatherDetails = [
                    "Conditions: " + data.data[0].weather.description,
                    "Wind: " + data.data[0].wind_spd + " MPH",
                    "Humidity: " + data.data[0].rh + "%",
                    "UV Index: " + data.data[0].uv
                ]
                //add in the API-listed weather details
                for (var x = 0; x < weatherDetails.length; x++) {
                    var weatherItems = $(`<li>`).text(weatherDetails[x])
                    weatherItems.attr({id: "weather-list-item"});
                    weatherListEl.append(weatherItems);
                }
                var weatherIconEl = $("#nav-weather");
                weatherIconEl.append(weatherIconImg);
                var weatherInfoEl = $("#weather-info");
                weatherInfoEl.append(weatherListEl);
            })
        }
    })
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
//function noGeoSearchMap() {
//console.log('ping');
//need input to city city data.
// noGeoCitySearch = input.value -- pass to fetch request
//fetchURL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/boston.json?&access_token=' + playDateMapBoxToken;
//fetch(fetchURL, {
//method: 'GET', //GET is the default.
//credentials: 'same-origin', // include, *same-origin, omit
//redirect: 'follow', // manual, *follow, error
//})
//.then(function (response) {
//return response.json();
// })
//.then(function (data) {
//console.log(data);
//long = data.features[0].geometry.coordinates[0];
//lat = data.features[0].geometry.coordinates[1];
//buildMaps();
//});
//};


//populate searches based on weather codes
async function getSearchTopicsFromWeather() {
    activityFetchUrls = [];
    console.log(iconCode)
    if (goodWeatherCodes.includes(iconCode)) {
        //get unique random numbers
        let goodWeatherIndexArray = [];
        for (let i = 0; i < goodWeatherSearches.length; i++) {
            goodWeatherIndexArray.push(i);
        }
        for (let i = goodWeatherIndexArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [goodWeatherIndexArray[i], goodWeatherIndexArray[j]] = [goodWeatherIndexArray[j], goodWeatherIndexArray[i]];
        }
        //get results to pass to page for good weather.
        for (let i = 0; i < 5; i++) {
            activityIndex = goodWeatherIndexArray[i];
            let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${goodWeatherSearches[activityIndex]}.json?bbox=${minLong},${minLat},${maxLong},${maxLat}&type=poi&limit=5&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`;
            activityFetchUrls.push(fetchUrl);
        }
    } else {
        //get unique random numbers
        let badWeatherIndexArray = [];
        for (let i = 0; i < badWeatherSearches.length; i++) {
            badWeatherIndexArray.push(i);
        }
        for (let i = badWeatherIndexArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [badWeatherIndexArray[i], badWeatherIndexArray[j]] = [badWeatherIndexArray[j], badWeatherIndexArray[i]];
        }
        for (let i = 0; i < 5; i++) {
            activityIndex = badWeatherIndexArray[i];
            let fetchUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${badWeatherSearches[activityIndex]}.json?bbox=${minLong},${minLat},${maxLong},${maxLat}&type=poi&limit=5&proximity=${long},${lat}&access_token=${playDateMapBoxToken}`;
            activityFetchUrls.push(fetchUrl);
        }
    }
    fetchAllTheThings();
}


function fetchAllTheThings() {
    var promises = [];
    for (let i = 0; i < activityFetchUrls.length; i++) {
        promises.push(fetch(activityFetchUrls[i], {
            method: 'GET', //GET is the default.
            credentials: 'same-origin', // include, *same-origin, omit
            redirect: 'follow', // manual, *follow, error)
        }))
    }
    Promise.all(promises).then(response => Promise.all(response.map(item => item.json()))).then(response => randomizeActivityList(response)).catch((error) => {
        console.error(error);
    });
}



//randomize fullActivityList
function randomizeActivityList(allThings) {
    for (let i = allThings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allThings[i], allThings[j]] = [allThings[j], allThings[i]];
    }
    // save activity list to local storage
    localStorage.setItem("localStorageActivityList", JSON.stringify(allThings));
    selectFiveActivities();
    return
}


//randomly select Five Activities, send to page, and add marker
function selectFiveActivities() {
    fullActivityList = JSON.parse(localStorage.getItem('localStorageActivityList'));
    if (fullActivityList.length <= 0) {
        getSearchTopicsFromWeather();
        return;
    } else {
        // grab 5 activities
        for (let i = 0; i < 5; i++) {
            //randomly pick activity from array 
            let featureAddress = ""
            let j = Math.floor(Math.random() * (fullActivityList[i].features.length));
            //create map marker
            var locationLong = fullActivityList[i].features[j].center[0];
            var locationLat = fullActivityList[i].features[j].center[1]
            var activityListEl = document.createElement('li');
            //if address not defined in results, pass along empty string in variable, else pass along address. use variable in calls
            if (fullActivityList[i].features[j].properties.address === undefined) {
                featureAddress = ""
            } else {
                featureAddress = fullActivityList[i].features[j].properties.address;
            }
            if (fullActivityList[i].features[j].properties.category === undefined) {
                featureTags = ""
            } else {
                featureTags = fullActivityList[i].features[j].properties.category;
            }
            // send info to page
            activityListEl.setAttribute('class', 'activityListItem')
            activityListEl.innerHTML = `<h5 class="activityName">${fullActivityList[i].features[j].text}</h5><p class="activityAddress">${featureAddress}</p><p class="activityProperties">${featureTags}`;
            activityListParent.appendChild(activityListEl);
            marker = new mapboxgl.Marker({ color: "green", rotation: 25 }) // initialize a new marker
                .setLngLat([locationLong, locationLat]) // Marker [lng, lat] coordinates
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setHTML(
                            `<h4>${fullActivityList[i].features[j].text}</h4><p>${featureAddress}</p>`

                        )
                )
                .addTo(map); // Add the marker to the map
            //remove from the array
            fullActivityList[i].features.splice(j, 1);
        }
        localStorage.setItem('localStorageActivityList', JSON.stringify(fullActivityList));
        activityListParent.addEventListener('click', populateActiveEvent);

    }
}

function populateActiveEvent(event) {
    event.preventDefault();
    var clickedEvent = event.target.closest('li');
    //pull local storage
    savedLocalReviews = JSON.parse(localStorage.getItem('savedLocalReviewsStorage'));
    //initialize local storage array if doesn't exist
    if (savedLocalReviews === null) {
        savedLocalReviews = [];
        localStorage.setItem('savedLocalReviewsStorage', JSON.stringify(savedLocalReviews))
    }
    var isCurrentReviewPresent = false;
    currentReviewTitle = clickedEvent.querySelector('.activityName').textContent;
    //check if current activity has an existing review  
    if (savedLocalReviews === []) {
        var isCurrentReviewPresent = false;
    } else for (i = 0; i < savedLocalReviews.length; i++) {
        if (currentReviewTitle === savedLocalReviews[i][0]) {
            var isCurrentReviewPresent = true;
            var pastReview = savedLocalReviews[i][1]
            break
        } 
    }

    //get card title with name of activity
    var cardTitleName = document.querySelector('#desInfo');
    cardTitleName.innerHTML = "";
    //populate page based on whether activity has a review already or not
    if (isCurrentReviewPresent === false) {
        cardTitleName.innerHTML = `<li><div class="collapsible-header "><i class="material-icons">place</i>${clickedEvent.querySelector('.activityName').textContent}</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i>${clickedEvent.querySelector('.activityAddress').textContent}</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i>You havent added a review yet!</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i>Click here to submit your review...</div>
                <div class="collapsible-body input-field "><i class="material-icons">place</i><input type="text" placeholder='Type your review here...'/><button class='reviewSubmit'>Save your review</button></div></li>`;
    } else {
        cardTitleName.innerHTML = `<li><div class="collapsible-header "><i class="material-icons">place</i>${clickedEvent.querySelector('.activityName').textContent}</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i>${clickedEvent.querySelector('.activityAddress').textContent}</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i><strong>Your review: </strong>${pastReview}</div></li>
            <li><div class="collapsible-header "><i class="material-icons">place</i>Click here to update your review...</div>
                <div class="collapsible-body input-field"><i class="material-icons">place</i><input type="text" placeholder='Type your review here...'/><button class='reviewSubmit'>Save your review</button></div></li>`;
    }
    document.querySelector('.reviewSubmit').addEventListener('click', logReview);
}


function logLatLong(latitude, longitude) {
    lat = latitude;
    long = longitude;
    coordinateUrl = queryUrl + lat + '&lon=' + long + '&key=' + weatherAPIKey + '&units=I';
    minLong = long - .5;
    maxLong = long + .5;
    minLat = lat - .5;
    maxLat = lat + .5;
    geolocationWeather();
    setTimeout(buildMaps, 5000);

}


function buildMaps() {
    mapboxgl.accessToken = playDateMapBoxToken;
    map = new mapboxgl.Map({
        container: 'map', // Container ID
        style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
        center: [long, lat], // Starting position [lng, lat]
        pitch: 60,
        zoom: 12, // Starting zoom level
    });

    //set new location marker to map
    const marker = new mapboxgl.Marker() // initialize a new marker for current location
        .setLngLat([long, lat]) // Marker [lng, lat] coordinates
        .addTo(map); // Add the marker to the map

    //Initialize the geocoder -- allows active search on map
    const geocoder = new MapboxGeocoder({
        accessToken: playDateMapBoxToken, // Set the access token
        placeholder: 'Search for nearby places',
        mapboxgl: mapboxgl, // Set the mapbox-gl instance
        marker: true,  // Do not use the default marker style
        bbox: [minLong, minLat, maxLong, maxLat], // Boundary for Berkeley
        proximity: {
            longitude: long,
            latitude: lat
        } //local coordinates
    });

    // Add the geocoder to the map 
    // map.addControl(geocoder);


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



function logReview(event) {
    savedLocalReviews = JSON.parse(localStorage.getItem('savedLocalReviewsStorage'));
    if (savedLocalReviews === null) {
        savedLocalReviews = [];
        localStorage.setItem('savedLocalReviewsStorage', JSON.stringify(savedLocalReviews))
    }
    var currentReview = (event.target.previousElementSibling.value);

    if (savedLocalReviews.length === 0) {
        savedLocalReviews.push([currentReviewTitle, currentReview]);
        localStorage.setItem('savedLocalReviewsStorage', JSON.stringify(savedLocalReviews));

        // return;
    }
    for (i = 0; i < savedLocalReviews.length; i++) {
        if (currentReviewTitle === savedLocalReviews[i][0]) {
            savedLocalReviews[i][1] = currentReview;
            localStorage.setItem('savedLocalReviewsStorage', JSON.stringify(savedLocalReviews));
            return
        } else {
            var SavedReview = false;
        }
    }
    if (SavedReview === false) {
        savedLocalReviews.push([currentReviewTitle, currentReview]);
 
    }
    localStorage.setItem('savedLocalReviewsStorage', JSON.stringify(savedLocalReviews));
    return
}


// regularly updates position -- Use if want to update position
//   const watchID = navigator.geolocation.watchPosition(success, error, options);

//   navigator.geolocation.clearWatch(watchID); --- stop watching position
//};

//grabs position once
// navigator.geolocation.getCurrentPosition((position) => {
//     success(position.coords.latitude, position.coords.longitude);
//     console.log(lat);
//     console.log(long);
//     var coordinateUrl = queryUrl + lat + '&lon=' + long + '&key=' + weatherAPIKey + '&units=I';
//     console.log(coordinateUrl);

// }, error, options);
