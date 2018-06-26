<?php
require_once 'User.class.php';

class Authentication extends User {
	public $errors = [];
	public $user_array = [];

	// Проверяет наличие записи в базе
	public function checkUser($user, $password){
		// Получаем пользователя из дочернего класса
		$user = array_shift(User::getUsers('login',$user));
		// Проверяем существование пользователя
		if($user) {
			//Если пользователь существует сравниваем пароль
			if(password_verify($password,$user['password'])) {
				// Если проверки прошли не делаем ничего
			} else {
				//Неверный пароль
				$this->errors[] = 'Неверный пароль.';
			}
		} else {
			$this->errors[] = 'Пользователь не существует';
		}
		// Возвращаем массив ошибок или пустой массив
		return $this->errors;
	}
/*
	public function getUserArray(){
		$this->user_array['login'] = $this->login;
		$this->user_array['username'] = $this->username;
		$this->user_array['email'] = $this->email;
		return $this->user_array;
	}
	*/
}


?>