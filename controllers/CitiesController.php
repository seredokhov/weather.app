<?php

class CitiesController {

	public function actionIndex() {

		if( !isset($_SESSION['user']) ) {
			// Если пользователь не авторизован - редирект на авторизацию
			header('Location: /login');

		} else {
			require_once ROOT .'/views/grid.php';
		}

		return true;
	}

}

?>