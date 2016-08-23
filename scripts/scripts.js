var allpositions = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG / OC', 'DE', 'DT', 'LB', 'CB', 'S', 'K', 'P', 'LS'];

var iFirstClass = $('div.cell.yr:first').index();
var iFirstPos = $('div.cell.pos-head:first').parent().index();
var NUM_CLASSES = $('div.cell.yr').length;
var NUM_POSITIONS = $('div.cell.pos-head').length;
var NUM_HEADERS = $('div.row.headers').length;
var iLastClass = NUM_CLASSES - iFirstClass + 1;
var iLastPosition = NUM_POSITIONS + NUM_HEADERS - iFirstPos + 1;

// Calculate column, row and team totals
fullRecalculate();		// Note: does not calculate targets
calcTargetTotal();		// Calculates the target values

// Advance season on click
$('#AdvanceSeason').click(function() {advanceSeason();});

// Add recruits event listening
$('#AddRecruits').click(function() {addRecruits();});

$('#Filter').click(function() {clickFilter();});

$('#FileManagement').click(function() {clickFileManagement();});

// Add help click event listening
$('#Help').click(function() {clickHelp();});

// Add click event listening for help sections
$('.help-header').click(function() {clickHelpHeader(this);});

// Add filter event listening
initiateFilterListeners();
initiateFileListeners();

// Set all players to be draggable
var $players = $('div.player:not(.example, .add-player)');
//$players.draggable({containment: 'div.row.position'});

// Set all div.players elements to accept drops
var pgroups = 'div.players';
var $playergroups = $(pgroups);
//$playergroups.droppable({drop: drop});

// Add listeners to both player elements and players drop zone elements
initiateChangeListeners();

// Add click listener to the add-player buttons
$('div.add-player').click(function() {addPlayerName(this);});

// Add click listener to the target values
$('div.position span.target-value').click(function () {
	clickTargetValue(this);
});

// Fix column headers on top when scrolling
var sticky = new Waypoint.Sticky({
	element: $('div.row.headers:first-child')[0],
	stuckClass: 'fixed',
	direction: 'down'
});

var source;

function clickFilter() {
	var $btn = $('#Filter');
	turnOffSubMenus($btn.get(0));
	var on = $btn.attr('on');
	
	// If help is on, turn it off
	/*if ($('#Help').attr('on')) {
		clickHelp();
	}*/
	
	if (on) {
		$btn.removeAttr('on');
		$('#filter-menu').css('display', 'none');
	} else {
		$btn.attr('on', 'true');
		$('#filter-menu').css('display', 'block');
	}
	
}

function clickFileManagement() {
	var $btn = $('#FileManagement');
	turnOffSubMenus($btn.get(0));
	var on = $btn.attr('on');
	
	if (on) {		// If it's on, turn off
		$btn.removeAttr('on');
		$('#file-menu').css('display', 'none');
	} else {		// If it's off, turn on
		$btn.attr('on', 'true');
		$('#file-menu').css('display', 'block');
	}
}

function clickHelp() {
	var $helpbtn = $('#Help');
	var $helpblock = $('#helpblock');
	turnOffSubMenus($helpbtn.get(0));
	var helpon = $helpbtn.attr('on');
	
	// Check if filter is on, if so, turn it off
	/*if ($('#Filter').attr('on')) {
		clickFilter();
	}*/
	
	if (helpon) {
		$helpbtn.removeAttr('on');
		$helpblock.css('display', 'none');
	} else {
		$helpbtn.attr('on', 'true');
		$helpblock.css('display', 'block');
	}
}

function clickHelpHeader(btn) {
	if ($(btn).attr('on')) {
		$(btn).removeAttr('on');
		$(btn).siblings('.help-content').css('display', 'none');
	} else {
		$(btn).attr('on', 'true');
		$(btn).siblings('.help-content').css('display', 'block');
	}
}

