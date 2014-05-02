/*global define */
define([
	'rawgithub/src/js/backbone-infinite-list',
	'rawgithub/examples/datasets/people',
	'tpl!rawgithub/examples/html/people.html'
], function (InfiniteList,
				  peopleData,
				  peopleTpl) {

	'use strict';

	var ScrollablePeople = InfiniteList.extend({

		getSingleElementTemplate : function () {
			return peopleTpl;
		},

		getData : function () {
			return peopleData.toJSON();
		},

		displayNewElementAlert : function () {

		}


	});

	return ScrollablePeople;
});
