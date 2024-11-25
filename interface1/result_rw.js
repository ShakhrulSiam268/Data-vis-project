init_saver();
init_reader();

function init_reader(){


}

function init_saver(){

	var a = document.createElement('a');
	a.id = "result_saver";
	// a.download = 'correct_data.json';
	a.innerHTML = 'Download New Result';

	var container = document.getElementById('ResultSaver');
	container.appendChild(a);
}

function SaveResult(){

	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(new_data));

	var a = document.getElementById('result_saver');
	a.href = 'data:' + data;
	a.download = 'new_data.json';
	// a.click();
}

