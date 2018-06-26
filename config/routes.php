<?php	
return array(
	'login' => 'authentication/index',
	'logout' => 'authentication/logout',
	'cities/user' => 'ajax/getUserCities',

	'cities/country/([A-Z]+)' => 'ajax/getCountryCities/$1',
	'cities/delete/([0-9]+)' => 'ajax/deleteCity/$1',
	'cities/insert' => 'ajax/insertCity',
	'cities/check' => 'ajax/checkCity',
	'cities/count' => 'ajax/getUserCitiesCount',
	'cities/subscribe' => 'ajax/subscribeCity',
	'cities' => 'cities/index',	
	'register' => 'registration/index',
	'' => 'main/index'
);

?>