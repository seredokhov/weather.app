<!DOCTYPE html>
<html lang="ru">
<head>
	<title>Weather</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<link rel="stylesheet" href="../public/css/font-awesome.min.css" type="text/css">
	<link rel="stylesheet" href="../public/css/style.css" type="text/css">
</head>
<body class='reg'>
	<header>
		<div class="container">
			<span class="logo"><i class="fa fa-snowflake-o"></i>Погода</span>
		</div>
	</header>
	<div class="form_block">
		<h1>Авторизация</h1>
		<?php echo $_SESSION['error'];unset($_SESSION['error']);?>
		<form method="post" id='reg_form'>
			<div>
				<div class="error_text"></div>
				<input class="reg_input" type="text" name="login" placeholder="Логин" value="<?php echo @$_SESSION['authinput']['login']?>">
			</div>
			<div>
				<div class="error_text"></div>
				<input class="reg_input" type="password" name="password" placeholder="Пароль">
			</div>
			
			
			<button class="reg_submit" type="submit" name="do_login" disabled="disabled"><i class="fa fa-sign-in"></i>Войти</button>
			<div class="links">
				<a href="/register" class="registration_link ">Зарегестрироваться</a>
			</div>
		</form>
	</div>
	<script src="../public/js/lib.js"></script>
	<script src="../public/js/validation.js"></script>	
</body>
</html>