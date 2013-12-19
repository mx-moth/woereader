//---------------------------------Page Setup----------------------------------
WOE = window.WOE || {};
WOE.selected;
WOE.viewMode;
WOE.itemShown;

WOE.prepare = function() {
	$('body').addClass('js');
	
	//Setup Infinite Scrolling
	var context = {
		showRead: $('#showRead').val(),
		pageSize: $('#itemsPerPage').val(),
		adding: "True",
		newest: $('.item').first().attr('id'),
	};
	var postClean = function() {
		$('#previousPage').remove();
		WOE.addCaptions();
		WOE.nullLinks('.item_title');
	};
	WOE.infiniteScroll.init(null, context, null, null, null, postClean, null);
	WOE.infiniteScroll.loadMore();
	$('#itemWrapper').scroll(WOE.infiniteScroll.loadMore);
	
	//Setup Expansion
	WOE.preview = false;
	WOE.selected = $('.item').first();
	WOE.selected.addClass('selected');
	var wclasses = document.getElementById('wrapper').className.split(/\s+/);
	for (var i=0; i<wclasses.length; i++)
		if(wclasses[i] === 'autoexpand'){
			WOE.viewMode = "autoexpand";
			WOE.itemShown = true;
		}else if(wclasses[i] === 'collapse')
			WOE.viewMode = "collapse";
		else if(wclasses[i] === 'expand')
			WOE.viewMode = "expand";
		else if(wclasses[i] === 'tall'){
			WOE.viewMode = "tall";
			WOE.itemShown = true;
		}else if(wclasses[i] === 'wide'){
			WOE.viewMode = "wide";
			WOE.itemShown = true;
		}
	if(WOE.itemShown)
		WOE.showItem(WOE.selected);

	//Setup Hotkeys
	$(document).keyup(function(e){
		var code = e.keyCode || e.which;
		switch(code){
			case 67: //'c' -> toggle collapsing for item
				WOE.toggleShow(WOE.selected.attr('ID'));
				break;
			case 70: //'f' -> toggle folders sidebar
				WOE.toggleSidebar();
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
		if(WOE.itemShown)
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
	if(WOE.itemShown)
		WOE.showItem(WOE.selected);
};

//Show/hide the sidebar
WOE.toggleSidebar = function(){
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
	if(WOE.viewMode == 'autoexpand' || WOE.viewMode == 'collapse'){
		$(item).find('.hider').text("-");
		$(item).removeClass('collapsed');
	}else
		$('#preview').html(WOE.selected.html());
};

WOE.hideItem = function(item){
	$(item).find('.hider').text("+");
	$(item).addClass('collapsed');
	WOE.infiniteScroll.loadMore();
};

WOE.selectItem = function(item){
	WOE.hideItem(WOE.selected);
	WOE.selected.removeClass('selected');
	WOE.selected = $('#'+item);
	WOE.selected.addClass('selected');
	WOE.showItem(WOE.selected);
}


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

//Change links in headers to display on left and open on middle
WOE.nullLinks = function(itemClass){
	var links = $(itemClass).find('a').not('.nullLink');
	links.click(function(e){
		if(e.which == 1 ){
			e.preventDefault();
			$(this).parent().click();
		}
	});
	links.addClass('nullLink');
}

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
