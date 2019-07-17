$(function() {
	// 图片放缩
	$("#imgClick").on('click', '.imgSmall', function(e) {
		$(this).removeClass("imgSmall offset-3 col-6").addClass( "imgBig col-12" );
	})
	$("#imgClick").on('click', '.imgBig', function(e) {
		$(this).removeClass("imgBig col-12").addClass( "imgSmall offset-3 col-6" );
	})


	$("#sellsRcd").click(function(e) {
		$(".basic").hide();
		$(".sellsRcd").show();
		$(this).addClass('btn-info');
		$("#basic").removeClass('btn-info');
	})

	$("#basic").click(function(e) {
		$(".sellsRcd").hide();
		$(".basic").show();
		$(this).addClass('btn-info');
		$("#sellsRcd").removeClass('btn-info');
	})

	$("#opt").click(function(e) {
		$(".opt").toggle();
	})

	$('.delSell').click(function(e) {
		let ids = $(this).attr("id").split('-')
		let prodId = ids[0]
		let sellId = ids[1]
		let tr = $('.sell-id-' + sellId)
		$.ajax({
			type: 'DELETE',
			url: '/sfProdDelSell?prodId=' + prodId + '&sellId=' + sellId
		})
		.done(function(results) {
			if(results.success === 1) {
				if(tr.length > 0) {
					tr.remove()
				}
			}
			if(results.success === 0) {
				alert(results.info)
			}
		})
	})


})