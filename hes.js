// ==UserScript==
// @name        Hall Enhancement Suite
// @namespace   http://leetnet.com
// @description Various new features for Hall.com.
// @include     https://hall.com/*
// @version     0.53
// @grant       none
// ==/UserScript==

//Determine if item is currently in viewport
//From http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
$.fn.isOnScreen = function(){
	
	var win = $(window);
	
	var viewport = {
		top : win.scrollTop(),
		left : win.scrollLeft()
	};
	viewport.right = viewport.left + win.width();
	viewport.bottom = viewport.top + win.height();
	
	var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();
	
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	
};

/*Initialize HES*/
//Only Enhance visible messages in viewport
lazyEnhanceMessages();
$("div.hall-listview-viewport").scroll(function(){ lazyEnhanceMessages(); }); //TODO: Find a better selector for this

//Add SFW Mode to all open rooms
$("div.navbar>ul.nav.btn-group.pull-right").each(function() { addSFWModeButton($(this)); });
/*End HES Initialization*/

/*Handle New Messages*/
$("div#doc").on('click', "span.hes-msg-minimizer-toggle", function(evt) {
	//On message minimizer click
	$(this).parent().find("div.msg").toggle();
});

$("div#doc").on("DOMNodeInserted", "div.HallsShow", function(evt) {
	//When a new room is opened
	evt.stopPropagation();
	addSFWModeButton($(this).find("div.navbar>ul.nav.btn-group.pull-right"));
	lazyEnhanceMessages();
});

$("div#doc").on("DOMNodeInserted", "li.hall-listview-li", function(evt) {
	//When a new message is recieved
	enhanceHallMessage($(this));
});

function enhanceHallMessage(hallLI) {
	if (!hallLI.is(".hes-enhanced-msg")) {
		var speaker = hallLI.children('cite');
		var message = hallLI.children('.msg');
		var embdimg = hallLI.children('a.image-embed');
		
		//Message minimization (disabled)
		// if (speaker.length > 0 && !speaker.is(".hes-msg-minimizer")){
			// speaker.addClass('hes-msg-minimizer');
			// speaker.css("display", "inline").css("padding-left", "3px");
			// speaker.before("<span class='hes-msg-minimizer-toggle' title='Toggle Comment' style='cursor: pointer; font-weight: bold; color: #9CA6AF;'>[&plusmn;]</span>");
		// }
		
		//Pivotal Tracker links
		var ptRegex = /\b\[?PT:?\s?([0-9]+)\]?/ig;
		while (ptRegex.test(message.html())) {
			var replaced = message.html().replace(ptRegex, "<a href='https://www.pivotaltracker.com/story/show/$1' target='_blank' title='Pivotal Tracker Story'>PT|$1</a>");
			message.html(replaced);
		}
		
		//Green Texting
		if (message.text().trim()[0] == '>') {
			if (!message.is("pre")) {
				message.css("color", "#789922").css("font-family", "Courier New");
			} else {		
				var lines = message.children("code").first().html().split("\n");
				var output = "";
				
				for (var i = 0; i < lines.length; i++) {
					if (lines[i].indexOf("&gt;") == 0)
						output += "<span style='color: #789922;'>" + lines[i] + "</span>\n";
					else
						output += lines[i] + "\n";
				}
				
				message.children("code").first().html(output);
			}
		}
		
		//IRC style commands
		if (!message.is("pre")) {
			if (message.text().trim().indexOf("/me ") == 0) {
				message.html(speaker.text() + message.text().substring(3));
				message.css('color', '#b15ab1');
			}
			if (message.text().trim().indexOf("/slap ") == 0) {
				message.html(speaker.text() + " slaps " + message.text().substring(5) + " around a bit with a large trout");
				message.css('color', '#b15ab1');
			}
		}
		
		hallLI.addClass("hes-enhanced-msg");
	}
}
function addSFWModeButton(hallNav) {
	if (hallNav.has("a.hes-sfw-mode").length == 0) {
		hallNav.prepend("<li><a class='btn hes-sfw-mode' data-toggle='tipsy' original-title='Click to toggle SFW mode.'><div class='presence connected-busy'><i class='i'></i></div>SFW Mode</a></li>");
	}
}
function lazyEnhanceMessages() {
	$("li.hall-listview-li:visible").not(".hes-enhanced-msg").filter(function(index) {
		return $(this).isOnScreen();
	}).each(function() {
		enhanceHallMessage($(this));
	});
}
/*End new Message Event Handler*/

/*Support Functionality*/
//HES overlay
$("div#doc").append("<div id='hesOverlay' style='position: fixed; width: 100%; height: 100%; top: 0; left: 0; z-index: 10000; background-color: #000; opacity: 0.6;'></div>");
$("div#hesOverlay").hide();
$(document).on("keypress", function(evt) {
	if (evt.keyCode == 27) {
		$("div#hesOverlay").hide();
		$("div#hesOverlay").empty();
	}
});

//SFW mode
$("a.hes-sfw-mode").on("click", function(evt) {
	evt.stopPropagation();
	var indicator = $(this).children('div');
	var header = $(this).closest('div.app-page-hd'); //Room Header
	var body = header.next(); //Room Messages
	body.find("li.hall-listview-li>a.image-embed").toggle();
	body.find('li.hall-listview-li>a.video_embed').toggle();
	
	if (indicator.is('.connected-busy')) {
		indicator.removeClass('connected-busy');
		indicator.addClass('connected-available');
	} else {
		indicator.removeClass('connected-available');
		indicator.addClass('connected-busy');
	}
	return false;
});
/*End Support Functionality*/

//Confirm handywork
console.log("Loaded Hall Enhancement Suite 0.53");

