/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */

 /**
 * Internationalization of some texts used by the map.
 * @param String key the key of the text item
 * @param String lang the language id
 * @return String the localized text item or the id if there's no translation found
 */
function getI18n(key, lang) {
	var i18n = {
		en: {
			  maps: 'Maps'
			, layers: 'TileLayer'
			, current: 'Current Weather'

			, clouds: 'Clouds'
			, cloudscls: 'Clouds (classic)'
			, precipitation: 'Precipitation'
			, precipitationcls: 'Precipitation (classic)'
			, rain: 'Rain'
			, raincls: 'Rain (classic)'
			, snow: 'Snow'
			, temp: 'Temperature'
			, windspeed: 'Wind Speed'
			, pressure: 'Pressure'
			, presscont: 'Pressure Contour'

			, city: 'Cities'
			, station: 'Stations'
			, windrose: 'Wind Rose'
		}
		, de: {
			  maps: 'Karten'
			, layers: 'Ebenen'
			, current: 'Aktuelles Wetter'

			, clouds: 'Wolken'
			, cloudscls: 'Wolken (classic)'
			, precipitation: 'Niederschläge'
			, precipitationcls: 'Niederschläge (classic)'
			, rain: 'Regen'
			, raincls: 'Regen (classic)'
			, snow: 'Schnee'
			, temp: 'Temperatur'
			, windspeed: 'Windgeschwindigkeit'
			, pressure: 'Luftdruck'
			, presscont: 'Isobaren'

			, city: 'Städte'
			, station: 'Stationen'
			, windrose: 'Windrose'
		}
		, fr: {
			  maps: 'Carte'
			, layers: 'Couches'
			, current: 'Temps actuel'

			, clouds: 'Nuage'
			, cloudscls: 'Nuage (classique)'
			, precipitation: 'Précipitations'
			, precipitationcls: 'Précipitations (classique)'
			, rain: 'Pluie'
			, raincls: 'Pluie (classique)'
			, snow: 'Neiges'
			, temp: 'Température'
			, windspeed: 'Vitesse du vent'
			, pressure: 'Pression de l\'air'
			, presscont: 'Isobare'

			, city: 'Villes'
			, station: 'Stations'
			, windrose: 'Boussole'
		}
		, ru: {
			  maps: 'карта'
			, layers: 'слой'
			, current: 'текущая погода'

			, clouds: 'о́блачность'
			, cloudscls: 'о́блачность (класси́ческий)'
			, precipitation: 'оса́дки'
			, precipitationcls: 'оса́дки (класси́ческий)'
			, rain: 'дождь'
			, raincls: 'дождь (класси́ческий)'
			, snow: 'снег'
			, temp: 'температу́ра'
			, windspeed: 'ско́рость ве́тра'
			, pressure: 'давле́ние'
			, presscont: 'изоба́ра'

			, city: 'города'
			, station: 'станции'
			, windrose: 'направление ветра'
		}
		, nl: {
			  maps: 'Kaarten'
			, layers: 'Lagen'
			, current: 'Actuele Weer'

			, clouds: 'Wolken'
			, cloudscls: 'Wolken (classic)'
			, precipitation: 'Neerslag'
			, precipitationcls: 'Neerslag (classic)'
			, rain: 'Regen'
			, raincls: 'Regen (classic)'
			, snow: 'Sneeuw'
			, temp: 'Temparatuur'
			, windspeed: 'Windsnelheid'
			, pressure: 'Luchtdruk'
			, presscont: 'Isobare'

			, city: 'Steden'
			, station: 'Stations'
			, windrose: 'Wind roos'
		}
	};

	if (typeof i18n[lang] != 'undefined'
			&& typeof i18n[lang][key] != 'undefined') {
		return  i18n[lang][key];
	}
	return key;
}

/**
 * Try to find a language we shoud use. Look for URL parameter or system settings.
 * Restricts to supported languages ('en', 'fr', 'ru', 'de' and some others).
 * @return String language code like 'en', 'fr', 'ru', 'de' or others
 */
function getLocalLanguage() {
	var lang = null;

	// 1. try to read URL parameter 'lang'
	var qs = window.location.search;
	if (qs) {
		if (qs.substring(0, 1) == '?') {
			qs = qs.substring(1)
		}
		var params = qs.split('&')
		for(var i = 0; i < params.length; i++) {
			var keyvalue = params[i].split('=');
			if (keyvalue[0] == 'lang') {
				lang = keyvalue[1];
				break;
			}
		}
	}

	// 2. try to get browser or system language
	if (!lang) {
		var tmp = window.navigator.userLanguage || window.navigator.language;
		lang = tmp.split('-')[0];
	}

	// Use only supported languages, defaults to 'en'
	if (lang != 'en' && lang != 'de' && lang != 'fr' && lang != 'ru' && lang != 'nl' && lang != 'ca' && lang != 'es' && lang != 'pt_br') {
		lang = 'en';
	}
	return lang;
}

