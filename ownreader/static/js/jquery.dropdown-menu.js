WOE = window.WOE || {};

//Show menus on demand, hide all others
WOE.menuShow = function($this){
	$this.find('ul').css('display', 'block');
	WOE.menuHide($('.menu').not($this));
};

//Hide specific menus on demand
WOE.menuHide = function($this){
	$this.find('ul').css('display', 'none');
};

//Toggle all menus as required
WOE.menuToggle = function($this){
	if($this.find('ul').css('display')=='none')
		WOE.menuShow($this);
	else
		WOE.menuHide($this);
};

//Enable menu functionality
WOE.setupMenus = function() {
	//Menus should have null locations; don't propagate links otherwise
	$('a').on('click touchstart', (function(e){
		if($(this).attr('href')!='#')
			e.stopPropagation();
	}));
	//Bind js alternatives to the CSS :hover, hides all but selected
	$('.menu:has(ul)').on('click touchstart', (function(e){
		e.stopPropagation(); //stop it from triggering the document event
		e.preventDefault();  //touchscreen devices do both otherwise
		WOE.menuToggle($(this));
	}));
	$('.menu').on('mouseenter', (function(){ WOE.menuShow($(this)) }));
	$('.menu').on('mouseleave', (function(){ WOE.menuHide($(this)) }));
	//Close menus on outside clicks
	$(document).on('click touchstart', (function (e) {
		if(e.which != (2 || 3)){
			WOE.menuHide($('.menu'));
		}
	}));
	//Scroll to top on Navbar click
	$('nav').click(function (e) {
		window.scrollTo(0,0);
	});
};

$(document).ready(WOE.setupMenus);
