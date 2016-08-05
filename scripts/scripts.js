$('#title').text("Is this a test?");

$.ajax({
	url: "https://github.com/projectpsu/projectpsu.github.io/blob/master/files/scholarshipinfo.json",
	datatype: "json",
	success: function(data) {
		var json = $.parseJSON(data);
		$('p#thisp').text(json.Name);
	}
});
