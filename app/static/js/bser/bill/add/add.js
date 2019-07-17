$( function() {
	$("#iptUnpaid").blur(function(e) {
		if(isFloat($(this).val()) || $(this).val() ==0 || $(this).val()=="") {
			$("#optUnpaid").hide()
		} else {
			$("#optUnpaid").show()
		}
	})
	$("#addBill").submit(function(e) {
		if($("#orderCter").val().length < 20) {
			$("#optCter").show();
			e.preventDefault();
		} else if(!isFloat($("#iptUnpaid").val())) {
			$("#optUnpaid").show()
			e.preventDefault();
		}
	})


	let isFloat = function(str) {
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