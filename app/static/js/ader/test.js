$(function() {
	$('#ajaxProd').focus()
	$('#ajaxProd').blur(function(e) {
		let code = $(this).val();
		$.ajax({
			type: 'GET',
			url: "http://10.10.9.158:8080/api/product/" + code
		})
		.done(function(results) {
			if(results.success === 1) {
				alert(results.object.code)
				alert(results.object.nome)
			}
			if(results.success === 0) {
				alert(results.info)
			}
		})
	})
})