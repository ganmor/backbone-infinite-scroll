Backbone-Infinite-List
===============================

A backbone view with infinite scroll ( that really works on mobile )
Works with either scrolling the window or a div althought it's nicer on a div.


NOTICE: Code is in working Draft.
Scroll on the window is not implemented (You can only use overflow scroll / webkit-overflow scroll )

WARNING : Still buggy when going up in the list, will fix this asap

Works smoothly on Android 4+;
iOs 5+;

Demo Available Here : http://ganmor.github.io/backbone-infinite-list/


How to use :
-------------


* Extends InfiniteList View

```

var ScrollableImpl = InfiniteList.extend({ });

```

* Implement the following methods


```
// You must implement the following methods
getSingleElementTemplate : function () {
	// Template for a single element
},
getData : function () {
	// The full list of elements that will be rendered
},
displayNewElementAlert : function () {

}
 ```

* Render the list



```
var scrollableInstance = new ScrollableImpl();
scrollablePeople.setElement(theDivToRenderTheListInto);
scrollableInstance.render();

```

How it works
-----------


Installation :
-------------

Bower :

Developement :
-------------

Clone repo and run
bower install
