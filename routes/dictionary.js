var Dictionary = require('../models/Dictionary');
var negativeWords = require('../dictionary/negative.json');
var stem = require('czech-stemmer');

exports.addVocabulary = function(req, res) {
	var newVocabulary = stem(req.body.vocabulary);
	var lang = req.query.lang ? req.query.lang : 'cs';
	saveToDatabase(newVocabulary, lang, function(err) {
		if (err) return next(err);
		res.send(201, 'Successfully added.');
	});

}


exports.initDictionary = function(req, res) {
	for (var i = 0; i < negativeWords.cs.length; i++) {
    console.log(stem(negativeWords.cs[i]));
    saveToDatabase(stem(negativeWords.cs[i]), 'cs', function(err) {
  		if (err) return next(err);
  		res.send(201, 'Successfully added.');
  	});
	}
}

function saveToDatabase(newVocabulary, lang, callback) {
	Dictionary.findOneAndUpdate({
		language: 'cs'
	}, {
		$push: {
			vocabulary: newVocabulary
		}
	}, callback);
}
