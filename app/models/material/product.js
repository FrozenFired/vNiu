let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let ObjectId = Schema.Types.ObjectId;
let Float = require('mongoose-float').loadType(mongoose, 2);

const colection = 'Product';
let dbSchema = new Schema({
	layer: Number,	// 1 总 2 颜色 3 大小

	group: {type: ObjectId, ref: 'Wsgp'},

	/* 1 */
	code: String,	// 本公司唯一

	material: String,
	width: String,

	nome: String,

	sizes: [{type: Number}],
	prodcls: [{type: ObjectId, ref: 'Product'}],

	priceIn: {type: Float, default: 0},
	price: Float,

	photo: { type: String, default: '/upload/product/1.jpg' }, // 2

	/* 2 */
	color: String,
	prodszs: [{type: ObjectId, ref: 'Product'}],
	/* 3 */
	prodcl: {type: ObjectId, ref: 'Product'},
	size: Number,
	stock: Number,

	sells: [{
		order: {type: ObjectId, ref: 'Order'},
		quot: Number,
	}],
	sellQuot: {
		type: Number,
		default: 0
	},
	
	/* 2 */  /* 3 */
	product: {type: ObjectId, ref: 'Product'},

});

module.exports = mongoose.model(colection, dbSchema);