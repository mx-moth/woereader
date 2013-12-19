WOE = window.WOE || {};

WOE.infiniteScroll = (function($){
	"use strict";
	var appendID = '#itemWrapper';
	var context = {};
	var itemClass = '.item';
	var loading = false;
	var newPage;
	var pageID = '#newPage';
	var postClean = function(){ $('#previousPage').remove(); };
	var preClean = function(){ $('#nextPage').remove(); };
	var replaceID = '#allItemsForm';

	var init = function() {
		$(window).on('load resize scroll', loadMore);
	}

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
		//Ensure we know which page to grab
		var newPage = $(pageID).val();
		var currContext = context;
		currContext.page = newPage;
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
			//Add captions for any new items retrieved
			loading = false;
			//Check that we've fetched enough content
			loadMore();
		};
		WOE.djajax("", currContext, update);
	};

	var setPostClean = function(newCleaner){
		postClean = newCleaner;
	};

	return {
		init: init,
		loadMore: loadMore,
		postClean: setPostClean,
	};
})(jQuery);
