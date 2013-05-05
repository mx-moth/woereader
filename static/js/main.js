//Startup
var canTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
$(document).ready(prepare);
$(window).resize(resizeContent);
function prepare() {
	addCaptions();
	setupTouch();
	setupMenus();
	resizeContent();
}

//UI  setup functions
function setupTouch() {
	if(canTouch) {
		$("html").addClass("touch");
	}
}
function menuShow($this){
	$this.find('ul').css('display', 'block');
	menuHide($('.menu').not($this));
}
function menuHide($this){
	$this.find('ul').css('display', 'none');
}
function menuToggle($this){
	if($this.find('ul').css('display')=='none')
		menuShow($this);
	else
		menuHide($this);
}
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

//Appearance fixer functions
function resizeContent(){
	//Workaround for browsers who don't support CSS calc()
	var properHeight = $(window).height() - $('#navbar').height();
	if($('#main').height() < properHeight){
		$('#main').css('height', properHeight);
	}
}
function addCaptions(){
	var str = $('body').html();
	var re = /(<img[^>]*title=")([^"]*)("[^>]*>)/gi;
	$('body').html(str.replace(re, "$1$2$3<br />$2<br />"));
}

//Functions for django+ajax
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
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
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

//UI element response functions
function toggleRead(itemId){
	djajax("toggleRead", { id: itemId });
}

