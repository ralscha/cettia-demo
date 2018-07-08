function initialize() {
	var mapOptions = {
		center: new google.maps.LatLng(46.947922, 7.444608),
		zoom: 14,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

	var blueCar = null;
	var redCar = null;

	google.maps.event.addListener(map, "rightclick", function(event) {
		var lat = event.latLng.lat();
		var lng = event.latLng.lng();
		console.log("Lat=" + lat + "; Lng=" + lng);
	});

	var moveCar = function(carColour, latlng) {
		var car = carColour === 'red' ? redCar : blueCar;
		
		if (!car) {
			car = new google.maps.Marker({
				position: new google.maps.LatLng(latlng.lat, latlng.lng),
				icon: 'car_'+carColour+'.png',
				map: map
			});
			if (carColour === 'red') {
				redCar = car;
			}
			else {
				blueCar = car;
			}
		}
		else {
			car.setPosition(new google.maps.LatLng(latlng.lat, latlng.lng));
		}
	}
	
	var serverPathUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
	var cettiaUrl = window.location.protocol + '//' + window.location.host + serverPathUrl + "cettia";

	cettia.open(cettiaUrl)
	        .on('map.blue', data => {
	        	moveCar('blue', data);
	        })
	        .on('map.red', data => {
	        	moveCar('red', data);
	        });	
}
