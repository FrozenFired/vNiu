$( function() {
	$(".cnlPrint").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')
		var value = target.data('value')

		$.ajax({
			type: 'GET',
			url: '/ptOrderPrinting?id=' + id + '&newPrint=' + value
		})
		.done(function(results) {
			if(results.success === 1) {
				window.location.reload();
			} else if(results.success === 0) {
				alert(results.info)
			}
		})
	})
} );