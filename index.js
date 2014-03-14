window.onload = function() {
	var map = L.map('map', {
	    center: [41.78961025632396, -87.59967505931854],
	    zoom: 15
	});
	L.tileLayer('http://{s}.tile.cloudmade.com/eb96ee9280fe4475ac82ff4afc79601b/997/256/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	    maxZoom: 18
	}).addTo(map);
};