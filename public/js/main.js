(function() {

	var countryID,
		select = Lib.getById('countries'),
		showCitiesBtn = Lib.getById('country-btn'),
		cities = Lib.getById('cities');

	Lib.showCitiesCount();
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
			Lib.createAlert('info', message, Lib.getById('alerts'), true);
		} catch (err) {
			// Если не удалось определить местоположение показываем погоду для региона по умолчанию
			Lib.getWeather({
				'id':  'Minsk',
				'lang': 'ru'
			});
			message = 'Не удалось определить ваше местоположение, будет показана информация для региона по умолчанию';
			Lib.createAlert('warning', message, Lib.getById('alerts'), true);
		}
	};


	// Обработчик события при выборе страны в селекте

	select.addEventListener('change', function(){
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


	// Обращение к базе данных по клику
	showCitiesBtn.addEventListener('click', function(){

		// Записываем значение выбранного селекта для дальнейшей проверке при выборе стран
		countryID = select.value;
		showCitiesBtn.setAttribute('disabled', 'disabled');

		Lib.selectCityFromDataBase(countryID, this);

	});

})();

