function SaveResult(){
	var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(new_data));
	var a = document.getElementById('ResultSaver');
	a.href = 'data:' + data;
	a.download = 'new_data.json';
	// a.click();
}