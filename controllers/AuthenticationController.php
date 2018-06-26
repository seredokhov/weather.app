<?php

include_once ROOT . '/models/Authentication.class.php';

class AuthenticationController {

	public function actionIndex() {
		
		if(isset($_POST['do_login'])) {
			// Если отправлена форма вызываем метод
			$this->Authentication($_POST);
		} else {
			// При первом входе показываем форму
			$this->view();
		}
		return true;
	}

	public function actionLogout() {
		session_unset();
		header('Location: /');
	}


	private function Authentication($array) {
		$login = trim($_POST['login']);
		$password = trim($_POST['password']);
		$errors = Authentication::checkUser($login,$password);
		$this->login($errors, $login);

	}

	private function login($errors, $login) {
		if(empty($errors)) {
			// Если ошибок нет
			$user = array_shift(User::getUsers('login', $login));
			$userCities = User::getCities($user['user_id']);

			// Записываем в сессию информацию о пользователе и выбранные им города
			$_SESSION['user'] = $user;
			$_SESSION['user']['cities'] = $userCities;

			// Редирект на главную страницу
			header('Location: /');
			die;
		} else {
			// Записываем ошибку в сессию
			$_SESSION['error'] = '<div class="alert-danger errors"><i class="fa fa-lock"></i>'.array_shift($errors).'</div>';
			$_SESSION['authinput'] = [
				'login' => $login
			];
			$this->view();
		}
	}


	private function view() {
		return include_once ROOT .'/views/authorization.php';
	}

}

?>