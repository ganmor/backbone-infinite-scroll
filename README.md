Backbone-Infinite-List
===============================

A backbone view with infinite scroll ( that really works on mobile )
Works with either scrolling the window or a div althought it's nicer on a div.


NOTICE: Code is in working Draft.
Scroll on the window is not implemented (You can only use overflow scroll / webkit-overflow scroll )


Demo Available Here : http://ganmor.github.io/backbone-infinite-list/



Works smoothly on Android 4+;
iOs 5+;


See demos here

Use :
-------------
Example Using requirejs to load files :

```
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
```




Installation :
-------------

Bower :

Developement :
-------------

Clone repo and run
bower install
