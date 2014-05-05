/*global define */
define([
	'rawgithub/src/js/backbone-infinite-list',
	'rawgithub/examples/datasets/tweets',
	'tpl!rawgithub/examples/html/tweet.html'
], function (InfiniteList,
				  peopleData,
				  peopleTpl) {

	'use strict';

	var ScrollablePeople = InfiniteList.extend({

		getSingleElementTemplate : function () {
			return peopleTpl;
		},

		getData : function () {
			return this.collection.toJSON();
		},

		displayNewElementAlert : function () {

		}

	});

	return ScrollablePeople;
});
