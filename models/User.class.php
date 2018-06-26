<?php

class User extends Database {

	//public $userArray= [];
	//public $login;

	// Возвращаем массив пользователей из бд
	public function getUsers($field,$value){
		$db = new DataBase();
		$sql = "SELECT * FROM users WHERE $field = '$value'";
		$userArray = $db->query($sql);
		return $userArray;
	}

	// Получить подписки пользователя
	public function getCities($user_id){
		$db = new DataBase();
		$sql = "SELECT city_id, subscribe FROM user_city WHERE user_id = '$user_id'"; // subscribe +
		$result = $db->query($sql);
		return $result;
	}

	// Получить имя по ID
	
	// public function getNameById($id) {
	// 	$sql = "SELECT `username` FROM `users` WHERE `user_id` = '$id'";
	// 	$result = array_shift($this->db->query($sql))['username'];
	// 	return $result;
	// }

	// Возвращает все города на которые оформлена подписка
	public static function getSubscribedCitiesID() {
		$db = new DataBase();
		$sql = "SELECT `city_id` FROM `user_city` WHERE `subscribe` = 1 GROUP BY `city_id`";
		$rows = $db->query($sql);
		return $rows;
	}


	// Создание массива подписок пользователя  [user_id] => [[city_id и подписки], .. ]
	public static function getUsersSubscribeArray(){
		$db = new DataBase();
		$user_cities = [];
		$sql = "SELECT * FROM `user_city` WHERE `subscribe` = 1";
		$row = $db->query($sql);
		
		foreach ($row as $key => $value) {
			$city = [
				'city_id' => $value['city_id'],
				'forecast_type' => $value['forecast_type'],
				'func' => $value['function'],
				'value' => $value['value'],
				'notification' => $value['notification']

			];
			if(!is_array($user_cities[$value['user_id']])) {
				$user_cities[$value['user_id']] = [];
			}		
			array_push($user_cities[$value['user_id']], $city);
		}
		return $user_cities;
	}

}



?>