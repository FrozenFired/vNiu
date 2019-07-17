$( function() {
	$("#orderNew").submit(function(e) {
		let imp = parseFloat($("#imp").val());
		if(isNaN(imp)) {
			alert("价格输入错误");
			e.preventDefault();
		} else if(imp == 0) {
			alert("添加商品后 结帐");
			e.preventDefault();
		}
	})
} );