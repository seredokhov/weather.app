
(function() {

	var countryID,
		select = Lib.getById('countries'),
		showCitiesBtn = Lib.getById('country-btn'),
		cities = Lib.getById('cities'),
		request;


// Определение местоположения пользователя + запрос на отображение погоды
	window.onload = function () {

		try {
			var userLat = ymaps.geolocation.latitude,	// широта
					userLlon = ymaps.geolocation.longitude,	// долгота
					message;

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



// Загрузка JSON и вызов колбека
	request = new XMLHttpRequest();	// Создаем объект запроса
	request.open('GET', 'current.city.list.json', true);	// формируем запрос

	// Инициализируем функцию калбэк

	request.onload = function() {

		var data;

		// Проверяем ответ сервера
		if (request.status >= 200 && request.status < 400) {
			// Парсим строку JSON
			data = JSON.parse(request.responseText);

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
				//showCitiesBtn.innerHTML = 'Загрузка...';

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