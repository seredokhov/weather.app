<?php

class MainController {

	public function actionIndex() {

		if( !isset($_SESSION['user']) ) {
			// Если пользователь не авторизован - редирект на авторизацию
			header('Location: /login');
			
		} else {
			require_once ROOT .'/views/main.php';
		}

		return true;
	}

}

?>