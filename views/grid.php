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
				<a class="logo" href="/"><i class="fa fa-snowflake-o"></i>Погода</a>
				<ul class="links_ul">
					<li><span><span id="count" class="empty"></span>Закладки</span></li>
				</ul>
				<div class="welcome">
					<a href="/logout"><i class="fa fa-sign-out"></i>Выйти</a>
					<span><i class="fa fa-user"></i><?php echo $_SESSION['user']['username']; ?></span>				
				</div>
			</div>
		</header>
		<div class="cities_grid_block">
			<div class="row" id="grid"></div>
		</div>
		<footer>
			<div class="container-fluid"></div>
		</footer>
		<div id="alerts"></div>
		

		<!-- Модальное окно -->
		<div id="modal">
			<form action="" method="POST">
				<label class="checkbox_block">
					<input type="checkbox" class="checkbox" name="rain">
					<span class="custom_check"></span>
					<span class="check_text">Оповещать о приближении дождя</span>
				</label>
				<label class="checkbox_block">
					<input type="checkbox" class="checkbox" name="temp">
					<span class="custom_check"></span>
					<span class="check_text">Оповещать об изменении температуры</span>
				</label>
				<div id="temp_controlls">
					<div class="temp_radio_block">
						<label class="checkbox_block">
							<input type="radio" class="checkbox" value="gt" name="function" checked>
							<span class="custom_check"></span>
							<span class="check_text">Выше</span>
						</label>
						<label class="checkbox_block">
							<input type="radio" class="checkbox" value="lt" name="function">
							<span class="custom_check"></span>
							<span class="check_text">Ниже</span>
						</label>
					</div>
					<div class="temp_input_block">
						<input type="text" class="temp_input" value="15" name="value">
						<span>&#8451;</span>
					</div>
				</div>

				<span class="label">Уведомлять за</span>
				<div id="counter">
					<button type="button" class="prev fa fa-chevron-left"></button>
					<input type="text" id="temp_input" name="notification" value="1">
					<button type="button" class="next fa fa-chevron-right"></button>
				</div>

				<button type="button" class="send" id="subscribe_btn" name="city_id" disabled>Подписаться</button>
			</form>
		</div>
		<div id="modal_overlay"></div>

	</div>
		<script src="../public/js/lib.js"></script>
		<script src="../public/js/cities.js"></script>
</body>
</html>