function turnOffSubMenus(btn) {
	var selection = 'ul.main-menu > li.sub:not(#' + $(btn).attr('id') + ')'
	$(selection).each(function() {
		if ($(this).attr('on')) {
			$(this).click();
		}
	});
}

function addRecruits() {
	var addPlyrOn = $('#AddRecruits').attr('on');
	
	if (addPlyrOn) {
		$('#AddRecruits').removeAttr('on');
		$('div.player.add-player').css('display', 'none');
	} else {
		$('#AddRecruits').attr('on', 'true');
		$('div.player.add-player').css('display', 'inline-block');
	}
}

function addPlayerName(target){	
	var originaltext = $(target).text();
	$(target).html(getPlayerInput());
	var $in = $(target).find('input');
	$in.select();
	$in.keydown(function(event) {
		// If user presses Enter
		if (event.keyCode == 13) {
			createPlayerFromInput(this);
		} 
		  
		if (event.keyCode == 27) {
			$in.prop("selected", "false");	// De-select the input box
			$(target).text(originaltext);
		}
	});
	
	$in.blur(function() {
		// If input box loses focus, create player.
		createPlayerFromInput(this);
	});
	
	function createPlayerFromInput(inpt) {
		var value = $in.val();		// Get current value of input box
		$in.prop("selected", "false");	// De-select the input box
		var e = getPlayerElement();		// Build a new player HTML element
		if (value === '') {
			value = 'Player Name';
		}
		var fullp = value + getShirtImageElement();
		var $test = $(e).html(fullp);	// Add content to the player element
		var $par =  $(target).closest('div.players');	// Get the parent div.players element
		$par.append($test.get(0));		// Append a new player element to the end of the div.players element
		$(target).text(originaltext);

		// Recalculate the total in the column
		calcPlayersColumn($par.index());
		
		// Add listeners to the added element
		initiatePlayerChangeListeners($test.get(0))
		
		reorderAddPlayer(target);
	};
}

function getPlayerElement() {
	var elem = '<div class="player" draggable="true"></div>';
	return elem;
}

function getShirtImageElement() {
	return ' <div class="rs-img"><img src="./img/blackshirt_transparent.png">';
}

function getPlayerInput() {
	var elem = '<input type="text" placeholder="Player Name"></input>';
	return elem;
}

function initiateChangeListeners() {
	
	$players.each(function() {
		var elem = $(this).get(0);
		initiatePlayerChangeListeners(elem);
	});
	
	// Now set listeners for drop zones
	$playergroups.each(function() {
		var elem = $(this).get(0);
		elem.ondragover = function(event) {
			dragOver(event);
		};
		elem.ondragleave = function(event) {
			dragLeave(event);
		};
		elem.ondrop = function(event) {
			drop(event);
		};
	});
}

function initiatePlayerChangeListeners(elem) {
	
	
	$plyr = $(elem);
	
	// Make player element draggable
	$plyr.attr('draggable', 'true');
	
	// Change player status upon click
	$plyr.click(function() {clickPlayer($(this));});
	
	// Drag and drop listeners
	elem.ondragstart = function(event) {
		dragStart(event);
	};
	elem.ondragover = function(event) {
		dragOver(event);
	};
	elem.ondragleave = function(event) {
		dragLeave(event);
	};
	elem.ondrop = function(event) {
		drop(event);
	};
}

function clickPlayer($plyr) {
	var rs = $plyr.attr('rs');
	var lvg = $plyr.attr('leaving');
	var usedrs = $plyr.attr('used-rs');

	if ($plyr.closest(pgroups).hasClass('incoming')) {
		var gs = $plyr.attr('gs');

		if (lvg) {
			$plyr.removeAttr('leaving');
			$plyr.attr('gs', 'true');
		} else if (gs) {
			$plyr.removeAttr('gs');
		} else {
			$plyr.attr('leaving', 'true');
		}
	} else if (usedrs) {
		// If player used their RS already or are incoming, they can only leave (not RS)
		if (lvg) {
			$plyr.removeAttr('leaving');
		} else {
			$plyr.attr('leaving','true');
		}
	} else {
		if (lvg) {
			$plyr.removeAttr('leaving');
		} else if (rs) {
			$plyr.removeAttr('rs');
			$plyr.attr('leaving', 'true');
		} else {
			$plyr.attr('rs','true');
		}
	}
}

