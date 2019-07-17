$( function() {
	$(".datepicker").datepicker();

	$("#clearB").click(function(e) {
		$("#atStTime").val("")
	})
	$("#clearT").click(function(e) {
		$("#atFnTime").val("")
	})
} );