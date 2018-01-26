
// Инициализация + объявление констант
function Lybrary() {
	this.Url = 'http://api.openweathermap.org/data/2.5/';
	this.ImgUrl = 'http://openweathermap.org/img/w/';
	this.Appid = 'fb7b90f94114b1c4a8c6ad811bb7e535';
	this.defaultCityName = 'Moscow,ru';
}
var Lib = new Lybrary();
// q=Minsk&lang=ru&appid=fb7b90f94114b1c4a8c6ad811bb7e535

// Перевод UNIX Timestamp в дату

Lib.timeConverter = 	function (timestamp){
	var a = new Date(timestamp * 1000);
	var months = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
	var month = months[a.getMonth()];
	var date = a.getDate();
	var dateString = date + ' ' + month;
	return dateString;
}


// запрос текущей погоды

Lib.getWeather =	function ( parameters ) {
	$.get(
		this.Url + 'weather',
		parameters,
		function (data) {
			// Инициализация вспомогательных переменных и объектов
			var image = new Image();
			var moreInfo = $('#moreInfo');
			var temp = Lib.tempConvert(data.main.temp);
			var pressure = Lib.pressureConvert(data.main.pressure);
			var windDirection = Lib.windConvert(data.wind.deg);
			$(image).attr('src', Lib.ImgUrl + data.weather[0].icon + '.png');


			// Заполнение основной информации на виджете
			$('#cityName').html(data.name);	// Записываем название города в виджет
			$('#mainDate').html(Lib.timeConverter(data.dt));	// Записываем текущую дату в виджет
			$('#mainWeatherBlock').prepend(image);
			$('#mainWeatherBlock').find('span').append((temp > 0 ? '+' + temp : temp) + '&#8451;');

			// Заполнение дополнительной информации на главном виджете
			moreInfo.append(createPanel('Погода', data.weather[0].description));
			moreInfo.append(createPanel('Облачность', data.clouds.all + ' %'));
			moreInfo.append(createPanel('Влажность', data.main.humidity + ' %'));
			moreInfo.append(createPanel('Давление воздуха', pressure + ' мм.рт.ст.'));
			moreInfo.append(createPanel('Направление ветра', windDirection));
			moreInfo.append(createPanel('Сила ветра', data.wind.speed + ' м/с'));

			console.log(data);
			//console.log(more);
		}
	);
}


// В случае ошибки делаем вызываем getWeather с дефолтными параметрами

Lib.geoError = function () {
	Lib.getWeather({
		'q': this.defaultCityName,
		'lang': 'ru',
		'appid': this.Appid
	});
	var message = 'Не удалось определить ваше местоположение, будет показана информация для региона по умолчанию';
	Lib.createAlert('warning', message);
}

// Конвертация температуры кельвинов в цельсии
Lib.tempConvert = function(val) {
	return Math.round( val - 273 );
}

// Конвертация мегапаскалей в мм.рт.ст.
Lib.pressureConvert = function(val) {
	return (val * 0.00750063755419211 * 100).toFixed(2);
}

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

}


// Создание панели
function createPanel(title, value) {
	if ( value === undefined ) return;
	var el = $('<div>').addClass('panel panel-default');
	el.append($('<span>').addClass('title').html(title));
	el.append($('<span>').addClass('value').html(value));
	return el[0];
}

// Создание Alert

Lib.createAlert = function (type, txt) {
	var alert = $('<div>').addClass('alert alert-' + type);
	var alertClose = $('<button>').addClass('close').attr({'type':'button','data-dismiss':'alert','aria-label':'Close'});
	alert.text(txt);
	alertClose.html('&times;');
	alert.append(alertClose);
	$('#alert').append(alert[0]);
}
