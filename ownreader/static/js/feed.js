//---------------------------------Page Setup----------------------------------
var selected;
$(document).ready(prepare);

function prepare() {
	addCaptions();
	setupExpansion();
	setupHotkeys();
	
	$('body').addClass('js');
	
	//Makes small-screened devices ignore starting state of sidebar
	if($('#smallscreen').css('visibility')=='visible')
		$('#wrapper').removeClass('sidebar');
}


//-----------------------------UI  setup functions-----------------------------
//Expand the first item if in collapsed-view
function setupExpansion(){
	selected = $('.item').first();
	selected.addClass('selected');

	if($('#wrapper').hasClass('collapse'))
		showItem($(selected));
}

//Add hotkeys/gestures for non-touch/mouse interaction
function setupHotkeys(){
	$(document).keyup(function(e){
		var code = e.keyCode || e.which;
		switch(code){
			case 78:
				nextItem();
				break;
			case 80:
				previousItem();
				break;
			case 86:
				openItem();
				break;
		}
	});
	$('.item').on("swipeleft", nextItem);
	$('.item').on("swiperight", previousItem);
}


//-------------------------------UI Interactions-------------------------------
//Expand the next item on the page, hide the current, mark it as read
function nextItem(){
	if(!$(selected).hasClass('read'))
		markAsRead(selected);
	else
		hideItem(selected);
	if(!($(selected).is(":last-child"))){
		selected.removeClass('selected');
		selected = $(selected).next('.item');
		selected.addClass('selected');
		showItem(selected);
	}
	loadMore();
}

//Expand the previous item on the page, hide the current
function previousItem(){
	if(!($(selected).is(":first-child"))){
		hideItem(selected);
		selected.removeClass('selected');
		selected = $(selected).prev('.item');
		selected.addClass('selected');
	}
	showItem(selected); //If there is only one item, toggles collapsing
}

//Opens the url of the currently selected item in a new tab
function openItem(){
	window.open($(selected).find('.item_title a').attr('href'));
}

//Show/hide the sidebar
function sidebarToggle(){
	if($('#wrapper').hasClass('sidebar'))
		$('#wrapper').removeClass('sidebar');
	else
		$('#wrapper').addClass('sidebar');
	
	//Deselect the Button
	$('#sidebarToggle').blur();
	
	//Only change the preference if both can be seen at once
	if($('#smallscreen').css('visibility')!='visible')
		djajax('toggleSidebar', {showSidebar: 'toggle'});
}

//Show/hide items
function toggleShow(itemId){
	var item = '#' + itemId;
	if($(item).hasClass('collapsed'))
		showItem(item);
	else
		hideItem(item);
}

function showItem(item){
	$(item).find('.hider').text("-");
	$(item).removeClass('collapsed');
}

function hideItem(item){
	$(item).find('.hider').text("+");
	$(item).addClass('collapsed');
}


//-------------------------Appearance fixer functions--------------------------
//Remove the reqirement for mousing-over to get the mouse-over text from comics
function addCaptions(){
	var imgs = $('.item').find('img[title]').not('.alttaken');
	imgs.each(function(){
		curImg = $(this);
		curImg.parent().append(
			"<div class=\"alttext\">" + curImg.attr('title') + "</div>");
		curImg.addClass('alttaken');
	});
}


//------------------------------AJAX functions---------------------------------
function toggleRead(itemId){
	var item = '#' + itemId;
	if($(item).hasClass('read'))
		markAsUnread(item);
	else
		markAsRead(item);
}

function markAsRead(item){
	djajax("toggleRead", { id: $(item).attr('id'), read: "True" });
	$(item).addClass('read');
	hideItem(item);
}

function markAsUnread(item){
	djajax("toggleRead", { id: $(item).attr('id'), read: "False" });
	$(item).removeClass('read');
}

function markAllAsRead(){
	items = $("#allItemsForm").serialize();
	djajax("markRead", items);
	items = $('.item').not('.read');
	items.addClass('read');
	hideItem(items);
}
