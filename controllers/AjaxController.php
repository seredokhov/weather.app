<?php
require_once ROOT . "/models/Ajax.class.php";

class AjaxController {

	// Проверка города в закладках у пользователя
	public function actionCheckCity() {
		$city_id = $_POST['id'];
		$user_id = $_SESSION['user']['user_id'];
		$ajax = new Ajax();
		$chek = $ajax->getUserCity($user_id, $city_id);
		if(count($chek) === 1) {
			echo 1;
		} else {
			echo 0;
		}
		return true;		
	}

	// Получение списка городов пользователя из текущей сессии
	public function actionGetUserCities() {
		if(!empty($_SESSION['user']['cities'])){
			$cities = $_SESSION['user']['cities'];
			echo json_encode($cities);
		}
		return true;
	}

	// Получение количества городов в закладках пользователя
	public function actionGetUserCitiesCount() {
		if(!empty($_SESSION['user']['cities'])){
			$cities = $_SESSION['user']['cities'];
			echo count($cities);
		}
		return true;
	}

	// Получение списка городов выбранной страны
	public function actionGetCountryCities($params){		
		$country = array_shift($params);
		$ajax = new Ajax();
		$cities = $ajax->showCitiesList($country);
		echo json_encode($cities);	
		return true;
	}

	// Добавление города в базу данных
	public function actionInsertCity() {
		$city_id = trim($_POST['id']);
		$user_id = $_SESSION['user']['user_id'];
		$ajax = new Ajax();
		// Выбираем записи из базы
		$cities = $ajax->getUserCity($user_id, $city_id);
		// Получаем количество подписок данного пользователя (должно быть не более 20)
		$subscribes = $ajax->getCountUserSubscribes($user_id);
		// Если нет дублей и не превышен лимит
		if(count($cities) === 0 && $subscribes < 20) {
			// Добавляем запись в базу
			$ajax->insertUserCity($user_id, $city_id);
			// Добавляем id города в массив городов в сессии
			$arr = [
				'city_id' => $city_id,
				'subscribe' => '0'
			];
			array_push($_SESSION['user']['cities'], $arr);
			echo 2;		// Все ок
		} elseif (count($cities) != 0) {
			echo 1;		// Город уже добавлен
		} else if($subscribes >= 2) {
			echo 0;		// Превышен лимит
		}
		return true;
	}

	// Удаление города из базы данных
	public function actionDeleteCity($params) {

		$city_id = array_shift($params);
		$user_id = $_SESSION['user']['user_id'];
		$ajax = new Ajax();
		// Проверяем наличие записей
		$chek = $ajax->getUserCity($user_id, $city_id);
		if(count($chek) !== 0 ) {
			// Удаляем запись из базы
			$ajax->deleteUserCity($user_id, $city_id);		

			// Удаляем горд из сессии
			foreach ($_SESSION['user']['cities'] as $key => $value) {
				if($value['city_id'] == $city_id) {
					// Удаляем элемент из массива со смещением ключей
					array_splice($_SESSION['user']['cities'], $key, 1);
				}
			}
			if(count($_SESSION['user']['cities']) !== 0) {
				echo 1;
			} else {
				echo 0;
			}
		}
		return true;
	}

	// Подписка на рассылку по городу
	public function actionSubscribeCity() {

		$method = $_SERVER['REQUEST_METHOD'];
		if ('PUT' === $method) {

			// Получаем тело PUT запроса
			parse_str(file_get_contents('php://input'), $_PUT);

			$ajax = new Ajax();
			$user_id = $_SESSION['user']['user_id'];
			$user_cities = $_SESSION['user']['cities'];
			$city_id = $_PUT['city_id'];
			 $notification = $_PUT['notification'];
			 // Определяем тип прогноза за которым будем следить
			 if($_PUT['rain'] && $_PUT['temp']) {
			 	$forecast_type = 'temp&rain';
			 } elseif ($_PUT['temp']) {
			 	$forecast_type = 'temp';
			 } elseif($_PUT['rain']) {
			 	$forecast_type = 'rain';
			 } else {
			 	$forecast_type = NULL;
			 }
			 // Если нужно следить за температурой, то добавляем функцию и значение
			 if($forecast_type === 'temp' || $forecast_type === 'temp&rain') {
			 	$func = $_PUT['function'];
			 	$value = $_PUT['value'];
		    } else if($forecast_type === 'rain') {
		    	$func = NULL;
		    	$value = NULL;
		    }
		    // Проверяем наличие города у пользователя (записей должно быть не более 1)
		    $cities = $ajax->getUserCity($user_id, $city_id);
		    $city = array_shift($cities);
		    // Если запись в базе существует и нужно поле валидно
		    if(count($city) != 0 && $$city['subscribe'] === '0' || '1'){

		    	// Изменяем значение переменной
		    	if($city['subscribe'] === '1') {
		    		$subscribe = 0;
		    		// Если подписан, отменяем подписку и выставляем значения полей по умолчанию
		    		$ajax->unsubscribe($user_id, $city_id, $subscribe);
		    		echo 0;

		    	} elseif ($city['subscribe'] === '0') {
		    		$subscribe = 1;
		    		// Если не подписан - оформляем подписку с параметрами полученными из Post
		    		$ajax->subscribe($user_id, $city_id, $subscribe, $forecast_type, $func, $value, $notification);
		    		echo 1;
		    	}

		    	// Заполняем сессию измененными данными
		    	foreach ($user_cities as $key => $arr) {
		    		if($arr['city_id'] == $city_id ) {
		    			// Записываем в сессию в массив города поле subscribe, для правильного отображения кнопки подписки
		    			$_SESSION['user']['cities'][$key]['subscribe'] = $subscribe;
		    		}
		    	}
		    }
		}
		return true;
	}


}

?>