function initiateFilterListeners() {
	$('#Filter-RS').click(function() {
		var selection = 'div.player:not(.example, .add-player, [rs])';
		filter(this, selection);
	});
	
	$('#Filter-RSAvailable').click(function() {
		var selection = 'div.player[used-rs]:not(.example, .add-player), div.incoming > div.player:not(.add-player)';
		filter(this, selection);
	});
	
	$('#Filter-UsedRS').click(function() {
		var selection = 'div.player:not(.example, .add-player, [used-rs])';
		filter(this, selection);
	});
	
	$('#Filter-Leaving').click(function() {
		var selection = 'div.player:not(.example, .add-player, [leaving])';
		filter(this, selection);
	});
	
	$('#Filter-Off').click(function() {
		filterTurnAllOff(this);
		fullRecalculate();
	});
}

// Filter functions

// Turn off all players who are not using their RS this year.
function filter(btn, selection) {
	filterTurnAllOff(btn);
	
	if ($(btn).attr('on')) {
		$(selection).css('display', 'inline-block');
		$(btn).removeAttr('on');
	} else {
		$(selection).css('display', 'none');
		$(btn).attr('on', 'true');
	}
	
	fullRecalculate();
}

// Turn off all filters except for the button that was clicked
function filterTurnAllOff(btn) {
	var filtertext = 'ul#filter-menu > li:not(#' + $(btn).attr('id') + ')';
	$(filtertext).removeAttr('on');
	$('div.player:not(.example, .add-player)').css('display', 'inline-block');
}

// File listeners
function initiateFileListeners() {
	$('#CreateFile').click(function() {
		createFile();
	});
	
	$('#upload').change(function() {
		loadFile(this);
	});
}

// File Functions

var linkToFile = ''
function createFile() {
	var pjson = {};
	
	// Get current year value, save that
	pjson['year'] = $('#CurrentSeasonValue').text();
	
	// Loop through each position
	$('div.row.position').each(function() {
		var $row = $(this);
		var $plyrs = $row.find('div.player:not(.add-player)');
		var pos = $row.find('div.pos-head').text();
		
		var posjson = {};
		
		var plyrarray = []
		
		var trgt = $row.find('span.inner-cell.target-value').text();
		posjson['Target'] = trgt;
		
		
		$plyrs.each(function() {
			var $plyr = $(this);
			var name = $plyr.text();
			var rs = $plyr.attr('rs') ? true : false;
			var usedrs = $plyr.attr('used-rs') ? true : false;
			var leaving = $plyr.attr('leaving') ? true : false;
			var col = $plyr.closest(pgroups).index();
			var jp = {Name:name, RS:rs, UsedRS:usedrs, Leaving:leaving, Col:col}
			plyrarray.push(jp);
		});
		
		// Add plyrarray to posjson
		posjson['Players'] = plyrarray;
		
		pjson[pos] = posjson;
	});
	
	var s = JSON.stringify(pjson);
	
	linkToFile = makeTextFile(s);
	
	$('#DownloadFileLink').attr('href', linkToFile);
	$('#DownloadFile').css('display', 'inline-block');
}

function getYrsEligibleFromIndex(index) {
	return 5-index+iFirstClass
}

var textFile = null;
function makeTextFile(text) {
	var data = new Blob([text], {type: 'text/plain'});

	// If we are replacing a previously generated file we need to
	// manually revoke the object URL to avoid memory leaks.
	if (textFile !== null) {
	  window.URL.revokeObjectURL(textFile);
	}

	textFile = window.URL.createObjectURL(data);

	return textFile;
};

