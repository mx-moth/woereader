window.WOE = WOE || {};

WOE.infiniteScroll = (function($){
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

	//Initialisation
	var init = function(newAppendID, newContext, newPageID, newItemClass,
			newPreClean, newPostClean, newReplaceID){
		loading = false;
		appendID = newAppendID || 'itemWrapper';
		appendID = '#' + appendID;
		context = newContext || {};
		pageID = newPageID || 'newPage';
		pageID = '#' + pageID;
		newPage = $(pageID).val();
		itemClass = newItemClass || 'item';
		itemClass = '.' + itemClass;
		preClean = newPreClean || oldPreClean;
		postClean = newPostClean || oldPostClean;
		replaceID = newReplaceID || 'allItemsForm';
		replaceID = '#' + replaceID;
		$(window).on('load resize scroll', loadMore);
		loadMore();
	};

	//Default cleaning functions
	var oldPreClean = function(){
		$('#nextPage').remove();
	};
	var oldPostClean = function(){
		$('#previousPage').remove();
	};

	//Grab the next page's items if 5th-to-last item is in view
	var loadMore = function(){
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
		//Replaces the formset with the new one, appends the new items
		var update = function(data, textStatus, xhr){
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
			//Get the value of the next page to load
			newPage = $(pageID).val();
			//Add captions for any new items retrieved
			loading = false;
			//Check that we've fetched enough content
			loadMore();
		};
		var currContext = context;
		currContext.page = newPage;
		WOE.djajax("", currContext, update);
	};

	return {
		init: init,
		loadMore: loadMore,
	}
})(jQuery);
