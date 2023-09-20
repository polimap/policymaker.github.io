/*
 * PolicyMaker 5:
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */
/* PolicyMaker Grids */

function GridSettings(table, sortColumn, rowHeightSet)
{
	this.grid = null;
	this.gridTable = table;
	this.rowHeight = rowHeightSet; //keep in sync with options.rowHeight
	this.columns = null;
	this.keyColumnIndex = -1;
	this.options =
		{
			enableCellNavigation: true,
			enableColumnReorder: false,
			rowHeight: rowHeightSet,
	        fullWidthRows: true
		};
	this.isAsc = true;
	this.currentSortCol = { id: sortColumn };
	this.indices = null;
	this.contextMenuSelectedDataRow = null;
	this.contextMenuSelectedOption = null;
}
GridSettings.prototype =
{
	findGridRowIndexForCellWithValue : function (cellKey, keyColumnIndex)
	{
		for (var I = 0; I < this.gridTable.length; I++)
		{
			var thisIdCell = this.grid.getCellNode(I, keyColumnIndex);
			if (thisIdCell)
			{
				if (thisIdCell.textContent == cellKey)
				{
					return I;
				}
			}
		}
		return -1;
	},
	findDataRowForKeyValue : function (cellKey)
	{
		for (var I = 0; I < this.gridTable.length; I++)
		{
			if (this.gridTable[I][this.columns[this.keyColumnIndex].field] == cellKey)
			{
				return this.gridTable[I];
			}
		}
	},
	getTableLength : function ()
	{
		return this.gridTable.length;
	},
	getTableItem : function(index)
	{
		if (this.isAsc)
			return this.gridTable[this.indices[this.currentSortCol.id][index]];
		else
			return this.gridTable[this.indices[this.currentSortCol.id][(this.gridTable.length - 1) - index]];
	},
};

var GridStatic = {};

GridStatic.additionalPageSetup = function(code)
{
	if (GridStatic[code].hasAdd)
	{
		$( "#bAddItem" ).button({ icons: { primary: "ui-icon-plus" } });
		$( "#bAddItem" ).unbind('click');
		$( "#bAddItem" ).click(function()
		{
			if (modalDialogShown)
			{
				return; //do not allow an Add action when a dialog is shown (otherwise multiple dialogs will be shown)
			}
			DialogStatic.showStandardDialog(code, true);
			return false;
		});
	}
	if (GridStatic[code].otherButtonsAndDialogs)
	{
		var otherBtnDial = GridStatic[code].otherButtonsAndDialogs;
		for (var I = 0; I < otherBtnDial.length; I++)
		{
			var vName = otherBtnDial[I].name;
			var selIdBtn = "#" + otherBtnDial[I].btnName;
			$( selIdBtn ).button({ icons: { primary: otherBtnDial[I].icon } });
			$( selIdBtn ).unbind('click');
			$( selIdBtn ).click(function()
			{
				if (modalDialogShown)
				{
					return; //do not allow an Add action when a dialog is shown (otherwise multiple dialogs will be shown)
				}
				
				GridStatic.showOtherDialog(this.id);
				return false;
			});
		}
	}
};
GridStatic.showOtherDialog = function(btnName)
{
	switch(btnName)
	{
	case GridStatic.PL.otherButtonsAndDialogs[0].btnName:
		DialogStatic.showTrumpDialog();
		break;
	case GridStatic.CL.otherButtonsAndDialogs[0].btnName:
	case GridStatic.CL.otherButtonsAndDialogs[1].btnName:
	case GridStatic.CL.otherButtonsAndDialogs[2].btnName:
		DialogStatic.showCoalitionDialog(btnName);
		break;
	}
};

function getGridsTableLength()
{
	return currentGrid.getTableLength();
}
function getGridItem(index)
{
	return currentGrid.getTableItem(index);
}

GridStatic.buildGrid = function(gridParentDivID)
{
	currentGrid.columns = GridStatic.buildColumns(GridStatic[winID]);

	currentGrid.indices = GridStatic.buildIndices(currentGrid.columns);

	currentGrid.grid = new Slick.Grid("#" + gridParentDivID,
		{
			getLength: getGridsTableLength,
			getItem: getGridItem
		},
		currentGrid.columns,
		currentGrid.options
	);

	currentGrid.grid.setSelectionModel(new Slick.RowSelectionModel());

	currentGrid.grid.onContextMenu.subscribe(function (e)
	{
		if (modalDialogShown)
		{
			return; //do not show the context menu when a dialog is shown 
		}
		e.preventDefault();
		var cell = currentGrid.grid.getCellFromEvent(e);

		//make the current row selected
		var selectedRows = [];
		selectedRows[0] = cell.row;
		currentGrid.grid.setSelectedRows(selectedRows);

		//Save this for use in case we want to edit or delete it
		currentGrid.contextMenuSelectedDataRow = currentGrid.findDataRowForKeyValue(currentGrid.grid.getCellNode(cell.row, currentGrid.keyColumnIndex).textContent);

		$("#contextMenu")
			.data("row", cell.row)
			.css("top", e.pageY)
			.css("left", e.pageX)
			.show();

		if (GridStatic[winID].editOnly == true)
		{
			$("#ctextAdd").hide();
			$("#ctextDelete").hide();
		}
		else
		{
			$("#ctextAdd").show();
			$("#ctextDelete").show();
		}

		$("body").one("click", function ()
		{
			$("#contextMenu").hide();
		});
	});

	currentGrid.grid.onSort.subscribe(function (e, args)
	{
		var cellKey = -1;
		var selectedRows = currentGrid.grid.getSelectedRows();
		if (selectedRows && selectedRows.length > 0)
		{
			var idCellInSelectedRow = currentGrid.grid.getCellNode(selectedRows[0], currentGrid.keyColumnIndex);
			cellKey = idCellInSelectedRow.textContent;
		}
		currentGrid.currentSortCol = args.sortCol;
		currentGrid.isAsc = args.sortAsc;
		currentGrid.grid.invalidateAllRows();
		currentGrid.grid.render();
		if (cellKey > -1)
		{
			var rowIxNew = currentGrid.findGridRowIndexForCellWithValue(cellKey, currentGrid.keyColumnIndex);
			if (rowIxNew > -1)
			{
				selectedRows = [];
				selectedRows[0] = rowIxNew;
				currentGrid.grid.setSelectedRows(selectedRows);
			}
		}
	});

};