function loadFile(btn) {
	var file = btn.files[0];
	var reader = new FileReader();
	reader.onloadend = function(e) {
		if (e.target.readyState == FileReader.DONE) {
			var filetext = reader.result;
			//console.log(filetext);
			var allplayers = JSON.parse(filetext);
			$('#CurrentSeasonValue').text(allplayers['year']);
			setAllPlayers(allplayers);
		}
	}
	reader.readAsText(file);
}

// reorders the add-player boxes to be at the bottom of their cells
function reorderAddPlayers() {
	$('div.add-player').each(function() {
		reorderAddPlayer(this);
	});
}

function reorderAddPlayer(elem) {
	var $cell = $(elem).closest(pgroups);
	$cell.append($(elem));
}

function setAllPlayers(allplayers) {
	// First, remove all the players.
	$('div.player:not(.add-player, .example)').remove();
	
	for (var pos in allplayers) {
		if (allplayers.hasOwnProperty(pos)) {
			var rowindex = allpositions.indexOf(pos);
			
			// Check if position is in the positional list
			if (rowindex == -1) { continue; }
			
			// Get row for current position
			var $row = $('div.row.position').eq(rowindex);
			
			// Set target value for current position
			var trgt = allplayers[pos]['Target'];
			$row.find('span.inner-cell.target-value').text(trgt);
			
			// Add players to current position
			var curplayers = allplayers[pos]['Players'];
			for (var i = 0, len = curplayers.length; i < len; i++) {
				var p = curplayers[i];

				var $cell = $row.find('div.cell:eq(' + p.Col + ')');
				var e = getPlayerElement();		// Build a new player HTML element
				var $plyr = $(e).html(p.Name + getShirtImageElement());	// Add content to the player element
				
				// Add any of the attributes that are true
				p.RS ? $plyr.attr('rs', 'true') : '';
				p.UsedRS ? $plyr.attr('used-rs', 'true') : '';
				p.Leaving ? $plyr.attr('leaving', 'true') : '';
				$cell.append($plyr);
				
				// Add listeners to the added element
				initiatePlayerChangeListeners($plyr.get(0))
			}
		}
	}
	
	reorderAddPlayers();
	
	fullRecalculate();
	calcTargetTotal();
}

// Drag and drop functionality
function dragStart(e){
	//start drag
	source = e.target;
	$(source).attr('id', 'moving');
	
	// Set original class if it's an incoming player
	if ($(source).closest(pgroups).hasClass('incoming') || $(source).data('original-yr')) {
		//$(source).data('original-yr', 'incoming');
		e.dataTransfer.setData("incoming", 'true');
	}

	//set data
	e.dataTransfer.setData("text", e.target.id);
	e.dataTransfer.setData("col", $(e.target).closest(pgroups).index());
	e.dataTransfer.setData("row", $(e.target).closest('div.row').index());
	//specify allowed transfer
	e.dataTransfer.effectAllowed = "move";

}

function dragLeave(e) {
	$(e.target).closest(pgroups).get(0).style.backgroundColor = "";
}

function dragOver(e) {
	//drag over
	e.preventDefault();
	//specify operation
	if ($(e.target).closest(pgroups).hasClass('incoming')) {
		if (e.dataTransfer.getData("col") == iFirstClass || e.dataTransfer.getData('incoming') == 'true') {
			$(e.target).closest(pgroups).get(0).style.backgroundColor = "darkgray"
			e.dataTransfer.dropEffect = "move";
		}
	} else {
		$(e.target).closest(pgroups).get(0).style.backgroundColor = "darkgray"
		e.dataTransfer.dropEffect = "move";
	}
}

