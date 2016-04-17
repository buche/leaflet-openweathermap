/**
 * Adds a language selector to Leaflet based maps.
 * License: CC0 (Creative Commons Zero), see http://creativecommons.org/publicdomain/zero/1.0/
 * Project page: https://github.com/buche/leaflet-languageselector
 **/
L.LanguageSelector = L.Control.extend({

	options: {
		  languages: new Array()
		, callback: null
		, title: null
		, position: 'topright'
		, hideSelected: false
		, vertical: false
		, initialLanguage: null
	},

	initialize: function(options) {
		this._buttons = new Array();
		L.Util.setOptions(this, options);
		this._container = L.DomUtil.create('div',
			'leaflet-control-layers leaflet-control-layers-expanded leaflet-languageselector-control');
		L.DomEvent.disableClickPropagation(this._container);
		this._createLanguageSelector(this._container);
	},

	onAdd: function(map) {
		this._map = map;
		return this._container;
	},

	onRemove: function(map) {
		this._container.style.display = 'none';
		this._map = null;
	},

	_createLanguageSelector: function(container) {
		if (this.options.title) {
			var titleDiv = L.DomUtil.create('div', 'leaflet-languageselector-title', container);
			titleDiv.innerHTML = this.options.title;
		}
		var languagesDiv = L.DomUtil.create('div', 'leaflet-languageselector-languagesdiv', container);
		for (var i1=0; i1<this.options.languages.length; i1++) {
			var lang = this.options.languages[i1];
			var langDiv = L.DomUtil.create('div', 'leaflet-languageselector-langdiv'
					+ (this.options.vertical ? '' : ' leaflet-languageselector-float-left')
					+ (i1 > 0 ? ' leaflet-languageselector-mleft' : ''), languagesDiv);
			if (lang.image) {
				var img = L.DomUtil.create('img', '', langDiv);
				img.src = lang.image;
				img.title = (lang.displayText ? lang.displayText : lang.id);
			} else {
				langDiv.innerHTML = lang.displayText ? lang.displayText : lang.id;
			}
			langDiv.id = 'languageselector_' + lang.id;
			langDiv._langselinstance = this;
			langDiv.addEventListener('click', this._languageChanged, false);
			if (this.options.hideSelected && this.options.initialLanguage && this.options.initialLanguage == lang.id) {
				langDiv.style.display = 'none';
			}
			this._buttons.push(langDiv);
		}
	},

	_languageChanged: function(pEvent) {
		var elem = pEvent.target;
		if (!elem._langselinstance) {
			elem = elem.parentElement;
		}
		var inst = elem._langselinstance;
		var lang = elem.id.substr(0,17) == 'languageselector_' ? elem.id.substr(17) : null;

		// hide language button
		if (inst.options.hideSelected) {
			for (var i=0; i<inst._buttons.length; i++) {
				var b = inst._buttons[i];
				if (b.id == elem.id) {
					b.style.display = 'none';
				} else {
					b.style.display = 'block';
				}
			}
		}

		// callback
		if (inst.options.callback && typeof inst.options.callback == 'function') {
			inst.options.callback(lang);
		}
	}

});

L.langObject = function(langId, text, img) {
	return {
		id: langId,
		displayText: text,
		image: img
	}
};

L.languageSelector = function(options) { return new L.LanguageSelector(options); };
