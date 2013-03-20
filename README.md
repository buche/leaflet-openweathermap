# OpenWeatherMap for Leaflet based maps

## Description
[OpenWeatherMap](http://openweathermap.org/) (OWM) is a service providing weather related data, visualizing it using an OpenLayers based map. This is a Leaflet based script providing easy access to OWM's features for Leaflet based maps.

In short: A JavaScript library for including OWM's layers and OWM's current city/station data in leaflet based maps without hassle.

Feel free to flattr me if you like it: [![alttext](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1193685/)

## License

This code is licensed under [CC0](http://creativecommons.org/publicdomain/zero/1.0/ "Creative Commons Zero - Public Domain").

## Usage

### Using TileLayers

OWM offers some TileLayers: Clouds, Clouds Classic, Precipitation, Precipitation Classic, Rain, Rain Classic, Snow, Temperature, Wind Speed, Pressure and Pressure Contours.

Here's how to initialize these TileLayers:

* var clouds = L.OWM.clouds();
* var cloudscls = L.OWM.cloudsClassic();
* var precipitation = L.OWM.precipitation();
* var precipitationcls = L.OWM.precipitationClassic();
* var rain = L.OWM.rain();
* var raincls = L.OWM.rainClassic();
* var snow = L.OWM.snow();
* var pressure = L.OWM.pressure();
* var pressurecntr = L.OWM.pressureContour();
* var temp = L.OWM.temperature();
* var wind = L.OWM.wind();

### Using current data for cities and stations

Weather data for cities and stations are fetched using the OpenWeatherMap API. They are added as a LayerGroup of markers, one for cities and another one for stations. These layers can be refreshed every *n* minutes (set *n* with the option *intervall*).

#### Initialization

Here's how to initialize these dynamically created layers:

* var city = L.OWM.current( /* options */ );
* var station = L.OWM.current({type: 'station' /*, additional options */ });

#### Options

A lot of *options* are available to configure the behaviour of the city/station data ( **default value** is bold):

* *type*: **'city'** or 'station'. Get city data or station data.
* *lang*: **'en'**, 'de', 'ru', 'fr'. Language of popup texts. Note: not every translation is finished yet.
* *minZoom*: Number ( **7** ). Minimal zoom level for fetching city/station data. Use smaller values only at your own risk.
* *intervall*: number ( **0** ). Time in minutes to reload city or station data.
* *progressControl*: **'true'** or 'false'. Whether a progress control should be used to tell the user that data is being loaded at the moment.
* *imageLoadingUrl*: URL ( **'owmloading.gif'** ). URL of the loading image, or a path relative to the HTML document. This is important when the image is not in the same directory as the HTML document!
* *temperatureUnit*: **'C'**, 'F', 'K'. Display temperature in Celsius, Fahrenheit or Kelvin.
* *temperatureDigits*: Number ( **1** ). Number of decimal places for temperature.
* *speedUnit*: **'ms'**, 'kmh' or 'mph'. Unit of wind speed (m/s, km/h or mph).
* *speedDigits*: Number ( **0** ). Number of decimal places for wind speed.
* *popup*: **'true'** or 'false'. Whether to bind a popup to the city/station marker.
* *showOwmStationLink*: **'true'** or 'false'. Whether to link city/station name to OWM.
* *showWindSpeed*: 'speed', 'beaufort' or **'both'**. Show wind speed as speed in speedUnit or in beaufort scala or both.
* *showWindDirection*: 'deg', 'desc' or **'both'**. Show wind direction as degree, as description (e.g. NNE) or both.
* *showTimestamp*: **'true'** or 'false'. Whether to show the timestamp of the data.
* *useLocalTime*: **'true'** or false. Whether to use local time or UTC for the timestamp.
* *clusterSize*: Number ( **150** ). If some stations are too close to each other, they are hidden. In an area of the size clusterSize pixels * clusterSize pixels only one city or one station is allowed.
* *imageUrlCity*: URL ( **'http://openweathermap.org/img/w/{icon}.png'** ). URL template for weather condition images of cities. {icon} will be replaced by the icon property of city's data. See http://openweathermap.org/img/w/ for some standard images.
* *imageWidth*: Number ( **50** ). Width of city's weather condition image.
* *imageHeight*: Number ( **50** ). Height of city's weather condition image.
* *imageUrlPlane*: URL ( **'http://openweathermap.org/img/s/iplane.png'** ). Image URL for stations of type 1.
* *imageWidthPlane*: Number ( **25** ). Width of image for station type 1.
* *imageHeightPlane*: Number ( **25** ). Height of image for station type 1.
* *imageUrlStation*: URL ( **'http://openweathermap.org/img/s/istation.png'** ). Image URL for stations of type unequal to 1.
* *imageWidthStation*: Number ( **25** ). Width of image for station type unequal to 1.
* *imageHeightStation*: Number ( **25** ). Height of image for station type unequal to 1.

## Example

An example can be seen here: http://map.comlu.com/openweathermap/

Here are the most important lines:

```js
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 18, attribution: '[insert correct attribution here!]' });

var clouds = L.OWM.clouds();
var city = L.OWM.current({intervall: 5, lang: 'de'});

var map = L.map('map', {
	center: new L.LatLng(51.5, 10),
	zoom: 10,
	layers: [osm, city]
});

var baseMaps = { "OSM Standard": osm };
var overlayMaps = { "Clouds": clouds, "Cities": city };

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
```

## TODO

* Bugfixing
* Complete translations for de, ru, fr (see `L.OWM.Utils.i18n[lang]`). Someone out there knowing the correct terms?
