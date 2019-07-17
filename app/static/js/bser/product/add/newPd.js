$( function() {
	$("#crtImg").click(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('crtImg').src = src;
		$("#crtImg").removeClass("rounded-circle")
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

	$("#iptAddquot").blur(function(e) {
		let addquot = parseInt($(this).val());
		if(isNaN(addquot)) {
			$("#optAddquot").show()
			$("#iptAddquot").focus()
		} else {
			$("#optAddquot").hide()
		}
	})

	var attrLen = 1
	$('#addAttrib').click(function(e) {
		attrLen += 1
		var j=attrLen-1
		str = '<div class="form-group row attrib" id="attrib' + attrLen +'">'
			str += '<label class="col-4 col-form-label"> 尺寸' + attrLen +' </label>'
			str += '<div class="col-8">'
				str += '<input class="form-control" type="number", name="obj[sizes]" />'
			str += '</div>'
		str += '</div>'
		$('#attrib'+j).after(str)
	})

	$('#delAttrib').click(function(e) {
		if(attrLen > 1) {
			$("#attrib"+attrLen).remove()
			attrLen -= 1
		}
	})

	$("#btnSubmit").click(function(e) {
		var nome = $("#iptNome").val()
		var price = $("#iptPrice").val()
		var priceIn = $("#iptPriceIn").val()
		var addquot = $("#iptAddquot").val()
		var size = $("#attrVal").val();
		if(nome.length < 1) {
			$("#optNome").show()
		}
		else if(!isFloat(price)) {
			$("#optPrice").show()
		}else if(!isFloat(priceIn)) {
			$("#optPriceIn").show()
		} else if(isNaN(addquot)) {
			$("#optAddquot").show()
		} else if(size.length < 1) {
			alert('请输入颜色')
		}
		else {
			$("#bsProdNew").submit()
		}
		// e.preventDefault();
	})

	$("#iptNome").focus(function(e) {
		$("#optNome").hide();
		$("#nomePoint").click();

		let str = $(this).val();
		str = String(str).replace(/(\s*$)/g, "").replace( /^\s*/, '');
		obtObjs(str)
	})
	$("#bsProdNew").on('input', '#iptNome', function(e) {
		let str = $(this).val();
		str = String(str).replace(/(\s*$)/g, "").replace( /^\s*/, '');

		obtObjs(str)
	})
	let obtObjs = function(str) {
		$(".pdnameAjax").remove();
		if(str.length < 1) {
			$("#pdnameAll").show();
		} else {
			$("#pdnameAll").hide();
			let nome = encodeURIComponent(str)
			$.ajax({
				type: 'GET',
				url: '/bsPdAjaxNome?nome=' + nome
			})
			.done(function(results) {
				if(results.success === 1) {
					let pdns = results.pdns
					let len = pdns.length
					let elem = '';
					for(i=0;i<len;i++){
						let pdn = pdns[i]
						elem += '<div class="col-6 mt-2 pdnameAjax">'
							elem += '<input class=" btn btn-light btn-block pdn", ';
							elem += 'type="button", value="'+pdn.nome+'">'
						elem += '</div>'
					}
					$('#pdnameAjax').append(elem);
				}
			})
		}
	}
	
	$("#pdnameShow").on('click', '.pdn', function(e) {
		$(".pdnameAjax").remove();
		let nome = $(this).val();

		$("#iptNome").val(nome)
		$("#pdnameAll").hide();
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