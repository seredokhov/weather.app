<?php

require_once 'User.class.php';

class Register extends User{

	public $errors = [];
	public $user_array = [];

	function __construct($username,$login,$email,$password,$r_password){
		//$this->userObj = $userObj;
		$this->username = $username;
		$this->login = $login;
		$this->email = $email;
		$this->join = time();
		$this->code_password = password_hash($password, PASSWORD_DEFAULT);
	}

	public function is_empty($str,$error){
		if($str == "") {
			$this->errors[] = $error;
		}
	}

	public function unique($field, $value, $error){

		//$rows = $this->userObj->getUsers($field,$value);
		$rows = User::getUsers($field,$value);
		if(count($rows) > 0) {
			$this->errors[] = $error;
		}
	}

	public function compare($val1,$val2,$error){
		if( $val1 == "" || $val2 == "" || $val1 != $val2){
			$this->errors[] = $error;
		}
	}

	public function getErrorsArray(){
		return $this->errors;
	}

	public function getUserArray(){
		$this->user_array['login'] = $this->login;
		$this->user_array['username'] = $this->username;
		$this->user_array['email'] = $this->email;
		return $this->user_array;
	}

	public function registrate(){
		$db = new Database();
		$insert_user = "INSERT INTO users SET username = '$this->username', login = '$this->login', email = '$this->email', password = '$this->code_password', join_data = '$this->join'";
		$db->execute($insert_user);
	}
}


?>