GridStatic.buildIndices = function(columns)
{
	var indices = [];
	for (var ix = 0; ix < columns.length; ix++)
	{
		var field = columns[ix].id;
		var indexForField = GridStatic.getIndexForField(currentGrid.gridTable, field);
		indices[field] = indexForField;
	}
	return indices;
};

GridStatic.getIndexForField = function(toSort, field)
{
	var localSort = [];
	for (var i = 0; i < toSort.length; i++)
	{
		var strVal = "" + toSort[i][field];
		strVal = strVal.toLowerCase();
		localSort[i] = [strVal, i];
	}

	localSort.sort(function(left, right)
	{
		return left[0] < right[0] ? -1 : 1;
	});

	var sortIndices = [];

	for (var j = 0; j < localSort.length; j++)
	{
		sortIndices.push(localSort[j][1]);
		localSort[j] = localSort[j][0];
	}
	return sortIndices;
};

GridStatic.getIndexForCoalition = function()
{
	var localSort = [];
	for (var i = 0; i < MODEL[TABLE_COALITION].length; i++)
	{
		var item = MODEL[TABLE_COALITION][i];
		var strVal = "" + item.Coal_Type + "-";
		switch(item.Coal_Type)
		{
		case 1:
			strVal += ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Player_name", item.Coal_Ent_ID);
			break;	
		case 2:
			strVal += item.Coal_Text;
			break;
		case 3:
			strVal += ModelStatic.getZeroPaddedNumber(item.Coal_Angle, 3);
			break;
		}
		localSort[i] = [strVal, i];
	}

	localSort.sort(function(left, right)
	{
		return left[0] < right[0] ? -1 : 1;
	});

	var sortIndices = [];

	for (var j = 0; j < localSort.length; j++)
	{
		sortIndices.push(localSort[j][1]);
		localSort[j] = localSort[j][0];
	}
	return sortIndices;
};

GridStatic.buildColumns = function(gridDef)
{
	var newColumns = [];
	var col;
	for (var I = 0; I < gridDef.columnDefs.length; I++)
	{
		col =
		{
			id: gridDef.columnDefs[I].field,
			name: gridDef.columnDefs[I].label,
			field: gridDef.columnDefs[I].field,
			minWidth: gridDef.columnDefs[I].width,
			sortable: true
		};
		if (gridDef.columnDefs[I].formatter)
		{
			col.formatter = gridDef.columnDefs[I].formatter;
		}
		newColumns.push(col);
	}
	//ID column
	col =
	{
		id: gridDef.idColumn,
		name: "ID",
		field: gridDef.idColumn,
		maxWidth: 1,
		minWidth: 1,
		sortable: false,
		cssClass: "fullyHidden",
		headerCssClass: "fullyHidden"
	};
	newColumns.push(col);
	currentGrid.keyColumnIndex = newColumns.length - 1; //for ID - made invisible through CSS - MUST BE LAST to avoid displaying it
	return newColumns;
};

GridStatic.getColumnPixelTotal = function(pageCode)
{
	var tot = 0;
	var colDefs = GridStatic[pageCode].columnDefs;
	for (var I = 0; I < colDefs.length; I++)
	{
		tot += colDefs[I].width;
	}
	return tot;
};

GridStatic.colorCodedCell = function(type, cellValue, backgroundColor)
{
	var colorCell = GridStatic.colorCell(type, cellValue);

	if (backgroundColor == "")
		return '<div class="colorcellicon" style="background-color:' + colorCell.color + 
			';"></div><div class="colorcelltext">' + colorCell.text + "</div>";
	else
		return '<div style="height: 100%; background-color: ' + backgroundColor +
			';"><div class="colorcellicon" style="background-color:' + colorCell.color +
			';"></div><div class="colorcelltext">' + colorCell.text + "</div></div>";
};
GridStatic.colorCodedCellDialog = function(idIcon, idText, type, cellValue)
{  
	var colorCell = GridStatic.colorCell(type, cellValue);
	
	return '<table width="100%"><tr><td style="width: 50%; margin-left: 5px">' +
	       '<div id="' + idIcon +
		   '" class="colorcellicondial" style="float: right; background-color:' + colorCell.color + 
		   ';"></div><td id="' + idText +
		   '"  style="text-align: left; padding-left: 5px;">' + colorCell.text + "</td></tr></table>";
};
GridStatic.colorCodedReportCell = function(type, cellValue)
{  
	var colorCell = GridStatic.colorCell(type, cellValue);
	return '<div class="colorcellicondial" style="float:left; margin-left: 10px; margin-top: 4px; margin-bottom: 4px; background-color:' + 
	colorCell.color + 
   	';"></div><div style="margin-left: 70px; margin-top: 4px;">' + 
   	colorCell.text + 
   	"</div>";

};
GridStatic.getProbabilityTableCell = function(row, field, isHorizontal)
{
	var colorCell = GridStatic.getProbabilityColorCell(GridStatic.evaluateProbabilityValue(row[field]));
	
	if (isHorizontal)
	{
		return '<div class="colorcellicondial" style="float:left; margin-left: 10px; margin-top: 4px; margin-bottom: 4px; background-color:' + 
		colorCell.color + 
	   	'; width: 30px;"></div><div style="margin-top: 4px;">' + 
	   	row[field] + 
	   	"</div>";
	}
	else
	{
		return '<div align="center" class="colorcellicondial" style="margin:0 auto; background-color:' + 
		colorCell.color + 
	   	';"></div><div style="text-align: center; margin-top: 4px;">' + 
	   	row[field] + 
	   	"</div>";
	}
};

