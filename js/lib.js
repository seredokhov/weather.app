
// Инициализация + объявление констант
function Lybrary() {
	this.Url = 'http://api.openweathermap.org/data/2.5/';
	this.ImgUrl = 'https://openweathermap.org/img/w/';
	this.Appid = 'fb7b90f94114b1c4a8c6ad811bb7e535';
	this.defaultCityName = 'Moscow,ru';
}
var Lib = new Lybrary();


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
			var image = new Image();
			var temp = Lib.tempConvert(data.main.temp);



			$(image).attr('src', Lib.ImgUrl + data.weather[0].icon + '.png');

			$('#cityName').html(data.name);	// Записываем название города в виджет
			$('#mainDate').html(Lib.timeConverter(data.dt));	// Записываем текущую дату в виджет
			$('#mainWeatherBlock').prepend(image);
			$('#mainWeatherBlock').find('span').append((temp > 0 ? '+' + temp : temp) + '&#8451;');

			console.log(data);
		}
	);
}


// В случае ошибки делаем вызываем getWeather с дефолтными параметрами

Lib.geoError = function () {
	Lib.getWeather({
		'q': this.defaultCityName,
		'appid': this.Appid
	});
}


// Перевод кельвинов в цельсии

Lib.tempConvert = function(temp) {
	return Math.round( temp - 273 );
}

