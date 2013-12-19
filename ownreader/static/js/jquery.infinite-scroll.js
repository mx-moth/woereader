WOE = window.WOE || {};

WOE.infiniteScroll = ( function($) {
	"use strict";
	var appendID;
	var context;
	var itemClass;
	var loading;
	var newPage;
	var pageID;
	var postClean;
	var preClean;
	var replaceID;

	var init = function(newAppend, newContext, newItem, newPageID,
						newPreClean, newPostClean, newReplace) {
		appendID  = newAppend    || '#itemWrapper';
		context   = newContext   || {};
		itemClass = newItem      || '.item';
		pageID    = newPageID    || '#newPage';
		postClean = newPostClean || function(){ $('#previousPage').remove(); };
		preClean  = newPreClean  || function(){ $('#nextPage').remove(); };
		replaceID = newReplace   || '#allItemsForm';
		loading   = false;
		$(window).on('load resize scroll', loadMore);
	};

	//Grab the next page's items if 5th-to-last item is in view
	var loadMore = function() {
		//Stop the function if we're already loading new items
		if(loading)
			return;
		//Stop the function if there's nothing to load
		if($(pageID).length == 0)
			return;
		//Stop the function if the 5th-to-last item is not in view
		var itemToCheck = $(itemClass).get(-5);
		if(!WOE.isElementVisible(itemToCheck))
			return;
		loading = true;
		//Ensure we know which page to grab
		newPage = $(pageID).val();
		var currContext = context;
		currContext.page = newPage;
		//Replaces the formset with the new one, appends the new items
		var update = function(data, textStatus, xhr) {
			var $response = data;
			var formset = $('<div />').html(data).find(replaceID).html();
			var newItems = $('<div />').html(data).find(appendID).html();
			//Remove the new page loader form
			preClean();
			//Add the new items
			$(replaceID).html(formset);
			$(appendID).append(newItems);
			//Remove the previous page loader form
			postClean();
			//Add captions for any new items retrieved
			loading = false;
			//Check that we've fetched enough content
			loadMore();
		};
		WOE.djajax("", currContext, update);
	};

	var setAppendID = function(newAppend) {
		appendID = newAppend;
	};

	var setContext = function(newContext) {
		context = newContext;
	};

	var setItemClass = function(newItem) {
		itemClass = newItem;
	};

	var setPageID = function(newPageID) {
		pageID = newPageID;
	};

	var setPostClean = function(newCleaner) {
		postClean = newCleaner;
	};

	var setPreClean = function(newCleaner) {
		preClean = newCleaner;
	};

	var setReplaceID = function(newReplace) {
		replaceID = newReplace;
	};

	return {
		init: init,
		loadMore: loadMore,
		appendID: setAppendID,
		context: setContext,
		itemClass: setItemClass,
		pageID: setPageID,
		postClean: setPostClean,
		preClean: setPreClean,
		replaceID: setReplaceID,
	};
})(jQuery);
