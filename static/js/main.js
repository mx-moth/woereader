var canTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
$(document).ready(prepare);
$(window).resize(resizeContent);

function prepare() {
	setupTouch();
	setupMenus();
	resizeContent();
}

function resizeContent(){
	//Workaround for browsers who don't support CSS calc()
	var properHeight = $(window).height() - $('#navbar').height();
	if($('#main').height() < properHeight){
		$('#main').css('height', properHeight);
	}
}

function setupMenus() {
	//Binds click alternatives to the CSS :hover, hides all but selected
	$('nav li').click(function (e) {
		e.stopPropagation();
		$(this).find('ul').toggle();
		$('nav li').not(this).find('ul').hide();
		//Don't follow links to '#'
		if($(this).find('a').attr('href')=="#"){
			return false;
		}
	});
	//Close menus on outside clicks
	$(document).click(function (e) {
		e.stopPropagation();
		$('nav li ul').hide();
	});
	//Scroll to top on Navbar click
	$('#navbar').click(function (e) {
		e.stopPropagation;
		window.scrollTo(0,0);
	});
	//Because somehow, mobile browsers will otherwise require 2 clicks on menus
	$('#navbar').click();
}

function setupTouch() {
	if(canTouch) {
		$("html").addClass("touch");
	}
}

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

function toggleRead(itemId){
	var csrftoken = getCookie('csrftoken');
	$.ajax({
		url: "toggleRead",
		crossDomain: false,
		type: "POST",
		beforeSend: function(xhr, settings) {
	    	if (!csrfSafeMethod(settings.type)) {
	        	xhr.setRequestHeader("X-CSRFToken", csrftoken);
	        }
	    },
		data: { id: itemId }
	});
	return false;
}
