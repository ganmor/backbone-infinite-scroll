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



Why 
------
Because the browser does not like when there is too much elements in the dom
Because mobile browsers *really* don't like when there is too much elements in the dom.


What you can do
------

What you can't do
------

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

The basics

On first render, it creates an element with a size that takes the full size the list would have taken and the list start checking your scroll position.
(This is based on a approxiation of the line height, you have to define that size)

The method repositionList is all where the magic happen. You can call it regulary, like it is done in the example, or only when a scroll event is triggered. 

- You are scrolling up and the new position of the list would overlap the previous one
- You are scrolling down and the new position of the list would overlap the previous one
- There is no list rendered around this scroll position


When you go down the list, backbone infinite list add items to end of the list and virtualy compute the new position of your rendered element. When you start scrolling slower or when you stop

IN details



Installation :
-------------

Bower :

Developement :
-------------

Clone repo and run
bower install
