<?php
require_once 'User.class.php';


class Forecast extends User {

	// Обращается к API и выводит прогноз на город по id
	public function getForecast($id){
		$ch = curl_init('http://api.openweathermap.org/data/2.5/forecast?id=' .$id. '&lang=ru&units=metric&appid=fb7b90f94114b1c4a8c6ad811bb7e535');
		curl_setopt_array($ch, [
			CURLOPT_HTTPHEADER => ['Authorization: Basic lock', 'Accept: application/json'],
			CURLOPT_RETURNTRANSFER => true
		]);
		$result = curl_exec($ch);
		If (curl_errno($ch) == 0) {
			$data = json_decode($result, true);
			return $data;

		} else {
			$data = false;
		}
		curl_close($ch);
	}

	// Создает ассоциативный массив прогнозов на каждый город на который оформлена подписка
	public static function createCitiesForecast(){
		// Получаем массив всех городов пользователей на которые оформлены подписки
		$cities = User::getSubscribedCitiesID();	

		if(count($cities) != 0) {	// Если подписки существуют
			$cities_forecast = [];
			foreach ($cities as $key => $value) {
				$forecast = self::getForecast($value['city_id']);
				$cities_forecast[$value['city_id']] = $forecast;
			}
			return $cities_forecast;  
		}
	}


	// Функция обходит массив прогнозов и составляет персональные сообщения для пользователей по их подпискам
	// Значения $func и $value могут быть пустыми, если сдедим только за дождем
	// Функция обходит массив прогнозов и составляет персональные сообщения для пользователей по их подпискам
	// Значения $func и $value могут быть пустыми, если сдедим только за дождем
	public static function createMessage($list, $type, $day, $func=null, $value=null) {
		$i = $day * 8;			// Оповещать за $day деней (1 день = 8 прогнозов в массиве)
		$end = $i + 8;	// Прогноз на 1 день
		$message = '';
		
		// Если следим только за темперетурой
		if( $type === 'temp' ) {	
			for($i; $i < $end; $i++) {
				if($func === 'gt') {
					// Если gt - выбираем значения больше заданного
					if($list[$i]['main']['temp'] > $value) {
						$message .= 'Дата: ' .$list[$i]['dt_txt']. ' | ' .$list[$i]['weather'][0]['description']. '. Температура: ' .$list[$i]['main']['temp']. 'C'. "\r\n";					
					}
				} elseif($func === 'lt') {
					// Если lt - выбираем значения меньше заданного
					if($list[$i]['main']['temp'] < $value) {
						$message .= 'Дата: ' .$list[$i]['dt_txt']. ' | ' .$list[$i]['weather'][0]['description']. '. Температура: ' .$list[$i]['main']['temp']. 'C'. "\r\n";
					}
				}
			}
		}
		// Если следим только за дождем
		elseif ($type === 'rain') {
			for($i; $i < $end; $i++) {
				if($list[$i]['weather'][0]['main']  === 'Rain') {
					$message .= 'Дата: ' .$list[$i]['dt_txt']. ' | ' .$list[$i]['weather'][0]['description']. '. Температура: ' .$list[$i]['main']['temp']. 'C'. "\r\n";
				}
			}
		}
		// Если следим за дождем и температурой одновременно
		elseif ($type === 'temp&rain') {
			for($i; $i < $end; $i++) {
				if($func === 'gt') {
					// Если gt - выбираем значения больше заданного
					if($list[$i]['main']['temp'] > $value && $list[$i]['weather'][0]['main']  === 'Rain') {
						$message .= 'Дата: ' .$list[$i]['dt_txt']. ' | ' .$list[$i]['weather'][0]['description']. '. Температура: ' .$list[$i]['main']['temp']. 'C'. "\r\n";					
					}
				} elseif($func === 'lt') {
					// Если lt - выбираем значения меньше заданного
					if($list[$i]['main']['temp'] < $value && $list[$i]['weather'][0]['main']  === 'Rain') {
						$message .= 'Дата: ' .$list[$i]['dt_txt']. ' | ' .$list[$i]['weather'][0]['description']. '. Температура: ' .$list[$i]['main']['temp']. 'C'. "\r\n";
					}
				}
			}
		}
		return $message;	// Возвращаем составленное сообщение, либо пустую строку
	}
	
}



?>