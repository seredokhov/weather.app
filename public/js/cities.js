(function() {

	Lib.getCityArray();
	Lib.showCitiesCount();

	// Инициализация счетчика в модальном окне
	(function(){
		var counter = Lib.getById('counter'),
				prev = counter.querySelector('.prev'),
				next = counter.querySelector('.next'),
				input = Lib.getById('temp_input');

		input.value = '1 день'; // по умолчанию
		prev.setAttribute('disabled', 'disabled');
		next.removeAttribute('disabled');		

		next.addEventListener('click', function(e){			
			if(parseInt(input.value)<4) {
				prev.removeAttribute('disabled');
				input.value = parseInt(input.value) + 1 + ' дня';
				if(parseInt(input.value) === 4) {
					this.setAttribute('disabled', 'disabled');
				}
			}
			
		}, false);
		prev.addEventListener('click', function(e){
			if(parseInt(input.value)>1){
				next.removeAttribute('disabled');
				input.value = parseInt(input.value) - 1 + ' дня';
				if(parseInt(input.value) === 1) {
					input.value = parseInt(input.value) + ' день';
					this.setAttribute('disabled', 'disabled');
				}
			}
		});
	})();


})();
