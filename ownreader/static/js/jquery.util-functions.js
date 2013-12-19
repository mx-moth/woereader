WOE = window.WOE || {};

//Retrieve cookies
WOE.getCookie = function(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(
                	cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

//Test methods for CSRF protection requirement
WOE.isCSRFSafe = function(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
};

//Pass data to the url via ajax easily, execute function on success
WOE.djajax = function($url, $data, successFunction){
	var csrftoken = WOE.getCookie('csrftoken');
	$.ajax({
		url: $url,
		crossDomain: false,
		type: "POST",
		beforeSend: function(xhr, settings) {
			if (!WOE.isCSRFSafe(settings.type)) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		},
		data: $data,
		success: successFunction
	});
	return false;
};

//Check if an element is in view
WOE.isElementVisible = function(el){
	var rect = el.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= $(window).height() &&
		rect.right <= $(window).width()
	);
};
