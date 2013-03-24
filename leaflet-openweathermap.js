/**
 * A JavaScript library for using OWM's layers and OWM's city/station data for leaflet based maps without hassle.
 * License: CC0
 */

L.OWM = L.TileLayer.extend({
  baseUrl: "http://{s}.tile.openweathermap.org/map/{layername}/{z}/{x}/{y}.png",
	options: {
		maxZoom: 18,
		attribution: 'Weather from <a href="http://openweathermap.org/" alt="World Map and worldwide Weather Forecast online">OpenWeatherMap</a>'
	},
	initialize: function (options) {
		L.TileLayer.prototype.initialize.call(this, this.url, options);
	}
});

(function () {

	L.OWM.Precipitation = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'precipitation')
	});
	L.OWM.precipitation = function (options) { return new L.OWM.Precipitation(options); };

	L.OWM.PrecipitationClassic = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'precipitation_cls')
	});
	L.OWM.precipitationClassic = function (options) { return new L.OWM.PrecipitationClassic(options); };

	L.OWM.Rain = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'rain')
	});
	L.OWM.rain = function (options) { return new L.OWM.Rain(options); };

	L.OWM.RainClassic = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'rain_cls')
	});
	L.OWM.rainClassic = function (options) { return new L.OWM.RainClassic(options); };

	L.OWM.Snow = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'snow')
	});
	L.OWM.snow = function (options) { return new L.OWM.Snow(options); };

	L.OWM.Clouds = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'clouds')
	});
	L.OWM.clouds = function (options) { return new L.OWM.Clouds(options); };

	L.OWM.CloudsClassic = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'clouds_cls')
	});
	L.OWM.cloudsClassic = function (options) { return new L.OWM.CloudsClassic(options); };

	L.OWM.Pressure = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'pressure')
	});
	L.OWM.pressure = function (options) { return new L.OWM.Pressure(options); };

	L.OWM.PressureContour = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'pressure_cntr')
	});
	L.OWM.pressureContour = function (options) { return new L.OWM.PressureContour(options); };

	L.OWM.Temperature = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'temp')
	});
	L.OWM.temperature = function (options) { return new L.OWM.Temperature(options); };

	L.OWM.Wind = L.OWM.extend({
		url: L.OWM.prototype.baseUrl.replace('{layername}', 'wind')
	});
	L.OWM.wind = function (options) { return new L.OWM.Wind(options); };

}());

/**
 * Layer for current weather (cities and stations).
 */
