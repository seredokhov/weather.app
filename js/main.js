
(function() {

// Определение местоположения пользователя + запрос на отображение погоды
	window.onload = function () {

		try {
			var userLat = ymaps.geolocation.latitude;	// широта
			var userLlon = ymaps.geolocation.longitude;	// долгота
			var message;

			// Генерируем исключение
			if ( !userLat  || !userLlon  ) {
				throw new Error('Не удалось найти местоположение');
			}
			// Показываем погоду для текущего местоположения пользователя
			Lib.getWeather({
				'lat': userLat,
				'lon': userLlon,
				'lang': 'ru'
			});
			// Генерируем сообщение
			message = 'Ваше местоположение определено, будет показана информация для вашего региона';
			Lib.createAlert('info', message, Lib.getById('main-content'), true);
		} catch (err) {
			// Если не удалось определить местоположение показываем погоду для региона по умолчанию
			Lib.getWeather({
				'q':  'Minsk',
				'lang': 'ru'
			});
			message = 'Не удалось определить ваше местоположение, будет показана информация для региона по умолчанию';
			Lib.createAlert('warning', message, Lib.getById('main-content'), true);
		}
	};

	var countryID;
	var select = Lib.getById('countries');
	var showCitiesBtn = Lib.getById('country-btn');
	var cities = Lib.getById('cities');

// Загрузка JSON и вызов колбека
	var request = new XMLHttpRequest();	// Создаем объект запроса
	request.open('GET', 'current.city.list.json', true);	// формируем запрос

	// Инициализируем функцию калбэк
	request.onload = function() {
		// Проверяем ответ сервера
		if (request.status >= 200 && request.status < 400) {
			// Парсим строку JSON
			var data = JSON.parse(request.responseText);

			// Делаем селект доступным после полной загрузки JSON
			select.removeAttribute('disabled');

			// Активация кнопки "показать города" при выборе страны в селекте
			select.addEventListener('change', function() {
				if ( this.value !== null && this.value !== countryID ) {

					// Если в выбраном селекте задан атрибут value
					// и выбранная страна не является той, чьи города на данный момент загружены
					showCitiesBtn.removeAttribute('disabled');
					showCitiesBtn.innerHTML = '<i class="fa fa-search"></i> Показать города';
				} else {
					showCitiesBtn.setAttribute('disabled', 'disabled');
					showCitiesBtn.innerHTML = '<i class="fa fa-search"></i> Найдено: ' + Lib.countCities();
				}
			});

			// Событие 'показать города'
			showCitiesBtn.addEventListener('click', function() {
				// Записываем значение выбранного селекта для дальнейшей проверке при выборе стран
				countryID = select.value;

				// Деактивируем кнопку и на время загрузки заменяем текст в ней
				showCitiesBtn.setAttribute('disabled', 'disabled');
				showCitiesBtn.innerHTML = 'Загрузка...';

				// Передаем объекты в функцию для получения списка городов
				Lib.getCityArray([data, showCitiesBtn]);
			});

			// Удаляем сообщение о загрузке
			Lib.getById('load-alert').parentNode.removeChild(Lib.getById('load-alert'));
			// Генерируем новое сообщение
			Lib.createAlert('info', '<i class="fa fa-check"></i> Список городов загружен.', Lib.getById('cities'));

		} else {
			// Если сервер не ответил или ответ не понравился
			console.log('Не удалось загрузить JSON, сервер не отвечает');
		}
	};
	// И отправляем запрос
	request.send();

})();






























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