GridStatic.colorCell = function(type, cellValue)
{
	switch(type)
	{
	case "POSITION":
		return GridStatic.getPositionColorCell(cellValue);
		
	case "POWER-AND-PRIORITY":
		return GridStatic.getPowerColorCell(cellValue);
 
 	case "PROBABILITY":
		return GridStatic.getProbabilityColorCell(cellValue);
	}
};
GridStatic.colorLegend = function(legend)
{
	var valArr;
	switch(legend.type)
	{
	case "POSITION":
		valArr = GridStatic.positionValueArr;
		break;
	case "POWER-AND-PRIORITY":
		valArr = GridStatic.powerValueArr;
		break;
	case "PROBABILITY":
		valArr = GridStatic.probabilityValueArr;
		break;
	}
	var html = '<div style="position: relative;">';
	for (var I = 0; I < legend.values.length; I++)
	{
		var left = I * 16;
		var ix = legend.values[I];
		html += '<div class="colorcelllegend" style="background-color:' + valArr[ix].color + 
			'; left:' + left +
			'px; margin-top: -7px;"></div>';
			//';"></div>';
	}
	html += '</div>';
	return html;
};

GridStatic.getFieldWithName = function(fields, fieldName)
{
	for (var I = 0; I < fields.length; I++)
	{
		if (fields[I].field == fieldName)
			return fields[I];
	}
};

function ColorCell(color, text, textColor)
{
	this.color = color;
	this.text = text;
	this.textColor = textColor;
}

GridStatic.positionValueArr =
[
	{ text : "High Support", color: "#008001", textColor: "#ffffff" },
	{ text : "Medium Support", color: "#00ff01", textColor: "#000000" },
	{ text : "Low Support", color: "#c0febf", textColor: "#000000" },
	{ text : "Non-Mobilized", color: "#ffffff", textColor: "#000000" },
	{ text : "Low Opposition", color: "#ffc1c1", textColor: "#000000" },
	{ text : "Medium Opposition", color: "#ff3f3f", textColor: "#ffffff" },
	{ text : "High Opposition", color: "#fd0001", textColor: "#ffffff" },
];

GridStatic.getPositionColorCellFromArr = function(oneBasedIndex)
{
	var pos = GridStatic.positionValueArr[oneBasedIndex - 1];
	return new ColorCell(pos.color, pos.text, pos.textColor);
};

GridStatic.getPositionColorCell = function(cellValue)
{
	switch(cellValue)
	{
	case 1:
	case 2:
	case 3:
	case 4:
	case 5:
	case 6:
	case 7:
		return GridStatic.getPositionColorCellFromArr(cellValue);
	case 0:
	default:
		return new ColorCell("#c0c0c0", "(Not Set)", "#000000");
	}
};

GridStatic.powerValueArr =
[
	{ text : "(Not Set)", color: "#c0c0c0", textColor: "#000000" },
	{ text : "High", color: "#000000", textColor: "#ffffff" },
	{ text : "Medium", color: "#808080", textColor: "#ffffff" },
	{ text : "Low", color: "#ffffff", textColor: "#000000" },
];

GridStatic.getPowerColorCellFromArr = function(oneBasedIndex)
{
	var pow = GridStatic.powerValueArr[oneBasedIndex];
	return new ColorCell(pow.color, pow.text, pow.textColor);
};

GridStatic.getPowerColorCell = function(cellValue)
{
	switch(cellValue)
	{
	case 0:
	case 1:
	case 2:
	case 3:
		return GridStatic.getPowerColorCellFromArr(cellValue);
	default:
		return GridStatic.getPowerColorCellFromArr(0);
	}
};

GridStatic.probabilityValueArr =
[
	{ text : "(Not Set)", color: "#c0c0c0", textColor: "#000000" },
	{ text : "Very Low", color: "#0000ff", textColor: "#ffffff" },
	{ text : "Low", color: "#add8e6", textColor: "#000000" },
	{ text : "Medium", color: "#ffffff", textColor: "#000000" },
	{ text : "High", color: "#f4b4c0", textColor: "#000000" },
	{ text : "Very High", color: "#ff0000", textColor: "#ffffff" },
];

GridStatic.getProbabilityColorCell = function(cellValue)
{
	//quintiles
	switch(cellValue)
	{
	case 1:
	case 2:
	case 3:
	case 4:
	case 5:
		{
			var probVal = GridStatic.probabilityValueArr[cellValue];
			return new ColorCell(probVal.color, probVal.text, probVal.textColor);
		}
	default: //including -1
		{
			var probVal = GridStatic.probabilityValueArr[0];
			return new ColorCell(probVal.color, probVal.text, probVal.textColor);
		}
	}
};

//TODO zero 0 is being evaluated as -1 - decimal / integer issue?
GridStatic.evaluateProbabilityValue = function(pctVal)
{
	if (typeof pctVal === "undefined")
		return -1;
	if (pctVal < 0 || pctVal > 100)
		return -1;
	if (pctVal > 80)
		return 5;
	if (pctVal > 60)
		return 4;
	if (pctVal > 40)
		return 3;
	if (pctVal > 20)
		return 2;
	return 1;
};

GridStatic.getIndexOfSelectedRow = function()
{
	var selectedRows = currentGrid.grid.getSelectedRows();
	if (!selectedRows || selectedRows.length < 1)
		return -1;
	return selectedRows[0];
};
GridStatic.selectNextOrPrevRow = function(isNext, currentIndex)
{
	var dataview = currentGrid.grid.getData();
	var ix = currentIndex;
	if (isNext)
	{
		ix++;
		if (ix >= dataview.getLength())
		{
			return; //at end
		}
	}
	else
	{
		ix--;
		if (ix < 0)
		{
			return; //at start
		}
	}
	selectedItems = [];
	selectedItems.push(ix);
	currentGrid.grid.setSelectedRows(selectedItems);
	currentGrid.contextMenuSelectedDataRow = dataview.getItem(ix);
	DialogStatic.targetRow = currentGrid.contextMenuSelectedDataRow;
};
GridStatic.getCombinationFieldText = function(field, row)
{
	switch(field)
	{
	case "Conseq_player_ID":
		{
	    	var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", row["Conseq_player_ID"]);
	    	return "<div style='white-space: normal'>" + playerName + ": " + row["Conseq_identity"] + "</div>";
		}
	case "PlayerInterest":
		{
	    	var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", row["Player_ID"]);
	    	return "<div style='white-space: normal'>" + playerName + ": " + row["Objective"] + "</div>";
		}
	case "calcPlayer":
		{
	    	return "<div style='white-space: normal'>" + ModelStatic.getPlayerNamesForAffectedPlayerForStrategy(row["Strategy_ID"]) + "</div>";
		}
	case "Action":
		{
	    	return "<div style='white-space: normal'>" + row["Strategy_name"] + ": " + row["Action"] + "</div>";
		}
	case "PlayerName":
		{
	    	var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", row["Player_ID"]);
	    	return "<div style='white-space: normal'>" + playerName + "</div>";
		}
	case "Strategy_ID":
		{
	    	var stratDesc = ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Action", row["Strategy_ID"]);
	    	return "<div style='white-space: normal'>" + stratDesc + "</div>";
		}
	case "ExpImpact":
		{
	    	var impact = GridStatic.SM.getExpectedImpact(row["Player_ID"], row["Future_position_rating"], row["Future_power_rating"]);
	    	var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", row["Player_ID"]);
	    	return "<div style='white-space: normal'>" + playerName + ": " + impact + "</div>";
		}
	default:
		return '';
	}
};

