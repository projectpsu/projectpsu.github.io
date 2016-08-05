$('#title').text("Is this a test?");

/*
$.ajax({
	url: "https://projectpsu.github.io/files/scholarshipinfo.json",
	datatype: "json",
	success: function(data) {
		console.log('Data: ' + data);
		var json = $.parseJSON(data);
		console.log('Json: ' + json);
		$('p#thisp').text(json.Name);
	}
});
*/

jQuery.getJSON("https://projectpsu.github.io/files/scholarshipinfo.json", function(data) {
	$.each(data, function(key, val) {
		  var items = [];
		  $.each( data, function( key, val ) {
		    items.push( "<li id='" + key + "'>" + val + "</li>" );
		  });
		 
		  $( "<ul/>", {
		    "class": "my-new-list",
		    html: items.join( "" )
		  }).appendTo( "body" );
	})
	
})