L.OWM.Current = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		type: 'city', // available types: 'city', 'station'
		lang: 'en', // available: 'en', 'de', 'ru', 'fr' (not every laguage is finished yet)
		minZoom: 7,
		intervall: 0, // intervall for rereading city/station data in minutes
		progressControl: 'true', // available: 'true', 'false'
		imageLoadingUrl: 'owmloading.gif', // URl of loading image relative to HTML document
		temperatureUnit: 'C', // available: 'K' (Kelvin), 'C' (Celsius), 'F' (Fahrenheit)
		temperatureDigits: 1,
		speedUnit: 'ms', // available: 'ms' (m/s), 'kmh' (km/h), 'mph' (mph)
		speedDigits: 0,
		popup: 'true', // available: 'true', 'false'
		keepPopup: 'true', // available: 'true', 'false'
		showOwmStationLink: 'true', // available: 'true', 'false'
		showWindSpeed: 'both', // available: 'speed', 'beaufort', 'both'
		showWindDirection: 'both', // available: 'deg', 'desc', 'both'
		showTimestamp: 'true', // available: 'true', 'false'
		showTempMinMax: 'true', // available: 'true', 'false'
		useLocalTime: 'true', // available: 'true', 'false'
		clusterSize: 150,
		imageUrlCity: 'http://openweathermap.org/img/w/{icon}.png',
		imageWidth: 50,
		imageHeight: 50,
		imageUrlStation: 'http://openweathermap.org/img/s/istation.png',
		imageWidthStation: 25,
		imageHeightStation: 25,
		imageUrlPlane: 'http://openweathermap.org/img/s/iplane.png',
		imageWidthPlane: 25,
		imageHeightPlane: 25
	},

	initialize: function(options) {
		L.setOptions(this, options);
		this._layer = L.layerGroup();
		this._timeoutId = null;
		this._requests = {};
		this._markers = new Array();
		this._markedMarker = null;
		this._map = null;
		this._urlTemplate = 'http://api.openweathermap.org/data/2.1/find/{type}?bbox={minlon},{minlat},{maxlon},{maxlat},10';
		this._directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
		this._msbft = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 31.7]; // Beaufort scala
		this._tempUnits = { K: 'K', C: '°C', F: 'F'};
		this._progressCtrl = null;
		if (this.options.progressControl == 'true') {
			var bgIcon = this.options.imageUrlCity.replace('{icon}', '10d');
			if (this.options.type != 'city') {
				var bgIcon = this.options.imageUrlStation;
			}
			this._progressCtrl = L.OWM.progressControl({
					type: this.options.type
					, bgImage: bgIcon
					, imageLoadingUrl: this.options.imageLoadingUrl
					, owmInstance: this
			});
		}
	},

	onAdd: function(map) {
		this._map = map;
		this._map.addLayer(this._layer);
		this._map.on('moveend', this.update, this);
		// add progress control
		if (this._progressCtrl != null) {
			this._map.addControl(this._progressCtrl);
		}
		this.update();
	},

	onRemove: function(map) {
		// clear timeout
		if (this._timeoutId !== null) {
			window.clearTimeout(this._timeoutId);
			this._timeoutId = null;
		}
		// remove progress control
		if (this._progressCtrl != null) {
			this._map.removeControl(this._progressCtrl);
		}
		// remove layer and markers
		this._map.off('moveend', this.update, this);
		this._map.removeLayer(this._layer);
		this._layer.clearLayers();
		this._map = null;
	},

	getAttribution: function() {
		return 'Weather from <a href="http://openweathermap.org/" '
			+ 'alt="World Map and worldwide Weather Forecast online">OpenWeatherMap</a>';
	},

	update: function() {
		// clear existing timeout
		if (this._timeoutId) {
			window.clearTimeout(this._timeoutId);
			this._timeoutId = null;
		}

		var _this = this;
		var bounds = this._map.getBounds();
		var url = this._urlTemplate
					.replace('{type}', this.options.type)
					.replace('{minlon}', bounds.getWest())
					.replace('{minlat}', bounds.getSouth())
					.replace('{maxlon}', bounds.getEast())
					.replace('{maxlat}', bounds.getNorth())
					;

		// clear requests for all types
		for (var typ in this._requests) {
			var request = this._requests[typ];
			this.fire('owmloadingend', {type: typ});
			request.abort();
		}
		this._requests = {};
		_this.fire('owmloadingstart', {type: _this.options.type});

		if (this._map.getZoom() < this.options.minZoom) {
			_this.fire('owmloadingend', {type: _this.options.type});
			// Info to user?
			return;
		}

		// fetch data from OWM
		this._requests[this.options.type] = L.OWM.Utils.jsonp(url, function(data) {
			delete _this._requests[_this.options.type];

			// read all stations/cities
			var stations = {};
			for (var i=0, len=data.list.length; i<len; i++) {
				var stat = data.list[i];
				// only use stations/cities having a minimum pixes distance on the map
				var pt = _this._map.latLngToLayerPoint(new L.LatLng(stat.coord.lat, stat.coord.lon));
				var key = '' + (Math.round(pt.x/_this.options.clusterSize)) + "_" + (Math.round(pt.y/_this.options.clusterSize));
				if (!stations[key] || parseInt(stations[key].rang) < parseInt(stat.rang)) {
					stations[key] = stat;
				}
			}

			// hide LayerGroup from map and remove old markers
			var markerWithPopup = null;
			if (_this.options.keepPopup == 'true') {
				markerWithPopup = _this._getMarkerWithPopup(_this._markers);
			}
			if (_this._map && _this._map.hasLayer(_this._layer)) {
				_this._map.removeLayer(_this._layer);
			}
			_this._layer.clearLayers();

			// add the stations/cities as markers to the LayerGroup
			_this._markers = new Array();
			for (var key in stations) {
				var marker = _this._createMarker(stations[key]);
				_this._layer.addLayer(marker);
				_this._markers.push(marker);
				if (_this.options.popup == 'true') {
					marker.bindPopup(_this._createPopup(stations[key]));
				}
				if (markerWithPopup != null
						&& typeof markerWithPopup.options.owmId != 'undefined'
						&& markerWithPopup.options.owmId == marker.options.owmId) {
					markerWithPopup = marker;
				}
			}

			// add the LayerGroup to the map
			_this._map.addLayer(_this._layer);
			if (markerWithPopup != null) {
				markerWithPopup.openPopup();
			}
			_this.fire('owmloadingend', {type: _this.options.type});
		});
		if (this.options.intervall && this.options.intervall > 0) {
			this._timeoutId = window.setTimeout(function() {_this.update()}, 60000*this.options.intervall);
		}
	},

	_getMarkerWithPopup: function(markers) {
		var marker = null;
		for (var idx in markers) {
			var m = markers[idx];
			if (m._popup && m._map && m._map.hasLayer(m._popup)) {
				marker = m;
				break;
			}
		}
		return marker;
	},

	_createPopup: function(station) {
		var showLink = typeof station.id != 'undefined' && this.options.showOwmStationLink == 'true';
		var txt = '<div class="owm-popup-name">';
		if (showLink) {
			var typ = 'station';
			if (typeof station.weather != 'undefined') {
				typ = 'city';
			}
			txt += '<a href="http://openweathermap.org/' + typ + '/' + station.id + '" target="_blank" title="'
				+ this.i18n('owmlinktitle', 'Details at OpenWeatherMap') + '">';
		}
		txt += station.name;
		if (showLink) {
			txt += '</a>';
		}
		txt += '</div>';
		if (typeof station.weather != 'undefined' && typeof station.weather[0] != 'undefined') {
			if (typeof station.weather[0].description != 'undefined' && typeof station.weather[0].id != 'undefined') {
				txt += '<div class="owm-popup-description">'
					+ this.i18n('id'+station.weather[0].id, station.weather[0].description + ' (' + station.weather[0].id + ')')
					+ '</div>';
			}
		}
		var imgData = this._getImageData(station);
		txt += '<div class="owm-popup-main"><img src="' + imgData.url + '" width="' + imgData.width
				+ '" height="' + imgData.height + '" border="0" />';
		if (typeof station.main != 'undefined' && typeof station.main.temp != 'undefined') {
			txt += '<span class="owm-popup-temp">' + this._temperatureConvert(station.main.temp)
				+ '&nbsp;' + this._tempUnits[this.options.temperatureUnit] + '</span>';
		}
		txt += '</div>';
		txt += '<div class="owm-popup-details">';
		if (typeof station.main != 'undefined') {
			if (typeof station.main.humidity != 'undefined') {
				txt += '<div class="owm-popup-detail">'
					+ this.i18n('humidity', 'Humidity')
					+ ': ' + station.main.humidity + '&nbsp;%</div>';
			}
			if (typeof station.main.pressure != 'undefined') {
				txt += '<div class="owm-popup-detail">'
					+ this.i18n('pressure', 'Pressure')
					+ ': ' + station.main.pressure + '&nbsp;hPa</div>';
			}
			if (this.options.showTempMinMax == 'true') {
				if (typeof station.main.temp_max != 'undefined' && typeof station.main.temp_min != 'undefined') {
					txt += '<div class="owm-popup-detail">'
						+ this.i18n('temp_minmax', 'Temp. min/max')
						+ ': '
							+ this._temperatureConvert(station.main.temp_min)
						+ '&nbsp;/&nbsp;'
						+ this._temperatureConvert(station.main.temp_max)
						+ '&nbsp;' + this._tempUnits[this.options.temperatureUnit] + '</div>';
				}
			}
		}
		if (typeof station.rain != 'undefined' && typeof station.rain['1h'] != 'undefined') {
			txt += '<div class="owm-popup-detail">'
				+ this.i18n('rain_1h', 'Rain (1h)')
				+ ': ' + station.rain['1h'] + '&nbsp;ml</div>';
		}
		if (typeof station.wind != 'undefined') {
			if (typeof station.wind.speed != 'undefined') {
				txt += '<div class="owm-popup-detail">';
				if (this.options.showWindSpeed == 'beaufort' || this.options.showWindSpeed == 'both') {
					txt += this.i18n('windforce', 'Wind Force')
						+ ': ' + this._windMsToBft(station.wind.speed);
					if (this.options.showWindSpeed == 'both') {
						txt += '&nbsp;(' + this._convertSpeed(station.wind.speed) + '&nbsp;'
							+ this._displaySpeedUnit() + ')';
					}
				} else {
					txt += this.i18n('wind', 'Wind') + ': '
						+ this._convertSpeed(station.wind.speed) + '&nbsp;'
						+ this._displaySpeedUnit();
				}
				txt += '</div>';
			}
			if (typeof station.wind.gust != 'undefined') {
				txt += '<div class="owm-popup-detail">';
				if (this.options.showWindSpeed == 'beaufort' || this.options.showWindSpeed == 'both') {
					txt += this.i18n('gust', 'Gust')
						+ ': ' + this._windMsToBft(station.wind.gust);
					if (this.options.showWindSpeed == 'both') {
						txt += '&nbsp;(' + this._convertSpeed(station.wind.gust) + '&nbsp;'
							+ this._displaySpeedUnit() + ')';
					}
				} else {
					txt += this.i18n('gust', 'Gust') + ': '
						+ this._convertSpeed(station.wind.gust) + '&nbsp;'
						+ this._displaySpeedUnit();
				}
				txt += '</div>';
			}
			if (typeof station.wind.deg != 'undefined') {
				txt += '<div class="owm-popup-detail">';
				txt += this.i18n('direction', 'Windrichtung') + ': ';
				if (this.options.showWindDirection == 'desc' || this.options.showWindDirection == 'both') {
					txt += this._directions[(station.wind.deg/22.5).toFixed(0)];
					if (this.options.showWindDirection == 'both') {
						txt += '&nbsp;(' + station.wind.deg + '°)';
					}
				} else {
					txt += station.wind.deg + '°';
				}
				txt += '</div>';
			}
		}
		if (typeof station.dt != 'undefined' && this.options.showTimestamp == 'true') {
			txt += '<div class="owm-popup-timestamp">';
			txt += '(' + this._convertTimestamp(station.dt) + ')';
			txt += '</div>';
		}
		txt += '</div>';
		return txt;
	},

	_getImageData: function(station) {
		var imageUrl;
		var imageWidth = this.options.imageWidth;
		var imageHeight = this.options.imageHeight;
		var imageUrlTemplate = this.options.imageUrlCity;
		if (station.weather && station.weather[0] && station.weather[0].icon) {
			imageUrl = imageUrlTemplate.replace('{icon}', station.weather[0].icon);
		} else if (station.type && station.type == 1) {
			imageUrl = this.options.imageUrlPlane;
			imageWidth = this.options.imageWidthPlane;
			imageHeight = this.options.imageWidthPLane;
		} else {
			imageUrl = this.options.imageUrlStation;
			imageWidth = this.options.imageWidthStation;
			imageHeight = this.options.imageWidthStation;
		}
		return {url: imageUrl, width: imageWidth, height: imageHeight};
	},

	_createMarker: function(station) {
		var imageData = this._getImageData(station);
		var icon = L.divIcon({
						className: ''
						, iconAnchor: new L.Point(25, imageData.height/2)
						, popupAnchor: new L.Point(0, -10)
						, html: this._icondivtext(station, imageData.url, imageData.width, imageData.height)
					});
		var marker = L.marker([station.coord.lat, station.coord.lon], {icon: icon, owmId: station.id});
		return marker;
	},

	_icondivtext: function(station, imageurl, width, height) {
		var txt = '';
		txt += '<div class="owm-icondiv">'
			+ '<img src="' + imageurl + '" border="0" width="' + width + '" height="' + height + '" />';
		if (typeof station.main != 'undefined' && typeof station.main.temp != 'undefined') {
			txt += '<div class="owm-icondiv-temp">' + this._temperatureConvert(station.main.temp)
				+ '&nbsp;' + this._tempUnits[this.options.temperatureUnit] + '</div>';
		}
		txt += '</div>';
		return txt;
	},

	_temperatureConvert: function(tempK) {
		var temp;
		switch (this.options.temperatureUnit) {
			case 'K':
				temp = tempK.toFixed(this.options.temperatureDigits);
				break;
			case 'C':
				temp = L.OWM.Utils.temperatureKtoC(tempK, this.options.temperatureDigits);
				break;
			case 'F':
				temp = L.OWM.Utils.temperatureKtoF(tempK, this.options.temperatureDigits);
				break;
		}
		return temp;
	},

	_windMsToBft: function(ms) {
		var bft = 99;
		for (var key in this._msbft) {
			if (ms < this._msbft[key]) {
				bft = key;
				break;
			}
		}
		return bft;
	},

	_displaySpeedUnit: function() {
		var unit = 'm/s';
		switch (this.options.speedUnit) {
			case 'kmh':
				unit = 'km/h'
				break;
			case 'mph':
				unit = 'mph'
				break;
		}
		return unit;
	},

	_convertSpeed: function(speed) {
		var sp = speed;
		switch (this.options.speedUnit) {
			case 'kmh':
				sp = 3.6*sp;
				break;
			case 'mph':
				sp = 2.236*sp;
				break;
		}
		return sp.toFixed(this.options.speedDigits);
	},

	_convertTimestamp: function(tstmp) {
		if (this.options.useLocalTime == 'true') {
			return (new Date(tstmp*1000));
		} else {
			return (new Date(tstmp*1000)).toUTCString();
		}
	},

	i18n: function(key, fallback) {
		var lang = this.options.lang;
		if (typeof L.OWM.Utils.i18n != 'undefined'
				&& typeof L.OWM.Utils.i18n[lang] != 'undefined'
				&& typeof L.OWM.Utils.i18n[lang][key] != 'undefined') {
			return  L.OWM.Utils.i18n[lang][key]
		}
		return fallback;
	}

});
L.OWM.current = function(options) { return new L.OWM.Current(options); };

