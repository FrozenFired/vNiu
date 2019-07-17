$( function() {
	// 手机打印功能（必须电脑登录打印员，并连接打印机）
	$("#taskPrint").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')

		$.ajax({
			type: 'GET',
			url: '/bsRoadPrinting?id=' + id + '&newPrint=1'
		})
		.done(function(results) {
			if(results.success === 1) {
				window.location.reload();
			} else if(results.success === 0) {
				alert(results.info)
			}
		})
	})
	// 取消打印
	$("#cnlPrint").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')

		$.ajax({
			type: 'GET',
			url: '/bsRoadPrinting?id=' + id + '&newPrint=0'
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