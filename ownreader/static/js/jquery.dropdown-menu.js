$(document).ready(setupMenus);

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
