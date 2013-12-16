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
	if ((eap = efp(rect.left,  rect.top)) == el
			|| el[contains](eap) == has
		||(eap = efp(rect.right, rect.top)) == el
			|| el[contains](eap) == has
		||(eap = efp(rect.right, rect.bottom)) == el
			|| el[contains](eap) == has
		||(eap = efp(rect.left,  rect.bottom)) == el
			|| el[contains](eap) == has)
		return true;
};
