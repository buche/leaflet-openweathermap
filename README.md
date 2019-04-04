# OpenWeatherMap for Leaflet based maps

## END OF LIFE
**This project is no longer maintained.**
If you like to continue this project, just fork it and go on. If you drop me a note maybe I'll add a prominent link to your fork here in this readme.

## Description
[OpenWeatherMap](https://openweathermap.org/) (OWM) is a service providing weather related data, visualizing it using an OpenLayers based map. This is an independant Leaflet based script providing easy access to OWM's features for Leaflet based maps.

In short: An independant JavaScript library for including OWM's layers and OWM's current city data in Leaflet based maps without hassle.

## Demo

An example map using many features of this library can be seen at [ahorn.lima-city.de/owm](https://ahorn.lima-city.de/owm/).
Its "Wind Rose" overlay is an example of a user defined marker to give you an idea what can be achieved by user defined functions for markers.
This map is available in the example directory, too.

## License

This code is licensed under [CC0](https://creativecommons.org/publicdomain/zero/1.0/ "Creative Commons Zero - Public Domain").
Some files in the example directory may have other licences (e.g. leaflet.js - see leaflet.license) - please have a look at the files if needed.

## Using TileLayers

OWM offers some TileLayers: Clouds, Clouds Classic, Precipitation, Precipitation Classic, Rain, Rain Classic, Snow, Temperature, Wind Speed, Pressure and Pressure Contours.

### Initializing TileLayers

Here's how to initialize these TileLayers (an AppId is mandatory now, get your own [here](https://www.openweathermap.org/appid)):

* var clouds = L.OWM.clouds({appId: 'YOUR_OWN_APPID'});
* var cloudscls = L.OWM.cloudsClassic({appId: 'YOUR_OWN_APPID'});
* var precipitation = L.OWM.precipitation({appId: 'YOUR_OWN_APPID'});
* var precipitationcls = L.OWM.precipitationClassic({appId: 'YOUR_OWN_APPID'});
* var rain = L.OWM.rain({appId: 'YOUR_OWN_APPID'});
* var raincls = L.OWM.rainClassic({appId: 'YOUR_OWN_APPID'});
* var snow = L.OWM.snow({appId: 'YOUR_OWN_APPID'});
* var pressure = L.OWM.pressure({appId: 'YOUR_OWN_APPID'});
* var pressurecntr = L.OWM.pressureContour({appId: 'YOUR_OWN_APPID'});
* var temp = L.OWM.temperature({appId: 'YOUR_OWN_APPID'});
* var wind = L.OWM.wind({appId: 'YOUR_OWN_APPID'});

### Options for TileLayers

Beyond standard options for Leaflet TileLayers there are additional ones:

* *appId*: An AppId is mandatory. Get it at https://www.openweathermap.org/appid
* *showLegend*: **true** or false. If true and option 'legendImagePath' is set there will be a legend image on the map.
* *legendImagePath*: URL (is set to a default image for some layers, **null** for others, see below). URL or relative path to an image which is a legend to this layer.
* *legendPosition*: **'bottomleft'**. Position of the legend images on the map. Available are standard positions for Leaflet controls ('topright', 'topleft', 'bottomright', 'bottomleft').

Out of the box a legend image is only available for Pressure, Precipitation Classic, Clouds Classic, Rain Classic, Snow, Temperature and Wind Speed. Please add your own images if you need some more.

## Using current data for cities

Weather data for cities are fetched using the OpenWeatherMap API. They are added as a LayerGroup of markers. This layer can be refreshed every *n* minutes (set *n* with the option *intervall* but do not use less than 10 minutes, please).

### Initialization

Here's how to initialize these dynamically created layers:

* var city = L.OWM.current( /* options */ );

### Options

A lot of *options* are available to configure the behaviour of the city data ( **default value** is bold). But don't be scared about the large number of options, you don't need to set any if you are pleased with the defaults:

* *appId*: String ( **null** ). Please get a free API key (called APPID) if you're using OWM's current weather data regulary.
* *lang*: **'en'**, 'de', 'ru', 'fr', 'es', 'ca'. Language of popup texts. Note: not every translation is finished yet.
* *minZoom*: Number ( **7** ). Minimal zoom level for fetching city data. Use smaller values only at your own risk.
* *interval*: Number ( **0** ). Time in minutes to reload city data. Please do not use less than 10 minutes. 0 no reload (default)
* *progressControl*: **true** or false. Whether a progress control should be used to tell the user that data is being loaded at the moment.
* *imageLoadingUrl*: URL ( **'owmloading.gif'** ). URL of the loading image, or a path relative to the HTML document. This is important when the image is not in the same directory as the HTML document!
* *imageLoadingBgUrl*: URL ( **null** ). URL of background image for progress control if you don't like the default one.
* *temperatureUnit*: **'C'**, 'F', 'K'. Display temperature in Celsius, Fahrenheit or Kelvin.
* *temperatureDigits*: Number ( **1** ). Number of decimal places for temperature.
* *speedUnit*: **'ms'**, 'kmh' or 'mph'. Unit of wind speed (m/s, km/h or mph).
* *speedDigits*: Number ( **0** ). Number of decimal places for wind speed.
* *popup*: **true** or false. Whether to bind a popup to the city marker.
* *keepPopup*: **true** or false. When true it tries to reopen an already open popup on move or reload. Can result in an additional map move (after reopening the popup) with closing and reopening the popup once again.
* *showOwmStationLink*: **true** or false. Whether to link city name to OWM.
* *showWindSpeed*: 'speed', 'beaufort' or **'both'**. Show wind speed as speed in speedUnit or in beaufort scala or both.
* *showWindDirection*: 'deg', 'desc' or **'both'**. Show wind direction as degree, as description (e.g. NNE) or both.
* *showTimestamp*: **true** or false. Whether to show the timestamp of the data.
* *showTempMinMax*: **true** or false. Whether to show temperature min/max.
* *useLocalTime*: **true** or false. Whether to use local time or UTC for the timestamp.
* *clusterSize*: Number ( **150** ). If some cities are too close to each other, they are hidden. In an area of the size clusterSize pixels * clusterSize pixels only one city is shown. If you zoom in the hidden cities will appear.
* *imageUrlCity*: URL ( **'https://openweathermap.org/img/w/{icon}.png'** ). URL template for weather condition images of cities. {icon} will be replaced by the icon property of city's data. See http://openweathermap.org/img/w/ for some standard images.
* *imageWidth*: Number ( **50** ). Width of city's weather condition image.
* *imageHeight*: Number ( **50** ). Height of city's weather condition image.
* *markerFunction*: Function ( **null** ). User defined function for marker creation. Needs one parameter for city data.
* *popupFunction*: Function ( **null** ). User defined function for popup creation. Needs one parameter for city data.
* *caching*: **true** or false. Use caching of current weather data. Cached data is reloaded when it is too old or the new bounding box doesn't fit inside the cached bounding box.
* *cacheMaxAge*: Number ( **15** ). Maximum age in minutes for cached data before it is considered as too old.
* *keepOnMinZoom*: **false** or true. Keep or remove markers when zoom < minZoom.
* *baseUrl*: Defaults to "https://{s}.tile.openweathermap.org/map/{layername}/{z}/{x}/{y}.png" - only change it when you know what you're doing.

## Simple Example 

Here are the most important lines:

```html
<head>
	<script type="text/javascript" src="leaflet.js"></script>
	<link rel="stylesheet" type="text/css" href="leaflet-openweathermap.css" />
	<script type="text/javascript" src="leaflet-openweathermap.js"></script>
</head>
```

```js
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18, attribution: '[insert correct attribution here!]' });

var clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: 'YOUR_OWN_APPID'});
var city = L.OWM.current({intervall: 15, lang: 'de'});

var map = L.map('map', { center: new L.LatLng(51.5, 10), zoom: 10, layers: [osm] });
var baseMaps = { "OSM Standard": osm };
var overlayMaps = { "Clouds": clouds, "Cities": city };
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
```

## Example with user provided marker/popup functions for current weather

Provide one functions for creating markers and another one for creating popups.
Add the options *markerFunction* and *popupFunction* to your call to *L.OWM.current*.
The data structure you get as a parameter isn't well documented at the moment. You
get what OWM sends. Just look at the data and keep in mind that most entries are optional.
The context (this) of the functions is the L.OWM.Current instance you created. Therefore
you have access to options (e.g. this.options.temperatureUnit) and other attributes.

```html
<head>
	<script type="text/javascript" src="leaflet.js"></script>
	<link rel="stylesheet" type="text/css" href="leaflet-openweathermap.css" />
	<script type="text/javascript" src="leaflet-openweathermap.js"></script>
</head>
```

```js
function myOwmMarker(data) {
	// just a Leaflet default marker
	return L.marker([data.coord.lat, data.coord.lon]);
}

function myOwmPopup(data) {
	// just a Leaflet default popup with name as content
	return L.popup().setContent(data.name);
}

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18, attribution: '[insert correct attribution here!]' });

var clouds = L.OWM.clouds({showLegend: false, opacity: 0.5, appId: 'YOUR_OWN_APPID'});
var city = L.OWM.current({intervall: 15, lang: 'de',
			markerFunction: myOwmMarker, popupFunction: myOwmPopup});

var map = L.map('map', { center: new L.LatLng(51.5, 10), zoom: 10, layers: [osm] });
var baseMaps = { "OSM Standard": osm };
var overlayMaps = { "Clouds": clouds, "Cities": city };
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
```


## Please help me

* Translations for some languages are incomplete. Someone out there knowing the correct terms? Please look at `L.OWM.Utils.i18n[lang]`.