function drop(e) {
	e.preventDefault();
	e.stopPropagation();
	
	var elemId = e.dataTransfer.getData("text");
	var sourceCol = e.dataTransfer.getData("col");
	var sourceRowIndex = e.dataTransfer.getData("row");
	var target = $(e.target).closest(pgroups).get(0);
	
	var elem = document.getElementById(elemId);
	
	// Clean up
	target.style.backgroundColor = "";
	$(elem).removeAttr('id');
	
	// Situation: trying to drop a player on the Incoming class. If they are already on the roster,
	// (i.e. sourceCol != iFirstClass), then can't do it. 
	if ($(target).hasClass('incoming') && (sourceCol != iFirstClass && !$(elem).data('original-yr'))) {
		return;
	}

	target.appendChild(elem);

	if ($(target).hasClass('incoming')) {
		var addp = $(target).find('.add-player');
		$(target).append(addp);
	}
	
	var targetCol = $(target).closest('div.cell').index();
	var targetRow = $(target).closest('div.row').get(0);
	
	if (e.dataTransfer.getData('incoming') && targetCol != iFirstClass) {
		$(elem).data('original-yr', 'incoming');
	}
	
	var sourceRow = $('div.row').get(sourceRowIndex);
	//var targetRow = $('div.row').get(targetRowIndex);

	calcPlayersRow(sourceRow);
	calcPlayersRow(targetRow);
	
	if (sourceCol != targetCol) {
		calcPlayersColumn(sourceCol);
		calcPlayersColumn(targetCol);
	}
}

// Testing droppable interface
function drop2(e, ui) {
	e.preventDefault();
	e.stopPropagation();
	
	var elemId = e.dataTransfer.getData("text");
	var sourceCol = e.dataTransfer.getData("col");
	var sourceRowIndex = e.dataTransfer.getData("row");
	var target = $(e.target).closest(pgroups).get(0);
	
	var elem = document.getElementById(elemId);
	
	// Clean up
	target.style.backgroundColor = "";
	$(elem).removeAttr('id');
	
	// Situation: trying to drop a player on the Incoming class. If they are already on the roster,
	// (i.e. sourceCol != iFirstClass), then can't do it. 
	if ($(target).hasClass('incoming') && (sourceCol != iFirstClass && !$(elem).data('original-yr'))) {
		return;
	}

	target.appendChild(elem);

	if ($(target).hasClass('incoming')) {
		var addp = $(target).find('.add-player');
		$(target).append(addp);
	}
	
	var targetCol = $(target).closest('div.cell').index();
	var targetRow = $(target).closest('div.row').get(0);
	
	if (e.dataTransfer.getData('incoming') && targetCol != iFirstClass) {
		$(elem).data('original-yr', 'incoming');
	}
	
	var sourceRow = $('div.row').get(sourceRowIndex);
	//var targetRow = $('div.row').get(targetRowIndex);

	calcPlayersRow(sourceRow);
	calcPlayersRow(targetRow);
	
	if (sourceCol != targetCol) {
		calcPlayersColumn(sourceCol);
		calcPlayersColumn(targetCol);
	}
}

