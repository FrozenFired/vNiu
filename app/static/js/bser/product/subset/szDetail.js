$(function() {
	/* ------------- 导航控制 ----------------------- */
	// 扩大点击面
	$(".back").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1];
		window.location.href = "/bsProd/"+id;
	})
	/* ------------- 导航控制 ----------------------- */

	/* ----------------- Prod Basic -------------------- */
	// update / 图片放缩
	$("#imgClick").on('click', '.imgSmall', function(e) {
		$("#imgClick").removeClass("col-3").addClass( "col-12" );
		$(this).removeClass("imgSmall").addClass( "imgBig" );
	})
	$("#imgClick").on('click', '.imgBig', function(e) {
		$("#imgClick").removeClass("col-12").addClass( "col-3" );
		$(this).removeClass("imgBig").addClass( "imgSmall" );
	})
	/* ----------------- Prod Basic -------------------- */



	/* ----------------- Prod 库存 -------------------- */
	$("#upStock").click(function(e) {
		$("#textStock").hide();
		$("#formStrok").show();

		$("#upCancel").show();
		$(this).hide();
	})
	$("#upCancel").click(function(e) {
		$("#formStrok").hide();
		$("#textStock").show();

		$("#upStock").show();
		$(this).hide();
	})

	$("#iptStock").blur(function(e) {
		let form = $("#bsProdszUpdAjax");
		let url = form.attr('action');
		let obj = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: obj, // serializes the form's elements.
			success: function(results) {
				if(results.success == 1) {
					$("#formStrok").hide();
					$("#textStock").text(results.stock);
					$("#textStock").show();

					$("#upStock").show();
					$("#upCancel").hide();
				}
			}
		});
	})
	/* ----------------- Prod 库存 -------------------- */



	/* 对出售记录的更改 */
	// $("#opt").click(function(e) {
	// 	$(".opt").toggle();
	// })
	// $('.delSell').click(function(e) {
	// 	let ids = $(this).attr("id").split('-')
	// 	let prodId = ids[0]
	// 	let sellId = ids[1]
	// 	let tr = $('.sell-id-' + sellId)
	// 	$.ajax({
	// 		type: 'DELETE',
	// 		url: '/bsProdDelSell?prodId=' + prodId + '&sellId=' + sellId
	// 	})
	// 	.done(function(results) {
	// 		if(results.success === 1) {
	// 			if(tr.length > 0) {
	// 				tr.remove()
	// 			}
	// 		}
	// 		if(results.success === 0) {
	// 			alert(results.info)
	// 		}
	// 	})
	// })
	/* 对出售记录的更改 */
	/* ----------------- Prod Color -------------------- */
})