L.OWM.ProgressControl = L.Control.extend({
	includes: L.Mixin.Events, 

	options: {
		position: "topleft",
		type: 'city',
		bgImage: null // bgImage is set in L.OWM.Current when creating this ProgressControll instance
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._container = L.DomUtil.create('div', 'leaflet-control-layers');
		if (this.options.bgImage != null) {
			this._container.style.backgroundImage ='url(' + this.options.bgImage + ')';
			this._container.style.backgroundRepeat = 'no-repeat';
			this._container.style.backgroundPosition = 'center center';
		}
		L.DomEvent.disableClickPropagation(this._container);
		this._container.innerHTML = '<img src="' + this.options.imageLoadingUrl + '" width="50" height="50" />';
	},

	onAdd: function(map) {
		this._map = map;
		this.options.owmInstance.on('owmloadingstart', this._activate, this);
		this.options.owmInstance.on('owmloadingend', this._deactivate, this);
		return this._container;
	},

	_activate: function(e) {
		if (e.target.options.type == this.options.type) {
			this._container.style.display = 'block';
		}
	},

	_deactivate: function(e) {
		if (e.target.options.type == this.options.type) {
			this._container.style.display = 'none';
		}
	},

	onRemove: function(map) {
		this.options.owmInstance.off('owmloadingstart', this._activate, this);
		this.options.owmInstance.off('owmloadingend', this._deactivate, this);
		this._container.style.display = 'none';
		this._map = null;
	}

});
L.OWM.progressControl = function(options) { return new L.OWM.ProgressControl(options); };

