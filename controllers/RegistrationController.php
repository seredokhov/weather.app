<?php
include_once ROOT . '/models/Register.class.php';

class RegistrationController {

	public function actionIndex() {

		if(isset($_POST['do_signup'])) {
			$this->validate();
		} else {
			$this->view();
		}

		return true;
	}

	private function validate(){
		$username = trim($_POST['username']);
		$login = trim($_POST['login']);
		$email = trim($_POST['email']);
		$password = trim($_POST['password']);
		$r_password = trim($_POST['r_password']);

		$reg = new Register($username,$login,$email,$password,$r_password);

		// Валидация
		$reg->is_empty($username,'Введите имя');
		$reg->is_empty($login,'Введите логин');
		$reg->is_empty($email,'Введите емаил');
		$reg->is_empty($password,'Введите пароль');
		$reg->compare($password,$r_password,'Повторите пароль');
		$reg->unique('login',$login,'Пользователь с таким логином уже существует');
		$reg->unique('email',$email,'Пользователь с таким email уже существует');

		// Получаем массив ошибок
		$errors = $reg->getErrorsArray();
		$this->registration($errors, $login, $username, $email, $reg);
	}


	private function registration($errors, $login, $username, $email, $reg) {
		if(empty($errors)) {
			// Ошибок нет, регистрируем
			$reg->registrate();
			$user = array_shift(User::getUsers('login', $login));
			$userCities = User::getCities($user['user_id']);

			// Записываем в сессию информацию о пользователе и выбранные им города
			$_SESSION['user'] = $user;
			$_SESSION['user']['cities'] = $userCities;

			// Редирект на главную страницу
			header('Location: /');
			die;
		} else {
			// Найдены ошибки при регистрации выводим ошибку и делаем редирект
			$_SESSION['error'] = '<div class="alert-danger errors"><i class="fa fa-lock"></i>'.array_shift($errors).'</div>';
			$_SESSION['reginput'] = [
				'login' => $login,
				'username' => $username,
				'email' => $email
			];
			$this->view();
		}
	}


	private function view() {
		return include_once ROOT .'/views/registration.php';
	}

}

?>