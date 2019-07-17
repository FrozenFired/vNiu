let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;

const colection = 'Pdname';
let dbSchema = new Schema({
	group: {type: ObjectId, ref: 'Wsgp'},
	nome: String,	// 本公司唯一

	freq: Number,

	ctAt: Date,
	upAt: Date,
});

dbSchema.pre('save', function(next) {
	if(this.isNew) {
		this.upAt = this.ctAt = Date.now();
	} else {
		this.upAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);