//Goals Grid Definition
GridStatic.CT = {};
GridStatic.CT.table = "Policy_Goal"; //TODO better default sort needed
GridStatic.CT.idColumn = "Goal_ID";
GridStatic.CT.initialSortColumn = "Goal";
GridStatic.CT.rowHeight = 110;
GridStatic.CT.editOnly = false;
GridStatic.CT.hasAdd = true;
GridStatic.CT.addButtonText = "Add";
GridStatic.CT.addAnother = "Add Another";
GridStatic.CT.nextPreviousButtons = true;
GridStatic.CT.header = {
	headerText : "Click on the 'Add' button to add a goal, its mechanism and indicator.",
	headerRelHeight : 125
};
GridStatic.CT.columnDefs = [
	{ field: "Goal", label: "Name", width: 357, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Goal"] + "</div>";
	    }
	},
	{ field: "Rel_priority", label: "Priority", width: 140, type: "POWER-AND-PRIORITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", dataContext["Rel_priority"], "#f4f0d6");
	    }
	},
	{ field: "Mechanism", label: "Mechanism", width: 232, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Mechanism"] + "</div>";
	    }
	},
	{ field: "Indicator", label: "Indicator", width: 231, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Indicator"] + "</div>";
	    }
	},
	//{ field: "Note", label: "Note", width: 30} //TODO PLACEHOLDER fix this
];
GridStatic.CT.dialog =
{
	name : "goalDialog",
	objectDisplayName : "Policy Goal",
	vertSizing : "auto",
	fields : [
		{ field: "Goal", title: "Define Goal", type: "longtext", required : "error9"},
		{ field: "Mechanism", title: "Mechanism", type: "longtext" },
		{ field: "Indicator", title: "Indicator", type: "longtext" },
		{ field: "On_agenda", title: "On Agenda", type: "select" },
		{ field: "Rel_priority", title: "Priority", type: "scalar" },
	],
};
GridStatic.CT.deleteDialog = 
{
	title : "Policy Goal",
	deleteDescriptionIDField : "Goal",
	getDeleteDescriptionField : function(goal)
	{
		return goal;
	}
};

//Player Grid Definition
//TODO: Special features - Trump button, etc
GridStatic.PL = {};
GridStatic.PL.table = "Player";
GridStatic.PL.idColumn = "Player_ID";
GridStatic.PL.initialSortColumn = "Player_name";
GridStatic.PL.rowHeight = 28;
GridStatic.PL.editOnly = false;
GridStatic.PL.hasAdd = true;
GridStatic.PL.addButtonText = "Add";
GridStatic.PL.addAnother = "Add Another";
GridStatic.PL.nextPreviousButtons = true;
GridStatic.PL.header = {
	headerText : "Click on the 'Add' button. Enter player information.  Indicate the position on the policy (extent of support, non-mobilized, opposition).  Determine the level of power of the players on the policy relative to other players.  Assign a trump weight to the most powerful player (optional). This can be done by clicking on the 'Trump' button below.",
	headerRelHeight : 182,
	legends: [
		{ name: "Position", type: "POSITION", lefttext: "Opposes", righttext: "Supports", values: [6,5,4,3,2,1,0]},
		{ name: "Power", type: "POWER-AND-PRIORITY", lefttext: "Low", righttext: "High", values: [3,2,1]},
	],
};
GridStatic.PL.columnDefs = [
	{ field: "Player_name", label: "Name", width: 350, type: "text"},
	{ field: "Level", label: "Level", width: 100, type: "text"},
	{ field: "Sector", label: "Sector", width: 130, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Sector"] + "</div>";
	    }
	},
	{ field: "Position_rating", label: "Position", width: 200, type: "POSITION", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POSITION", dataContext["Position_rating"], "");
	    }
	},
	{ field: "Strength_of_influence", label: "Power", width: 164, type: "POWER-AND-PRIORITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", dataContext["Strength_of_influence"], "");
	    }
	}
];//Total: 874
GridStatic.PL.dialog =
{
	name : "playerDialog",
	objectDisplayName : "Player",
	vertSizing : "auto",
	fields : [
		{ field: "Player_name", title: "Player Name", type: "text", required: "error1", validationFunction : function(fieldValue)
			{
				return (fieldValue.length < 71) ? 0 : "error27";
			}
		},
		{ field: "Player_abbrev", title: "Player Abbreviation", type: "shorttext" },
		{ field: "Player_details", title: "Additional Information", type: "longtext" },
		{ field: "Sector", title: "Sector", type: "select" },
		{ field: "Level", title: "Level", type: "select", required: "error2" },
		{ field: "PosValue", title: "Player's Position", type: "scalar" },
		{ field: "PowValue", title: "Player's Power", type: "scalar" },
	],
};
GridStatic.PL.deleteDialog = 
{
	title : "Player Name",
	deleteDescriptionIDField : "Player_name",
	getDeleteDescriptionField : function(playerName)
	{
		return playerName;
	}
};
GridStatic.PL.otherButtonsAndDialogs = [
{
	name : "Trump",
	btnName : "bTrumpBtn",
	dialogId : "trumpDialog",
	icon : "ui-icon-newwin",
	objectDisplayName : "Set Trump Player",
	vertSizing : "auto",
	fields : [
		{ field: "Player_ID", title: "Player Name", type: "player" },
		{ field: "Weight", title: "Weight (2 - 5)", type: "shorttext"},
	],	
}];

