// Модуль для сокрытия приватных данных и методов
var  Lib = (function(){


	// Приватные свойства
	var APPID = 'fb7b90f94114b1c4a8c6ad811bb7e535',
		URL = 'http://api.openweathermap.org/data/2.5/',
		ImgUrl = 'http://openweathermap.org/img/w/',
		btn, // елемент кнопки
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

		// Создаем прелоадер на виджете если его нет
		if(!document.querySelector('.overlay')) {
			addSpin(getById('widget'));
		}

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

			// проверяем готовность данных
			if (request.readyState === 4) {
				// проверяем ответ сервера
				if(request.status >= 200 && request.status < 400) {
					// парсим JSON строку
					data = JSON.parse(request.responseText);
					// Рендерим виджет
					renderCurrentWeather(data);
					// Активируем кнопки подробного прогноза и сохранения города
					showMore(data.id);
					saveCity(data.id);

					// Удаляем ранее отрисованную карту если она существует
					if (getById('map')) {
						getById('map').remove();
					}
					// Вешаем событие для создание новой карты
					initMap(data.coord);
				} else {
					document.querySelector('.overlay').innerHTML = '<div class="fa fa-ban"><span>Ошибка подключения...</span></div>'
				}
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
				alertClose,
				time;

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
			// Через 4 секунды удаляем алерт
			time = setTimeout( function() {
				fadeOut(alert, 1000, function() {
					destroyElem(alert);
				});
			}, 3000 );
			alert.addEventListener('click', function() {
				clearTimeout(time);
				this.style.display = 'none';
				destroyElem(this);
			});
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
				elem.style.opacity = 0;
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


	// Выбор городов из базы данных по идентификатору страны
	// @countryID - обозначение страны
	// @elem - елемент кнопки для замыкания
	function selectCityFromDataBase(countryID, elem){
		var request = new XMLHttpRequest(),
			  data,
			  param;

		// Переменная из замыкания
		btn = elem;
		param = '&country=' + countryID;
		request.onreadystatechange = function() {

			if( request.readyState === 4 ) {
				data = JSON.parse(request.responseText);
				// Передаем объекты в функцию для получения списка городов
				createCityArray(data);
			}
		};
		request.open('GET', '/cities/country/' + countryID);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send();
	}

	function animateCitiesCount() {
		var count = getById('count');
		count.classList.add('animate');
		setTimeout(function(){
			count.classList.remove('animate');
		},500)
	}
	// Добавление города в базу
	// @id - идентификатор города
	function insertCityIntoDataBase(id) {

		var request = new XMLHttpRequest(),
				elem = getById('alerts'),
				param = '&id=' + id,
				data,
				message,
				link;

		request.onreadystatechange = function() {
			if( request.readyState === 4 ) {
				// Выводим уведомление в зависимости от ответа (если вернул 2, значит запись добавлена)
				data = parseInt(request.responseText);
				if(data === 2) {
					message = 'Запись успешно добавлена в базу';					
					createAlert('sucsess', message, elem, true);
					showCitiesCount();
					animateCitiesCount();
					disableSaveLink();
				} else if (data === 1) {
					message = 'Город уже добавлен';
					createAlert('danger', message, elem, true);
				} else if (data === 0) {
					message = 'Превышено допустимое количество (не более 20 городов на пользователя)';
					createAlert('danger', message, elem, true);
				} else {
					message = 'Что-то пошло не так...';
					createAlert('danger', message, elem, true);
				}
			}
		};

		request.open('POST','/cities/insert');
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(param);
	}



	// Запрос на удаление города из списка городов пользователя
	// @elem - принимает элемент карточки города, которую необходимо удалить
	function deleteCityFromDataBase(e) {
		var elem = e.target,
			message = '<i class="fa fa-exclamation-triangle"></i> Вы не добавили ни одного города',
			param = '&id=' + elem.dataset.id,
			request,
			column;

		// Проверка наличия ID
		// Если есть ID значит функция запускается с главной страницы
		if (!elem.hasAttribute('id')) {
			column = elem.parentNode.parentNode.parentNode;
		}

		request = new XMLHttpRequest();

		request.onreadystatechange = function() {
			if(request.readyState === 4) {
				//console.log(request.responseText);
				if(request.responseText === '1') {
					if (!elem.hasAttribute('id')) {
						fadeOut(column, 1000, function(){
							destroyElem(column);
							createAlert('sucsess', 'Запись успешно удалена', getById('alerts'), true);
						});
					} else {
						enableSaveLink();
						createAlert('sucsess', 'Запись успешно удалена', getById('alerts'), true);
					}					
					showCitiesCount();
					animateCitiesCount();
				} else if(request.responseText === '0') {
					if (!elem.hasAttribute('id')) {
						fadeOut(column, 1000, function(){
							destroyElem(column);
							createAlert('sucsess', 'Запись успешно удалена', getById('alerts'), true);
							createAlert('warning', message, getById('grid'));
						});
					} else {
						enableSaveLink();
						createAlert('sucsess', 'Запись успешно удалена', getById('alerts'), true);
					}
					showCitiesCount();
					animateCitiesCount();
				} else {
					createAlert('danger', 'Ошибка. Запись не найдена в базе', getById('alerts'), true);
				}
			}
		};
		request.open('DELETE','/cities/delete/' + elem.dataset.id);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send();
	}

	// Получение количества городов в закладках пользователя
	function showCitiesCount() {
		var request = new XMLHttpRequest(),
			data;

		request.onreadystatechange = function() {
			if(request.readyState === 4) {
				count = request.responseText;				
				iconRefresh(count);
			}
		};
		request.open('GET','/cities/count');
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send();
	}



	// Проверка наличия города в закладках пользователя и изменение состояния ссылки на добавление
	function checUserCity(id){
		var request = new XMLHttpRequest();
		var param = '&id=' + id;

		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status >= 200 && request.status < 400) {
				
				// Если город добавлен пользователем в закладки изменяем ссылку
				if(request.responseText === '1') {
					disableSaveLink();
				} else {
					enableSaveLink();
				}
			}
		};
		request.open('POST','cities/check');
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(param);
	}


	// Получает массив городов пользователя из PHP
	// Вызывается без параметров при переходе на нужную страницу
	function getCityArray(){
		var request = new XMLHttpRequest(),
			data;

		request.onreadystatechange = function() {
			if(request.readyState === 4) {
				if(request.responseText){
					data = JSON.parse(request.responseText);
					renderEmptyCards(data);
				} else {
					var message = '<i class="fa fa-exclamation-triangle"></i> Вы не добавили ни одного города';
					createAlert('warning', message, getById('grid'));
				}
			}
		};
		request.open('GET', '/cities/user');
		request.send();
	}


	// Подписка на email рассылку
	// @id - принимает идентификатор города
	// @otherParams - необязательная строка дополнительных параметров (если ожидается новая подписка)
	// @elem - необязательный елемент кнопки "подписаться", который нужно пометить активным при успешной подписке
	//id, otherParams, elem
	function emailSubscribe(params) {
		var request = new XMLHttpRequest(),
				data,
				param = '&city_id='+params.id;

		// Если переданы дополнительные параметры для запроса, добавляем их к строку параметров
		if(params.otherParams) {
				param += params.otherParams;
		}

		request.onreadystatechange = function() {
			if(request.readyState === 4) {
				data = parseInt(request.responseText);
				// Если запрос прошел помечаем кнопку в зависимости от действия (подписка/отписка)
				// Если переданы доп параметры запроса, значит совершена подписка, если нет - отписка
				if(params.otherParams){
					params.elem.className = 'subscribed';
					params.elem.innerHTML = '<i class="fa fa-envelope-open"></i> Отписаться';
					fadeOut(getById('modal'),1000);
					fadeOut(getById('modal_overlay'), 1000);
				} else {
					params.elem.className = 'subscribe';
					params.elem.innerHTML = '<i class="fa fa-envelope"></i> Подписаться';
				}

				// Выводим сообщении о завершении действия
				if(data === 1) {
					createAlert('sucsess', 'Подписка добавлена', getById('alerts'), true);
				} else if (data === 0) {
					createAlert('danger', 'Подписка отменена', getById('alerts'), true);
				} else {
					createAlert('danger', 'Что-то пошло не так', getById('alerts'), true);
				}
			}
		};
		request.open('PUT','/cities/subscribe');
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.send(param);
	}




	// Отрисовка пустых карточек городов пользователя
	// @array - получает массив id городов
	function renderEmptyCards(array) {
		var count = array.length,
			grid = getById('grid'),
			col,
			card,
			load,
			loadInner;

		for(count; count > 0; count--) {

			col = document.createElement('div');
			col.classList.add('col');

			card = document.createElement('div');
			card.classList.add('city_card');
			card.setAttribute('id',count);

			load = document.createElement('div');
			load.classList.add('overlay');

			loadInner = document.createElement('i');
			loadInner.classList.add('fa', 'fa-circle-o-notch', 'fa-spin');

			load.appendChild(loadInner);
			card.appendChild(load);
			col.appendChild(card);
			grid.appendChild(col);
		}
		// Получаем прогноз погоды для выбранных городов
		getGroupForecast(array);
	}


	// Получение группового прогноза погоды для массива городов
	// @array - принимает массив идентификаторов городов
	function getGroupForecast(array) {

		var string = '',
			len = array.length,
			i,
			data,
			request;

		// Вормируем строку из id городов через запятую
		for(i=0; i<len; i++){
			string += ',' + array[i].city_id;
		}

		string = string.substr(1);

		// Отправляем запрос
		request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if(request.readyState === 4) {
				if(request.responseText){
					data = JSON.parse(request.responseText);

					// Добавляем собственное свойство в каждый объект прогноза
					// для будущего определения подписки на рассылку
					for(var i = 0; i < data.list.length; i++) {
						data.list[i].subscribe = array[i].subscribe + '';
					}
					// Передаем объект для рендера
					eachCards(data);
				}
			}
		};
		request.open('GET', URL + 'group?id=' +  string + '&lang=ru&appid=' + APPID , true);
		request.send();
	}


	// Перебор городов в цикле и вызов для каждого функции отрисовки
	// @forecast - принимает объект прогноза для всех городов пользователя
	function eachCards(forecast) {
		var i = forecast.cnt,
				arr = forecast.list;
		for(i; i > 0; i--) {
			fillingCard(arr[i-1], i);
		}

	}

	// Заполняет пустую карточку прогноза
	// @arr - принимает объект с прогнозом на данный город
	// @num - принимает номер города в массиве
	function fillingCard(arr, num) {
		var card = getById(num + ''),
				overlay = card.querySelector('.overlay'),
			  h2,
		    image = new Image(),
			  tempBlock,
			  temp = tempConvert(arr.main.temp),
				fade,
		    panelBlock,
				row,
			  weather,
				subscribe,
				del;

		// Название города
		h2 = document.createElement('h2');
		h2.innerHTML = arr.name + ' (' + arr.sys.country + ')';

		// Картинка
		image.setAttribute('src',ImgUrl + arr.weather[0].icon + '.png' );

		// Температура
		tempBlock = document.createElement('span');
		tempBlock.classList.add('card_temp');
		tempBlock.innerHTML = (temp > 0 ? '+' + temp : temp) + '&#8451;';

		// Картинка + температура
		weather = document.createElement('div');
		weather.classList.add('card_weather');
		weather.appendChild(image);
		weather.appendChild(tempBlock);

		// Первая строка
		row = document.createElement('div');
		row.classList.add('card_title');
		row.appendChild(h2);
		row.appendChild(weather);
		card.appendChild(row);

		// Панели
		panelBlock = document.createElement('div');
		panelBlock.classList.add('card_panels');
		panelBlock.appendChild(createPanel('Погода', arr.weather[0].description));
		panelBlock.appendChild(createPanel('Облачность', arr.clouds.all + ' %'));
		panelBlock.appendChild(createPanel('Влажность', arr.main.humidity + ' %'));
		panelBlock.appendChild(createPanel('Давление воздуха', pressureConvert(arr.main.pressure) + ' мм.рт.ст.'));
		card.appendChild(panelBlock);

		// Кнопка удалить
		del = document.createElement('a');
		del.setAttribute('href', '#');
		del.dataset.id = arr.id;
		del.classList.add('delete');
		del.innerHTML = '<i class="fa fa-trash"></i> Удалить';
		del.onclick = function(e) {
			var evt = e || window.event;
			deleteCityFromDataBase(evt);
			return false;
		};

		// Кнопка подписаться
		subscribe = document.createElement('a');
		subscribe.setAttribute('href', '#');
		subscribe.dataset.id = arr.id;
		subscribe.classList.add('subscribe');

		if(arr.subscribe === '1'){
			subscribe.className = 'subscribed';
			subscribe.innerHTML = '<i class="fa fa-envelope-open"></i> Отписаться';
		} else if(arr.subscribe === '0') {
			subscribe.className = 'subscribe';
			subscribe.innerHTML = '<i class="fa fa-envelope"></i> Подписаться';
		}

		subscribe.onclick = function() {
			if(this.className === 'subscribe') {
				// если еще не подписан вызываем окно
				initModal(arr.id, this);

			} else {
				emailSubscribe({
					id: arr.id,
					elem: this
				});
			}

			return false;
		};

		// Затемнение
		fade = document.createElement('div');
		fade.classList.add('fade');
		fade.appendChild(subscribe);
		fade.appendChild(del);
		card.appendChild(fade);

		fadeOut(overlay, 1000, function() {
			destroyElem(overlay);
		});
	}



	// Вызов модального окна подписка
	function initModal(cityId, elem){
		var modal = getById('modal'),
				overlay = getById('modal_overlay');


		// Показываем окно с затемнением фона
		fadeIn(modal, 1000);
		fadeIn(overlay, 1000);

		// По клику на затемненный фон закрываем
		overlay.onclick = function(){
			fadeOut(this, 1000);
			fadeOut(modal,1000);
		};

		bindControls(cityId, elem);
		resetCounter();
	}


	// Вешаем события на элементы модального окна, сбрасываем их значения по умолчанию
	// @cityId - принимает идентификатор города на который нужно подписаться
	// @elem - принимает элемент ссылки, который необходимо стилизовать при успешной подлписке
	function bindControls(cityId, elem) {
		var checkTemp = document.querySelector('input[name=temp]'),
			checkRain = document.querySelector('input[name=rain]'),
			radio = document.getElementsByName('function'),
			valueTemp = document.querySelector('input[name=value]'),
			notification = document.querySelector('input[name=notification]'),
			tempControls = getById('temp_controlls'),
			button = getById('subscribe_btn'),
			paramString = '';

		// Ставим значения по умолчанию
		button.value = cityId;
		checkTemp.checked = false;
		checkRain.checked = false;
		valueTemp.value = 15;
		//notification.value = 1;
		radio[0].checked = true;
		tempControls.style.display = 'none';

		button.onclick = function() {
			// выбираем значение заполненных полей
			// Склеиваем их в строку и отправляем как строку параметров
			if(checkRain.checked) {
				paramString += '&rain=' + checkRain.value;
			}
			if(checkTemp.checked){
				paramString += '&temp=' + checkTemp.value;
				paramString += '&function=' + getRadioVal('function');
				paramString += '&value=' + valueTemp.value;
			}
			paramString += '&notification=' + parseInt(notification.value);

			// передаем елемент ссыдки elem для его изменения при успешной подписке
			// и параметры для AJAX запроса
			emailSubscribe({
				id: cityId,
				otherParams: paramString,
				elem: elem
			});
		};


		checkRain.onchange = check;
		checkTemp.onchange = function() {
			if(this.checked) {
				fadeIn(tempControls, 500);
			} else {
				fadeOut(tempControls, 500);
			}
			check();
		};

		// Проверка чекбоксов
		function check() {
			if(checkTemp.checked || checkRain.checked) {
				button.removeAttribute('disabled');
			} else {
				button.setAttribute('disabled', 'disabled');
			}
		}

	}

	// Сбрасывает форму по умолчанию
	function resetCounter(){
		var counter = getById('counter'),
			prev = counter.querySelector('.prev'),
			next = counter.querySelector('.next'),
			input = getById('temp_input');

		input.value = '1 день'; // по умолчанию
		prev.setAttribute('disabled', 'disabled');
		next.removeAttribute('disabled');
	}



	// Создает массив городов страны, полученной из базы данных
	// @data - принимаем объект из базы данных
	function createCityArray(data) {
		var arr = [],
				index = getById('countries').options.selectedIndex,
				options = getById('countries').querySelectorAll('option'),
				selectVal = options[index].value,
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

		// Создаем поиск
		searchCreate(arr);
		// Рендерим города
		citiesEach(arr);
	}


	// Создание поиска + отображение количества найденных городов
	function searchCreate(arr) {

		var search = getById('searchCity'),
				searchInput;

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
	}


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
		citiesEach(searchArr);
	}



	// Подготовка списка городов
	// @arr - принимаем массив городов
	function citiesEach (arr) {
		var citiesList = getById('cities'),
				out = "",	// обязательная инициализация
				i,	// Замыкаем i
				length = arr.length;

		// Формирование и отображение первой сотни элементов
		for(i = 0; i < 100 &&  i < length; i += 1) {
			// записываем HTML в виде строки
			out = out + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';
		}

		//	Подгрузка городов при скроле
		citiesList.onscroll = function() {
			var localOut = "",	// Переменная для хранения дополнительных элементов и их последующей подгрузке в конец списка (обязательная инициалитзация)
					offsetBottom = 50, // Отступ от низа блока при скроле за который добавляются элементы
					length = arr.length,
					j;

			if ( this.scrollTop >= this.scrollHeight-this.clientHeight - offsetBottom ) {
				j = i + 100;	// При прокручивании до точки добавляем по 100 элементов

				// записываем в localOut следеющую сотню элементов
				for( ; i < j &&  i < length; i += 1) {
					localOut = localOut + '<a href="#" data-id="' + arr[i].id + '" class="list-group-item"><i class="fa fa-info"></i> ' + arr[i].city + '</a>';
				}
				// Добавляем элементы в конец списка
				citiesList.innerHTML += localOut;

				// Вешаем на них событие клик (см. функцию)
				bindGetWeatherOnClick(citiesList);
			}
		};
		// Рендерим первую сотню городов
		citiesRender(citiesList, out);
	}


	// Рендер списка городов
	// @parent - блок списка городов
	// @output - элементы списка в виде строки
	function citiesRender(parent, output) {

		var searchInputBlock = getById('searchCity');
		// Очищаем блок	для городов от статических элементов
		parent.innerHTML = '';
		parent.classList.add('list-group');
		// Выгружаем полученные элементы в список (если ничего не найдено показываем сообщение)
		if ( output.length > 0 ) {
			parent.innerHTML = output;
			searchInputBlock.classList.remove('error');
		} else {
			output = '<i class="fa fa-exclamation"></i> Ничего не найдено.';
			parent.innerHTML = '';
			createAlert('danger', output, parent);
			searchInputBlock.classList.add('error');
		}
		// Вешаем на них событие клик (см. функцию)
		bindGetWeatherOnClick(parent);
	}


	// Вешаем событие вызова погоды при клике на элементы из списка городов
	// @cities - принимает елемент со списком городов
	function bindGetWeatherOnClick (citiesList) {

		var links = citiesList.querySelectorAll('a');

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

				// записываем значение атрибута в переменную
				data = this.dataset.id;
				this.classList.add('active');

				// у всех кроме нажатой ссылки удаляем клас active
				elems = this.parentNode.querySelectorAll('.active');
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
	// @data - принимает объект полученный из API
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


		// Удаление прелоадера
		(function(){
			var load = getById('load');
			if(load) {
				fadeOut(load, 500, function(){
					destroyElem(load);
				})
			}
		})();
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

			//fadeIn(forecast, 1000);

			// Вставляем текст в заголовок
			h3 = getById('date-links-group').parentNode.firstElementChild;
			h3.innerHTML = 'Подробный прогноз на 5 дней с промежутком на каждые 3 часа:';

			// ПоДаем запрос на отображение прогноза на 5 дней
			getForecastWeather(id);
		};
	}

	// Активация ссылки на добавление города в базу
	// @id - идентификатор города
	function saveCity(id){
		var link = getById('city_add');		
		link.dataset.id = id;
		checUserCity(id);
	}


	// Изменение ссылки сохранения города в базе
	function disableSaveLink() {
		var link = getById('city_add');

		link.classList.remove('fa-database');
		link.classList.add('fa-check');
		link.onclick = function(e) {
			var evt = e || windiw.event;
			deleteCityFromDataBase(evt);
			return false;
		}
	}
	function enableSaveLink() {
		var link = getById('city_add'),
			id  = link.dataset.id;

		link.classList.remove('fa-check');
		link.classList.add('fa-database');
		link.onclick = function () {
			insertCityIntoDataBase(id);
			return false;
		}		
	}

	// Индикатор количества закладок
	function iconRefresh(count) {
		var icon = getById('count');		
		if(count) {
			icon.classList.remove('empty');
			icon.innerHTML = count;
		} else {
			
			icon.classList.add('empty');
			icon.innerHTML = '0';
		}
		icon.style.visibility = 'visible';
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
		var weekForecast = [],
			now = new Date(),
			nowDay,
			dayForecast,
			length,
			i,
			j;


		//	Прогноз на 5 ней от текущего момента каждые 3 часа,
		// значит может состоять из 6 неполных дней => j < 6
		for ( j = 0; j < 6; j += 1 ) {

			// Обнуляем массив прогноза на день на каждой итерации
			dayForecast = [];
			// Добавляем по j дней на каждой итерации цикла (с переходом на след месяц)
			//var nowDay = (now.addDays(j)).getDate();
			nowDay = (now.addDays(j)).getDate();

			// Создаем массив прогноза на день j
			for ( i = 0, length = arr.list.length; i < length; i += 1 ) {
				if ( timeConverter(arr.list[i].dt) === nowDay ) {
					dayForecast.push({
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
			if ( dayForecast.length > 0 ) {
				weekForecast.push(dayForecast);
			}
		}
		// Возвращаем преобразованный массив
		return weekForecast;
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

		// Отображаем блок с прогнозом
		fadeIn(getById('forecast'), 1000);
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
			//fadeIn(div, 1000);
		}
		// Плавное появление прогноза
		fadeInDay(wrap);
	}

	// Анимация плавного появления прогноза
	// @wrap - родительский элемент карточек с прогнозом
	function fadeInDay(parent){
		var card = parent.querySelectorAll('.flex-column'),
			length = card.length,
			i = 0;

		var interval = setInterval(function(){
			if(i <= length - 1) {
				fadeIn(card[i], 1000);
				i++;
			} else {
				clearInterval(interval);
			}
		},50);
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

	// Получение выбранного значения радиокнопки
	// Принимает значение NAME поля радиокнопок
	// возвращает value нажатой или ничего, если значений нет
	function getRadioVal(name) {
		var radio = document.getElementsByName(name);
		for (var i = 0; i < radio.length; i++) {
			if (radio[i].checked) {
				return radio[i].value;
			}
		}
		return false;
	}

	// Создание прелоадера для погоды
	function addSpin(elem) {
		var overlay = document.createElement('div'),
			spin = document.createElement('i');

		overlay.classList.add('overlay');
		overlay.setAttribute('id','load');
		spin.classList.add('fa', 'fa-circle-o-notch', 'fa-spin');
		overlay.appendChild(spin);
		elem.appendChild(overlay);
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
		getRadioVal: getRadioVal,
		fadeIn: fadeIn,
		fadeOut: fadeOut,
		getWeather: getWeather,
		getCityArray: getCityArray,
		showCitiesCount: showCitiesCount,
		createAlert: createAlert,
		destroyElem: destroyElem,
		getById: getById,
		selectCityFromDataBase: selectCityFromDataBase,
		countCities: function() {
			return countCities;
		}
	};


}());