$(function() {
	/* ----------------- 导航 list -------------------- */
	$("#group").click(function(e) {
		window.location.href = "/bsGroup";
	})
	$("#pdcolor").click(function(e) {
		window.location.href = "/bsColors";
	})
	/* ----------------- 导航 list -------------------- */

	/* ----------------- 导航 Detail -------------------- */
	$("#back").click(function(e) {
		window.location.href = "/bsWsers";
	})
	/* ----------------- 导航 Detail -------------------- */


	/* -----------------wser Update -------------------- */
	$("#divImg").click(function(e) {
		$("#uploadPhoto").click();
	})
	$("#uploadPhoto").change(function(e) {
		var f = document.getElementById('uploadPhoto').files[0];
		var src = window.URL.createObjectURL(f);
		document.getElementById('divImg').src = src
	})
	/* -----------------wser Update -------------------- */

})