//Consequence Grid Definition - TODO: Sort on Player_name (join)
GridStatic.CN = {};
GridStatic.CN.table = "Consequences";
GridStatic.CN.idColumn = "Conseq_ID";
GridStatic.CN.initialSortColumn = "Conseq_qual";
GridStatic.CN.rowHeight = 80;
GridStatic.CN.editOnly = false;
GridStatic.CN.hasAdd = true;
GridStatic.CN.addButtonText = "Add";
GridStatic.CN.addAnother = "Add Another";
GridStatic.CN.nextPreviousButtons = true;
GridStatic.CN.header = {
	headerText : "Assess the consequences of your policy for key players.", //Same as WINDOWMETADATA.longdesc
	headerRelHeight : 125,
	legends: [
		{ name: "Importance", type: "POWER-AND-PRIORITY", lefttext: "Low", righttext: "High", values: [3,2,1]},
	],

};
GridStatic.CN.columnDefs = [
	{ field: "Conseq_qual", label: "Type", width: 120, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Conseq_qual"] + "</div>";
	    }
	},
	{ field: "Conseq_player_ID", label: "Player / Identity", width: 320, type: "combination", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("Conseq_player_ID", dataContext);
	    }
	},
	{ field: "Conseq_size", label: "Size", width: 190, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Conseq_size"] + "</div>";
	    }
	},
	{ field: "Conseq_timing", label: "Timing", width: 204, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Conseq_timing"] + "</div>";
	    }
	},
	{ field: "Conseq_intensity_rating", label: "Import.", width: 144, type: "POWER-AND-PRIORITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", dataContext["Conseq_intensity_rating"], "");
	    }
	},
	//{ field: "Custom_sort", label: "Cust", width: 30},
];
GridStatic.CN.dialog =
{
	name : "consDialog",
	objectDisplayName : "Consequence",
	vertSizing : "auto",
	fields : [
		{ field: "Conseq_identity", title: "Consequence description", type: "longtext", required : "error10" },
		{ field: "Conseq_size", title: "Describe the size of the consequence", type: "longtext" },
		{ field: "Conseq_timing", title: "Describe the timing of the consequence", type: "longtext" },
		{ field: "Conseq_qual", title: "Consequence type", type: "select" },
		{ field: "Conseq_intensity_rating", title: "Importance", type: "scalar" },
		{ field: "Conseq_player_ID", title: "A consequence for whom", type: "player", required : "error11" },
	],
};
GridStatic.CN.deleteDialog = 
{
	title : "Consequence",
	deleteDescriptionIDField : "Conseq_identity",
	getDeleteDescriptionField : function(conseqIdent)
	{
		return conseqIdent;
	}
};

//Interests Grid Definition
GridStatic.PI = {};
GridStatic.PI.table = "Objectives";
GridStatic.PI.idColumn = "Objective_ID";
GridStatic.PI.initialSortColumn = "Objective_ID"; //TODO Sort by player_name (join)
GridStatic.PI.rowHeight = 70;
GridStatic.PI.editOnly = false;
GridStatic.PI.hasAdd = true;
GridStatic.PI.addButtonText = "Add";
GridStatic.PI.addAnother = "Add Another";
GridStatic.PI.nextPreviousButtons = true;
GridStatic.PI.header = {
	headerText : "Analyze the interests of key players involved in your policy.",  //Same as WINDOWMETADATA.longdesc
	headerRelHeight : 125,
	legends: [
		{ name: "Priority", type: "POWER-AND-PRIORITY", lefttext: "Low", righttext: "High", values: [3,2,1]},
	],
};
GridStatic.PI.columnDefs = [
	{ field: "Player_ID", label: "Player / Interest", width: 652, type: "combination", combinationName: "PlayerInterest", formatter:  
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("PlayerInterest", dataContext);
	    }
	},
	{ field: "Type", label: "Type", width: 144, type: "text" },
	{ field: "Priority", label: "Priority", width: 144, type: "POWER-AND-PRIORITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", dataContext["Priority"], "");
	    }
	},
	//TODO Custom sort?
];
GridStatic.PI.dialog =
{
	name : "interDialog",
	objectDisplayName : "Interest",
	vertSizing : "auto",
	fields : [
		{ field: "Player_ID", title: "Player Name", type: "player", required : "error13" },
		{ field: "Type", title: "Type of Interest", type: "select" },
		{ field: "Priority", title: "Priority", type: "scalar" },
		{ field: "Objective", title: "Interest", type: "longtext", required : "error12" },
	],
};
GridStatic.PI.deleteDialog = 
{
	title : "Interest",
	deleteDescriptionIDField : "Objective_ID",
	getDeleteDescriptionField : function(objectiveID)
	{
		var playerID = ModelStatic.getFieldFromRowBasedOnKey("Objectives", "Player_ID", objectiveID);
		var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", playerID);
		var interest = ModelStatic.getFieldFromRowBasedOnKey("Objectives", "Objective", objectiveID);
		return playerName + ": " + interest;
	}
};

//Coalition Map Definition
GridStatic.CL = {};
GridStatic.CL.header = {
	headerText : "Construct a map of the coalitions among key players.  Click 'Add' to add a player, caption or divider. Click 'Options' to add concentric circles.  Click 'Remove' to remove an item from the map.  Click and drag players and captions to arrange them.",
	headerRelHeight : 168,
	legends: [
		{ name: "Position", type: "POSITION", lefttext: "Opposes", righttext: "Supports", values: [6,5,4,3,2,1,0]},
	],
};
GridStatic.CL.otherButtonsAndDialogs = [ 
	{
		name : "Add",
		btnName : "bAddCoal",
		dialogId : "addCoalDialog",
		icon : "ui-icon-plus",
		displayFunction : function(name)
		{
			DialogStatic.showCoalitionDialog(name);
		},
		objectDisplayName : "Add to the Coalition Map",
		vertSizing : "auto",
		fields : [
			{ field: "addRadio" },
			{ field: "playerSel"},
			{ field: "coalCaption" },
			{ field: "coalAngle"},
		],
		errorCode : "",
		errorFieldIndex : -1,	
	},
	{
		name : "Remove",
		btnName : "bDelCoal",
		dialogId : "delCoalDialog",
		icon : "ui-icon-trash",
		displayFunction : function(name)
		{
			DialogStatic.showCoalitionDialog(name);
		},
		objectDisplayName : "Remove an Item from the Coalition Map",
		vertSizing : "auto",
		fields : [
			{ field: "coalSel" },
		],
		errorCode : "",	
		errorFieldIndex : -1,	
	},
	{
		name : "Options",
		btnName : "bOptCoal",
		dialogId : "optCoalDialog",
		icon : "ui-icon-gear",
		displayFunction : function(name)
		{
			DialogStatic.showCoalitionDialog(name);
		},
		objectDisplayName : "Coalition Map: Options",
		vertSizing : "auto",
		fields : [
			{ field: "innerCircle" },
			{ field: "outerCircle" },
		],
		errorCode : "",	
		errorFieldIndex : -1,	
	},
];

