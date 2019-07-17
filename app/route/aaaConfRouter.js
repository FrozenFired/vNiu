module.exports = function(app){
	require('./aderRouter')(app);

	require('./aaRouter')(app);
	require('./wsbsRouter')(app);
	require('./wssfRouter')(app);
	require('./wsptRouter')(app);
};