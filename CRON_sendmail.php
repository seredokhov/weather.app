<?php
// Файл, который будет запускаться по крону
require_once "/components/DataBase.php";
require_once "/models/Forecast.class.php";
session_start();

$cities_forecast_array = Forecast::createCitiesForecast();	// Прогноз на все города из таблицы user_cities на которые оформлена подписка
// Если есть подписки
if($cities_forecast_array != 0) {
	
	$users_subscribe = User::getUsersSubscribeArray(); // получаем массив подписок всех пользователей

	foreach ($users_subscribe as $user => $subscribs) {
		$currentUser = array_shift(User::getUsers('user_id', $user)); // Обращаемся к методу класса User
		$name = $currentUser['username'];
		$mail = $currentUser['email'];
		$mesageHeader = 'Здраствуйте ' . $name . '! Вы подписаны на почтовую рассылку прогноза погоды. Информация о прогнозе погоды в интересующих вас городах представлена ниже.' . "\r\n\n\n";
		$messageBody = '';

		// Проверка email регуляркой
		if(preg_match("/@/", $mail)){
			// Если емаил проходит проверку то составляем прогноз для пользователя
			foreach ($subscribs as $key => $city) {

				// Заполняем временные переменные для текущего города пользователя
				$cityname = $cities_forecast_array[$city['city_id']]['city']['name'];	// Название текущего города
				$list = $cities_forecast_array[$city['city_id']]['list'];	// Прогноз на 5 дней для текущего города
				$type = $city['forecast_type'];
				$days = $city['notification'];
				$func = $city['func'];   // Необязательное поле
				$val = $city['value'];   // Необязательное поле

				$txt = Forecast::createMessage($list, $type, $days, $func, $val);

				// Если сообщение не пустое значит условия выполнились, составляем часть письма для данного города
				if($txt != '') {
					$messageBody .= 'Город: '.$cityname . "\r\n" . $txt . "\r\n\r\n";					
				}			
			}
			// Если хотя бы для одного города был составлен прогноз, то отправляем письмо
			if($messageBody != '') {
				$fullMesage = $mesageHeader . $messageBody;
				mail($mail,"Прогноз погоды",$fullMesage, 'Content-type:text/plain; Charset=utf-8');
			}
		}	
	}
}




?>