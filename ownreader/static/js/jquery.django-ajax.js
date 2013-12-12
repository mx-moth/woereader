//Retrieve cookies
function getCookie(name) {
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
}

//Test methods for CSRF protection requirement
function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

//Pass data to the url via ajax easily, execute function on success
function djajax($url, $data, successFunction){
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
		data: $data,
		success: successFunction
	});
	return false;
}
