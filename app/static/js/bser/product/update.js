$(function() {
	$("#proImg").click(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('proImg').src = src
	})

	$("#iptCode").blur(function() {
		if($(this).val().length < 3) {
			$("#optCode").show()
		} else {
			$("#optCode").hide()
		}
	})
	$("#iptNome").blur(function() {
		if($(this).val().length < 1) {
			$("#optNome").show()
		} else {
			$("#optNome").hide()
		}
	})

	$("#iptPrice").blur(function(e) {
		var str = $(this).val();
		// 突然想自己写个逻辑，就没有用正则
		if(isFloat(str)) {
			$("#optPrice").hide()
		} else {
			$("#optPrice").show()
		}
	})

	$("#iptPriceIn").blur(function(e) {
		var str = $(this).val();
		// 突然想自己写个逻辑，就没有用正则
		if(isFloat(str)) {
			$("#optPriceIn").hide()
		} else {
			$("#optPriceIn").show()
		}
	})


	$("#upInfo").submit(function(e) {
		var price = $("#iptPrice").val()
		var priceIn = $("#iptPriceIn").val()
		var stock = $("#iptStock").val()
		
		if($("#iptCode").val().length < 3) {
			$("#optCode").show()
			$("#iptCode").focus()
			e.preventDefault();
		}
		else if($("#iptNome").val().length < 1) {
			$("#optNome").show()
			$("#iptNome").focus()
			e.preventDefault();
		}
		else if(!isFloat(price)) {
			$("#optPrice").show()
			$("#iptPrice").focus()
			e.preventDefault();
		}
		else if(!isFloat(priceIn)) {
			$("#optPriceIn").show()
			$("#iptPriceIn").focus()
			e.preventDefault();
		} 
	})

	var isFloat = function(str) {
		if(str.length == 0){
			return false
		} else {			
			var nums = str.split('.')
			if(nums.length > 2){
				return false
			} else {
				var n0 = nums[0]
				if(nums.length == 1){
					if(isNaN(n0)) {
						return false
					} else {
						return true
					}
				} else {
					var n1 = nums[1]
					if(isNaN(n0)) {
						return false
					} else {
						if(n1 && isNaN(n1)) {
							return false
						} else {
							return true
						}
					}
					
				}
				
			}
		}
	}

} );