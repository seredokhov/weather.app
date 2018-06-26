<?php

class Router {

	private $routes;

	public function __construct() {
		// Подключение массива с возможными роутами
		$routesPath = ROOT.'/config/routes.php';
		$this->routes = include($routesPath);
	}

	// Получение строки URI
	private function getUri() {
		if(!empty($_SERVER['REQUEST_URI'])) {
			return trim($_SERVER['REQUEST_URI'], '/');
		}
	}

	public function run() {
		$uri = $this->getUri();
		$flag = false;

		foreach ( $this->routes as $key => $path) {
			if(preg_match("~^$key$~", $uri)) {

				$route = preg_replace("~^$key$~", $path, $uri);

				// Парсим строку запроса и определяем контроллер, метод и переданные параметры
				$segments = explode('/', $route);
				$controllerName = ucfirst(array_shift($segments) . 'Controller');
				$actionName = 'action'. ucfirst(array_shift($segments));
				$params = $segments;

				//print_r($params);
				//die;
				
				// Подключаем нужный контроллер
				$controllerFile = ROOT . '/controllers/' . $controllerName . '.php';

				if(file_exists($controllerFile)) {
					include_once($controllerFile);
				}

				// Создаем экземпляр класса контроллера и вызываем нужный метод (из URI)
				$controllerObject = new $controllerName;
				$result = $controllerObject->$actionName($params);
				if ($result != null) {
					$flag = true;
					break;	// Выходим из цикла foreach при нахождении первого совпадения
				}
			}
		}
		if($flag == false) {
			// Если запрос не соответствует прописанным в роутере то редирект на главную
			header('Location: /');
			die;
		}



	}

}

?>