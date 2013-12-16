//---------------------------------Page Setup----------------------------------
WOE = window.WOE || {};
WOE.selected;

WOE.prepare = function() {
	WOE.addCaptions();
	
	//Setup Expansion
	WOE.selected = $('.item').first();
	WOE.selected.addClass('selected');
	if($('#wrapper').hasClass('collapse'))
		WOE.showItem($(WOE.selected));

	//Setup Hotkeys
	$(document).keyup(function(e){
		var code = e.keyCode || e.which;
		switch(code){
			case 67: //'c' -> toggle collapsing for item
				WOE.toggleShow(WOE.selected.attr('ID'));
				break;
			case 78: //'n' -> next item
				WOE.nextItem();
				break;
			case 80: //'p' -> previous item
				WOE.previousItem();
				break;
			case 82: //'r' -> toggle read for item
				WOE.toggleRead(WOE.selected.attr('ID'));
				break;
			case 86: //'v' -> view item in new tab
				window.open($(WOE.selected).find('.item_title a').attr('href'));
				break;
		}
	});
	$('.item').on("swipeleft", WOE.nextItem);
	$('.item').on("swiperight", WOE.previousItem);

	var context = {
		showRead: $('#showRead').val(),
		pageSize: $('#itemsPerPage').val(),
		adding: "True",
		newest: $('.item').first().attr('id'),
	};
	var postClean = (function(){
		$('#previousPage').remove();
		WOE.addCaptions();
	})(jQuery);
	WOE.infiniteScroll.init(null, context, null, null, null, postClean);
	
	$('body').addClass('js');
	
	//Makes small-screened devices ignore starting state of sidebar
	if($('#smallscreen').css('visibility')=='visible')
		$('#wrapper').removeClass('sidebar');
};

//-------------------------------UI Interactions-------------------------------
//Expand the next item on the page, hide the current, mark it as read
WOE.nextItem = function(){
	if(!$(WOE.selected).hasClass('read'))
		WOE.markAsRead(WOE.selected);
	else
		WOE.hideItem(WOE.selected);
	if(!($(WOE.selected).is(":last-child"))){
		WOE.selected.removeClass('selected');
		WOE.selected = $(WOE.selected).next('.item');
		WOE.selected.addClass('selected');
		WOE.showItem(WOE.selected);
	}
	WOE.infiniteScroll.loadMore();
};

//Expand the previous item on the page, hide the current
WOE.previousItem = function(){
	if(!($(WOE.selected).is(":first-child"))){
		WOE.hideItem(WOE.selected);
		WOE.selected.removeClass('selected');
		WOE.selected = $(WOE.selected).prev('.item');
		WOE.selected.addClass('selected');
	}
	WOE.showItem(WOE.selected); //If there is only one item, toggles collapsing
};

//Show/hide the sidebar
WOE.sidebarToggle = function(){
	if($('#wrapper').hasClass('sidebar'))
		$('#wrapper').removeClass('sidebar');
	else
		$('#wrapper').addClass('sidebar');
	
	//Deselect the Button
	$('#sidebarToggle').blur();
	
	//Only change the preference if both can be seen at once
	if($('#smallscreen').css('visibility')!='visible')
		WOE.djajax('toggleSidebar', {showSidebar: 'toggle'});
};

//Show/hide items
WOE.toggleShow = function(itemId){
	var item = '#' + itemId;
	if($(item).hasClass('collapsed'))
		WOE.showItem(item);
	else
		WOE.hideItem(item);
};

WOE.showItem = function(item){
	$(item).find('.hider').text("-");
	$(item).removeClass('collapsed');
};

WOE.hideItem = function(item){
	$(item).find('.hider').text("+");
	$(item).addClass('collapsed');
	WOE.infiniteScroll.loadMore();
};


//-------------------------Appearance fixer functions--------------------------
//Remove the reqirement for mousing-over to get the mouse-over text from comics
WOE.addCaptions = function(){
	var imgs = $('.item').find('img[title]').not('.alttaken');
	imgs.each(function(){
		curImg = $(this);
		curImg.parent().append(
			"<div class=\"alttext\">" + curImg.attr('title') + "</div>");
		curImg.addClass('alttaken');
	});
};


//------------------------------AJAX functions---------------------------------
WOE.toggleRead = function(itemId){
	var item = '#' + itemId;
	if($(item).hasClass('read'))
		WOE.markAsUnread(item);
	else
		WOE.markAsRead(item);
};

WOE.markAsRead = function(item){
	WOE.djajax("toggleRead", { id: $(item).attr('id'), read: "True" });
	$(item).addClass('read');
	WOE.hideItem(item);
};

WOE.markAsUnread = function(item){
	WOE.djajax("toggleRead", { id: $(item).attr('id'), read: "False" });
	$(item).removeClass('read');
};

WOE.markAllAsRead = function(){
	items = $("#allItemsForm").serialize();
	WOE.djajax("markRead", items);
	items = $('.item').not('.read');
	items.addClass('read');
	WOE.hideItem(items);
};
$(document).ready(WOE.prepare);
