$(document).ready(function(){

	var app = {};
	
	app.status = function(){
		  
		  $.ajax({
			type:'GET',
			url: 'http://localhost:8080/physical/status',
			contentType: 'application/json',
			headers: { 'Authorization':'Bearer {Super Secret Token Goes Here}'}
		  }).done(function(data) {
			alert("status of server:" + data);
		  })
		  .fail(function(err) {
			alert( "error:" + err );
		  });
	
	};
	
	$('#statusCheckButton').click(function(){
		app.status();
	});

});