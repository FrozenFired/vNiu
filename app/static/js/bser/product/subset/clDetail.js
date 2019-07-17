$(function() {
	/* ------------- 导航控制 ----------------------- */
	// 扩大点击面
	$(".back").click(function(e) {
		let id = ($(this).attr('id')).split('-')[1];
		window.location.href = "/bsProd/"+id;
	})
	$("#upBtn").click(function(e) {
		$("#clSizePage").hide();
		$("#upPage").show();

		$(this).addClass('bg-light')
		$("#clSizeBtn").removeClass('bg-light')
	})
	$("#clSizeBtn").click(function(e) {
		$("#upPage").hide();
		$("#clSizePage").show();

		$(this).addClass('bg-light')
		$("#upBtn").removeClass('bg-light')
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

	// 上传图片 优化设计
	$("#crtImg").click(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('crtImg').src = src;
	})
	// 判断是否输入颜色
	$("#upClForm").submit(function(e) {
		if($("#iptColor").val().length < 1) {
			e.preventDefault();
		}
	})

})