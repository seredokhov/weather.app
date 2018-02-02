// Инициализация + объявление констант
function LibConstructor() {
	this.ImgUrl = 'http://openweathermap.org/img/w/';
	this.defaultCityName = 'Minsk';
	this.timer; // Костыль для FadeOut (удалить)
}
var Lib = new LibConstructor();		// создание объекта библиотеки

// Получение элемента по id
function getById (elem) {
	return document.getElementById(elem);
}

// Метод добавления дней к текущей дате
Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
};


// Перевод UNIX Timestamp в дату
// @type - строка.
// 'date' - возвращает дату + месяц
// 'time' - возвращает время
// 'day' - возвращает день недели
// Без аргумента - возвращает число
Lib.timeConverter = 	function (timestamp, type){
	var a = new Date(timestamp * 1000);
	var days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
	var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
	var month = months[a.getMonth()];
	var date = a.getDate();
	var day = days[a.getDay()];
	var hour = ('' + a.getHours()).length > 1 ? a.getHours() : '0' + a.getHours();
	var min = a.getMinutes().length > 1 ? a.getMinutes() : '0' + a.getMinutes();
	if (type === 'time') {
		return hour + ':' + min;
	} else if ( type === 'date' ) {
		return date + ' ' + month;
	} else if ( type === 'day' ) {
		return day;
	}	else {
		return date;
	}
};


// запрос текущей погоды и отрисовка виджета
// @parameters - принимает объект параметров
Lib.getWeather =	function ( parameters ) {
	// Приватные свойства
	var Appid = 'fb7b90f94114b1c4a8c6ad811bb7e535';
	var Url = 'http://api.openweathermap.org/data/2.5/';


	var	string = '';
	// Записываем в переменную параметры в виде строки
	for (var key in parameters) {
		string += key + '=' + parameters[key] + '&';			// Нужно будет убрать последний символ
	}
	// создаем новый объект запроса
	var request = new XMLHttpRequest();

	// формируем запрос
	request.open('GET', Url + 'weather?' +  string + 'appid=' + Appid , true);

	// инициализируем функцию калбек
	request.onload = function () {

		// проверяем ответ сервера
		if (request.status >= 200 && request.status < 400) {
			// парсим JSON строку
			var data = JSON.parse(request.responseText);

			// Рендерим виджет
			Lib.renderCurrentWeather(data);
			// Активируем кнопку подробного прогноза
			showMore (data.id);

			// Удаляем ранее отрисованную карту если она существует
			if (getById('map')) {
				getById('map').remove();
			}
			// Вешаем событие для создание новой карты
			initMap(data.coord);

		}
	};
	// отправляем запрос
	request.send();
};



// Отрисовка основного виджета
// @data - принимает объект полученный из JSON
Lib.renderCurrentWeather = function (data) {

	var moreInfo = getById('moreInfo');
	var mainWeatherBlock = getById('mainWeatherBlock');
	var temp = Lib.tempConvert(data.main.temp);
	var pressure = Lib.pressureConvert(data.main.pressure);
	var windDirection = Lib.windConvert(data.wind.deg);
	var image = new Image();
	image.setAttribute('src',Lib.ImgUrl + data.weather[0].icon + '.png' );


	// Заполнение основной информации на виджете
	getById('cityName').innerHTML = data.name;	// Записываем название города в виджет
	getById('mainDate').innerHTML = Lib.timeConverter(data.dt, 'date');	// Записываем текущую дату в виджет

	// Заполняем температуру + вставляем картинку
	mainWeatherBlock.innerHTML = '';
	var tempBlock = document.createElement('span');
	tempBlock.innerHTML = (temp > 0 ? '+' + temp : temp) + '&#8451;';
	mainWeatherBlock.appendChild( tempBlock );
	mainWeatherBlock.insertBefore(image, tempBlock);

	// Заполнение дополнительной информации на виджете
	moreInfo.innerHTML = '';	// Обнуляем таблицу перед загрузкой новых данных

	// Заполняем таблицу
	moreInfo.appendChild(createPanel('Погода', data.weather[0].description));
	moreInfo.appendChild(createPanel('Облачность', data.clouds.all + ' %'));
	moreInfo.appendChild(createPanel('Влажность', data.main.humidity + ' %'));
	moreInfo.appendChild(createPanel('Давление воздуха', pressure + ' мм.рт.ст.'));
	moreInfo.appendChild(createPanel('Направление ветра', windDirection));
	moreInfo.appendChild(createPanel('Скорость ветра', data.wind.speed + ' м/с'));
};



