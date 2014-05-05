/*global define, document, window */
/*jslint nomen :true */
define([
	"jquery",
	"underscore",
	"backbone",
	"tpl!rawgithub/src/html/backbone-infinite-list.html",
	"css!rawgithub/src/css/backbone-infinite-list.css"
], function ($,
					_,
					Backbone,
					template) {

	'use strict';

	//
	//	Privates props and methods
	//

	var PROPS = ["-moz", "-o", "-webkit", "-ms"], TRANSFORM_PREFIX, TRANSFORM_ORIGIN_PREFIX, testDiv = document.createElement('div'),

		DEFAULTS = {},

		getWindowHeight = function () {
			return $(window).height();
		},

		nextFrame = (function () {
			return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame || function (callback) {
					return window.setTimeout(callback, 1);
				};
		})(),
		cancelFrame = (function () {
			return window.cancelRequestAnimationFrame ||
				window.webkitCancelAnimationFrame ||
				window.webkitCancelRequestAnimationFrame ||
				window.mozCancelRequestAnimationFrame ||
				window.oCancelRequestAnimationFrame ||
				window.msCancelRequestAnimationFrame ||
				window.clearTimeout;
		})();


	PROPS.forEach(function (prop) {

		var browserPrefix, testProp;

		function cap(str) {
			return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
		}

		browserPrefix = prop;
		testProp = cap(browserPrefix.slice(1, prop.length));
		testDiv.style[testProp + "Transition"] = "all 1s ease";
		if (testDiv.style[testProp + "TransitionProperty"]) {
			TRANSFORM_PREFIX = browserPrefix + "-transform";
			TRANSFORM_ORIGIN_PREFIX = browserPrefix + "-transform-origin";
		}
	});



	// Default Configuration
	DEFAULTS.DEFAULT_ITEM_HEIGHT = 50;
	DEFAULTS.MARGIN_BOTTOM = 60;
	DEFAULTS.MARGIN_OUT_SCREEN = 5 * DEFAULTS.DEFAULT_ITEM_HEIGHT;

	//
	//	Implementation
	//

	return Backbone.View.extend({


		///
		///	Public Methods
		///


		setElement : function (element) {
			this.$el = element;
		},

		getScroll : function () {
			if (this.isWindowScroll) {
				return Math.max($(window).scrollTop(), $(window).scrollTop() - this.initialOffsetTop);
			} else {
				return this.$el.scrollTop();
			}
		},

		scrollTo : function (value) {

			if (this.isWindowScroll) {
				$(window).scrollTop(value);
			} else {
				this.$el.scrollTop(value);
			}


		},

		render : function () {
			this._initialize();
			this._domReady();
		},

		reRender : function () {
			this._initialize();
			this._domReady();
		},


		//
		//	Interface, Must be imple
		//
		getSingleElementTemplate : function () {
			throw new Error('The delegate must implement the getSingleElementTemplate method');
		},

		displayNewElementAlert : function () {

			if (!this.newElementsView) {
				throw new Error("newElementsView is no defined in scrollableview impl, it is needed to display a banner when new elements arrive");
			}

			this.hasNewElements = true;

			// Display an alert
			this.newElementsView.show();
		},

		/**
		*	Return the elements that the list will be rendering
		**/
		getData : function () {
			throw new Error("You must implement getData, this method should return the full list of element that have to be rendered");
		},

		//
		//	Internal Methods, not meant to be overriden
		//

		_initialize: function (config) {

			var fragmentHtml, elementsHeight;

			config = config || {};

			this._configuration = _.extend(DEFAULTS, config);

			this.ItemHeight = this._configuration.DEFAULT_ITEM_HEIGHT;
			this.nbItemRenderedOffScreen = 8;
			this.initialOffsetTop = this.$el.offset().top;

			this.viewPortHeight = getWindowHeight() - this.$el.offset().top - this._configuration.MARGIN_BOTTOM;

			this.elementsList = this.getData();

			fragmentHtml = template.call(this, {});

			this.hasNewComments = false;
			this.newCommentsNumber = 0;

			this.$el.html(fragmentHtml);


			elementsHeight = $(window).height() - this.$el.offset().top;

			this.$el.css("height", elementsHeight + "px");
			this.$el.css("overflow-y", "scroll");
			this.$el.css("-webkit-overflow-scrolling", "touch");

			this.initialStartIdx = 0;
			this.initialEndIdx = 35;
			this.hasNewElements = false;

			this.numberOfItemRendered = this.initialEndIdx - this.initialStartIdx;

			// Reset
			this.startIdx = undefined;
			this.endIdx = undefined;
			this.offsetTop = undefined;
			this.offsetBottom = undefined;
			this.oldScroll = undefined;
			this.listCurrentHeight = undefined;
			this.isWindowScroll = false;

			// TODO: this should be computed acording to viewport height
			this.parentListContainer = $(".js-infinite-sizer", this.$el);
			this.listContainer = $(".js-infinite-list-container", this.$el);
			this.listSizer = $(".js-infinite-sizer", this.$el);
			this.outOfScreenBuffer = $(".js-out-of-screen-buffer", this.$el);

			this.offsetTop = 0;
			this.oldScroll = this.getScroll();

			// Rerender does an apporximate insertion to the correct position
			this.approximateInsertion(this.getScroll());
		},


		_render : function (startIdx, endIdx) {

			var instance_ = this,
				fullLength,
				restoredScroll;

				// Handle no element

				/* TODO: Restore previous scroll
				if (typeof startIdx == 'undefined' && typeof endIdx == 'undefined') {
					restoredScroll = instance_.f_context.get("lastScroll") ? instance_.f_context.get("lastScroll") : 0;
					this.approximateInsertion(restoredScroll);
					return;
				}
				*/

			startIdx = startIdx - this.nbItemRenderedOffScreen;
			endIdx = endIdx + this.nbItemRenderedOffScreen;


			fullLength = this.elementsList.length;
			(startIdx <= 0) ? (startIdx = 0) : startIdx = startIdx;
			(endIdx >= fullLength) ? (endIdx = fullLength) : endIdx = endIdx;


			this.listSizer.height(this.getListFullHeight() + "px");


			this.updateDomWithElements(this.elementsList.slice(startIdx, endIdx));
			this.updateListLimits(this.listContainer.height(), null);

			this.startIdx = startIdx;
			this.endIdx = endIdx;

		},

		_domReady : function () {
			var instance_ = this;

			if (this.onAfterDisplay) {
				this.onAfterDisplay();
			}


			if (this.onDomReady) {
				this.onDomReady();
			}

			function repos() {
				nextFrame(function () { instance_.rePositionList.call(instance_, instance_.getScroll()); });
			}

			if (this.currentInterval) {
				window.clearInterval(this.currentInterval);
			}


			this.currentInterval =  window.setInterval(repos, 50);

		},


		/**
		 * Update the rendering of an element in the list
		 * If it is not displayed, do nothing
		 * If it is, compute it's size
		 */
		updateListElement: function (element, elements) {

			// Maybe use request animation frame here
			var renderedElements, found, elementHtml, inDomEl, oldHeight, jqel;

			if (!this.elementsList || this.elementsList.length === 0) {
				return;
			}


			renderedElements = this.elementsList.slice(this.startIdx, this.endIdx);
			found = _.find(renderedElements, function (el) {
				return element.id === el.id;
			});

			if (!found || this.shouldDelayReRender ) {
				// Not currently in the list, no rerender
			} else {
				elementHtml = this.generateListElementHtml(found);
				inDomEl = this.$el.find(".infinite-scroll-container[data-item-id='" + found.id + "']");
				oldHeight = inDomEl.height();

				jqel = $(elementHtml);
				jqel.addClass("render-hardware-accelerated");
				this.listCurrentHeight =  this.listCurrentHeight - oldHeight;
				inDomEl.replaceWith(jqel);
				this.listCurrentHeight = this.listCurrentHeight  + jqel.height();
			}
			return jqel;
		},



		/**
		 * Replace the currently rendred elements with new ones
		 */
		updateDomWithElements: function (toBeRendered) {

			var instance_ = this;
		   var newListContainer = "<div style=\"position:absolute;width:100%;"+TRANSFORM_ORIGIN_PREFIX+":0px 0px;"+TRANSFORM_PREFIX+":translate(0," + this.offsetTop + "px)\" class=\"js-infinite-list-container infinite-feed-container\">";

			newListContainer += "<div class=\"js-out-of-screen-buffer infinite-feed-container\" style=\"background:#FAFAFA;width:100%;"+TRANSFORM_PREFIX+":translate(0,0,0)\"></div>";
			_.each(toBeRendered, function (model) {
				newListContainer += instance_.generateListElementHtml(model);
			});
			newListContainer += "</div>";

			var oldListReference = this.parentListContainer.children();
			this.parentListContainer.prepend($(newListContainer));
			oldListReference.remove();

			this.outOfScreenBuffer = $(".js-out-of-screen-buffer", this.$el);
			this.listContainer = $(".js-infinite-list-container", this.parentListContainer);

			if (this.onDomReady)
				this.onDomReady();

		},

		/**
		 * Get the index of the first comment idx currently on screen
		 */
		getFirstDisplayedCommentIdx : function(){

			var instance_ = this;
			var searchTimes = 0;
			var maxSearchTime = 5;

			/**
			 * Sometimes thre is no element at the search position
			 * So we just retry..
			 */
			var searchForElement = function(ypos){
				// TODO: This should be computed and  not read from the dom
				var element = document.elementFromPoint(50, ypos);
				var parentComment = $(element).parents(".infinite-feed-comment");
				var parentCommentId = parentComment.attr("data-item-id");
				var comment = instance_.commentsCollection.get(parentCommentId);

				searchTimes++;
				if (comment){
					return comment;
				} else if(  !comment && searchTimes < maxSearchTime  ) {
					return searchForElement( ypos+5 );
				} else {
					return null;
				}

			}

			var comment = searchForElement(95);
			if (!comment)
				return 0;

			var idx = _.indexOf( this.elementsList, comment);
			return idx;
		},


		getScrollTopPosition : function(){

		},


		/**
		 * Reposition the ist according to the new scroll
		 * @param newScroll
		 */
		rePositionList: function (newScroll) {

			var isGoingUp = newScroll < this.oldScroll;
			var isGoingDown = newScroll > this.oldScroll;

			var isBeforeTop = (newScroll < (this.offsetTop - this.viewPortHeight / 3));
			var isAfterBottom = (newScroll > (this.offsetBottom + this.viewPortHeight / 3));

			var hasReachedTopOfTheList = (this.startIdx == 0);
			var hasReachedBottomOfTheList = (this.endIdx == (this.elementsList.length));

			this.oldScroll = newScroll;

			if (isGoingUp && hasReachedTopOfTheList && this.startIdx == 0) {
				return;
			}

			if (isGoingDown && hasReachedBottomOfTheList) {
				return;
			}


			if ((isBeforeTop || isAfterBottom )) {
				this.approximateInsertion(newScroll);
			} else if (isGoingDown) {
				this.repositionListDown(newScroll);
			} else if (isGoingUp) {
				this.repositionListUp(newScroll);
			}

		},


		/**
		 * Moves the list rendering up
		 */
		 repositionListUp: function (newScroll) {

			var targetOffsetTop, move, willReachTop, isTooCloseToBottom;


				 // Check if the bottom of the list is not too close
				 isTooCloseToBottom = this.offsetBottom < newScroll + this.viewPortHeight +  ( this._configuration.MARGIN_OUT_SCREEN / 2)

				 // Where we want the new offset top to be
				 targetOffsetTop = newScroll - this._configuration.MARGIN_OUT_SCREEN * 2;

				 // Compute the move
				 move =  Math.max( (this.offsetTop - targetOffsetTop) / this._configuration.DEFAULT_ITEM_HEIGHT, 0);

				 // Beginning of line
				 willReachTop = (this.startIdx-move) <= 0;

				 if ((!isTooCloseToBottom && move>3) || willReachTop) {

					 move = Math.min(move, this.startIdx); // Easy one

					 var scrollDiff = newScroll - this.oldScroll;

					 this.addItemsUp(move, scrollDiff);
					 this.removeItemsDown(move);
					 this.reposItems();

				 }

		 },



		 /**
		  * var scrollDiff = newScroll - this.oldScroll;
		  * Moves the list rendering down
		  */
		 repositionListDown: function (newScroll) {
			 var instance_, targetOffsetBottom, move, maxMove, isTooCloseToTop, willReachedBottom;
			 instance_ = this;

			 // Check if top of the list is not too close
			 isTooCloseToTop = ( newScroll - this.offsetTop ) < (this._configuration.MARGIN_OUT_SCREEN / 2);

			 // Where list is supposed to end now
			 targetOffsetBottom = newScroll + this.viewPortHeight + this._configuration.MARGIN_OUT_SCREEN;


			 // Now we can compute the desired move
			 move = Math.max( (targetOffsetBottom - this.offsetBottom) / this._configuration.DEFAULT_ITEM_HEIGHT , 0);

			 // Another move
			 willReachedBottom = (this.endIdx+move) >= this.elementsList.length;


			 if ((!isTooCloseToTop && move>3) || willReachedBottom) {
				 move = Math.min(move, (this.elementsList.length) - this.endIdx);
				 this.addItemsDown(move);
				 this.removeItemsUp(move);
				 this.reposItems();
			 }
		 },


		 /**
		  *
		  */
		 addElementToList: function (collection, elements) {

			 // No elements, nothing to do
			 if (!elements || elements.length <= 0)
				 return;

			 var toBeRenderedElements = this.getData(elements);
			 if ((toBeRenderedElements && toBeRenderedElements.length >= 0) && (this.getScroll() < (this.viewPortHeight / 3))) {

				 if (this.shouldDelayReRender) {
					 this.reRenderRequired = true;
				 } else {
					 // FIXME: At least 15 comments ?
					 if (this.isCommentBeforeLastRenderedIndex()) {
						 this.reRender();
					 }
				 }

			 } else {
				 this.displayNewElementAlert(elements);
			 }

		 },


		 isCommentBeforeLastRenderedIndex : function(){
			 return true;
		 },

		 /**
		  * Warning this is an approximation of the total length of the items
		  * Used in the sizer
		  */
		 getListFullHeight: function () {
			 var fullLength = this.elementsList.length;
			 return (fullLength * this.ItemHeight) || 0;
		 },


		 /**
		  *
		  * Remove a certain number of items at the beginning of the list
		  *
		  */
		 removeItemsUp: function (number) {

			 var instance_ = this;
			 var itemsToRemove = this.elementsList.slice(this.startIdx, (this.startIdx + number));
			 var removeArray = [];
			 _.each(itemsToRemove, function (item) {
				 removeArray.push($("[data-item-id='" + item.id + "']", instance_.$el));
			 });

			 var representativeHeight = instance_.getItemsListHeight(removeArray);
			 this.updateListLimits((this.listCurrentHeight - representativeHeight), this.offsetTop + representativeHeight);
			 this.updateStartAndEnd(0, 0, number, 0);
		 },


		 /**
		  * Provided a list of items return their length
		  */
		 getItemsListHeight: function (elementsList) {
			 var size = 0;
			 _.each(elementsList, function (rendering) {
				 try {
					 size += $(rendering).outerHeight(true);
				 } catch (e) {
					 console.log("test");
				 }

			 });
			 return size;
		 },


		 /**
		  * Render one list item
		  *  @return html string
		  */
		 generateListElementHtml : function (element) {
			 return this.getSingleElementTemplate().call(this, element);
		 },

		 /**
		  * @return A list of elements, rendered as html
		  */
		 renderElements: function (toBeRendered) {
			 var html = "";
			 var instance_ = this;
			 _.each(toBeRendered, function (model) {
				 html += instance_.generateListElementHtml(model);
			 });
			 return html;
		 },

		 renderOutOfScreen: function (toBeAdded) {

			 this.translateElement(this.outOfScreenBuffer, 0, -10000);
			 var wrapper = this.outOfScreenBuffer;

			 this.translateElement(wrapper, 0, -10000);

			 var html = this.renderElements(toBeAdded);
			 wrapper.html(html);
			 return wrapper.children();
		 },


		 /**
		  *
		  * Remove a certain number of items at the end of the list
		  *
		  */
		 removeItemsDown: function (number) {

			 var instance_ = this;
			 var itemsToRemove = this.elementsList.slice(this.endIdx - number, this.endIdx);
			 var removeArray = [];
			 _.each(itemsToRemove, function (item) {
				 removeArray.push($("[data-item-id='" + item.id + "']", instance_.$el));
			 });

			 var representativeHeight = instance_.getItemsListHeight(removeArray);
			 //console.log("Remove " + number + "items down, represent " + representativeHeight );
			 this.updateListLimits((this.listCurrentHeight - representativeHeight), this.offsetTop);
			 this.updateStartAndEnd(0, 0, 0, -number);
		 },

		 /**
		  *	Add a certain number of elements at the bottom of the list
		  *	Compute new rendering indexes
		  *	Update the offsetBottom value and the list height value once added
		  */
		 addItemsDown: function (number) {

			 var instance_ = this;
			 var startRenderIdx = this.endIdx;
			 var endRenderIdx = this.endIdx + number;

			 var toRender = this.elementsList.slice(startRenderIdx, endRenderIdx);
			 var rendering = $(this.renderElements(toRender));


			 this.updateStartAndEnd(0, number, 0, 0);
			 this.listContainer.append(rendering);


			 var representativeHeight = this.getItemsListHeight(rendering),
			 newListHeight = this.listCurrentHeight + representativeHeight;

			 this.updateListLimits(newListHeight, null);

			 this.checkMainDivLimits();

		 },

		 checkMainDivLimits: function () {

			 // Real correction
			 var tooMuchDistanceBottom = (this.offsetTop + this.getListFullHeight()) > this.listSizer.height();
			 var tooMuchDistanceTop = this.offsetTop <= 0;
			 var missingDistanceTop = this.offsetTop > 0 && (this.startIdx == 0);
			 var missingDistanceBottom = (this.offsetBottom < this.listSizer.height()) && (this.endIdx < this.elementsList.length - 1);

			 if (tooMuchDistanceBottom) {

				 	// TODO

			 } else if (tooMuchDistanceTop) {

 					// TODO

			 } else if (missingDistanceTop) {

					// TODO

			 } else if (missingDistanceBottom) {

				 	// TODO

			 }

			 if (!tooMuchDistanceBottom && !tooMuchDistanceTop && !missingDistanceTop && !missingDistanceBottom) {
				 // Thre are no correction to be done for this rendering phase
				 // Approximate corrections
				 var suspectMissingDistanceBottom = false; // Remaining list down is very big and distance is very small ( 5 * itemheight < distance left)
				 var suspectMissingDistanceTop = false;
				 var suspectTooMuchDistanceBottom = false;
				 var tooMuchDistanceBottom = false;
			 }


			 if (missingDistanceBottom > 0) {
				 this.listSizer.height((this.getListFullHeight() + missingDistanceBottom +  this.initialOffsetTop ) + "px");
			 }

		 },


		 /**
		  * Virtually add items at the top of the list
		  * Compute new rendering indexes
		  * Compute space that those items wouuld have taken
		  */
		 addItemsUp: function (number, scrollDiff) {
			 // TODO: Update indexes etc..
			 // Render in a buffer the
			 var instance_ = this;

			 var startRenderIdx = this.startIdx - number;
			 var endRenderIdx = this.startIdx;

			 var toRender = this.elementsList.slice(startRenderIdx, endRenderIdx);

			 var elements = this.renderOutOfScreen(toRender);
			 var representativeHeight = this.getItemsListHeight(elements);
			 this.translateElement(this.outOfScreenBuffer, -representativeHeight, -10000);

			 this.updateStartAndEnd(-number, 0, 0, 0);
			 this.updateListLimits((this.listCurrentHeight + representativeHeight), this.offsetTop - representativeHeight);

			 if (this.startIdx == 0 && this.offsetTop > 1 ) {
				 this.scrollTo( 0 );
				 this.approximateInsertion(0);
				 return;
			 }

			 // We have been too far down, will blink but understandable
			 if (this.offsetTop < 0) {
				 this.offsetTop = 0;
			 }

			 return true;
		 },

		 updateListLimits: function (listCurrentHeight, offsetTop) {

			 if (!_.isUndefined(listCurrentHeight) && !_.isNull(listCurrentHeight))
				 this.listCurrentHeight = listCurrentHeight;

			 if (!_.isUndefined(offsetTop) && !_.isNull(offsetTop))
				 this.offsetTop = offsetTop;


			 this.offsetBottom = this.offsetTop + this.listCurrentHeight;

		 },

		 /**
		  * Execute only if there was no call in the previous 50 ms
		  */
		 reposItems: _.debounce( function () {
			 var instance_ = this;
			 // Upload to the gpu, at the next frame, replace old bitmap with the new one
			 nextFrame(function () {
				 var toBerendered = instance_.elementsList.slice(instance_.startIdx, instance_.endIdx);
				 instance_.updateDomWithElements.call(instance_, toBerendered);
			 });
		 }, 50 ),



		 /**
		  * Update the borders
		  */
		 updateStartAndEnd: function (numberToAddStart, numberToAddEnd, numberToRemoveStart, numberToRemoveEnd) {
			 this.startIdx = this.startIdx + numberToAddStart + numberToRemoveStart;
			 this.endIdx = this.endIdx + numberToAddEnd + numberToRemoveEnd;

			 var fullLength = this.elementsList.length;
			 (this.endIdx >= fullLength) ? (this.endIdx = fullLength) : (this.endIdx = this.endIdx);
			 if (this.startIdx < 0) this.startIdx = 0;

		 },


		 /**
		  * Generate a rendering of the list based on an approximation of the list item's height
		  * @param, the new target scroll
		  */
		 approximateInsertion: function (newScroll) {

			 var fullLength, fullSize, startPosition, endPosition;

			 fullLength = this.elementsList.length;
			 fullSize = fullLength * this.ItemHeight;
			 startPosition = Math.round((newScroll * fullLength) / fullSize);
			 endPosition = Math.round(startPosition + this.numberOfItemRendered);

			 this.offsetTop = newScroll - this.viewPortHeight;
			 this.offsetTop <= 0 ? (this.offsetTop = 0) : (this.offsetTop = this.offsetTop);

			 this._render(startPosition, endPosition);
		 },

		 translateElement: function (el, y, x) {
			 el.css(TRANSFORM_PREFIX, "translate(" + (x || 0) + "px," + y + "px)");
		 }


	});

});
