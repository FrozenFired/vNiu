$(function() {
	/* ----------------- Product -------------------- */
	$("#back").click(function(e) {
		window.location.href = "/bsProds";
	})
	$("#colorBtn").click(function(e) {
		$("#colorPage").show();
		$("#sizePage").hide();
		$("#upPage").hide();

		$(this).addClass('btn-info');
		$("#sizeBtn").removeClass('btn-info');
		$("#upBtn").removeClass('btn-info');
	})

	$("#sizeBtn").click(function(e) {
		$("#sizePage").show();
		$("#colorPage").hide();
		$("#upPage").hide();

		$(this).addClass('btn-info');
		$("#colorBtn").removeClass('btn-info');
		$("#upBtn").removeClass('btn-info');
	})

	$("#upBtn").click(function(e) {
		$("#upPage").show();
		$("#sizePage").hide();
		$("#colorPage").hide();

		$(this).addClass('btn-info');
		$("#colorBtn").removeClass('btn-info');
		$("#sizeBtn").removeClass('btn-info');
	})
	/* ----------------- Product -------------------- */


	

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




	/* ----------------- Prod Color -------------------- */
	// 展开color中的size选项  扩大点击面
	$(".pdszBtn").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1];
		$(".pdszPage-"+id).toggle();
	})
	// 点击删除 扩大点击面
	$(".minusClBtn").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1];
		window.location.href = "/bsProdclDel/"+id;
	})
	// Prod Color / new Color
	$("#addClBtn").click(function(e) {
		$("#addClForm").toggle();

		$(".pdszPage").hide();
		$(".pdszBtn").show();
		$(".minusClBtn").hide();
	})
	$("#addClForm").submit(function(e) {
		if($("#iptColor").val().length < 1) {
			e.preventDefault();
		}
	})
	// Prod Color / minus Color
	$("#minusClBtn").click(function(e) {
		$("#addClForm").hide();
		$(".pdszPage").hide();
		$(".pdszBtn").toggle();
		$(".minusClBtn").toggle();
	})
	$("#addClForm").submit(function(e) {
		if($("#iptColor").val().length < 1) {
			e.preventDefault();
		}
	})
	/* ----------------- Prod Color -------------------- */

	


	/* ----------------- Prod Size -------------------- */
	// new Size
	$("#addzsBtn").click(function(e) {
		$("#addzsForm").toggle();
		$("#minuszsForm").hide();
	})
	// 保证至少选中一个尺寸
	$("#addzsForm").submit(function(e) {
		let addSizes = $("#iptAddSize").val();
		if(addSizes.length < 1) {
			alert('input Size')
			e.preventDefault();
		}
	})
	// minus Size
	$("#minuszsBtn").click(function(e) {
		$("#minuszsForm").toggle();
		$("#addzsForm").hide();
	})
	// 保证至少选中一个尺寸
	$("#minuszsForm").submit(function(e) {
		let minusSizes = $(".minusSizes:checkbox:checked").val();
		if(!minusSizes) {
			alert('Select Size')
			e.preventDefault();
		}
	})

	// 更改prod的stock
	// $(".pdcolor").click(function(e) {
	// 	let prodclId = $(this).attr('id').split('-')[1];
	// 	$(".formclsz").hide();
	// 	$(".txtclsz").show();
	// 	$("#txtColor-"+prodclId).hide();
	// 	$("#formColor-"+prodclId).show();
	// 	$("#iptColor-"+prodclId).focus();
	// })
	$(".pdsize").click(function(e) {
		let prodszId = $(this).attr('id').split('-')[1];
		$(".formclsz").hide();
		$(".txtclsz").show();
		$("#txtSize-"+prodszId).hide();
		$("#formSize-"+prodszId).show();
		$("#iptSize-"+prodszId).focus();
	})

	$(".iptclsz").blur(function(e) {
		let prodclId = $(this).attr('id').split('-')[1];
		let form = $("#formColor-"+prodclId);
		let url = form.attr('action');
		let obj = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: obj, // serializes the form's elements.
			success: function(results) {
				if(results.success == 1) {
					location.reload();
				}
			}
		});
	})

	$(".iptSize").blur(function(e) {
		let prodszId = $(this).attr('id').split('-')[1];
		let form = $("#formSize-"+prodszId);
		let url = form.attr('action');
		let obj = form.serialize();
		$.ajax({
			type: "POST",
			url: url,
			data: obj, // serializes the form's elements.
			success: function(results) {
				if(results.success == 1) {
					$(".formclsz").hide();
					$(".txtclsz").show();
					$("#txtSize-"+prodszId).text(results.stock);
				}
			}
		});
	})
	/* ----------------- Prod Size -------------------- */
})