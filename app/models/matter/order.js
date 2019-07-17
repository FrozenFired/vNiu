let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Order';
let dbSchema = new Schema({
	group: {type: ObjectId, ref: 'Wsgp'},
	code: String,	// 本公司唯一
	creater: {type: ObjectId, ref: 'Wser'},
	status: Number,

	sells: [{
		quot: Number,
		prodFir: {type: ObjectId, ref: 'Product'},
		prodSec: {type: ObjectId, ref: 'Product'},
		prodThr: {type: ObjectId, ref: 'Product'},
		code: String,
		nome: String,
		material: String,
		width: String,
		color: String,
		size: Number,
		price: Float,		// 产品单价	//获取
		ctAt: Date,
	}],

	// 结算时计算
	arts: Number,		// 种类数
	pieces: Number,		// 件数
	imp: Float,

	note: String,

	cter: {type: ObjectId, ref: 'Cter'},
	bill: {type: ObjectId, ref: 'Bill'},

	printing: {
		type: Number,
		default: 0
	},
	ticketing: {
		type: Number,
		default: 0
	},
	ctAt: Date,
});

dbSchema.pre('save', function(next) {	
	if(this.isNew) {
		this.ctAt = Date.now();
	}
	next();
})

module.exports = mongoose.model(colection, dbSchema);