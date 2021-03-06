<!doctype html>
<html lang="ru">
<head>
	<title>Weather</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<link rel="stylesheet" href="../public/css/font-awesome.min.css">
	<link rel="stylesheet" href="../public/css/style.css">
</head>
<body>	
	<div class="wrapper">
		<header>
			<div class="container">
				<div class="logo"><i class="fa fa-snowflake-o"></i>Погода</div>
				<ul class="links_ul">
					<li><a href="/cities"><span id="count" class="empty"></span>Закладки</a></li>
				</ul>
				<div class="welcome">
					<a href="/logout"><i class="fa fa-sign-out"></i>Выйти</a>
					<span><i class="fa fa-user"></i><?php echo $_SESSION['user']['username']; ?></span>				
				</div>
			</div>
		</header>
		<h1 class="current-title">Прогноз погоды на текущее время</h1>
		<section class="flex-row" id="main-content">
			<div class="current-weather">
				<div class="widget-card" id="widget">
					<div class="overlay" id="load"><i class="fa fa-circle-o-notch fa-spin"></i></div>
					<div class="main-panel">
						<h1 id="cityName"></h1>
						<div id="mainDate"></div>
						<div id="mainWeatherBlock"></div>
						<a href="#" id="city_add" class="fa fa-database">
							<i class="fa fa-plus" aria-hidden="true"></i>
						</a>
					</div>
					<div class="panel-block" id="moreInfo"></div>

					<div>
						<button class="button" type="button" id="getMore"><i class="fa fa-calendar"></i> Подробный прогноз</button>
						<a href="#" id="showMap"><i class="fa fa-globe"></i> Показать на карте?</a>
					</div>
				</div>
			</div>
			<div class="controls-block">
				<form method="POST" class="change-countries-block">
					<select id="countries">
						<option disabled selected>Выберите страну</option>
						<option value="AU">Австралия</option>
						<option value="AT">Австрия</option>
						<option value="AZ">Азербайджан</option>
						<option value="AX">Аландские острова</option>
						<option value="AL">Албания</option>
						<option value="DZ">Алжир</option>
						<option value="AS">Американское Самоа</option>
						<option value="AO">Ангола</option>
						<option value="AD">Андорра</option>
						<option value="AQ">Антарктида</option>
						<option value="AR">Аргентина</option>
						<option value="AM">Армения</option>
						<option value="AF">Афганистан</option>
						<option value="BS">Багамы</option>
						<option value="BD">Бангладеш</option>
						<option value="BY">Беларусь</option>
						<option value="BE">Бельгия</option>
						<option value="BG">Болгария</option>
						<option value="BA">Босния и Герцеговина</option>
						<option value="BR">Бразилия</option>
						<option value="GB">Великобритания</option>
						<option value="HU">Венгрия</option>
						<option value="VE">Венесуэла</option>
						<option value="VN">Вьетнам</option>
						<option value="HT">Гаити</option>
						<option value="GP">Гваделупа</option>
						<option value="GT">Гватемала</option>
						<option value="GN">Гвинея</option>
						<option value="DE">Германия</option>
						<option value="GI">Гибралтар</option>
						<option value="HN">Гондурас</option>
						<option value="GL">Гренландия</option>
						<option value="GR">Греция</option>
						<option value="GE">Грузия</option>
						<option value="DK">Дания</option>
						<option value="DO">Доминиканская Республика</option>
						<option value="EG">Египет</option>
						<option value="IL">Израиль</option>
						<option value="IN">Индия</option>
						<option value="ID">Индонезия</option>
						<option value="JO">Иордания</option>
						<option value="IQ">Ирак</option>
						<option value="IR">Иран</option>
						<option value="IE">Ирландия</option>
						<option value="IS">Исландия</option>
						<option value="ES">Испания</option>
						<option value="IT">Италия</option>
						<option value="KZ">Казахстан</option>
						<option value="KH">Камбоджа</option>
						<option value="CA">Канада</option>
						<option value="KE">Кения</option>
						<option value="CY">Кипр</option>
						<option value="KG">Киргизия</option>
						<option value="KI">Кирибати</option>
						<option value="CN">КНР</option>
						<option value="CC">Кокосовые острова</option>
						<option value="CO">Колумбия</option>
						<option value="CR">Коста-Рика</option>
						<option value="CU">Куба</option>
						<option value="KW">Кувейт</option>
						<option value="LV">Латвия</option>
						<option value="LY">Ливия</option>
						<option value="LT">Литва</option>
						<option value="LU">Люксембург</option>
						<option value="MK">Македония</option>
						<option value="MY">Малайзия</option>
						<option value="MV">Мальдивы</option>
						<option value="MT">Мальта</option>
						<option value="MX">Мексика</option>
						<option value="NL">Нидерланды</option>
						<option value="NZ">Новая Зеландия</option>
						<option value="NO">Норвегия</option>
						<option value="PK">Пакистан</option>
						<option value="PE">Перу</option>
						<option value="PL">Польша</option>
						<option value="PT">Португалия</option>
						<option value="PR">Пуэрто-Рико</option>
						<option value="CG">Республика Конго</option>
						<option value="RU">Россия</option>
						<option value="RO">Румыния</option>
						<option value="SA">Саудовская Аравия</option>
						<option value="RS">Сербия</option>
						<option value="SG">Сингапур</option>
						<option value="SY">Сирия</option>
						<option value="SK">Словакия</option>
						<option value="SI">Словения</option>
						<option value="US">США</option>
						<option value="TH">Таиланд</option>
						<option value="TN">Тунис</option>
						<option value="TR">Турция</option>
						<option value="UZ">Узбекистан</option>
						<option value="UA">Украина</option>
						<option value="UY">Уругвай</option>
						<option value="PH">Филиппины</option>
						<option value="FI">Финляндия</option>
						<option value="FR">Франция</option>
						<option value="HR">Хорватия</option>
						<option value="ME">Черногория</option>
						<option value="CZ">Чехия</option>
						<option value="CL">Чили</option>
						<option value="CH">Швейцария</option>
						<option value="SE">Швеция</option>
						<option value="LK">Шри-Ланка</option>
						<option value="EE">Эстония</option>
						<option value="ET">Эфиопия</option>
						<option value="JM">Ямайка</option>
						<option value="JP">Япония</option>
					</select>
					<button type="button" id="country-btn" class="button" disabled><i class="fa fa-search"></i> Показать города</button>
				</form>
				<div id="searchCity"></div>
				<div class="cities-list" id="cities">
					<div id="load-alert" class="alert-info"><i class="fa fa-globe"></i>Выберите страну из списка</div>
				</div>

			</div>
		</section>

		<section class="forecast" id="forecast">
			<h2></h2>
			<div id="date-links-group" class="date-buttons"></div>
			<div id="forecast-list"></div>
		</section>

		<footer>
			<div class="container-fluid"></div>
		</footer>
		<div id="alerts"></div>
	</div>
	
		<script src="http://api-maps.yandex.ru/2.0-stable/?load=package.standard&lang=ru_RU" type="text/javascript"></script>
		<script src="../public/js/lib.js"></script>
		<script src="../public/js/main.js"></script>
</body>
</html>