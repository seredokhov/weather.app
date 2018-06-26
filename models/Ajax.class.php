<?php
require_once ROOT . "/components/DataBase.php";

class Ajax extends Database {
	private $db;

	public function __construct() {
		$this->db = new Database();		
	}


	// Проверка наличия города пользователя в базе данных
	public function getUserCity($user_id, $city_id) {
		$row = "SELECT * FROM user_city WHERE user_id = '$user_id' AND  city_id = '$city_id'";
		$result = $this->db->query($row);
		return $result;
	}

	// Получение количества подписок пользователя
	public function getCountUserSubscribes($user_id) {
		$check_count = "SELECT * FROM user_city WHERE user_id = '$user_id'";
		$subscribes = count($this->db->query($check_count));
		return $subscribes;
	}

	// Показать список городов для выбранной страны 
	public function showCitiesList($country) {
		$sql = "SELECT city_id, country, name FROM cities WHERE country = '$country'";
		$cities = $this->db->query($sql);
		return $cities;
	}

	// Добавить город в список городов пользователя
	public function insertUserCity($user_id, $city_id) {
		$sql = "INSERT INTO user_city(user_id, city_id) VALUES ('$user_id','$city_id')";
		$this->db->execute($sql);
	}

	// Удалить город из списка городов пользователя
	public function deleteUserCity($user_id, $city_id) {
		$sql = "DELETE FROM user_city WHERE user_id = '$user_id' AND city_id = '$city_id'";
		$this->db->execute($sql);
	}

	// Подписаться на рассылку
	public function subscribe($user_id, $city_id, $subscribe, $forecast_type, $func, $value, $notification) {
		$sql = "UPDATE user_city SET subscribe = '$subscribe', forecast_type = '$forecast_type', function = '$func', value = '$value', notification = '$notification' WHERE user_id = '$user_id' AND city_id = '$city_id'";
		$this->db->execute($sql);
	}
	
	// Отписаться от рассылки
	public function unsubscribe($user_id, $city_id, $subscribe) {
		$sql = "UPDATE user_city SET subscribe = '$subscribe', forecast_type = null, function = null, value = null, notification = null WHERE user_id = '$user_id' AND city_id = '$city_id'";
		$this->db->execute($sql);
	}

}


?>