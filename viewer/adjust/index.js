var geojsonViewerApp = angular.module("geojsonViewerApp", [ "leaflet-directive" ]);
var geojsonUrl = "../data/march2014.geojson";
geojsonViewerApp.controller("timestampEditorCtrl", [ "$scope", "$http", "leafletData", "leafletHelpers", "showFeature", "Util", function($scope, $http, leafletData, leafletHelpers, showFeature, Util) {
	/* Set up map. */
	angular.extend($scope, {
		hydePark: {
			lng: -87.59967505931854,
			lat: 41.78961025632396,
			zoom: 15
		},
		tiles: {
			url: "http://{s}.tile.stamen.com/toner-lite/{z}/{x}/{y}.jpg",
			options: {
				attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
			}
		},
		events: {
			enable: ['click', 'drag', 'dragend' ],
			logic: 'emit'
		}
	});

	$http({ method: 'GET', url: geojsonUrl })
		.success(function(data) {
			leafletData.getMap().then(function(map) {
				Util.initialize(map, data);

				$scope.currentFeatureIndex = 1;
				$scope.currentFeatureId = Util.indexToId($scope.currentFeatureIndex);
				showFeature(map, data, $scope.currentFeatureIndex);

				$scope.updateFeature = Util.updateFeature;
				$scope.switchFeature = Util.switchFeature;

				$scope.downloadFile = function(featureIndex) {
					var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,
						isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1,
						downloadData = featureIndex ? data.features[featureIndex] : data,
						downloadUrl = encodeURI('data:text/json;charset=utf-8,' + JSON.stringify(downloadData)),
						featureId = Util.indexToId(featureIndex);

				    //If in Chrome or Safari - download via virtual link click
				    if (isChrome || isSafari) {
				        //Creating new link node.
				        var link = document.createElement('a');
				        link.href = downloadUrl;
				 
				        if (link.download !== undefined){
				            //Set HTML5 download attribute. This will prevent file from opening if supported.
				            var fileName = featureId ? "feature" + featureId + ".geojson" : "march2014.geojson";
				            link.download = fileName;
				        }
				 
				        //Dispatching click event.
				        if (document.createEvent) {
				            var e = document.createEvent('MouseEvents');
				            e.initEvent('click' ,true ,true);
				            link.dispatchEvent(e);
				            return true;
				        }
				    }
				 
				    // Force file download (whether supported by server).
				    var query = '?download';
				 
				    window.open(downloadUrl + query);
				};
			});
		})
		.error(function(data, status) {
			console.log("Status: " + status + "Could not locate the file.");
		});
}]);