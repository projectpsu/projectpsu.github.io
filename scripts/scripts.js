$('#title').text("Is this a test?");

$.ajax({
	url: "https://projectpsu.github.io/files/scholarshipinfo.json",
	datatype: "json",
	success: function(data) {
		var json = $.parseJSON(data);
		$('p#thisp').text(json.Name);
	}
});
