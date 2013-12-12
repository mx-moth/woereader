var showReadItems;
var itemsPerPage;
var newPage;
var newestItem;
var loading = false;
$(window).on('load resize scroll', loadMore);
$(document).ready(prepareScrolling);

function prepareScrolling() {
	//showRead and itemsPerPage should change only on page reload
	//newestItem is taken so that pages are calculated from there by server
	//newPage is recalculated when new content is taken in
	if($('#next_page').length != 0){
		showReadItems = $('#showRead').val();
		itemsPerPage = $('#itemsPerPage').val();
		newPage = $('#newPage').val();
		newestItem = $('.item').first().attr('id');
	}

	loadMore();
}

//Grab the next page's items if 5th-to-last item is in view
function loadMore(){
	//Stop the function if we're already loading new items
	if(loading)
		return;

	//Stop the function if there's nothing to load
	if($('#next_page').length == 0)
		return;

	//Stop the function if the 5th-to-last item is not in view
	itemToCheck = $('.item').get(-5);
	if(!isElementVisible(itemToCheck))
		return;

	loading = true;

	//Replaces the formset with the new one, appends the new items
	var update = function(data, textStatus, xhr){
		var $response = data;

		var formset = $('<div />').html(data).find('#allItemsForm').html();
		var newItems = $('<div />').html(data).find('#itemwrapper').html();

		//Remove the new page loader form
		$('#next_page').remove();
		$('#allItemsForm').html(formset);
		$('#itemwrapper').append(newItems);
		//Remove the previous page loader form
		$('#previous_page').remove();
		//Get the value of the next page to load
		newPage = $('#newPage').val();
		//Add captions for any new items retrieved
		addCaptions();
		loading = false;
		//Check that we've fetched enough content
		loadMore();
	};

	djajax(
		"",
		{	page: newPage,
			showRead: showReadItems,
			pageSize: itemsPerPage,
			adding: "True",
			newest: newestItem},
		update);
}

//Check if an element is in view
function isElementVisible(el){
		var eap,
		rect     = el.getBoundingClientRect(),
		docEl    = document.documentElement,
		vWidth   = window.innerWidth || docEl.clientWidth,
		vHeight  = window.innerHeight || docEl.clientHeight,
		efp      = function (x, y) { return document.elementFromPoint(x, y) },
		contains = "contains" in el ? "contains" : "compareDocumentPosition",
		has      = contains == "contains" ? 1 : 0x10;

	// Return false if it's not in the viewport
	if (rect.right < 0 || rect.bottom < 0
			|| rect.left > vWidth || rect.top > vHeight)
		return false;

	// Return true if any of its four corners are visible
	return (
		  (eap = efp(rect.left,  rect.top)) == el
		|| el[contains](eap) == has
		||  (eap = efp(rect.right, rect.top)) == el
		|| el[contains](eap) == has
		||  (eap = efp(rect.right, rect.bottom)) == el
		|| el[contains](eap) == has
		||  (eap = efp(rect.left,  rect.bottom)) == el
		|| el[contains](eap) == has
	);
}

