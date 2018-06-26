<?php

	// Точка входа
	//$root = $_SERVER["DOCUMENT_ROOT"];

	// Редирект на главную
	//header("Location: /views/main.php");
	//die;

	//require_once 'DataBase.class.php';


	// Подключение компонентов
	session_start();
	define('ROOT', dirname((__FILE__)));	
	require_once(ROOT.'/components/Router.php');
	require_once(ROOT.'/components/DataBase.php');
	
	// Вызов роутера
	$router = new Router();
	$router->run();

?>
