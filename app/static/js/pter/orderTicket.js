$(function() {
	if($("#ticketing").val() == 1) {
		window.print();
		var id = $("#id").val()
		$.ajax({
			type: 'GET',
			url: '/ptOrderTicket?id=' + id + '&newTicket=0'
		})
		.done(function(results) {
			if(results.success === 1) {
				setTimeout(function(){
					window.location.reload();
				}, 5*1000);
			} else if(results.success === 0) {
				alert(results.info)
			}
			// 不能把 alert(results.info) 提取出来
		})
	} else {
		setTimeout(function(){
			window.location.reload();
		}, 5*1000);
	}
	
} );