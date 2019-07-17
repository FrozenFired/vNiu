$( function() {
	$('#iptName').blur(function(e) {
		if($(this).val().length < 1){
			$("#optName").show()
		} else {
			$("#optName").hide()
		}
	})
	$('#iptTel').blur(function(e) {
		if($(this).val().length < 5){
			$("#optTel").show()
		} else {
			$("#optTel").hide()
		}
	})


	$("#upGroup").submit(function(e) {
		if($('#iptName').val().length < 1){
			$("#optName").show()
			$("#iptName").focus()
			e.preventDefault();
		}
		else if($('#iptTel').val().length < 1){
			$("#optTel").show()
			$("#iptTel").focus()
			e.preventDefault();
		}
	})


} );