// Функционал кнопки показать подробный прогноз
// @id - принимает id города
function showMore (id) {
	var getMoreBtn = getById('getMore');
	var forecast = getById('forecast');
	// Функция вызывается в момент отображения погоды = > активируем кнопку
	getMoreBtn.removeAttribute('disabled');

	// Записываем кнопке id текущего города в дата атрибут
	getMoreBtn.dataset.id = id;

	// По клику на нее вызываем дополнительный прогноз и передаем туда id
	getMoreBtn.onclick = function () {
		// Делаем кнопку нажатой, чтобы исключить повторные запросы
		this.setAttribute('disabled', 'disabled');
		forecast.style.display = 'block';
		// Вставляем текст в заголовок
		var h3 = getById('date-links-group').parentNode.firstElementChild;
		h3.innerHTML = 'Подробный прогноз на 5 дней с промежутком на каждые 3 часа:';

		// ПоДаем запрос на отображение прогноза на 5 дней
		Lib.getForecastWeather(id);
	};
}


// Инициализация и отрисовка карты
function initMap (coord) {
	var link = getById('showMap');
	link.onclick = function () {

		var widget = getById('widget');
		var coordinates = [coord.lat, coord.lon];

		// Создание карты
		var map = document.createElement('div');
		map.setAttribute('id', 'map');
		widget.appendChild(map);

		// Инициализируем карту и метку
		var Mymap = new ymaps.Map("map", {
			center: coordinates,
			zoom: 10
		});
		var placemark = new ymaps.Placemark(coordinates);
		// Метка
		Mymap.geoObjects.add(placemark);
		Mymap.controls.add('zoomControl');

		// Создание кнопки закрывающей карту
		var close =document.createElement('button');
		close.classList.add('map-close');
		close.innerHTML = '<i class="fa fa-times"></i>';
		map.appendChild(close);

		// По клику уничтожаем блок с картой
		close.onclick = function () {
			map.remove();
		};
		// Отменяем переход по ссылке
		return false;
	}
}




// Дополнительный прогноз
// @id - принимает id текущего города
Lib.getForecastWeather = function (id) {
	// Приватные свойства
	var Appid = 'fb7b90f94114b1c4a8c6ad811bb7e535';
	var Url = 'http://api.openweathermap.org/data/2.5/';

	// Создаем объект запроса
	var request = new XMLHttpRequest();

	// формируем запрос
	request.open('GET', Url + 'forecast?lang=ru&id=' + id + '&appid=' + Appid, true);

	// Инициализируем функцию калбЭк
	request.onload = function () {
		// Если сервер ответил производим дальнейшие действия
		if (request.status >= 200 && request.status < 400) {
			// Парсим полученный JSON и записываем результат в переменную
			var data = JSON.parse(request.responseText);

			// Создаем массив с прогнозом
			var forecastArray = Lib.createForecastArray(data);
			// Рендерим прогноз
			Lib.renderForecast(forecastArray);
		}
	};
	request.send();
};



// Создает и возвращает массив с прогнозом на 5 дней от текущего момента
// может состоять из 6 неполных дней
// $arr - получает весь массив из JSON
Lib.createForecastArray = function (arr) {
	// Инициализируем пустой массив для общего прогноза
	var sumForecast = [];
	// Текущая дата
	var now = new Date();

	//	Прогноз на 5 ней от текущего момента каждые 3 часа,
	// значит может состоять из 6 неполных дней => j < 6
	for ( j = 0; j < 6; j++ ) {

		// Обнуляем массив прогноза на день на каждой итерации
		var forecastDay = [];
		// Добавляем по j дней на каждой итерации цикла (с переходом на след месяц)
		//var nowDay = (now.addDays(j)).getDate();
		var nowDay = (now.addDays(j)).getDate();

		// Создаем массив прогноза на день j
		for ( var i = 0; i < arr.list.length; i++ ) {
			if ( Lib.timeConverter(arr.list[i].dt) === nowDay ) {
				forecastDay.push({
					city: arr.city,
					time: Lib.timeConverter(arr.list[i].dt, 'time'),
					day: Lib.timeConverter(arr.list[i].dt, 'day'),
					date: Lib.timeConverter(arr.list[i].dt, 'date'),
					weather: {
						clouds: arr.list[i].clouds.all,
						humidity: arr.list[i].main.humidity,
						pressure: arr.list[i].main.pressure,
						temp: arr.list[i].main.temp,
						description: arr.list[i].weather[0].description,
						icon: arr.list[i].weather[0].icon
					}
				});
			}
		}
		// Пушим массив с прогнозом на день в общий массив, если он не пустой
		if ( forecastDay.length > 0 ) {
			sumForecast.push(forecastDay);
		}
	}
	// Возвращаем преобразованный массив
	return sumForecast;
};



