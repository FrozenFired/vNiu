exports.wsLanguage = function(router, rPath, crWser) {
	let language = require('../../../confile/lang'+router+rPath);
	// console.log(language);
	let Lang = language.cn;
	if(crWser.lang && crWser.lang == 1) {
		Lang = language.en;
	} else if(crWser.lang && crWser.lang == 2) {
		Lang = language.it;
	}
	return Lang;
}
