/**
 * Adds a Flattr-button to Leaflet based maps.
 * License: CC0 (Creative Commons Zero), see http://creativecommons.org/publicdomain/zero/1.0/
 * Project page: https://github.com/buche/leaflet-flattrbutton
 **/
L.FlattrButton = L.Control.extend({

	options: {
		position: 'topright',
		autosubmit: false, // false or true
		buttonType: 'static', // available: 'static', 'widget', 'counterlarge', 'countercompact'
		buttonContent: 'badge', // available: 'badge', 'icon' or your HTML content
		flattrUid: null, // your Flattr user name
		flattrId: null, // the id of your Flattr thing
		flattrUrl: null, // the website of your Flattr thing, mandatory for autosubmit
		flattrTitle: null, // the title of your Flattr thing, optional for autosubmit
		flattrDesc: null, // the description of your Flattr thing, optional for autosubmit
		flattrLang: null, // the language of your Flattr thing, optional for autosubmit
		flattrTags: null, // the tags of your Flattr thing, optional for autosubmit
		flattrCategory: null, // the category of your Flattr thing
		flattrHidden: false, // should your Flattr thing be hidden? Optional for autosubmit
		popout: true, // show popout when hovering mouse over button (true) or hide it (false)
		counterDelay: 500 // delay for initializing counter function (in ms) when using 'countercompact' or 'counterlarge'
	},

	initialize: function(options) {
		L.Util.setOptions(this, options);
		this._container = L.DomUtil.create('div', 'leaflet-control-layers leaflet-control-layers-expanded');
		L.DomEvent.disableClickPropagation(this._container);
		this._container.innerHTML = this._createFlattrButton();
	},

	onAdd: function(map) {
		this._map = map;
		this._initCounterFunction();
		return this._container;
	},

	onRemove: function(map) {
		this._container.style.display = 'none';
		if (typeof this._script != 'undefined' && this._script != null) {
			if (this._script.parentNode) {
				this._script.parentNode.removeChild(this._script);
			}
			this._script = null;
		}
		this._map = null;
	},

	_createFlattrButton: function() {
		var txt = '';
		switch (this.options.buttonType) {
			case 'static':
				txt = this._createFlattrButtonStatic();
				break;
			case 'widget':
				txt = this._createFlattrButtonWidget();
				break;
			case 'counterlarge':
			case 'countercompact':
				txt = this._createFlattrButtonCounter();
				break;
			default:
				txt = 'Error: unsupported buttonType';
				break;
		}
		return txt;
	},

	_createButtonImageOrText: function() {
		if (this.options.buttonContent == 'badge') {
			return '<img src="http://api.flattr.com/button/flattr-badge-large.png" '
					+ 'width="93" height="20" '
					+ 'alt="Flattr this" title="Flattr this" border="0" />';
		}
		if (this.options.buttonContent == 'icon') {
			return '<img src="http://api.flattr.com/button/flattr-badge-small.png" '
					+ 'width="16" height="16" '
					+ 'alt="Flattr this" title="Flattr this" border="0" />';
		}
		return '<span class="flattr-button-content">'
				+ this.options.buttonContent
				+ '</span>';
	},

	_createFlattrButtonStatic: function() {
		var txt = '';
		if (this.options.autosubmit) {
			if (this.options.flattrUid == null || this.options.flattrUrl == null) {
				return 'Error in flattrUid or flattrUrl';
			}
			txt = 'https://flattr.com/submit/auto?user_id=' + encodeURIComponent(this.options.flattrUid)
				+ '&url=' + encodeURIComponent(this.options.flattrUrl)
				+ (this.options.flattrTitle !== null ? '&title=' + encodeURIComponent(this.options.flattrTitle) : '')
				+ (this.options.flattrDesc !== null ? '&description=' + encodeURIComponent(this.options.flattrDesc) : '')
				+ (this.options.flattrLang !== null ? '&language=' + encodeURIComponent(this.options.flattrLang) : '')
				+ (this.options.flattrTags !== null ? '&tags=' + encodeURIComponent(this.options.flattrTags) : '')
				+ (this.options.flattrHidden === true ? '&hidden=1' : '')
				+ (this.options.flattrCategory !== null ? '&category=' + encodeURIComponent(this.options.flattrCategory) : '');
		} else {
			if (this.options.flattrId == null) {
				return 'Error in flattrId';
			}
			txt = 'http://flattr.com/thing/' + encodeURIComponent(this.options.flattrId);
		}
		txt = '<a href="' + txt + '" target="_blank">' + this._createButtonImageOrText();
		return txt;
	},

	_createFlattrButtonWidget: function() {
		if (this.options.flattrId == null) {
			return 'Error in flattrId';
		}
		return '<iframe src="http://tools.flattr.net/widgets/thing.html?'
				+ 'thing=' + this.options.flattrId + '" '
				+ 'width="292" height="420"></iframe>';
	},

	_counterFunction: function() {
		var popout = this.options.popout === false ? '&popout=0' : '';
		var button = this.options.buttonType == 'countercompact' ? '&button=compact' : '';
		var params = '';

		if (this.options.autosubmit) {
			params += this.options.flattrUid !== null ? '&user_id=' + encodeURIComponent(this.options.flattrUid) : '';
			params += this.options.flattrUrl !== null ? '&url=' + encodeURIComponent(this.options.flattrUrl) : '';
			params += this.options.flattrTitle !== null ? '&title=' + encodeURIComponent(this.options.flattrTitle) : '';
			params += this.options.flattrDesc !== null ? '&description=' + encodeURIComponent(this.options.flattrDesc) : '';
			params += this.options.flattrLang !== null ? '&language=' + encodeURIComponent(this.options.flattrLang) : '';
			params += this.options.flattrTags !== null ? '&tags=' + encodeURIComponent(this.options.flattrTags) : '';
			params += this.options.flattrCategory !== null ? '&category=' + encodeURIComponent(this.options.flattrCategory) : '';
			params += this.options.flattrHidden === true ? '&hidden=1' : '';
		}

		var s = document.createElement('script');
		var t = document.getElementsByTagName('head')[0];
		s.type = 'text/javascript';
		s.async = true;
		s.src = 'http://api.flattr.com/js/0.6/load.js?mode=auto' + popout + button + params;
		t.appendChild(s);
		this._script = s;
	},

	_initCounterFunction: function() {
		if (this.options.buttonType == 'countercompact' || this.options.buttonType == 'counterlarge') {
			var thisObject = this;
			var fkt = function() { thisObject._counterFunction(); };
			window.setTimeout(fkt, this.options.counterDelay);
		}
    },

	_createFlattrButtonCounter: function() {
		if (this.options.flattrUrl == null) {
			return 'Error in flattrUrl';
		}
		if (this.options.autosubmit && this.options.flattrUid == null) {
			return 'Error in flattrUid';
		}
		var txt = '<a class="FlattrButton" style="display:none;" href="' + this.options.flattrUrl + '"></a>';
		return txt;
	}

});
L.flattrButton = function(options) { return new L.FlattrButton(options); };