// Отображаем ссылки на дни недели и прогноз на ближайший день
// @arr - принимает массив с прогнозом
Lib.renderForecast = function (arr) {
	var dateLinks = getById('date-links-group');
	//очищаем блок от старых ссылок
	dateLinks.innerHTML = '';

	// создаем ссылку на прогноз по дате
	var link = document.createElement('button');
	link.classList.add('btn', 'btn-default');
	link.setAttribute('type', 'button');

	for (var key in arr) {
		// Клонируем созданную выше ссылку и записываем ей в атрибут ее позицию в массиве
		var clone = link.cloneNode(true);
		clone.dataset.idx = key;
		clone.innerHTML = arr[key][0].date + '<br>' + arr[key][0].day;

		// Вешаем событие на каждую ссылку
		clone.addEventListener('click', function () {
			// Если нажатая ссылке уже активна - не делаем ничего
			if (!this.classList.contains('active')) {
				dateLinks.querySelector('.active').classList.remove('active');
				this.classList.add('active');
				renderDay(arr, this.dataset.idx);
			}
		});
		dateLinks.appendChild(clone);
	}
	// Добавляем активный класс первой ссылке в списке
	dateLinks.querySelector('.btn').classList.add('active');

	// Сразу рендерим первый день ( 0 элемент массива ), т.к. он открыт по дефолту
	renderDay(arr, 0);
};



// Функция для отображения прогноза за конкретное число
// @Принимает массив дней и индекс дня
function renderDay(arr, idx) {
	// сохраняем массив с прогнозом на конкретный день
	var dayForecast = arr[idx];
	var wrap = getById('forecast-list');
	wrap.innerHTML = '';	// очищаем

	// Перебираем массив и отрисовываем элементы
	for ( var i = 0; i < dayForecast.length; i++ ) {

		// Блок обертка
		var div = document.createElement('div');
		div.classList.add('flex-column');

		// Элемент карточки
		var panel = document.createElement('div');
		panel.classList.add('card');

		//	Шапка карточки
		var header = document.createElement('div');
		header.classList.add('card-heading');
		header.innerHTML = dayForecast[i].time;
		panel.appendChild(header);

		// Тело карточки
		var body = document.createElement('div');
		body.classList.add('card-body');

		// Описание в теле карточки
		var weather = document.createElement('div');
		weather.classList.add('weather');
		weather.innerHTML = dayForecast[i].weather.description;
		body.appendChild(weather);

		// Блок с температурой
		var tempBlock = document.createElement('div');
		tempBlock.classList.add('temp');

		// Картинка
		var image = new Image();
		image.setAttribute('src',Lib.ImgUrl + dayForecast[i].weather.icon + '.png');
		tempBlock.appendChild(image);

		// Вычисляем и вставляем температуру. Если больше 0 то добавляем '+'
		var	temp = document.createElement('span');
		var cels = Lib.tempConvert(dayForecast[i].weather.temp);
		temp.innerHTML = cels > 0 ? '+' + cels : cels;
		tempBlock.appendChild(temp);

		// Вставляем блок с температурой в тело карточки
		body.appendChild(tempBlock);
		// Вставляем тело карточки в саму карточку
		panel.appendChild(body);
		// Вставляем карточку в блок обертку
		div.appendChild(panel);
		// Добавляем готовую обертку в список
		wrap.appendChild(div);
	}
}


// Конвертация температуры кельвинов в цельсии
Lib.tempConvert = function(val) {
	return Math.round( val - 273 );
};

// Конвертация мегапаскалей в мм.рт.ст.
Lib.pressureConvert = function(val) {
	return (val * 0.00750063755419211 * 100).toFixed(2);
};

// Направление ветра из градусов
Lib.windConvert = function(val) {
	switch(!!val) {
		case ( +val > 20 && +val < 70 ): return 'СВ';
		case ( +val > 70 && +val < 110 ): return 'В';
		case ( +val > 110  && +val < 160 ): return 'ЮВ';
		case ( +val > 160  && +val < 200 ): return 'Ю';
		case ( +val > 200  && +val < 250 ): return 'ЮЗ';
		case ( +val > 250  && +val < 290 ): return 'З';
		case ( +val > 290  && +val < 340 ): return 'СЗ';
		case ( +val > 340  && +val < 20 ): return 'С';
		default: return 'Неизвестно';
	}
};


