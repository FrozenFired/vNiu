$( function() {
	$("#downBtn").click(function(e) {
		$(".downBtn").toggle()
	})
	$("#optBtn").click(function(e) {
		$(".optBtn").toggle()
	})

	// 手机打印功能（必须电脑登录打印员，并连接打印机）
	$("#taskPrint").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')

		$.ajax({
			type: 'GET',
			url: '/sfOrderPrinting?id=' + id + '&newPrint=1'
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
			url: '/sfOrderPrinting?id=' + id + '&newPrint=0'
		})
		.done(function(results) {
			if(results.success === 1) {
				window.location.reload();
			} else if(results.success === 0) {
				alert(results.info)
			}
		})
	})

	// 手机小票打印功能（必须电脑登录打印员，并连接打印机）
	$("#taskTicket").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')

		$.ajax({
			type: 'GET',
			url: '/sfOrderTicket?id=' + id + '&newTicket=1'
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
	$("#cnlTicket").click(function(e) {
		var target = $(e.target)
		var id = target.data('id')

		$.ajax({
			type: 'GET',
			url: '/sfOrderTicket?id=' + id + '&newTicket=0'
		})
		.done(function(results) {
			if(results.success === 1) {
				window.location.reload();
			} else if(results.success === 0) {
				alert(results.info)
			}
		})
	})

	// 更改备注
	$("#noteLab").click(function(e) {
		$(".orgNote").hide();
		$(".fixNote").show();
		$("#iptNote").val($("#orgNote").val())
		$("#iptNote").focus();
	})
	$("#cancelUp").click(function(e) {
		$(".orgNote").show();
		$(".fixNote").hide();
	})
	$("#iptNote").blur(function(e) {
		$("#orderUpdNote").submit();
	})
} );