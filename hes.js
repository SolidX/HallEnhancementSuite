// ==UserScript==
// @name        Hall Enhancement Suite
// @namespace   http://leetnet.com
// @description Various new features for Hall.com.
// @include     https://hall.com/*
// @version     0.73a
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

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

// http://stackoverflow.com/a/2117523
function generateGUID() { 
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

//This abomination from http://stackoverflow.com/a/4301991
function urlExists(url, callback){
  $.ajax({
    type: 'HEAD',
    url: url,
    success: function(){
      callback(true);
    },
    error: function() {
      callback(false);
    }
  });
}

/*Initialize HES*/
//Only Enhance visible messages in viewport
lazyEnhanceMessages();
$("div.hall-listview-viewport").scroll($.debounce(250, function(){ lazyEnhanceMessages(); })); //TODO: Find a better selector for this

//Add SFW Mode to all open rooms
$("div.navbar>ul.nav.btn-group.pull-right").each(function() { addSFWModeButton($(this)); });
/*End HES Initialization*/

/*Handle New Messages*/
$("#HallViewContent").on("DOMNodeInserted", "div.HallsShow", function(evt) {
	//When a new room is opened
	evt.stopPropagation();
	addSFWModeButton($(this).find("div.navbar>ul.nav.btn-group.pull-right"));
	lazyEnhanceMessages();
});

$("#HallViewContent").on("DOMNodeInserted", "li.hall-listview-li", function(evt) {
	//When a new message is received
	enhanceHallMessage($(this));
});

function enhanceHallMessage(hallLI) {
	if (!hallLI.is(".hes-enhanced-msg")) {
		var speaker = hallLI.children('cite');
		var message = hallLI.children('.msg');
		var embdimg = hallLI.children('a.image-embed');
		var msgtxt = message.text().trim();
		
		//Pivotal Tracker links
		var ptRegex = /(?!>)\bPT:?\s?([0-9]+)(?!<)\b/gim;
		if (ptRegex.test(message.html())) {
			var replaced = message.html().replace(ptRegex, function(match, id) {	
				var guid = generateGUID();
				
				$.ajax({
					"url": "https://aorist.co/stuff/story/" + id,
					"dataType": "xml",
					"success": function(data, status, jqXHR) {
						var nameNode = jqXHR.responseXML.querySelector("story > name");
						if (nameNode)
							$("#pt-link-" + guid).attr("title", nameNode.textContent).css({"color": "#9952CC", "border-bottom": "1px dotted #9952CC", "font": "bold normal medium monospace"});
					}
				});
				
				return "<a id='pt-link-" + guid + "' href='https://www.pivotaltracker.com/story/show/" + id + "' " +
												  "target='_blank' title='Pivotal Tracker Story'>" + match + "</a>";
			});
			message.html(replaced);
		}
		
		//Green Texting
		var gRegex = /\B&gt;(?!\s).*$/gm;
		if (gRegex.test(message.html())) {
			var melem = message.html().indexOf("\n") >= 0 ? message.children("code") : message;
			var greplaced = melem.html().replace(gRegex, '<span style="color: #789922; font-family: monospace;">$&</span>');
			melem.html(greplaced);
		}
		
		if (!message.is("pre")) {
			//IRC style commands
			if (msgtxt.indexOf("/me ") == 0) {
				message.html(speaker.text() + msgtxt.substring(3));
				message.css('color', '#b15ab1');
			}
			if (msgtxt.indexOf("/slap ") == 0) {
				message.html(speaker.text() + " slaps " + msgtxt.substring(5) + " around a bit with a large trout");
				message.css('color', '#b15ab1');
			}
			
			//Conditional Emoji Resizing -- if a message only contains an emoji
			if (message.text().length == 0 && message.has("img.emojicon").length == 1) {
				//for previously loaded things
				var emoji = message.children("img.emojicon");
				emoji.removeClass("emoticon emojicon").removeAttr("height").removeAttr("width");
			} else {
				//for new messages
				//forgive the horrible abuse of AJAX
				//also we could extend the hall emojicon set here in theory.
				var msgtxtLength = msgtxt.length;
				if (msgtxtLength > 3 && msgtxt[0] == ':' && msgtxt[msgtxtLength - 1] == ':') {
					//Should leverage memoization eventually
					var potentialURL = 'https://hall.com/images/embed/emojicons/' + msgtxt.substring(1, msgtxt.length - 1) + '.png';
					
					//if url exists
					urlExists(potentialURL, function(doIt) {
						if (doIt)
							message.html(generateImageEmbed(potentialURL).html()); //This can probably be optimized.
					});
				}
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
$("#HallViewContent").on("click", "a.hes-sfw-mode", function(evt) {
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

function generateImageEmbed(imgURL){
	var img = $('<img>').attr({src: imgURL}).on("load",function(){
		$(this).trigger('embedPhotoLoaded');
	});
	var a = $('<a>').attr({target: '_blank', href: imgURL, class: 'image-embed'}).append(img);
	return a;
}
/*End Support Functionality*/

//Confirm handiwork
console.log("Loaded Hall Enhancement Suite 0.73a");