<?php
class Database {

	private $link;

	public function __construct() {

		$this->connect();

	}

	private function connect() {

		$config = require '/config/db_config.php';
		$dsn = 'mysql:host='.$config['host'].';dbname='.$config['db_name'].';charset='.$config['charset'];
		$username = $config['username'];
		$password = $config['password'];

		$this->link = new PDO($dsn, $username, $password);

		return $this;
	}

	public function execute($sql) {
		$sth = $this->link->prepare($sql);

		return $sth->execute();
	}

	public function query($sql) {

		$sth = $this->link->prepare($sql);

		$sth->execute();

		$result = $sth->fetchAll(PDO::FETCH_ASSOC);

		if($result === false) {
			return [];
		}

		return $result;
	}

}

?>