L.OWM.Utils = {

	callbacks: {},
	callbackCounter: 0,

	jsonp: function(url, callbackFn) {
		var _this = this;
		var elem = document.createElement('script');
		var counter = this.callbackCounter++;
		var callback = 'L.OWM.Utils.callbacks[' + counter + ']';
		var abort = function() {
			if (elem.parentNode) {
				return elem.parentNode.removeChild(elem);
			}
		};

		this.callbacks[counter] = function(data) {
			delete _this.callbacks[counter];
			return callbackFn(data);
		};

		elem.src = '' + url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callback;
		elem.type = 'text/javascript';
		document.getElementsByTagName('body')[0].appendChild(elem);
		return { abort: abort };
	},

	temperatureKtoC: function(tempK, digits) {
		return (tempK-273.15).toFixed(digits);
	},

	temperatureKtoF: function(tempK, digits) {
		return (tempK*1.8-459.67).toFixed(digits);
	},

	i18n: {
		en: {
			owmlinktitle: 'Details at OpenWeatherMap'
			, temperature: 'Temperature'
			, temp_minmax: 'Temp. min/max'
			, wind: 'Wind'
			, gust: 'Gust'
			, windforce: 'Wind Force'
			, direction: 'Direction'
			, rain_1h: 'Rain'
			, humidity: 'Humidity'
			, pressure: 'Pressure'

		// weather conditions, see http://openweathermap.org/wiki/API/Weather_Condition_Codes
			, id200: 'Thunderstorm with Light Rain'
			, id201: 'Thunderstorm with Rain'
			, id202: 'Thunderstorm with Heavy Rain'
			, id210: 'Light Thunderstorm'
			, id211: 'Thunderstorm'
			, id212: 'Heavy Thunderstorm'
			, id221: 'Ragged Thunderstorm'
			, id230: 'Thunderstorm with Light Drizzle'
			, id231: 'Thunderstorm with Drizzle'
			, id232: 'Thunderstorm with Heavy Drizzle'

			, id300: 'Light Intensity Drizzle'
			, id301: 'Drizzle'
			, id302: 'Heavy Intensity Drizzle'
			, id310: 'Light Intensity Drizzle Rain'
			, id311: 'Drizzle Rain'
			, id312: 'Heavy Intensity Drizzle Rain'
			, id321: 'Shower Drizzle'

			, id500: 'Light Rain'
			, id501: 'Moderate Rain'
			, id502: 'Heavy Intensity Rain'
			, id503: 'Very Heavy Rain'
			, id504: 'Extreme Rain'
			, id511: 'Freezing Rain'
			, id520: 'Light Intensity Shower Rain'
			, id521: 'Shower Rain'
			, id522: 'Heavy Intensity Shower Rain'

			, id600: 'Light Snow'
			, id601: 'Snow'
			, id602: 'Heavy Snow'
			, id611: 'Sleet'
			, id621: 'Shower Snow'
			, id622: 'Heavy Shower Snow'

			, id701: 'Mist'
			, id711: 'Smoke'
			, id721: 'Haze'
			, id731: 'Sand/Dust Whirls'
			, id741: 'Fog'

			, id800: 'Sky is Clear'
			, id801: 'Few Clouds'
			, id802: 'Scattered Clouds'
			, id803: 'Broken Clouds'
			, id804: 'Overcast Clouds'
			, id900: 'Tornado'
			, id901: 'Tropical Storm'
			, id902: 'Hurricane'
			, id903: 'Cold'
			, id904: 'Hot'
			, id905: 'Windy'
			, id906: 'Hail'
		},

		de: {
			owmlinktitle: 'Details bei OpenWeatherMap'
			, temperature: 'Temperatur'
			, temp_minmax: 'Temp. min/max'
			, wind: 'Wind'
			, gust: 'Windböen'
			, windforce: 'Windstärke'
			, direction: 'Windrichtung'
			, rain_1h: 'Regen'
			, humidity: 'Luftfeuchtigkeit'
			, pressure: 'Luftdruck'

		// Wetterbedingungen, siehe http://openweathermap.org/wiki/API/Weather_Condition_Codes
			, id200: 'Gewitter mit leichtem Regen' // 'Thunderstorm with Light Rain'
			, id201: 'Gewitter mit Regen' // 'Thunderstorm with Rain'
			, id202: 'Gewitter mit Starkregen' // 'Thunderstorm with Heavy Rain'
			, id210: 'Leichtes Gewitter' // 'Light Thunderstorm'
			, id211: 'Mäßiges Gewitter' // 'Thunderstorm'
			, id212: 'Starkes Gewitter' // 'Heavy Thunderstorm'
		//	, id221: 'Ragged Thunderstorm'
		//	, id230: 'Thunderstorm with Light Drizzle'
		//	, id231: 'Thunderstorm with Drizzle'
		//	, id232: 'Thunderstorm with Heavy Drizzle'

			, id300: 'Leichter Nieselregen' // 'Light Intensity Drizzle'
			, id301: 'Nieselregen' // 'Drizzle'
			, id302: 'Starker Nieselregen' // 'Heavy Intensity Drizzle'
		//	, id310: 'Light Intensity Drizzle Rain'
		//	, id311: 'Drizzle Rain'
		//	, id312: 'Heavy Intensity Drizzle Rain'
		//	, id321: 'Shower Drizzle'

			, id500: 'Leichter Regen' // 'Light Rain'
			, id501: 'Mäßiger Regen' // 'Moderate Rain'
			, id502: 'Starker Regen' // 'Heavy Intensity Rain'
			, id503: 'Ergiebiger Regen' // 'Very Heavy Rain'
			, id504: 'Starkregen' // 'Extreme Rain'
			, id511: 'Gefrierender Regen' // 'Freezing Rain'
			, id520: 'Leichte Regenschauer' // 'Light Intensity Shower Rain'
			, id521: 'Mäßige Regenschauer' // 'Shower Rain'
			, id522: 'Wolkenbruchartige Regenschauer' // 'Heavy Intensity Shower Rain'

			, id600: 'Leichter Schneefall' // 'Light Snow'
			, id601: 'Mäßiger Schneefall' // 'Snow'
			, id602: 'Starker Schneefall' // 'Heavy Snow'
			, id611: 'Schneeregen' // 'Sleet'
			, id621: 'Schneeschauer' // 'Shower Snow'
			, id622: 'Starke Schneeschauer' // 'Heavy Shower Snow'

			, id701: 'Dunst' // 'Mist'
			, id711: 'Rauch' // 'Smoke'
			, id721: 'Eingetrübt' // 'Haze'
			, id731: 'Sand-/Staubwirbel' // 'Sand/Dust Whirls'
			, id741: 'Nebel' // 'Fog'

			, id800: 'Wolkenlos' // 'Sky is Clear'
			, id800d: 'Sonnig' // 'Sky is Clear' at day
			, id800n: 'Klar' // 'Sky is Clear' at night
			, id801: 'Leicht bewölkt' // 'Few Clouds'
			, id802: 'Wolkig' // 'Scattered Clouds'
			, id803: 'Stark bewölkt' // 'Broken Clouds'
			, id804: 'Bedeckt' // 'Overcast Clouds'
			, id900: 'Tornado' // 'Tornado'
			, id901: 'Tropischer Sturm' // 'Tropical Storm'
			, id902: 'Orkan' // 'Hurricane'
			, id903: 'Kälte' // 'Cold'
			, id904: 'Hitze' // 'Hot'
			, id905: 'Windig' // 'Windy'
			, id906: 'Hagel' // 'Hail'
		},

		ru: {
			owmlinktitle: 'Информация в OpenWeatherMap'
			, temperature: 'Температура'
			, temp_minmax: 'Макс./Мин. темп'
			, wind: 'Ветер'
			, gust: 'Порывы'
			, windforce: 'Сила'
			, direction: 'направление'
			, rain_1h: 'Дождь'
			, humidity: 'Влажность'
			, pressure: 'Давление'

		// weather conditions, see http://openweathermap.org/wiki/API/Weather_Condition_Codes
		//	, id200: 'Thunderstorm with Light Rain'
		//	, id201: 'Thunderstorm with Rain'
		//	, id202: 'Thunderstorm with Heavy Rain'
		//	, id210: 'Light Thunderstorm'
		//	, id211: 'Thunderstorm'
		//	, id212: 'Heavy Thunderstorm'
		//	, id221: 'Ragged Thunderstorm'
		//	, id230: 'Thunderstorm with Light Drizzle'
		//	, id231: 'Thunderstorm with Drizzle'
		//	, id232: 'Thunderstorm with Heavy Drizzle'

		//	, id300: 'Light Intensity Drizzle'
		//	, id301: 'Drizzle'
		//	, id302: 'Heavy Intensity Drizzle'
		//	, id310: 'Light Intensity Drizzle Rain'
		//	, id311: 'Drizzle Rain'
		//	, id312: 'Heavy Intensity Drizzle Rain'
		//	, id321: 'Shower Drizzle'

		//	, id500: 'Light Rain'
		//	, id501: 'Moderate Rain'
		//	, id502: 'Heavy Intensity Rain'
		//	, id503: 'Very Heavy Rain'
		//	, id504: 'Extreme Rain'
			, id511: 'Ледяной дождь' // 'Freezing Rain'
		//	, id520: 'Light Intensity Shower Rain'
		//	, id521: 'Shower Rain'
		//	, id522: 'Heavy Intensity Shower Rain'

		//	, id600: 'Light Snow'
			, id601: 'Снег' // 'Snow'
		//	, id602: 'Heavy Snow'
		//	, id611: 'Sleet'
		//	, id621: 'Shower Snow'
		//	, id622: 'Heavy Shower Snow'

		//	, id701: 'Mist'
		//	, id711: 'Smoke'
		//	, id721: 'Haze'
		//	, id731: 'Sand/Dust Whirls'
		//	, id741: 'Fog'

			, id800: 'Ясно' // 'Sky is Clear'
		//	, id801: 'Few Clouds'
		//	, id802: 'Scattered Clouds'
		//	, id803: 'Broken Clouds'
		//	, id804: 'Overcast Clouds'
		//	, id900: 'Tornado'
		//	, id901: 'Tropical Storm'
			, id902: 'Ураган' // 'Hurricane'
		//	, id903: 'Cold'
		//	, id904: 'Hot'
		//	, id905: 'Windy'
			, id906: 'Γрад' // 'Hail'
		},

		fr: {
			owmlinktitle: 'Détails à OpenWeatherMap'
			, temperature: 'Température'
			, temp_minmax: 'Temp. min/max'
			, wind: 'Vent'
			, gust: 'Rafales'
			, windforce: 'Force du vent'
			, direction: 'Direction'
			, rain_1h: 'Pluie'
			, humidity: 'Humidité'
			, pressure: 'Pression'

		// weather conditions, see http://openweathermap.org/wiki/API/Weather_Condition_Codes
		//	, id200: 'Thunderstorm with Light Rain'
		//	, id201: 'Thunderstorm with Rain'
		//	, id202: 'Thunderstorm with Heavy Rain'
		//	, id210: 'Light Thunderstorm'
		//	, id211: 'Thunderstorm'
		//	, id212: 'Heavy Thunderstorm'
		//	, id221: 'Ragged Thunderstorm'
		//	, id230: 'Thunderstorm with Light Drizzle'
		//	, id231: 'Thunderstorm with Drizzle'
		//	, id232: 'Thunderstorm with Heavy Drizzle'

		//	, id300: 'Light Intensity Drizzle'
		//	, id301: 'Drizzle'
		//	, id302: 'Heavy Intensity Drizzle'
		//	, id310: 'Light Intensity Drizzle Rain'
		//	, id311: 'Drizzle Rain'
		//	, id312: 'Heavy Intensity Drizzle Rain'
		//	, id321: 'Shower Drizzle'

		//	, id500: 'Light Rain'
		//	, id501: 'Moderate Rain'
		//	, id502: 'Heavy Intensity Rain'
		//	, id503: 'Very Heavy Rain'
		//	, id504: 'Extreme Rain'
		//	, id511: 'Freezing Rain'
		//	, id520: 'Light Intensity Shower Rain'
		//	, id521: 'Shower Rain'
		//	, id522: 'Heavy Intensity Shower Rain'

		//	, id600: 'Light Snow'
			, id601: 'Neige' // 'Snow'
		//	, id602: 'Heavy Snow'
		//	, id611: 'Sleet'
		//	, id621: 'Shower Snow'
		//	, id622: 'Heavy Shower Snow'

		//	, id701: 'Mist'
			, id711: 'Fumer' // 'Smoke'
		//	, id721: 'Haze'
		//	, id731: 'Sand/Dust Whirls'
			, id741: 'Brouillard' // 'Fog'

		//	, id800: 'Sky is Clear'
		//	, id801: 'Few Clouds'
		//	, id802: 'Scattered Clouds'
		//	, id803: 'Broken Clouds'
		//	, id804: 'Overcast Clouds'
			, id900: 'Tornade' // 'Tornado'
		//	, id901: 'Tropical Storm'
			, id902: 'Ouragan' // 'Hurricane'
			, id903: 'Froid' // 'Cold'
			, id904: 'Chaleur' // 'Hot'
			, id905: 'Venteux' // 'Windy'
			, id906: 'Grêle' // 'Hail'
		}
	}
};
