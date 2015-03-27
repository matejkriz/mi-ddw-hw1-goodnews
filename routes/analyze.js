var tm = require('text-miner');
var Dictionary = require('../models/Dictionary');

var dict = [];
exports.analyzeNegativeness = function(items, field, callback) {
	loadDictionary('cs').then(
		function(dictionary) {
			dict = dictionary.vocabulary;
			var corpusList = [];
			for (var i = 0; i < items.length; i++) {
				corpusList[i] = new tm.Corpus(items[i][field]);
				corpusList[i]
					.trim()
					.toLower();
				items[i].negativeness = getMatchingRate(corpusList[i]);
			}
			callback(items);
		});
}

function getMatchingRate(corpus) {
	var terms = new tm.Terms(corpus);
	var termsCount = terms.vocabulary.length;
	var matchCount = 0;
	for (var j = 0; j < termsCount; j++) {
		if (dict.indexOf(terms.vocabulary[j]) > -1) {
			matchCount++;
		}
	}
	// rounded matching rate in percentages
	return Math.round(1000 * matchCount / termsCount) / 10;
}

function loadDictionary(lang, callback) {
	return Dictionary.findOne({
		language: lang
	}).exec();
}
