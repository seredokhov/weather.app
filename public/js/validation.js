(function(){

	var form = Lib.getById('reg_form'),
		  inputs = form.querySelectorAll('input');


	for(var i = 0; i<inputs.length; i++) {
		inputs[i].addEventListener('input', function(e){
			var serverErrors = document.querySelector('.errors');
			if (serverErrors) {
				serverErrors.parentNode.removeChild(serverErrors);
			}
			validateForm(e.target.name, e.target, inputs);
		});
	}

	function validateForm(name, elem, array) {
		var pattern,
				message,
				flag = 1,
				button;

		// Проверка поля в которое совершен ввод в зависимости от его типа
		if(name === 'login') {
			pattern = /^\S{3,20}$/;
			message = 'Некорректный логин';
			checkField(elem, pattern, message);
		} else if (name === 'password') {
			pattern = /^\S{5,}$/;
			message = 'Пароль не может содержать пробелы';
			checkField(elem, pattern, message);
		} else if(name === 'username') {
			pattern = /^\S{3,20}$/;
			message = 'Некорректное имя';
			checkField(elem, pattern, message);
		} else if(name === 'email') {
			pattern = /\S+@\S+\.\S{2,}$/;
			message = 'Некорректный email';
			checkField(elem, pattern, message);
		} else if(name === 'r_password') {
			// Проверка повторного ввода пароля
			var error = elem.parentNode.querySelector('.error_text');
			if(elem.value !== document.getElementsByName('password')[0].value) {
				error.classList.add('active');
				error.innerHTML = 'Пароли не совпадают';
			} else {
				elem.classList.remove('error');
				error.classList.remove('active');
				error.innerHTML = '';
			}
		}


		// Проверка все ли поля заполнены и заполнены правильно
		for(var i = 0; i < array.length; i++) {
			if (array[i].classList.contains('error') || array[i].value === '' ) {
				flag = 0;
			}
		}

		button = document.querySelector('.reg_submit');

		if(flag === 0) {
			button.setAttribute('disabled', 'disabled');
		} else {
			button.removeAttribute('disabled');
		}

	}


	// Проверка поля
	function checkField(elem, regex, message){
		var error = elem.parentNode.querySelector('.error_text');

		if(elem.value.length < 1) {
			elem.classList.add('error');
			error.classList.add('active');
			error.innerHTML = 'Поле не должно быть пустым';
		} else if(!regex.test(elem.value)) {
			elem.classList.add('error');
			error.classList.add('active');
			if(elem.value.length<3 && elem.name !== 'password') {	// Для всех кроме пароля
					error.innerHTML = 'Поле не должно быть короче 3 символов';
			} else if(elem.value.length<5 && elem.name === 'password') {	// Для пароля
				error.innerHTML = 'Пароль не долже ныть короче 5 символов';
			} else {
				error.innerHTML = message;
			}
		} else {
			elem.classList.remove('error');
			error.classList.remove('active');
			error.innerHTML = '';
		}

	}
}());