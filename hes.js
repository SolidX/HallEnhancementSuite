//Add Message minimization feature
$('li.hall-listview-li>cite').css("display", "inline");
$('li.hall-listview-li>cite').css("padding-left", "3px");
$('li.hall-listview-li>cite').before("<span class='hes-toggle' title='Toggle Comment' style='cursor: pointer; font-weight: bold; color: #9CA6AF;'>[&plusmn;]</span>");
$("span.hes-toggle").on("click", function(evt) {
	$(this).parent().find("div.msg").toggle();
});

//Add HES overlay
$("div#doc").append("<div id='hesOverlay' style='position: fixed; width: 100%; height: 100%; top: 0; left: 0; z-index: 10000; background-color: #000; opacity: 0.6;'></div>")
$("div#hesOverlay").hide();
$("div#hesOverlay").on("keypress", function (evt) {
	if (evt.which == 13) {
		$("div#hesOverlay").empty();
		$("div#hesOverlay").hide();
	}
});

//Green Texting
$("div#doc").on("DOMNodeInserted", "li.hall-listview-li>div.msg", function(evt) {
	if ($(this).text().trim()[0] == '>') {
		$(this).css("color", "#789922").css("font-family", "Courier New");
	}
});

//Add Image Expando
// $('li.hall-listview-li>a.image-embed>img').css("max-height", "50px"); //thumbnail mode
// $('li.hall-listview-li>a.image-embed').after("<span class='hes-imgexpando' style='display: inline; cursor: pointer;'><img src='http://i.imgur.com/6NlkN2b.png' title='Click to show image preview.' height='25' /></span>");
// $('li.hall-listview-li>a.image-embed').hide();
// $("span.hes-imgexpando").on("click", function(evt) {
	// var large = $(this).prev().find('img').css('max-height', '').css('height', '90%').css('margin-left:', 'auto').css('margin-right', 'auto');
	// $("div#hesOverlay").html(large.html());
	// console.log(large.html());
	// $("div#hesOverlay").show();
// });

//Confirm handywork
console.log("Loaded Hall Enhancement Suite 0.3a");
// $('#content div.hall-listview-viewport>ol.hall-listview-chat').append('<li class="hall-listview-li" data-type="Comment"><cite>Hall Enhancement Suite</cite><time class="" datetime="' + new Date().toISOString() + '"><div class="msg">Rejoice peasant, for the Hall Enhancement Suite has come to enhance your life!</div></li>');
