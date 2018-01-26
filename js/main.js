// Сценарий при загрузке страницы
// ==============================

$(function() {

	var citiesArr = [];


// Определение местополдожения пользователя
	if (!!navigator.geolocation ) {		// Проверка на поддержку браузерами
		navigator.geolocation.getCurrentPosition(function (position) {	// если поддерживается получаем координаты пользователя

			var userLat = position.coords.latitude;	// широта
			var userLlon = position.coords.longitude;	// долгота

			Lib.getWeather({	// вызов и отображение виджета текущей погоды
				'lat': userLat,
				'lon': userLlon,
				'lang': 'ru',
				'appid': Lib.Appid
			});

			var message = 'Ваше местоположение определено автоматически, ' + ' будет показана информация для вашего региона';
			Lib.createAlert('info', message);

		}, function () {
			Lib.geoError();
		});
	} else {
		Lib.geoError();
	}

	$.getJSON('current.city.list.json', function (data){
		for (var key in data) {

			citiesArr.push({
				city: data[key].name,
				id: data[key].id,
				country: data[key].country,
			});
		}
	});





});






























/*

$(function() {

	$.getJSON('current.city.list.json', function (data) {

		$('#country').on('change', function () {
			var out = '';
			var arr = [];
			for (var key in data) {
				if (data[key].country == $('#country option:selected').val()) {

					arr.push({
						city: data[key].name,
						id: data[key].id,
					});

					out += '<p value="' + data[key].id + '">' + data[key].name + '</p>';
				}
			}
			$('#city').html(out);
			$('#city p').on('click', function(){
				$.get(
					"http://api.openweathermap.org/data/2.5/weather",
					{
						"id": $(this).attr('value'),
						"lang": "ru",
						"appid": "fb7b90f94114b1c4a8c6ad811bb7e535"
					},
					function(data){
						console.log(data);
						var out = "";
						out += 'Населенный пункт: <b>' + data.name + '</b></br>';
						out += 'Координаты: <b>' + 'Широта ' + data.coord.lat + ' Долгота ' + data.coord.lon + '</b></br>';
						out += 'Погода: <b>' + data.weather[0].description + '</b></br>';
						out += 'Облачность: <b>' + data.clouds.all + '%</b></br>';
						if( data.visibility ) {
							out += 'Видимость: <b>' + data.visibility + 'м</b></br>';
						}
						out += 'Температура: <b>' + Math.round(data.main.temp - 273) + 'C</b></br>';
						$('#current-weather').html(out);
					}
				);
			})

		})
	});


});

*/
/*

	$.get(
		"http://api.openweathermap.org/data/2.5/forecast",
		{
			"q": "Minsk",
			"appid": "fb7b90f94114b1c4a8c6ad811bb7e535"
		},
		function(data){
			console.log(data);
		}
	);
*/