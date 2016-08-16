var iFirstClass = $('div.cell.yr:first').index();
var iFirstPos = $('div.cell.pos-head:first').parent().index();
var NUM_CLASSES = $('div.cell.yr').length;
var NUM_POSITIONS = $('div.cell.pos-head').length;
var NUM_HEADERS = $('div.row.headers').length;
var iLastClass = NUM_CLASSES - iFirstClass + 1;
var iLastPosition = NUM_POSITIONS + NUM_HEADERS - iFirstPos + 1;

// Calculate column, row and team totals
fullRecalculate();

// Advance season on click
$('#AdvanceSeason').click(function() {advanceSeason();});

// Add recruits event listening
$('#AddRecruits').click(function() {addRecruits();});

$('#Filter').click(function() {clickFilter();});

// Add help click event listening
$('#Help').click(function() {clickHelp();});

// Add filter event listening
initiateFilterListeners();

// Set all players to be draggable
var $players = $('div.player:not(.add-player)');

// Set all div.players elements to accept drops
var pgroups = 'div.players';
var $playergroups = $(pgroups);

// Add listeners to both player elements and players drop zone elements
initiateChangeListeners();

// Add click listener to the add-player buttons
$('div.add-player').click(function() {addPlayerName(this);});

var source;

function clickFilter() {
	var $btn = $('#Filter');
	var on = $btn.attr('on');
	
	// If help is on, turn it off
	if ($('#Help').attr('on')) {
		clickHelp();
	}
	
	if (on) {
		$btn.removeAttr('on');
		$('.filter-menu').css('display', 'none');
	} else {
		$btn.attr('on', 'true');
		$('.filter-menu').css('display', 'block');
	}
	
}

function clickHelp() {
	var $helpbtn = $('#Help');
	var $helpblock = $('#helpblock');
	var helpon = $helpbtn.attr('on');
	
	// Check if filter is on, if so, turn it off
	if ($('#Filter').attr('on')) {
		clickFilter();
	}
	
	if (helpon) {
		$helpbtn.removeAttr('on');
		$helpblock.css('display', 'none');
	} else {
		$helpbtn.attr('on', 'true');
		$helpblock.css('display', 'block');
	}
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
			var value = $in.val();		// Get current value of input box
			$in.prop("selected", "false");	// De-select the input box
			var e = getPlayerElement();		// Build a new player HTML element
			var $test = $(e).html(value);	// Add content to the player element
			var $par =  $(target).closest('div.players');	// Get the parent div.players element
			$par.append($test.get(0));		// Append a new player element to the end of the div.players element
			$par.append(target);			// Append the original add-player box the user clicked (keep it last)
			if ($(target).attr('leaving')) {		// This shouldn't need to be done - remove listeners from add-player elements
				$(target).removeAttr('leaving');
			}
			$(target).text(originaltext);

			// Recalculate the total in the column
			calcPlayersColumn($par.index());
			
			// Add listeners to the added element
			initiatePlayerChangeListeners($test.get(0))
		  } 
		  
		  if (event.keyCode == 27) {
			  $in.prop("selected", "false");	// De-select the input box
			  $(target).text(originaltext);
		  }
	});
}

function getPlayerElement() {
	var elem = '<div class="player" draggable="true"></div>';
	return elem;
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
		filterRS(this);
	});
	
	$('#Filter-RSAvailable').click(function() {
		filterRSAvailable(this);
	});
	
	$('#Filter-UsedRS').click(function() {
		filterUsedRS(this);
	});
	
	$('#Filter-Off').click(function() {
		filterTurnAllOff(this);
		fullRecalculate();
	});
}

// Filter functions

// Turn off all players who are not using their RS this year.
function filterRS(btn) {
	filterTurnAllOff(btn);
	
	if ($(btn).attr('on')) {
		$('div.player:not(.example, .add-player, [rs])').css('display', 'inline-block');
		$(btn).removeAttr('on');
	} else {
		$('div.player:not(.example, .add-player, [rs])').css('display', 'none');
		$(btn).attr('on', 'true');
	}
	
	fullRecalculate();
}

// Turn off all players who do not have a redshirt available
function filterRSAvailable(btn) {
	filterTurnAllOff(btn);
	
	if ($(btn).attr('on')) {
		$('div.player[used-rs]:not(.example, .add-player), div.incoming > div.player:not(.add-player)').css('display', 'inline-block');
		$(btn).removeAttr('on');
	} else {
		$('div.player[used-rs]:not(.example, .add-player), div.incoming > div.player:not(.add-player)').css('display', 'none');
		$(btn).attr('on', 'true');
	}
	
	fullRecalculate();
}

// Turn off all players who have not already used their redshirt
function filterUsedRS(btn) {
	filterTurnAllOff(btn);
	
	if ($(btn).attr('on')) {
		$('div.player:not(.example, .add-player, [used-rs])').css('display', 'inline-block');
		$(btn).removeAttr('on');
	} else {
		$('div.player:not(.example, .add-player, [used-rs])').css('display', 'none');
		$(btn).attr('on', 'true');
	}
	
	fullRecalculate();
}

// Turn off all filters except for the button that was clicked
function filterTurnAllOff(btn) {
	var filtertext = 'ul.filter-menu > li:not(#' + $(btn).attr('id') + ')';
	$(filtertext).removeAttr('on');
	$('div.player:not(.example, .add-player)').css('display', 'inline-block');
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
	//e.datatransfer.setDragImage(e.target,0,0);
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
		//target.style.backgroundColor = "";
		//$(elem).removeAttr('id');
		return;
	}

	target.appendChild(elem);
	
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
	$('div.total-value.final').text($('div.players:not(.incoming) > div.player:visible').length.toString());
}

function calcPlayersRow(row) {
	var count = $(row).find('div.players:not(.incoming) > div.player:visible').length;

	// Update year total values
	$(row).find('div.total-value').text(count.toString());
}