function advanceSeason() {
	var $players = $(pgroups);
	$players.each(function() {
		var $curplyrs = $(this);
		var clss = $curplyrs.attr('class');
		// If the last class, just remove and add to table data.
		if ($curplyrs.index() == iLastClass) {
			var $p = $curplyrs.find('div.player:not([advanced])');
			$p.each(function() {
				var $plyr = $(this);
				// Check if they are redshirting
				if (!$plyr.attr('rs') || $plyr.attr('leaving')) {
					// If not redshirting, remove. Otherwise, stay where they are.
					$plyr.remove();
				} else if ($plyr.attr('rs')) {
					$plyr.removeAttr('rs');
					$plyr.attr('used-rs', 'true');
				}
			});
			
		} else {	//Advance the players each a season if they are not Redshirting
		
			var $p = $curplyrs.find('div.player:not([advanced])');
			$p.each(function() {
				var $plyr = $(this);
				
				// If they are leaving, then remove
				if ($plyr.attr('leaving')) {
					$plyr.remove();
					return;
				}
				
				// If it is an add-player block, then keep where it is
				if ($plyr.hasClass('add-player')) {
					return;
				}
				
				if (!$curplyrs.hasClass('incoming') && $plyr.attr('rs')) {		// If player is redshirting this season
					$plyr.attr('used-rs', 'true');
					$plyr.removeAttr('rs');
				} else {					// If player is not redshirting
					if ($curplyrs.hasClass('incoming')) {		// If incoming player
						if ($plyr.attr('gs')) {
							$plyr.removeAttr('gs');
							return;
						}
						$plyr.attr('rs', 'true');
					}

					$plyr.attr('advanced', 'true');
					$curplyrs.next().append($plyr);
				}
			})
		}
	});
	$advPlayers = $('div.player[advanced]');
	$advPlayers.removeAttr('advanced');
	
	fullRecalculate();
	addOneToCurrentSeason();
}

function addOneToCurrentSeason() {
	var $value = $('#CurrentSeasonValue')
	$value.text(parseInt($value.text()) + 1);
}

// Recalculates columns, rows, and the total value of scholarships
function fullRecalculate() {
	calcAllPlayersColumns();
	calcAllPlayersRows();
	calcValuesColumn();
}

// Recalculates the column scholarship values
function calcAllPlayersColumns() {
	// Calculate the columns automatically upon opening
	for (var i = iFirstClass; i <= iLastClass; i++) {
		calcPlayersColumn(i);
	}
}

function calcAllPlayersRows() {
	$('div.row.position').each(function() {
		calcPlayersRow(this);
	});
}

function calcPlayersColumn(index) {
	var count = $('div.row.position').find('div.cell:eq(' + index + ') > div.player:not(.add-player):visible').length;
	
	// Update year total values
	$('div.row.yr-totals').find('div.cell:eq(' + index + ')').text(count.toString());
}

function calcValuesColumn() {
	
	// Update year total values
	$('span.total-value.final ').text($('div.players:not(.incoming) > div.player:visible').length.toString());
}

function calcPlayersRow(row) {
	var count = $(row).find('div.players:not(.incoming) > div.player:visible').length;

	// Update year total values
	$(row).find('span.total-value').text(count.toString());
}

function calcTargetTotal() {
	var count = 0;
	$('div.row.position span.inner-cell.target-value').each(function() {
		count += parseInt($(this).text());
	});
	$('div.row.headers div.cell.total-value span.target-value').text(count);
}

// Target value adjustments
function clickTargetValue(trgt) {
	var on = $(trgt).attr('on');
	
	if (on) {
		/*var num = $(trgt).find('input').val();
		$(trgt).text(num);
		$(trgt).removeAttr('on');*/
	} else {
		var curval = parseInt($(trgt).text());
		var inpt = getTargetInput(curval);
		$(trgt).html(inpt);
		var $in = $(trgt).find('input');
		$in.focus();
		$in.select();
		$(trgt).attr('on', 'true');
		
		// Attach listeners: blur (mouse click elsewhere), enter key, escape key
		$in.keydown(function() {
			// Enter key (submit number)
			if (event.keyCode == 13) {
				setTargetValue();
			}
			
			// Escape key (cancel)
			if (event.keyCode == 27) {
				cancelSetTargetValue();
			}
		});
		
		$in.blur(function() {
			setTargetValue();
		});
		
		function setTargetValue() {
			$(trgt).text($in.val());
			$(trgt).removeAttr('on');
			calcTargetTotal();
		}
		
		function cancelSetTargetValue() {
			$(trgt).text(curval);
			$(trgt).removeAttr('on');
		}
	}
}

function getTargetInput(init) {
	var elem = '<input type="number" max="20" min="0" step="1" value="' + init + '"></input>';
	return elem;
}
