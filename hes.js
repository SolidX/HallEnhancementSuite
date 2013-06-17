/*Initialize for currently displayed messages*/
//Message Minimization
$('li.hall-listview-li>cite').not('.hes-msg-minimizer').css("display", "inline").css("padding-left", "3px");
$('li.hall-listview-li>cite').not('.hes-msg-minimizer').addClass('hes-msg-minimizer');
$('li.hall-listview-li>cite').not('.hes-msg-minimizer').before("<span class='hes-msg-minimizer-toggle' title='Toggle Comment' style='cursor: pointer; font-weight: bold; color: #9CA6AF;'>[&plusmn;]</span>");

//Green Texting
$("li.hall-listview-li>div.msg").each(function() {
	if ($(this).text().trim()[0] == '>') {
		$(this).css("color", "#789922").css("font-family", "Courier New");
	}
});

//SFW Mode (hides images)
$("div.navbar>ul.nav.btn-group.pull-right").prepend("<li><a class='btn' id='hes-sfw-mode' data-toggle='tipsy' original-title='Click to toggle SFW mode.'><div class='presence connected-busy'><i class='i'></i></div>SFW Mode</a></li>");
/*End HES Initialization*/

/*Handle New Messages*/
//Add Message minimization feature
$("div#doc").on('click', "span.hes-msg-minimizer-toggle", function(evt) {
	$(this).parent().find("div.msg").toggle();
});

$("div#doc").on("DOMNodeInserted", "li.hall-listview-li", function(evt) {
	var speaker = $(this).children('cite');
	var message = $(this).children('div.msg');
	var embdimg = $(this).children('a.image-embed');
	
	//Message minimization
	if (speaker.length > 0 && !speaker.is(".hes-msg-minimizer")){
		speaker.addClass('hes-msg-minimizer');
		speaker.css("display", "inline").css("padding-left", "3px");
		speaker.before("<span class='hes-msg-minimizer-toggle' title='Toggle Comment' style='cursor: pointer; font-weight: bold; color: #9CA6AF;'>[&plusmn;]</span>");
	}
	
	//Green Texting
	if (message.text().trim()[0] == '>') {
		message.css("color", "#789922").css("font-family", "Courier New");
	}
});
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
$("a#hes-sfw-mode").on("click", function(evt) {
	evt.stopPropagation();
	var indicator = $(this).children('div');
	$('li.hall-listview-li>a.image-embed').toggle();
	$('li.hall-listview-li>a.video_embed').toggle();
	if (indicator.is('.connected-busy')) {
		indicator.removeClass('connected-busy');
		indicator.addClass('connected-available');
	} else{
		indicator.removeClass('connected-available');
		indicator.addClass('connected-busy');
	}
	return false;
});
/*End Support Functionality*/

/*Experimental*/
//add image expando
// $('li.hall-listview-li>a.image-embed>img').css("max-height", "50px"); //thumbnail mode
// $('li.hall-listview-li>a.image-embed').after("<span class='hes-imgexpando' style='display: inline; cursor: pointer;'><img src='http://i.imgur.com/6nlkn2b.png' title='click to show image preview.' height='25' /></span>");
// $('li.hall-listview-li>a.image-embed').hide();
// $("span.hes-imgexpando").on("click", function(evt) {
	// var large = $(this).prev().find('img').css('max-height', '').css('height', '90%').css('margin-left:', 'auto').css('margin-right', 'auto');
	// $("div#hesOverlay").html(large.html());
	// console.log(large.html());
	// $("div#hesOverlay").fadeIn();
// });
/*End Experimental*/

//Confirm handywork
console.log("Loaded Hall Enhancement Suite 0.4a");

