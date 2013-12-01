////Page Setup
var canTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
$(document).ready(prepare);
$(window).resize(resizeContent);

function prepare() {
	addCaptions();
	setupTouch();
	setupMenus();
	resizeContent();
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



////Appearance fixer functions

//Resize items so as to stop horizontal overflow
function resizeContent(){
	//Workaround for browsers (webkit) who don't support CSS calc() with vw
	//Stupidly hacky and annoying, Firefox does it perfectly
	//Alternatively, sites not using tables for layout would make it work too
	if($('.item').width() > $('nav').width() ||
	   $('.item').width() < $('#main').width()) {
		var itemMax = $('nav').width();
		$('.item').width(itemMax);
		$('.item_header').width(itemMax);
		var padding = parseInt($('.item_summary').css('padding-left'), 10);
		itemMax -= 2 * padding;
		$('table').width(itemMax);
		$('table').find('*').css('max-width', itemMax);
	}
}

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
}

