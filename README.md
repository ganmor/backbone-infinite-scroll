Backbone-Infinite-Scroll
===============================

A backbone view with infinite scroll ( that really works on mobile )


NOTICE: Code is in working Draft.
There is still some work to to on edge detection and edge cases.

Demo Available Here : 
- Example 1 : 1500 elements dataset : http://ganmor.github.io/backbone-infinite-scroll/
- Example 2: 10000 elements dataset : TODO

Tested on firefox, Chrome 34, Android Chrome 34, Safari iOS6 - iOS7 


TODO: 
- Remove dependency to jQuery
- DEFAULT_ITEM_HEIGHT, MARGIN_OUT_SCREEN, MARGIN_BOTTOM should be customizable


Why 
------
- Because the browser does not like when there are too many elements in the dom.
- Because mobile browsers *really* don't like when there are too many elements in the dom.


What you can do
------

- You can render virtually infinite list of items without having to worry about pagination.
- You can have elements in the list dynamically updated.
- You can add elements at the bottom of the list  while you scroll.
- You can add elements at the top of the list ( Meaning you can build news Feeds *)
- You can start requesting elements from your server at any given position.

What you can't do
------

- You can not add elements in the middle of the list while scrolling. ( You would loose you scroll position )
- You cannot go back to a previous scroll position easely.
- Backone infinite-scroll does not take care of fetching the data, you'll have to do this yourself


How it works
-----------

The basics : 

Elements are only rendered where your viewport is ( With a little margin at the top and the bottom ).
The rendered elements are translated from the top of the list with css translate, at the position they should have been if the whole list had been rendered

In details

On first render, it creates an element with a size that takes the full size the list would have taken. 
(This is based on a approxiation of the line height, you have to define that size)

Then, backbone-infinite-list start checking your scroll position.

The method repositionList is all where the magic happen. You can call it regulary, like it is done in the example, or only when a scroll event is triggered. Threre are three cases :

- You are scrolling up and the new position of the list would overlap the previous one
- You are scrolling down and the new position of the list would overlap the previous one
- There is no list rendered around this scroll position, you render at an approximate position in the list


When you go down the list, backbone infinite list add items to end of the list and virtualy compute the new position of your rendered element. When you start scrolling slower or when you stop



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


Installation :
-------------

Bower :

Developement :
-------------

Clone repo and run
bower install
