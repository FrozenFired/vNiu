let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Fter';
let dbSchema = new Schema({
	group: {type: ObjectId, ref: 'Wsgp'},
	code: String,
	nome: String,
	tel: String,
	iva: String,
	doct: String,
	addr: String,
	post: String,

	note: String,

	arrears: [{type: ObjectId, ref: 'Arrear'}],
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
});

module.exports = mongoose.model(colection, dbSchema);