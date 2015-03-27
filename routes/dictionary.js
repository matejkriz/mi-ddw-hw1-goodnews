var Dictionary = require('../models/Dictionary');

exports.addVocabulary = function(req, res) {
	var newVocabulary = req.body.vocabulary;
	var lang = req.query.lang ? req.query.lang : 'cs';
	Dictionary.findOneAndUpdate({
		language: 'cs'
	}, {
		$push: {
			vocabulary: newVocabulary
		}
	}, function(err) {
		if (err) return next(err);
		res.send(201, 'Successfully added.');
	});
}
