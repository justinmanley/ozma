L.AwesomeMarkers.Icon = L.AwesomeMarkers.Icon.extend({
	options: {
		number: '',
		className: 'awesome-marker'
	},
	createIcon: function() {
        var div = document.createElement('div'),
        	numberDiv = document.createElement('div'),
            options = this.options;

        if (options.icon) {
            div.innerHTML = this._createInner();
        }

        if (options.bgPos) {
            div.style.backgroundPosition =
                (-options.bgPos.x) + 'px ' + (-options.bgPos.y) + 'px';
        }

        numberDiv.setAttribute( "class", "number" );
        numberDiv.innerHTML = this.options["number"] || "";
        div.appendChild(numberDiv);

        this._setIconStyles(div, 'icon-' + options.markerColor);
        return div;
	}
});
L.AwesomeMarkers.icon = function(options) {
	return new L.AwesomeMarkers.Icon(options);
}