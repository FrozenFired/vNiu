$(function() {
	let len = $("#len").val();
	// alert(cdn)
	for(let i = 0; i<len; i++){
		var imgsrc = isHasImg($("#imgsrc-"+i).val())
		$(".imgshow-"+i).attr("src",imgsrc);
	}

	function isHasImg(pathImg){
		var imgsrc = cdn+ pathImg;
		var ImgObj=new Image();
		ImgObj.src= imgsrc;
		if(ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))
		{
			return imgsrc;
		} else {
			imgsrc = dns+ pathImg;
			ImgObj = new Image();
			ImgObj.src= imgsrc;
			if(ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))
			{
				return imgsrc;
			} 
			// else { return imgsrc}
			else {
				imgsrc = pathImg;
				ImgObj=new Image();
				ImgObj.src= imgsrc;
				if(ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))
				{
					return imgsrc;
				} else {
					return '/upload/product/1.jpg'
				}
			}
		}
	}
})