// Создание панели для основного виджета
function createPanel(title, value) {
	if ( value === undefined ) return;
	//var el = $('<div>').addClass('panel panel-default');
	var row = document.createElement('div');
	row.classList.add('panel', 'panel-default');
	var col1 = document.createElement('span');
	col1.className = 'title';
	col1.innerHTML = title;
	var col2 = col1.cloneNode();
	col2.className = 'value';
	col2.innerHTML = value;
	row.appendChild(col1);
	row.appendChild(col2);
	return row;
}



// Создание Alert
// @type - принимает тип оповещения в виде префикса прим: "warning"
// @txt - принимает текстовое сообщение из вызывающей функции
// @elem - принимает элемент в который нужно вставить уведомление
// @flag - булево значение, если передано true добавляет глобальное уведомление
Lib.createAlert = function (type, txt, elem, flag) {
	var alert = document.createElement('div');
	alert.classList.add('alert-' + type);
	alert.innerHTML = txt;

	// Если передан флаг добавляем кастомный класс, интервал на удаление и событие клик
	if( flag === true ) {
		var alertClose = document.createElement('button');
		alertClose.classList.add('close');
		alertClose.setAttribute('type', 'button');
		alert.classList.add('custom-alert');
		alertClose.innerHTML = '&times;';
		alert.appendChild(alertClose);
		alert.addEventListener('click', function() {
			Lib.destroyElem(this);
			clearInterval(Lib.timer);
		});
		// Удалить через время
		setTimeout(Lib.destroyElem, 4000, alert);
	}
	// Вставляем сгенерированный алерт в переданный параметром DOM елемент
	elem.appendChild(alert);
};



// Удаление элемента c эффектом затухания
Lib.destroyElem = function (elem) {
	elem.classList.add('fadeOut');
	Lib.timer = setTimeout(function() {
		elem.parentNode.removeChild(elem);
	}, 300);
};



// Функция сортировки массива для вывода в алфавитном порядке
Lib.compareObject = function (a, b) {
	if (a.city > b.city) return 1;
	if (a.city < b.city) return -1;
	return 0;
};



// Функция для отображения городов
// В качестве параметра принимает массив элементов
// @param[0] принимаем объект JSON из корневого каталога
// @param[1] принимаем елемент кнопки для подмены текста
Lib.getCityArray = function (param) {
	var arr = [];
	var data = param[0];	// объект всех городов всех стран, переданный из main.js
	var btn = param[1];	// Элемент нажатой кнопки из файла main.js
	var index = getById('countries').options.selectedIndex;
	var options = getById('countries').querySelectorAll('option');
	var selectVal = options[index].value;
	var search = getById('searchCity');

	// Создаем массив объектов с городами выбранной страны
	for ( var key = 0; key < data.length; key++ ) {
		if (data[key].country === selectVal) {
			arr.push({
				id: data[key].id,
				city: data[key].name
			});
		}
	}
	// Сортируем массив по алфавиту
	arr.sort(Lib.compareObject);
	// Записываем количество городов в глобальную переменную
	Lib.countCities = arr.length;

	// изменяем текст в переданном элементе кнопки для отображения кол-ва городов
	btn.innerHTML = '<i class="fa fa-search"></i> Найдено: ' + Lib.countCities;

	// Если выполнена функция getCityArray
	// Создаем и вставляем новый input для поиска
	var searchInput = document.createElement('input');
	searchInput.classList.add('search-input');
	searchInput.setAttribute('id', 'search');
	searchInput.setAttribute('placeholder', 'Введите название города...');
	search.innerHTML = '';
	search.appendChild(searchInput);

	// На созданный input вешаем событие для поиска
	searchInput.addEventListener('keyup', function (e) {
		var e = e || event;
		if ( e.key !== 'Shift' && e.key !== 'Enter' && e.key !== 'Alt' && e.key !== ' ' ) {
			Lib.searchByCityName(this, arr, btn);
		}
	});
	// Рендерим все города выбранной страны
	Lib.citiesRender(arr);
};