//Opportunities and Obstacles Grid Definition
GridStatic.OS = {};
GridStatic.OS.table = "Player";
GridStatic.OS.idColumn = "Player_ID";
GridStatic.OS.initialSortColumn = "Player_name";
GridStatic.OS.rowHeight = 90;
GridStatic.OS.editOnly = true;
GridStatic.OS.hasAdd = false;
GridStatic.OS.addButtonText = "Add";
GridStatic.OS.nextPreviousButtons = true;
GridStatic.OS.header = {
	headerText : "Right-Click and select 'Edit' to enter opportunities and obstacles for the selected player.  Use this information for strategy development.",
	headerRelHeight : 100
};
GridStatic.OS.columnDefs = [
	{ field: "Player_name", label: "Player Name", width: 250, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Player_name"] + "</div>";
	    }
	},
	{ field: "Player_opportunity", label: "Opportunity", width: 340, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Player_opportunity"] + "</div>";
	    }
	},
	{ field: "Player_obstacle", label: "Obstacle", width: 340, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Player_obstacle"] + "</div>";
	    }
	},
	//TODO Note
];
GridStatic.OS.dialog =
{
	name : "oppobsDialog",
	objectDisplayName : "Opportunity and Obstacle for Player",
	vertSizing : "auto",
	fields : [
		{ field: "Player_name", title: "Player Name", type: "statictext" },
		{ field: "Player_opportunity", title: "Opportunity", type: "longtext" },
		{ field: "Player_obstacle", title: "Obstacle", type: "longtext" },
	],
};


//Strategy Grid Definition
GridStatic.ST = {};
GridStatic.ST.table = "Strategy";
GridStatic.ST.idColumn = "Strategy_ID";
GridStatic.ST.initialSortColumn = "Pct_Success";
GridStatic.ST.rowHeight = 100;
GridStatic.ST.editOnly = false;
GridStatic.ST.hasAdd = true;
GridStatic.ST.addButtonText = "Add";
GridStatic.ST.addAnother = "Add Another";
GridStatic.ST.nextPreviousButtons = true;
GridStatic.ST.header = {
	headerText : "Click on the 'Add' button to add strategies. For a given player, select from the suggested menu or define a new strategy. For each strategy, specify the actions, challenges, timeline, and probability of success.",
	headerRelHeight : 145,
	legends: [
		{ name: "Probability", type: "PROBABILITY", lefttext: "0", righttext: "100", values: [1,2,3,4,5]},
	],
};
GridStatic.ST.columnDefs = [
	{ field: "calcPlayer", label: "Player", width: 250, type: "combination", formatter:  
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("calcPlayer", dataContext);
	    }
	},
	{ field: "Action", label: "Strategy and Actions", width: 404, type: "combination", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("Action", dataContext);
	    }
	},
	{ field: "Implications", label: "Challenges", width: 95, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Implications"] + "</div>";
	    }
	},
	{ field: "Timeline", label: "Timeline", width: 95, type: "text", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return "<div style='white-space: normal'>" + dataContext["Timeline"] + "</div>";
	    }
	},
	{ field: "Pct_Success", label: "Probability", width: 80, type: "PROBABILITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	var colorCell = GridStatic.getProbabilityColorCell(GridStatic.evaluateProbabilityValue(dataContext["Pct_Success"]));
	    	return "<div style='background-color: " + colorCell.color + "; height: 100%;'>" + dataContext["Pct_Success"] + "</div>";
	    }
	},
	//TODO Note checkbox
];
GridStatic.ST.dialog =
{
	name : "stratDialog",
	objectDisplayName : "Strategy",
	vertSizing : "auto",
	fields : [
		{ field: "Affected_player", title: "Player Name(s)", type: "affectedplayer", linkID: "Strategy_ID", required : "error14" },
		{ field: "Strategy_name", title: "Strategy Name", type: "longtext", required: "error15" },
		{ field: "Action", title: "Action", type: "longtext", required: "error16"},
		{ field: "Implications", title: "Challenges", type: "longtext" },
		{ field: "Timeline", title: "Timeline", type: "longtext" },
		{ field: "Pct_Success", title: "Probability of Success", type: "scalar" },
	],
};  //TODO: Suggested Strategy integration, validation, numbered headings, combo-control for probability
GridStatic.ST.deleteDialog = 
{
	title : "Strategy Name",
	deleteDescriptionIDField : "Strategy_name",
	getDeleteDescriptionField : function(stratName)
	{
		return stratName;
	}
};
//Strategy Impacts Grid Definition
//TODO this is rendering correctly, but it is not calculated correctly; Not a one-to-one.
//NEED to present a selection dialog box first. Then, replace, (name of strategy) with the actual name
GridStatic.SI = {};
GridStatic.SI.table = "Affected_player";
GridStatic.SI.idColumn = "Affected_player_ID";
GridStatic.SI.initialSortColumn = "Player_ID"; //TODO Sort by player_name (join)
GridStatic.SI.rowHeight = 90;
GridStatic.SI.editOnly = false;
GridStatic.SI.hasAdd = true;
GridStatic.SI.addButtonText = "Edit Strategy";
GridStatic.SI.header = {
	headerText : "Timeline: <!--REPLACE--> <br/><br/>To input or edit your data, right-click and select 'Edit'.  Click on Next or Previous for other strategies, or Edit Strategy to add players.",
	headerRelHeight : 190,
	headerReplaceContent : "",
	legends: [
		{ name: "Position", type: "POSITION", lefttext: "Opposes", righttext: "Supports", values: [6,5,4,3,2,1,0]},
		{ name: "Power", type: "POWER-AND-PRIORITY", lefttext: "Low", righttext: "High", values: [3,2,1]},
	],
};
GridStatic.SI.menuReplaceContent = "";
GridStatic.SI.columnDefs = [
	{ field: "Player_ID", label: "Player Name", width: 220, type: "combination", combinationName: "PlayerName", formatter: 
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("PlayerName", dataContext);
	    }
	},
	{ field: "Curr_Pos", label: "Current Position", width: 210, type: "POSITION-CURR", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	var currPos = ModelStatic.getFieldFromRowBasedOnKey("Player", "Position_rating", dataContext["Player_ID"]);
	    	return GridStatic.colorCodedCell("POSITION", currPos, "");
	    }
	},
	{ field: "Future_position_rating", label: "Future Position", width: 210, type: "POSITION", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POSITION", dataContext["Future_position_rating"], "");
	    }
	},
	{ field: "Curr_Pow", label: "Current Power", width: 130, type: "POWER-AND-PRIORITY-CURR", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	var currPow = ModelStatic.getFieldFromRowBasedOnKey("Player", "Strength_of_influence", dataContext["Player_ID"]);
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", currPow, "");
	    }
	},
	{ field: "Future_power_rating", label: "Future Power", width: 130, type: "POWER-AND-PRIORITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.colorCodedCell("POWER-AND-PRIORITY", dataContext["Future_power_rating"], "");
	    }
	},
];
GridStatic.SI.dialog =
{
	name : "stratImpacDialog",
	objectDisplayName : "Strategy Impacts",
	vertSizing : "auto",
	isAddException : true,
	fields : [
		{ field: "Player_ID", title: "Player Name", type: "statictext", source:
			function(playerID)
			{
				return ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", playerID);
			}
		},
		{ field: "Position_rating", title: "Current Position", type: "colorcodedcell", foreignkey: "Player_ID", celltype: "POSITION" },
		{ field: "Fut_PosValue", title: "Future Position", type: "scalar" },
		{ field: "Strength_of_influence", title: "Current Power", type: "colorcodedcell", foreignkey: "Player_ID", celltype: "POWER-AND-PRIORITY" },
		{ field: "Fut_PowValue", title: "Future Power", type: "scalar" },
	],
};
GridStatic.SI.deleteDialog = 
{
	title : "Strategy Impact",
	deleteDescriptionIDField : "Affected_player_ID",
	getDeleteDescriptionField : function(affPlayerID)
	{
		var playerID = ModelStatic.getFieldFromRowBasedOnKey("Affected_player", "Player_ID", affPlayerID);
		var stratID = ModelStatic.getFieldFromRowBasedOnKey("Affected_player", "Strategy_ID", affPlayerID);
		var stratName = ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Strategy_name", stratID);
		var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", playerID);
		return "Strategy: " + stratName + ", on Player: " + playerName;
	}
};


