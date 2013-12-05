////Page Setup
var canTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
$(document).ready(prepare);

function prepare() {
	addCaptions();
	setupTouch();
	setupMenus();
	
	//Makes small-screened devices ignore starting state of sidebar
	if($('#smallscreen').css('visibility')=='visible')
		$('#wrapper').removeClass('sidebar');
}


////UI  setup functions

//Add touch functionality if present
function setupTouch() {
	if(canTouch) {
		$("html").addClass("touch");
	}
}

//Show menus on demand, hide all others
function menuShow($this){
	$this.find('ul').css('display', 'block');
	menuHide($('.menu').not($this));
}

//Hide specific menus on demand
function menuHide($this){
	$this.find('ul').css('display', 'none');
}

//Toggle all menus as required
function menuToggle($this){
	if($this.find('ul').css('display')=='none')
		menuShow($this);
	else
		menuHide($this);
}

//Enable menu functionality
function setupMenus() {
	//Menus should have null locations; don't propagate links otherwise
	$('a').on('click touchstart', (function(e){
		if($(this).attr('href')!='#')
			e.stopPropagation();
	}));
	//Bind js alternatives to the CSS :hover, hides all but selected
	$('.menu:has(ul)').on('click touchstart', (function(e){
		e.stopPropagation(); //stop it from triggering the document event
		e.preventDefault();  //touchscreen devices do both otherwise
		menuToggle($(this));
	}));
	$('.menu').on('mouseenter', (function(){ menuShow($(this)) }));
	$('.menu').on('mouseleave', (function(){ menuHide($(this)) }));
	//Close menus on outside clicks
	$(document).on('click touchstart', (function (e) {
		if(e.which != (2 || 3)){
			menuHide($('.menu'));
		}
	}));
	//Scroll to top on Navbar click
	$('#navbar').click(function (e) {
		window.scrollTo(0,0);
	});
}

//Show/hide the sidebar
function sidebarToggle(){
	if($('#wrapper').hasClass('sidebar')){
		$('#wrapper').removeClass('sidebar');
	}else{
		$('#wrapper').addClass('sidebar');
	}
	
	//Deselect the Button
	$('#sidebarToggle').blur();
	
	//Only change the preference if both can be seen at once
	if($('#smallscreen').css('visibility')!='visible')
		djajax('toggleSidebar', {showSidebar: 'toggle'});
}

//Show/hide items
function toggleShow(itemId){
	var item = '#' + itemId;
	if($(item).hasClass('collapsed')){
		$(item).find('.hider').text("-");
		$(item).removeClass('collapsed');
	}
	else{
		$(item).find('.hider').text("+");
		$(item).addClass('collapsed');
	}
}



////Appearance fixer functions

//Remove the reqirement for mousing-over to get the mouse-over text from comics
function addCaptions(){
	var str = $('body').html();
	var re = /(<img[^>]*title=")([^"]*)("[^>]*>)/gi;
	$('body').html(str.replace(re, "$1$2$3<br /><p>$2</p><br />"));
}



//Functions for django+ajax

//Retrieve cookies
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

//Test methods for CSRF protection requirement
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

//Pass data to the url via ajax easily
function djajax($url, $data){
	var csrftoken = getCookie('csrftoken');
	$.ajax({
		url: $url,
		crossDomain: false,
		type: "POST",
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type)) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		},
		data: $data
	});
	return false;
}



////Methods that perform specific Client-Server communication

//Toggle the 'read' status for an item
function toggleRead(itemId){
	djajax("toggleRead", { id: itemId });
	var item = '#' + itemId;
	if($(item).hasClass('read')){
		$(item).removeClass('read');
	}
	else{
		$(item).addClass('read');
		if(!$(item).hasClass('collapsed')){
			$(item).find('.hider').text("+");
			$(item).addClass('collapsed');
		}
	}
}