// Функция рендеринга элементов городов
// @arr - принимаем массив городов
Lib.citiesRender = function (arr) {
	var block = getById('cities');
	var searchInputBlock = getById('searchCity');
	var citiesList = document.createElement('div');
	citiesList.classList.add('list-group');
	var out = "";	// обязательная инициализация

	// Очищаем блок	для городов от статических элементов
	block.innerHTML = '';

	// Формирование и отображение первой сотни элементов
	for(var i = 0; i < 100 &&  i < arr.length; i++) {
		out = out + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';	// записываем HTML в
		// виде строки
	}
	// Выгружаем полученные элементы в список (если ничего не найдено показываем сообщение)
	if ( out.length > 0 ) {
		citiesList.innerHTML = out;
		block.appendChild(citiesList);
		searchInputBlock.classList.remove('error');
	} else {
		out = '<i class="fa fa-exclamation"></i> Ничего не найдено.';
		block.innerHTML = '';
		Lib.createAlert('danger', out, block);
		searchInputBlock.classList.add('error');
	}
	// Вешаем на них событие клик (см. функцию)
	Lib.bindGetWeatherOnClick(block);

	//	Подгрузка городов при скроле
	citiesList.addEventListener('scroll', function() {
		var localOut = "";	// Переменная для хранения дополнительных элементов и их последующей подгрузке в конец списка (обязательная инициалитзация)
		var offsetBottom = 100; // Отступ от низа блока при скроле за который добавляются элементы
		if ( this.scrollTop >= this.scrollHeight-this.clientHeight - offsetBottom ) {
			var j = i + 100;	// При прокручивании до точки добавляем по 100 элементов

			// записываем в localOut следеющую сотню элементов
			for( i; i < j &&  i < arr.length && i; i++) {
				localOut = localOut + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';
			}
			// Добавляем элементы в конец списка
			citiesList.innerHTML += localOut;

			// Вешаем на них событие клик (см. функцию)
			Lib.bindGetWeatherOnClick(block);
		}
	});
};



//Поиск при наборе текста
Lib.searchByCityName = function (target, arr, btn) {
	// Обнуляем счетчик количество городов
	Lib.countCities = 0;
	var searchArr = [];

	// Обходим циклом все города выбранной страны и выбираем нужные нам
	for ( var key in arr) {
		// Сравниваем значение поля city каждого элемента массива с набранным тестом (без учета регистра)
		// И формируем новый массив из выбранных значений
		if ( arr[key].city.toUpperCase().indexOf(target.value.toUpperCase()) === 0  ) {
			Lib.countCities++;	// Количество найденных результатов
			searchArr.push({
				id: arr[key].id,
				city: arr[key].city
			})
		}
	}
	// Отображаем количество найденных элементов в кнопке
	btn.innerHTML = '<i class="fa fa-search"></i> Найдено: ' + Lib.countCities;

	// Передаем полученный массив городов в функцию для рендеринга
	Lib.citiesRender(searchArr);
};




// Вешаем событие вызова погоды при клике на элементы из списка городов
// @cities - принимает елемент со списком городов
Lib.bindGetWeatherOnClick = function (block) {
	// получаем массив ссылок
	var links = block.querySelectorAll('a');
	// обходим массив и каждой ссылке вешаем событие
	links.forEach(function(elem) {
		elem.addEventListener('click', function (e) {

			// Записываем в переменную объект события
			var evt = e || window.event;

			// Если данные по городу уже получены не делаем ничего
			if(this.classList.contains('active')) {
				// Отменяем событие по умолчанию (переход по ссылке)
				(evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
				return;
			}
			// записываем значение аотрибута в переменную
			var data = this.dataset.id;
			this.classList.add('active');

			// Выбираем все ссылки в коллекцию
			var elems = this.parentNode.querySelectorAll('.active');

			// у всех кроме нажатой удаляем клас active
			elems.forEach(function (i) {
				if ( i.dataset.id !== data ) {
					i.className = 'list-group-item';
				}
			});
			// Отображаем погоду для нажатого элемента
			Lib.getWeather({
				'id': data,
				'lang': 'ru'
			});

			// Обнуляем блок с подробным прогнозом, который был показан для другого города
			resetForecast();

			// Отменяем событие по умолчанию (переход по ссылке)
			(evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
			return false
		});
	})
};

// Обнуление подробного прогноза
function resetForecast() {
	var links = getById('date-links-group');
	var forecast = getById('forecast');
	var forecastList = getById('forecast-list');
	forecast.style.display = 'none';
	links.parentNode.firstElementChild.innerHTML = '';
	links.innerHTML = '';
	forecastList.innerHTML = '';
}