//Strategy Implementation Grid Definition
GridStatic.SM = {};
GridStatic.SM.table = "Affected_player";
GridStatic.SM.idColumn = "Affected_player_ID";
GridStatic.SM.initialSortColumn = "Strategy_ID"; //TODO Sort by Strategy.Action (join)
GridStatic.SM.rowHeight = 90;
GridStatic.SM.editOnly = true;
GridStatic.SM.hasAdd = true;
GridStatic.SM.addButtonText = "Edit Displayed Strategies";
GridStatic.SM.header = {
	headerText : "Track the implementation of your strategies, to evaluate whether the actual impacts match the expected impacts. Assign success percentages to strategies for time periods.",  //Same as WINDOWMETADATA.longdesc
	headerRelHeight : 150,
	legends: [
		{ name: "Probability", type: "PROBABILITY", lefttext: "0", righttext: "100", values: [1,2,3,4,5]},
	],
};
GridStatic.SM.columnDefs = [
	{ field: "Strategy_ID", label: "Strategy", width: 310, type: "combination", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("Strategy_ID", dataContext);
	    	//var stratDesc = ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Action", dataContext["Strategy_ID"]);
	    	//return "<div style='white-space: normal'>" + stratDesc + "</div>";
	    }
	},
	{ field: "ExpImpact", label: "Expected Impact", width: 308, type: "combination", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getCombinationFieldText("ExpImpact", dataContext);
	    	//var impact = GridStatic.SM.getExpectedImpact(dataContext["Player_ID"], dataContext["Future_position_rating"], dataContext["Future_power_rating"]);
	    	//var playerName = ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", dataContext["Player_ID"]);
	    	//return "<div style='white-space: normal'>" + playerName + ": " + impact + "</div>";
	    }
	}, //edited at runtime, insertImplementationPeriodLabels()
	{ field: "Pct_Success_1", label: "", width: 110, type: "PROBABILITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getProbabilityTableCell(dataContext, "Pct_Success_1", false);
	    }
	}, //edited at runtime, insertImplementationPeriodLabels()
	{ field: "Pct_Success_2", label: "", width: 110, type: "PROBABILITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getProbabilityTableCell(dataContext, "Pct_Success_2", false);
	    }
	}, //edited at runtime, insertImplementationPeriodLabels()
	{ field: "Pct_Success_3", label: "", width: 110, type: "PROBABILITY", formatter:
	    function(row, cell, value, columnDef, dataContext)
	    {
	    	return GridStatic.getProbabilityTableCell(dataContext, "Pct_Success_3", false);
	    }
	},
];
GridStatic.SM.dialog =
{
	name : "stratImpDialog",
	objectDisplayName : "Strategy Implementation",
	vertSizing : "auto",
	fields : [
		{ field: "Strategy_ID", title: "Strategy", type: "statictext", source:
			function(stratID)
			{
				return ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Strategy_name", stratID) +
				": " + ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Action", stratID);
			}
		},
		{ field: "Player_ID", title: "Player", type: "statictext", source:
			function(playerID)
			{
				return ModelStatic.getFieldFromRowBasedOnKey("Player", "Player_name", playerID);
			}
		},
		{ field: "Assign_Person", title: "Assign Implementation Strategy to", type: "text" },
		{ field: "Pct_Success_1", title: "", type: "scalar" }, //edited at runtime, insertImplementationPeriodLabels()
		{ field: "Pct_Success_2", title: "", type: "scalar" }, //edited at runtime, insertImplementationPeriodLabels()
		{ field: "Pct_Success_3", title: "", type: "scalar" }, //edited at runtime, insertImplementationPeriodLabels()
	],
};
GridStatic.SM.insertImplementationPeriodLabels = function()
{
	var userDefinedLabels = [];
	userDefinedLabels.push( MODEL[TABLE_PROJECT][0].ImpDt_01 );
	userDefinedLabels.push( MODEL[TABLE_PROJECT][0].ImpDt_02 );
	userDefinedLabels.push( MODEL[TABLE_PROJECT][0].ImpDt_03 );
	
	for (var I = 0; I < GridStatic.SM.columnDefs.length; I++)
	{
		if (GridStatic.SM.columnDefs[I].field.indexOf("Pct_Success_") > -1)
		{
			var ixStr = GridStatic.SM.columnDefs[I].field.substring(12);
			var ix = parseInt(ixStr) - 1;
			GridStatic.SM.columnDefs[I].label = userDefinedLabels[ix];
		}
	}
	
	for (var I = 0; I < GridStatic.SM.dialog.fields.length; I++)
	{
		if (GridStatic.SM.dialog.fields[I].field.indexOf("Pct_Success_") > -1)
		{
			var ixStr = GridStatic.SM.dialog.fields[I].field.substring(12);
			var ix = parseInt(ixStr) - 1;
			GridStatic.SM.dialog.fields[I].title = "Probability of Success:<br/>" + userDefinedLabels[ix];
		}
	}
};
GridStatic.SM.getExpectedImpact = function(playerID, futPosRating, futPowRating)
{
	var curPosRating = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Position_rating", playerID);
	var curPowRating = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Strength_of_influence", playerID);
	var changesDesc = [];
	if ((futPosRating > 0) && (futPosRating < 8))
    {
        if (curPosRating < futPosRating)
        {
        	var colorCell = GridStatic.getPositionColorCellFromArr(futPosRating);
            var txt = "Position strengthened to " + colorCell.text;
        	changesDesc.push(txt);
        }
        else
        {
            if (curPosRating > futPosRating)
            {
            	var colorCell = GridStatic.getPositionColorCellFromArr(futPosRating);
                var txt = "Position weakened to " + colorCell.text;
            	changesDesc.push(txt);
            }
        }
    }
    if ((futPowRating > 0) && (futPowRating < 4))
    {
        if (curPowRating > futPowRating)
        {
        	var colorCell = GridStatic.getPowerColorCellFromArr(futPowRating);
            var txt = "Power strengthened to " + colorCell.text;
            changesDesc.push(txt);
        }
        else
        {
            if (curPowRating < futPowRating)
            {
        		var colorCell = GridStatic.getPowerColorCellFromArr(futPowRating);
                var txt = "Power weakened to " + colorCell.text;
            	changesDesc.push(txt);
            }
        }
    }
    if (changesDesc.length < 1)
    	return "";
    if (changesDesc.length == 1)
    	return changesDesc[0];
    return changesDesc[0] + " and " + changesDesc[1];	
};

