// Модуль для сокрытия приватных данных и методов
var  Lib = (function(){


	// Приватные свойства
	var APPID = 'fb7b90f94114b1c4a8c6ad811bb7e535',
			URL = 'http://api.openweathermap.org/data/2.5/',
			ImgUrl = 'http://openweathermap.org/img/w/',
			countCities = null; // чило количества найденных городов



	// Метод добавления дней к текущей дате
	Date.prototype.addDays = function(days) {
		var dat = new Date(this.valueOf());
		dat.setDate(dat.getDate() + days);
		return dat;
	};


	// Публичные функции
	// ******************

	// запрос текущей погоды и отрисовка виджета
	// @parameters - принимает объект параметров
	function getWeather ( parameters ) {

		var	string = '',
				request,
				data,
				key;

		// Записываем в переменную параметры в виде строки
		for (key in parameters) {
			if ( parameters.hasOwnProperty(key) ) {
				string += key + '=' + parameters[key] + '&';			// Последний символ & нужен
			}
		}
		// создаем новый объект запроса
		request = new XMLHttpRequest();

		// формируем запрос
		request.open('GET', URL + 'weather?' +  string + 'appid=' + APPID , true);

		// инициализируем функцию калбек
		request.onreadystatechange = function () {

			// проверяем ответ сервера
			if (request.readyState === 4 &&  request.status >= 200 && request.status < 400) {
				// парсим JSON строку
				data = JSON.parse(request.responseText);
				// Рендерим виджет
				renderCurrentWeather(data);
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
	}


	// Создание Alert
	// @type - принимает тип оповещения в виде префикса прим: "warning"
	// @txt - принимает текстовое сообщение из вызывающей функции
	// @elem - принимает элемент в который нужно вставить уведомление
	// @flag - булево значение, если передано true добавляет глобальное уведомление
	function createAlert (type, txt, elem, flag) {
		var alert = document.createElement('div'),
				alertClose;

		alert.classList.add('alert-' + type);
		alert.innerHTML = txt;

		// Если передан флаг добавляем кастомный класс, интервал на удаление и событие клик
		if( flag === true ) {
			alertClose = document.createElement('button');
			alertClose.classList.add('close');
			alertClose.setAttribute('type', 'button');
			alert.classList.add('custom-alert');
			alertClose.innerHTML = '&times;';
			alert.appendChild(alertClose);
			alert.addEventListener('click', function() {
				fadeOut(this, 1000, function() {
					destroyElem(this);
				});
			});

			// Через 4 секунды запускаем fadeOut
			setTimeout( function() {
				fadeOut(alert, 1000, function() {
					destroyElem(alert);
				});
			}, 4000 );
		}
		// Вставляем сгенерированный алерт в переданный параметром DOM елемент
		elem.appendChild(alert);
	}


	// Удаление элемента
	function destroyElem(elem) {
			elem.parentNode.removeChild(elem);
	}

	// Функция fadeOut
	// @elem - елемент к которому будем применять функцию
	// @t - время за которое будет происходить исчезновение
	// @callback - функция калбек
	function fadeOut(elem, t, callback) {
		var fps = 50,
				time = t || 500,
				steps = time / fps,
				opacity = 1,
				d0 = opacity / steps,
				timer;

		timer = setInterval( function () {
			opacity -= d0;
			elem.style.opacity = opacity;
			steps--;

			if(steps === 0) {
				clearInterval(timer);
				elem.style.display = 'none';
				if ( callback && typeof callback === 'function' ) {
					callback();
				}
			}
		}, (1000 / fps));
	}

	// Функция fadeIn
	// @elem - елемент к которому будем применять функцию
	// @t - время за которое будет происходить исчезновение
	// @callback - функция калбек
	function fadeIn(elem, t, callback) {
		var fps = 50,
			time = t || 500,
			steps = time / fps,
			opacity = 0,
			d0 = 1 / steps,
			timer;

		elem.style.opacity = opacity;
		elem.style.display = 'block';

		timer = setInterval( function () {
			opacity += d0;
			elem.style.opacity = opacity;
			steps--;

			if(steps === 0) {
				clearInterval(timer);
				if ( callback && typeof callback === 'function' ) {
					callback();
				}
			}
		}, (1000 / fps));
	}

	// Функция для отображения городов
	// В качестве параметра принимает массив элементов
	// @param[0] принимаем объект JSON из корневого каталога
	// @param[1] принимаем елемент кнопки для подмены текста
	function getCityArray(param) {
		var arr = [],
				data = param[0],	// объект всех городов всех стран, переданный из main.js
				btn = param[1],	// Элемент нажатой кнопки из файла main.js
				index = getById('countries').options.selectedIndex,
				options = getById('countries').querySelectorAll('option'),
				searchInput,
				selectVal = options[index].value,
				search = getById('searchCity'),
				length = data.length,
				key;

		// Создаем массив объектов с городами выбранной страны
		for ( key = 0; key < length; key += 1 ) {
			if (data[key].country === selectVal) {
				arr.push({
					id: data[key].city_id,
					city: data[key].name
				});
			}
		}
		// Сортируем массив по алфавиту
		arr.sort(compareObject);
		// Записываем количество городов в глобальную переменную
		countCities = arr.length;

		// изменяем текст в переданном элементе кнопки для отображения кол-ва городов
		btn.innerHTML = '<i class="fa fa-search"></i> Найдено: ' + countCities;

		// Если выполнена функция getCityArray
		// Создаем и вставляем новый input для поиска
		searchInput = document.createElement('input');
		searchInput.classList.add('search-input');
		searchInput.setAttribute('id', 'search');
		searchInput.setAttribute('placeholder', 'Введите название города...');
		search.innerHTML = '';
		search.appendChild(searchInput);

		// На созданный input вешаем событие для поиска
		searchInput.addEventListener('keyup', function (e) {
			var evt = e || event;
			if ( evt.key !== 'Shift' && evt.key !== 'Enter' && evt.key !== 'Alt' && evt.key !== ' ' ) {
				searchByCityName(this, arr, btn);
			}
		});
		// Рендерим все города выбранной страны
		citiesRender(arr);
	}




	// Приватные функции
	// ******************


	//Поиск при наборе текста
	function searchByCityName (target, arr, btn) {

		var searchArr = [],
				key;

		// Обнуляем счетчик количество городов
		countCities = 0;

		// Обходим циклом все города выбранной страны и выбираем нужные нам
		for ( key in arr) {
			// Сравниваем значение поля city каждого элемента массива с набранным тестом (без учета регистра)
			// И формируем новый массив из выбранных значений если свойство является свойством объекта
			if ( arr.hasOwnProperty(key) && arr[key].city.toUpperCase().indexOf(target.value.toUpperCase()) === 0  ) {
				countCities++;	// Количество найденных результатов
				searchArr.push({
					id: arr[key].id,
					city: arr[key].city
				})
			}
		}
		// Отображаем количество найденных элементов в кнопке
		btn.innerHTML = '<i class="fa fa-search"></i> Найдено: ' + countCities;

		// Передаем полученный массив городов в функцию для рендеринга
		citiesRender(searchArr);
	}



	// Функция рендеринга элементов городов
	// @arr - принимаем массив городов
	function citiesRender (arr) {
		var block = getById('cities'),
				searchInputBlock = getById('searchCity'),
				citiesList = document.createElement('div'),
				out = "",	// обязательная инициализация
				i,	// Замыкаем i
				length;

		// Очищаем блок	для городов от статических элементов
		block.innerHTML = '';
		citiesList.classList.add('list-group');

		// Формирование и отображение первой сотни элементов
		for(i = 0, length = arr.length; i < 100 &&  i < length; i += 1) {
			// записываем HTML в виде строки
			out = out + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';
		}
		// Выгружаем полученные элементы в список (если ничего не найдено показываем сообщение)
		if ( out.length > 0 ) {
			citiesList.innerHTML = out;
			block.appendChild(citiesList);
			searchInputBlock.classList.remove('error');
		} else {
			out = '<i class="fa fa-exclamation"></i> Ничего не найдено.';
			block.innerHTML = '';
			createAlert('danger', out, block);
			searchInputBlock.classList.add('error');
		}
		// Вешаем на них событие клик (см. функцию)
		bindGetWeatherOnClick(block);

		//	Подгрузка городов при скроле
		citiesList.addEventListener('scroll', function() {
			var localOut = "",	// Переменная для хранения дополнительных элементов и их последующей подгрузке в конец списка (обязательная инициалитзация)
					offsetBottom = 100, // Отступ от низа блока при скроле за который добавляются элементы
					length,
					j;

			if ( this.scrollTop >= this.scrollHeight-this.clientHeight - offsetBottom ) {
				j = i + 100;	// При прокручивании до точки добавляем по 100 элементов

				// записываем в localOut следеющую сотню элементов
				for( i, length = arr.length; i < j &&  i < length && i; i += 1) {
					localOut = localOut + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';
				}
				// Добавляем элементы в конец списка
				citiesList.innerHTML += localOut;

				// Вешаем на них событие клик (см. функцию)
				bindGetWeatherOnClick(block);
			}
		});
	}

	// Вешаем событие вызова погоды при клике на элементы из списка городов
	// @cities - принимает елемент со списком городов
	function bindGetWeatherOnClick (block) {
		// получаем массив ссылок
		var links = block.querySelectorAll('a');
		// обходим массив и каждой ссылке вешаем событие
		links.forEach(function(elem) {
			elem.addEventListener('click', function (e) {

				var evt = e || window.event,
						data,
						elems;

				// Если данные по городу уже получены не делаем ничего
				if(this.classList.contains('active')) {
					// Отменяем событие по умолчанию (переход по ссылке)
					(evt.preventDefault) ? evt.preventDefault() : evt.returnValue = false;
					return;
				}
				// записываем значение аотрибута в переменную
				data = this.dataset.id;
				this.classList.add('active');

				// Выбираем все ссылки в коллекцию
				elems = this.parentNode.querySelectorAll('.active');

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
	}




	// Отрисовка основного виджета
	// @data - принимает объект полученный из JSON
	function renderCurrentWeather (data) {

		var moreInfo = getById('moreInfo'),
				mainWeatherBlock = getById('mainWeatherBlock'),
				temp = tempConvert(data.main.temp),
				tempBlock,
				pressure = pressureConvert(data.main.pressure),
				windDirection = windConvert(data.wind.deg),
				image = new Image();


		image.setAttribute('src',ImgUrl + data.weather[0].icon + '.png' );

		// Заполнение основной информации на виджете
		getById('cityName').innerHTML = data.name;	// Записываем название города в виджет
		getById('mainDate').innerHTML = timeConverter(data.dt, 'date');	// Записываем текущую дату в виджет

		// Заполняем температуру + вставляем картинку
		mainWeatherBlock.innerHTML = '';
		tempBlock = document.createElement('span');
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
	}



	// Функционал кнопки показать подробный прогноз
	// @id - принимает id города
	function showMore (id) {
		var getMoreBtn = getById('getMore'),
				forecast = getById('forecast');
		// Функция вызывается в момент отображения погоды = > активируем кнопку
		getMoreBtn.removeAttribute('disabled');

		// Записываем кнопке id текущего города в дата атрибут
		getMoreBtn.dataset.id = id;

		// По клику на нее вызываем дополнительный прогноз и передаем туда id
		getMoreBtn.onclick = function () {
			var h3;
			// Делаем кнопку нажатой, чтобы исключить повторные запросы
			this.setAttribute('disabled', 'disabled');
			forecast.style.display = 'block';
			// Вставляем текст в заголовок
			h3 = getById('date-links-group').parentNode.firstElementChild;
			h3.innerHTML = 'Подробный прогноз на 5 дней с промежутком на каждые 3 часа:';

			// ПоДаем запрос на отображение прогноза на 5 дней
			getForecastWeather(id);
		};
	}


	// Инициализация и отрисовка карты
	function initMap (coord) {
		var link = getById('showMap');

		link.onclick = function () {

			var widget = getById('widget'),
					coordinates = [coord.lat, coord.lon],
					map,
					Mymap,
					placemark,
					close;

			// Создание карты
			map = document.createElement('div');
			map.setAttribute('id', 'map');
			widget.appendChild(map);

			// Инициализируем карту и метку
			Mymap = new ymaps.Map("map", {
				center: coordinates,
				zoom: 10
			});
			placemark = new ymaps.Placemark(coordinates);

			// Метка
			Mymap.geoObjects.add(placemark);
			Mymap.controls.add('zoomControl');

			// Создание кнопки закрывающей карту
			close = document.createElement('button');
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
	function getForecastWeather (id) {

		// Создаем объект запроса
		var request = new XMLHttpRequest();

		// формируем запрос
		request.open('GET', URL + 'forecast?lang=ru&id=' + id + '&appid=' + APPID, true);

		// Инициализируем функцию калбЭк
		request.onreadystatechange = function () {

			var data,
					forecastArray;

			// Если сервер ответил производим дальнейшие действия
			if (request.readyState === 4 && request.status >= 200 && request.status < 400) {
				// Парсим полученный JSON и записываем результат в переменную
				data = JSON.parse(request.responseText);

				// Создаем массив с прогнозом
				forecastArray = createForecastArray(data);
				// Рендерим прогноз
				renderForecast(forecastArray);
			}
		};
		request.send();
	}


	// Создает и возвращает массив с прогнозом на 5 дней от текущего момента
	// может состоять из 6 неполных дней
	// $arr - получает весь массив из JSON
	function createForecastArray (arr) {

		var sumForecast = [],
			now = new Date(),
			nowDay,
			forecastDay,
			length,
			i,
			j;


		//	Прогноз на 5 ней от текущего момента каждые 3 часа,
		// значит может состоять из 6 неполных дней => j < 6
		for ( j = 0; j < 6; j += 1 ) {

			// Обнуляем массив прогноза на день на каждой итерации
			forecastDay = [];
			// Добавляем по j дней на каждой итерации цикла (с переходом на след месяц)
			//var nowDay = (now.addDays(j)).getDate();
			nowDay = (now.addDays(j)).getDate();

			// Создаем массив прогноза на день j
			for ( i = 0, length = arr.list.length; i < length; i += 1 ) {
				if ( timeConverter(arr.list[i].dt) === nowDay ) {
					forecastDay.push({
						city: arr.city,
						time: timeConverter(arr.list[i].dt, 'time'),
						day: timeConverter(arr.list[i].dt, 'day'),
						date: timeConverter(arr.list[i].dt, 'date'),
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
	}



	// Отображаем ссылки на дни недели и прогноз на ближайший день
	// @arr - принимает массив с прогнозом
	function renderForecast (arr) {

		var dateLinks = getById('date-links-group'),
				link,
				key,
				clone;

		//очищаем блок от старых ссылок
		dateLinks.innerHTML = '';

		// создаем ссылку на прогноз по дате
		link = document.createElement('button');
		link.classList.add('btn', 'btn-default');
		link.setAttribute('type', 'button');

		for (key in arr) {
			// Если свойство является свойством объекта
			if ( arr.hasOwnProperty(key) ) {
				// Клонируем созданную выше ссылку и записываем ей в атрибут ее позицию в массиве
				clone = link.cloneNode(true);
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
		}
		// Добавляем активный класс первой ссылке в списке
		dateLinks.querySelector('.btn').classList.add('active');

		// Сразу рендерим первый день ( 0 элемент массива ), т.к. он открыт по дефолту
		renderDay(arr, 0);
	}



	// Функция для отображения прогноза за конкретное число
	// @Принимает массив дней и индекс дня
	function renderDay(arr, idx) {
		// сохраняем массив с прогнозом на конкретный день
		var dayForecast = arr[idx],
				wrap = getById('forecast-list'),
				div,
				panel,
				header,
				body,
				weather,
				tempBlock,
				image,
				temp,
				cels,
				i,
				length;

		// очищаем блок перед отрисовкой
		wrap.innerHTML = '';

		// Перебираем массив и отрисовываем элементы
		for ( i = 0, length = dayForecast.length; i < length; i += 1 ) {

			// Блок обертка
			div = document.createElement('div');
			div.classList.add('flex-column');

			// Элемент карточки
			panel = document.createElement('div');
			panel.classList.add('card');

			//	Шапка карточки
			header = document.createElement('div');
			header.classList.add('card-heading');
			header.innerHTML = dayForecast[i].time;
			panel.appendChild(header);

			// Тело карточки
			body = document.createElement('div');
			body.classList.add('card-body');

			// Описание в теле карточки
			weather = document.createElement('div');
			weather.classList.add('weather');
			weather.innerHTML = dayForecast[i].weather.description;
			body.appendChild(weather);

			// Блок с температурой
			tempBlock = document.createElement('div')	;
			tempBlock.classList.add('temp');

			// Картинка
			image = new Image();
			image.setAttribute('src',ImgUrl + dayForecast[i].weather.icon + '.png');
			tempBlock.appendChild(image);

			// Вычисляем и вставляем температуру. Если больше 0 то добавляем '+'
			temp = document.createElement('span');
			cels = tempConvert(dayForecast[i].weather.temp);
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


	// Обнуление подробного прогноза
	function resetForecast() {

		var links = getById('date-links-group'),
				forecast = getById('forecast'),
				forecastList = getById('forecast-list');

		forecast.style.display = 'none';
		links.parentNode.firstElementChild.innerHTML = '';
		links.innerHTML = '';
		forecastList.innerHTML = '';
	}



	// Перевод UNIX Timestamp в дату
	// @type - строка.
	// 'date' - возвращает дату + месяц
	// 'time' - возвращает время
	// 'day' - возвращает день недели
	// Без аргумента - возвращает число
	function timeConverter (timestamp, type){

		var a = new Date(timestamp * 1000),
				days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
				months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
				month = months[a.getMonth()],
				date = a.getDate(),
				day = days[a.getDay()],
				hour = ('' + a.getHours()).length > 1 ? a.getHours() : '0' + a.getHours(),
				min = a.getMinutes().length > 1 ? a.getMinutes() : '0' + a.getMinutes();

		if (type === 'time') {
			return hour + ':' + min;
		} else if ( type === 'date' ) {
			return date + ' ' + month;
		} else if ( type === 'day' ) {
			return day;
		}	else {
			return date;
		}
	}

	// Конвертация температуры кельвинов в цельсии
	function tempConvert (val) {
		return Math.round( val - 273 );
	}

	// Конвертация мегапаскалей в мм.рт.ст.
	function pressureConvert (val) {
		return (val * 0.00750063755419211 * 100).toFixed(2);
	}

	// Направление ветра из градусов
	function windConvert (val) {
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
	}


	// Создание панели для основного виджета
	function createPanel(title, value) {

		var row,
				col1,
				col2;

		if ( value === undefined ) return;
		row = document.createElement('div');
		row.classList.add('panel', 'panel-default');

		// Первый столбец
		col1 = document.createElement('span');
		col1.className = 'title';
		col1.innerHTML = title;

		// Второй столбец
		col2 = col1.cloneNode();
		col2.className = 'value';
		col2.innerHTML = value;

		// Строка
		row.appendChild(col1);
		row.appendChild(col2);
		return row;
	}

	// Функция сортировки массива для вывода в алфавитном порядке
	function compareObject (a, b) {
		if (a.city > b.city) return 1;
		if (a.city < b.city) return -1;
		return 0;
	}

	// Получение элемента по id
	function getById (elem) {
		return document.getElementById(elem);
	}


	// Публичный интерфейс
	return {
		fadeIn: fadeIn,
		fadeOut: fadeOut,
		getWeather: getWeather,
		createAlert: createAlert,
		getCityArray: getCityArray,
		destroyElem: destroyElem,
		getById: getById,
		countCities: function() {
			return countCities;
		}
	};


}());