//This switches to a ST dialog upon use
//Not a grid, dialog is defined here
GridStatic.SH = {};
GridStatic.SH.dialog =
{
	isAddException : true,
	objectDisplayName : "Add New Strategy Based On Suggested Strategy",
};

//Not a grid, but IS a page
GridStatic.FF = {};
GridStatic.FF.hasAdd = true;
GridStatic.FF.addButtonText = "Edit Displayed Strategies";
GridStatic.FF.header = {
	headerText : "Click on the 'Edit Displayed Strategies' button to change the strategies displayed in this graph.",
	headerRelHeight : 120
};

//Not a grid, but IS a page
GridStatic.PF = {};
GridStatic.PF.hasAdd = true;
GridStatic.PF.addButtonText = "Edit Displayed Strategies";
GridStatic.PF.header = {
	headerText : "Click on the 'Edit Displayed Strategies' button to change the strategies displayed in this graph.",
	headerRelHeight : 120
};

//Not a grid, but IS a dialog
GridStatic.PJ = {};
GridStatic.PJ.table = "Project";
GridStatic.PJ.idColumn = "Project_ID";
GridStatic.PJ.editOnly = true;
GridStatic.PJ.dialog =
{
	name : "projectDialog",
	objectDisplayName : "Add New Project",
	vertSizing : "auto",
	cancelAction : function() { FileSelectorStatic.returnToWelcomePage(); },
	fields : [
		{ field: "User_label", title: "Full Project Name", type: "text", required: "error3", validationFunction : function(fieldValue)
			{
				return (ProjectManager.isNewProjectNameUnique(fieldValue)) ? 0 : "error4";
			}
		},
		{ field: "Analyst", title: "Analyst", type: "text", required: "error5"},
		{ field: "Client", title: "Client Name", type: "text" },
		{ field: "Policy_Date", title: "Policy Date", type: "text" },
		{ field: "Analysis_Date", title: "Analysis Date", type: "text" },
		{ field: "ImpDt_01", title: "Implementation Period 1", type: "shorttext" },
		{ field: "ImpDt_02", title: "Implementation Period 2", type: "shorttext" },
		{ field: "ImpDt_03", title: "Implementation Period 3", type: "shorttext" },
	],
};

//Not a grid, but are pages
GridStatic.RE = {};
GridStatic.RE.hasAdd = false;
GridStatic.RE.header = {
	headerText : " ",
	headerRelHeight : 30
};

GridStatic.PS = {};
GridStatic.PS.hasAdd = false;
GridStatic.PS.header = {
	headerText : "Edit settings for the project, including list items and project name and analyst.",
	headerRelHeight : 80
};

function OKValidationResponse()
{
	this.response = true;
}
function ErrorValidationResponse(field, errorCode)
{
	this.response = false;
	this.fieldName = field;
	this.errorCode = errorCode;
}


