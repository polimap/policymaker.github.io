/* 
 * PolicyMaker 5: 
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */
/* PolicyMaker Model Definitions */
/* Relies on the current Global, "MODEL" - the current loaded model */

var TABLE_AFFECTED_PLAYER = "Affected_player";
var TABLE_ANNOTATIONGOALS = "AnnotationGoals";
var TABLE_ANNOTATIONPLAYERS = "AnnotationPlayers";
var TABLE_ANNOTATIONSTRATS = "AnnotationStrats";
var TABLE_COALITION = "Coalition";
var TABLE_CONSEQUENCES = "Consequences";
var TABLE_LIST_OPTIONS = "List_options";
var TABLE_OBJECTIVES = "Objectives";
var TABLE_PLAYQUES = "PlayQues";
var TABLE_PLAYER = "Player";
var TABLE_POLICY_GOAL = "Policy_Goal";
var TABLE_PROJECT = "Project";
var TABLE_QUESTION = "Question";
var TABLE_REPORTLBL = "ReportLbl";
var TABLE_REPORTTBL = "ReportTbl";
var TABLE_SCALEPARM = "ScaleParm";
var TABLE_STRATEGY = "Strategy";

var TABLE_TEMPTABLE = "TempTable"; //must exist in any model, but is emptied

var TABLE_SUGGSTR = "SuggStr"; //a static table, located in this js


var SCALETYPE_NMOB_VALUE = 5.0; //This may be set in the future via a Project dialog; used in Feasibility graph

function NewModel()
{
	this.Affected_player = [];
	this.AnnotationGoals = [];
	this.AnnotationPlayers = [];
	this.AnnotationStrats = [];
	this.Coalition = [];
	this.Consequences = [];
	this.List_options = ModelStatic.getListOptionDefaults();
	this.Objectives = [];
	this.PlayQues = [];
	this.Player = [];
	this.Policy_Goal = [];
	this.Project = [];
	this.Question = [];
	this.ReportLbl = [];
	this.ReportTbl = [];
	this.ScaleParm = [];
	this.Strategy = [];
	this.TempTable = [];
}

function NewProjectDefinition(name)
{
	this.name = name;
	this.isCurrent = true;
}

/* STATIC METHODS */

var ProjectManager = {};
ProjectManager.keys = {};
ProjectManager.keys.CURRENTPROJECT = "CurrentProject";
ProjectManager.keys.SPECIFIC_PROJECT_PREFIX = "Project-";
ProjectManager.keys.PROJ_BTN_PREFIX = "bOpenProj";
ProjectManager.keys.keyList = [];
ProjectManager.PROJECTS_DIALOG_ID = "projectsDialog";
ProjectManager.DEL_THIS_PROJECT_DIALOG_ID = "delEntireProjectDialog";
ProjectManager.DELETE_THIS_BUTTON_ID = "bDelEntireProj";

/*
 * Structure of localStorage:
 * 
 * After the first project created, there will be a CurrentProject key,
 * and a Project-xxxx key for each stored project
 * 
 * key: ProjectManager.keys.CURRENTPROJECT
 * value: currentProject - a string - the name of the project (without the prefix)
 * Stored locally in ProjectManager.currentProject
 * 
 */
ProjectManager.readForCurrentProject = function()
{
	var currentProject = localStorage.getItem(ProjectManager.keys.CURRENTPROJECT);
	if (!currentProject) //initial use of the product
	{
		ProjectManager.hasProject = false;
		ProjectManager.currentProject = "";
	}
	else
	{
		ProjectManager.hasProject = true;
		ProjectManager.currentProject = currentProject;
	}
};

ProjectManager.getCurrentProjectName = function()
{
	return ProjectManager.currentProject;
};
ProjectManager.markProjectAsCurrent = function()
{
	localStorage.setItem(ProjectManager.keys.CURRENTPROJECT, ProjectManager.currentProject);
};

//Adds the new project (name must be unique) and saves it.  Makes it the current project
ProjectManager.addNewProject = function(newProjectName)
{
	if (!ProjectManager.isNewProjectNameUnique(newProjectName))
	{
	//TODO - ERROR handling (dialogs should prevent against this happening)
		alert("New Project Creation Failed.  Name is not unique: " + newProjectName);
		return;
	}
	ProjectManager.saveProject();
	ProjectManager.currentProject = newProjectName;
	ProjectManager.hasProject = true;
	ProjectManager.markProjectAsCurrent();
};

ProjectManager.loadCurrentProject = function()
{
	var keyCurr = ProjectManager.getKeyForProject(ProjectManager.currentProject);
	var currentProjectModel = localStorage.getItem(keyCurr);
	if (!currentProjectModel)
	{
		alert("Current project not found: " + ProjectManager.currentProject);
		return;
	}
	MODEL = JSON.parse(currentProjectModel);
};
ProjectManager.saveProject = function()
{
	if (MODEL[TABLE_PROJECT])
	{
		if (MODEL[TABLE_PROJECT][0].notTheExampleProject) //do not save the example project
		{
			var keyForCurrentProject = ProjectManager.getKeyForCurrentProject();
			try
			{
				MODEL[TABLE_PROJECT][0].Date_LocalStorage_Save = ModelStatic.getSimpleTimestamp();
				localStorage.setItem(keyForCurrentProject, JSON.stringify(MODEL));
			}
			catch(e)
			{
				alert("The local storage limit (2.5m characters) for the browser has been exceeded.  Navigate to the Select Project (Welcome) screen and use the Export project option to save your work as a file to your computer.");
			}
		}
	}
};
ProjectManager.getKeyForCurrentProject = function()
{
	return ProjectManager.getKeyForProject(MODEL[TABLE_PROJECT][0].User_label);
};
ProjectManager.getKeyForProject = function(projectName)
{
	return ProjectManager.keys.SPECIFIC_PROJECT_PREFIX + projectName;
};
ProjectManager.isNewProjectNameUnique = function(newProjectName)
{
	var newKey = ProjectManager.getKeyForProject(newProjectName);
	for (var key in localStorage)
	{
		if (key == newKey)
		{
			return false;
		}
	}
	return true;
};
//This is currently not available via the UI
ProjectManager.deleteAllData = function()
{
	for (var key in localStorage)
	{
   		localStorage.removeItem(key);
	}
};
ProjectManager.activateDeleteThisProjectButton = function()
{
	var selDelThisBtn = '#' + ProjectManager.DELETE_THIS_BUTTON_ID;
	$( selDelThisBtn ).button({ icons: { primary: "ui-icon-trash" } });
	$( selDelThisBtn ).unbind('click');
	$( selDelThisBtn ).click(function()
	{
		ProjectManager.showDeleteProjectDialog();
	});
};
ProjectManager.showDeleteProjectDialog = function()
{
	var projectRow = MODEL[TABLE_PROJECT][0];
	var dialogId = ProjectManager.DEL_THIS_PROJECT_DIALOG_ID;
	var dialogIdAsSel = '#' + dialogId;
	var divDef = '<div id="' + dialogId + '" title="Delete Project: ' + projectRow.User_label + ' by ' + projectRow.Analyst  + '"><table width="100%"><tbody>';
	divDef += '<tr><td colspan="2" class="dialUrgent">Are you sure you want to delete this entire project - ALL data will be deleted?</td></tr>';
	divDef += '</tbody></table></div>';
	
	$("#dialogs").after(divDef);
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 500,
		height: "auto",
		buttons: [
			{
				id: "deleteProjBtnOK",
				text: "Delete",
				click: function()
				{
					if (ProjectManager.handleDeleteProjectDialogOK())
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
					}
				}
			},
			{
				id: "deleteProjBtnCancel",
				text: "Cancel",
				click: function()
				{
					DialogStatic.onDialogClose(dialogId);
					$(this).dialog('destroy').remove();
				}
			}
		],
		open: function() 
		{
			DialogStatic.onDialogOpen(dialogId);
        	$("#deleteProjBtnCancel").focus(); //make Cancel the default
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
};
ProjectManager.handleDeleteProjectDialogOK = function()
{
	console.log("Deleting project.");
	if (!MODEL[TABLE_PROJECT])
		return true; //no current project

	if (!MODEL[TABLE_PROJECT][0].notTheExampleProject)
		return true; //the example project cannot be deleted. 
	
	//delete the project
	var projKey = ProjectManager.getKeyForProject(MODEL[TABLE_PROJECT][0].User_label);
	localStorage.removeItem(projKey);

	//unset as current project
	localStorage.removeItem(ProjectManager.keys.CURRENTPROJECT);
	ProjectManager.hasProject = false;
	ProjectManager.currentProject = "";
	
	//return to welcome screen
	MODEL = {};
	changePage("WE");
	
	return true;
};

ProjectManager.getOpenButtonForProject = function(keyIndex)
{
	return '<button id="' + ProjectManager.keys.PROJ_BTN_PREFIX + keyIndex + '">Open</button>';
};
ProjectManager.showProjectsDialog = function()
{
	var fullTitle = "Local Projects";
	var dialogIdAsSel = "#" + ProjectManager.PROJECTS_DIALOG_ID;
	var divDef = '<div id="' + ProjectManager.PROJECTS_DIALOG_ID + '" title="' + fullTitle + '"><table width="100%" class="projectsTable"><tbody>';
	divDef += '<thead class="projectsBoxHeader"><th>Project</th><th>Analyst</th><th>Date Last Local Update</th><th>Open</th><thead>';
	ProjectManager.keys.keyList = [];
	var keyIndex = -1;
	for (var key in localStorage)
	{
		if (key == ProjectManager.keys.CURRENTPROJECT)
		{
			continue;
		}
		keyIndex++;
		var localProjectModelJson = localStorage.getItem(key);
		var localProjectModel = JSON.parse(localProjectModelJson);
		var projectRow = localProjectModel[TABLE_PROJECT][0];
		var analyst = (projectRow.Analyst) ? projectRow.Analyst : "";
		var localSaveDt = ModelStatic.getDateTimeString(projectRow.Date_LocalStorage_Save);
		ProjectManager.keys.keyList.push(projectRow.User_label);
		divDef += '<tr><td class="projectsTableCell">' + projectRow.User_label + 
		'</td><td class="projectsTableCell">' + analyst + 
		'</td><td class="projectsTableCell">' + localSaveDt + 
		'</td><td class="projectsTableCell" style="width: 74px; padding: 2px;">' + ProjectManager.getOpenButtonForProject(keyIndex) +
		'</td></tr>';
	}
	divDef += '</tbody></table><table width="100%"><tbody>';
	//Error bar not necessary: divDef += '<tr><td height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';
	divDef += '<tr><td>&nbsp;</td></tr>';
	divDef += '<tr><td><hr/></td></tr>';
	
	var pctEst = ProjectManager.getStorageCapacityPercentEstimate();
	divDef += '<tr><td>Local Storage Estimate: ' + pctEst.toFixed(2) + '% Used:</td></tr>';
	divDef += '<tr><td><div id="stgProgressBar"></div></td></tr>';
		
	divDef += '</tbody></table></div>';
	$("#dialogs").append(divDef);
	
	ProjectManager.setStorageEstimateBarDiv("stgProgressBar", pctEst);
	
	for (var B = 0; B < ProjectManager.keys.keyList.length; B++)
	{
		var selBtnID = '#' + ProjectManager.keys.PROJ_BTN_PREFIX + B;
		$( selBtnID ).button({ icons: { primary: "ui-icon-open" } });
		$( selBtnID ).unbind('click');
		$( selBtnID ).click(function()
		{
			var indexOfProjectToOpen = parseInt(this.id.substring(ProjectManager.keys.PROJ_BTN_PREFIX.length));
			ProjectManager.hasProject = true;
			ProjectManager.currentProject = ProjectManager.keys.keyList[indexOfProjectToOpen];
			ProjectManager.loadCurrentProject();
			ProjectManager.markProjectAsCurrent();
			
			FileSelectorStatic.showMainMenuForProject();
			
			$(dialogIdAsSel).dialog('destroy').remove();
    		DialogStatic.onDialogClose(ProjectManager.PROJECTS_DIALOG_ID);
		});
	}
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 700,
		height: "auto",
		buttons: [
			{
				id : "pjsBtnCancel",
				text: "Close",
				click: function()
				{
   					DialogStatic.onDialogClose(ProjectManager.PROJECTS_DIALOG_ID);
 					$(this).dialog('destroy').remove();
				}
			},
		],
		open: function() 
		{
			DialogStatic.onDialogOpen(ProjectManager.PROJECTS_DIALOG_ID);
       		$("#pjsBtnCancel").focus(); //make Cancel the default
    	},
    	close: function()
    	{
    		$(dialogIdAsSel).dialog('destroy').remove();
    		DialogStatic.onDialogClose(ProjectManager.PROJECTS_DIALOG_ID);
    	},
	});
};
ProjectManager.getStorageCapacityPercentEstimate = function()
{
	var used = JSON.stringify(localStorage).length;
	var capacity = 2500000; //2.5 M UTF-16 chars, 2 bytes each.
	return (used / capacity) * 100;
};
ProjectManager.setStorageEstimateBarDiv = function(divName, pctEst)
{
	var divSel = "#" + divName;
	$( divSel ).progressbar({
		value: pctEst
	});	
};


var ModelStatic = {};
ModelStatic.getKeyFieldForTable = function(table)
{
    if (table == TABLE_AFFECTED_PLAYER) return "Affected_player_ID";
    if (table == TABLE_ANNOTATIONGOALS) return "Annotation_ID";
    if (table == TABLE_ANNOTATIONPLAYERS) return "Annotation_ID";
    if (table == TABLE_ANNOTATIONSTRATS) return "Annotation_ID";
    if (table == TABLE_COALITION) return "Coal_ID";
    if (table == TABLE_CONSEQUENCES) return "Conseq_ID";
    if (table == TABLE_LIST_OPTIONS) return "List_value_ID";
    if (table == TABLE_OBJECTIVES) return "Objective_ID";
    if (table == TABLE_PLAYQUES) return "PlayQues_ID";
    if (table == TABLE_PLAYER) return "Player_ID";
    if (table == TABLE_POLICY_GOAL) return "Goal_ID";
    if (table == TABLE_PROJECT) return "Project_ID";
    if (table == TABLE_QUESTION) return "Ques_ID";
    if (table == TABLE_REPORTLBL) return "RepLbl_ID";
    if (table == TABLE_REPORTTBL) return "Rep_ID";
    if (table == TABLE_SCALEPARM) return "Scale_ID";
    if (table == TABLE_STRATEGY) return "Strategy_ID";
    if (table == TABLE_SUGGSTR) return "SuggStr_ID";
	return "";
};

ModelStatic.getNewObject = function(table)
{
    if (table == TABLE_AFFECTED_PLAYER) return new Affected_player();
    if (table == TABLE_ANNOTATIONGOALS) return new AnnotationGoals();
    if (table == TABLE_ANNOTATIONPLAYERS) return new AnnotationPlayers();
    if (table == TABLE_ANNOTATIONSTRATS) return new AnnotationStrats();
    if (table == TABLE_COALITION) return new Coalition();
    if (table == TABLE_CONSEQUENCES) return new Consequences();
    if (table == TABLE_LIST_OPTIONS) return new List_options();
    if (table == TABLE_OBJECTIVES) return new Objectives();
    if (table == TABLE_PLAYQUES) return new PlayQues();
    if (table == TABLE_PLAYER) return new Player();
    if (table == TABLE_POLICY_GOAL) return new Policy_Goal();
    if (table == TABLE_PROJECT) return new Project();
    if (table == TABLE_QUESTION) return new Question();
    if (table == TABLE_REPORTLBL) return new ReportLbl();
    if (table == TABLE_REPORTTBL) return new ReportTbl();
    if (table == TABLE_SCALEPARM) return new ScaleParm();
    if (table == TABLE_STRATEGY) return new Strategy();
    //Does not support NEW; if (table == TABLE_SUGGSTR) return new SuggStr();
};
ModelStatic.dependentTables = 
[
	{ 
		masterTableName : TABLE_PLAYER,
		dependentTables : 
		[
			{ 
				table : TABLE_AFFECTED_PLAYER, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_AFFECTED_PLAYER, "Player_ID", playerID);
				}
			},
			{ 
				table : TABLE_ANNOTATIONPLAYERS, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_ANNOTATIONPLAYERS, "Player_ID", playerID);
				}
			},
			{ 
				table : TABLE_COALITION, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_COALITION, "Coal_Ent_ID", playerID);
				}
			},
			{ 
				table : TABLE_CONSEQUENCES, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_CONSEQUENCES, "Conseq_player_ID", playerID);
				}
			},
			{ 
				table : TABLE_OBJECTIVES, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_OBJECTIVES, "Player_ID", playerID);
				}
			},
			{ 
				table : TABLE_PLAYQUES, 
				deletionFunction : function(playerID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_PLAYQUES, "PlayQues_Player_ID", playerID);
				}
			},
		]
	},
	{ 
		masterTableName : TABLE_POLICY_GOAL,
		dependentTables : 
		[
			{ 
				table : TABLE_ANNOTATIONGOALS, 
				deletionFunction : function(goalID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_ANNOTATIONGOALS, "Goal_ID", goalID);
				}
			},
		]
	},
	{ 
		masterTableName : TABLE_STRATEGY,
		dependentTables : 
		[
			{ 
				table : TABLE_AFFECTED_PLAYER, 
				deletionFunction : function(stratID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_AFFECTED_PLAYER, "Strategy_ID", stratID);
				}
			},
			{ 
				table : TABLE_ANNOTATIONSTRATS, 
				deletionFunction : function(stratID)
				{
					ModelStatic.deleteItemsWithFieldValueFromTable(TABLE_ANNOTATIONSTRATS, "Strategy_ID", stratID);
				}
			},
		]
	},
];
ModelStatic.getDependentTablesSetForTable = function(table)
{
	for (var I = 0; I < ModelStatic.dependentTables.length; I++)
	{
		if (ModelStatic.dependentTables[I].masterTableName == table)
		{
			return ModelStatic.dependentTables[I];
		}
	}
};

ModelStatic.getFieldFromRowBasedOnKey = function(table, field, keyValue)
{
	var tableLen = MODEL[table].length;
	var keyField = ModelStatic.getKeyFieldForTable(table);
	for (var I = 0; I < tableLen; I++)
	{
		if (MODEL[table][I][keyField] == keyValue)
		{
			return MODEL[table][I][field];
		}
	}
};

ModelStatic.getRowBasedOnKey = function(table, keyValue)
{
	var tableLen = MODEL[table].length;
	var keyField = ModelStatic.getKeyFieldForTable(table);
	for (var I = 0; I < tableLen; I++)
	{
		if (MODEL[table][I][keyField] == keyValue)
		{
			return MODEL[table][I];
		}
	}
};

ModelStatic.getNextID = function(table)
{
	return ModelStatic.findMaximumValueForField(table, ModelStatic.getKeyFieldForTable(table)) + 1;
};

ModelStatic.findMaximumValueForField = function(table, field)
{
	var max = 0;
	for (var I = 0; I < MODEL[table].length; I++)
	{
		var idVal = MODEL[table][I][field];
		if (idVal > max)
		{
			max = idVal;
		}
	}
	return max;
};

ModelStatic.deleteItemWithKeyFromTable = function(table, keyValue, required)
{
	//Delete Cascade, bottom up.
	
	//Delete any dependent rows (if any) first, then the main row
	var depTblsSet = ModelStatic.getDependentTablesSetForTable(table);
	if (depTblsSet) //only a few tables have dependent tables
	{
		for (var I = 0; I < depTblsSet.dependentTables.length; I++)
		{
			depTblsSet.dependentTables[I].deletionFunction(keyValue);
		}
	}
	
	//Find the main item, if found, delete it
	var ixInArray = ModelStatic.getIndexForItemInTable(table, ModelStatic.getKeyFieldForTable(table), keyValue);
	if (ixInArray == -1)
	{
		if (required)
		{
			console.log("Error: Attempting to delete missing item in table: " + table + " with an ID value of: " + keyValue);
		}
		return;
	}
	MODEL[table].splice(ixInArray, 1);
};

ModelStatic.deleteItemsWithFieldValueFromTable = function(table, field, fieldValue)
{
//This method should be treated as private - called only from deletionFunction for particular objects
//effectively, only from deleteItemWithKeyFromTable.
	var ixInArray = ModelStatic.getIndexForItemInTable(table, field, fieldValue);
	while (ixInArray > -1)
	{
		MODEL[table].splice(ixInArray, 1);
		ixInArray = ModelStatic.getIndexForItemInTable(table, field, fieldValue);
	}
};

ModelStatic.getIndexForItemInTable = function(table, keyFieldName, keyValue)
{
	for (var I = 0; I < MODEL[table].length; I++)
	{
		if (MODEL[table][I][keyFieldName] == keyValue)
		{
			return I;
		}
	}
	return -1;
};

ModelStatic.getPlayerNamesForAffectedPlayerForStrategy = function(stratID)
{
	var names = "";
	for (var I = 0; I < MODEL[TABLE_AFFECTED_PLAYER].length; I++)
	{
		if (MODEL[TABLE_AFFECTED_PLAYER][I].Strategy_ID == stratID)
		{
			if (names.length > 0)
				names += ", ";
			names += ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Player_name", MODEL[TABLE_AFFECTED_PLAYER][I].Player_ID);
		}
	}
	return names;
};

ModelStatic.getPlayerIDsForAffectedPlayerForStrategy = function(stratID)
{
	var ids = [];
	for (var I = 0; I < MODEL[TABLE_AFFECTED_PLAYER].length; I++)
	{
		if (MODEL[TABLE_AFFECTED_PLAYER][I].Strategy_ID == stratID)
		{
			ids.push(MODEL[TABLE_AFFECTED_PLAYER][I].Player_ID);
		}
	}
	return ids;
};

ModelStatic.getAffectedPlayerID = function(playerID, stratID)
{
	for (var I = 0; I < MODEL[TABLE_AFFECTED_PLAYER].length; I++)
	{
		if (MODEL[TABLE_AFFECTED_PLAYER][I].Strategy_ID == stratID &&
			MODEL[TABLE_AFFECTED_PLAYER][I].Player_ID == playerID)
		{
			return MODEL[TABLE_AFFECTED_PLAYER][I].Affected_player_ID;
		}
	}
	return -1;
};

//Match the stored affected players with the IDs
ModelStatic.synchronizeAffectedPlayerIDsForStrategy = function(stratID, selPlayerIDs)
{
	var currPlayerIDs = ModelStatic.getPlayerIDsForAffectedPlayerForStrategy(stratID);
	
	var NOTMATCHED = -1;
	var MATCHED = 1;
	var currPlayerMatch = ModelStatic.createArrayOfSize(currPlayerIDs.length, NOTMATCHED);
	var selPlayerMatch = ModelStatic.createArrayOfSize(selPlayerIDs.length, NOTMATCHED);
	for (var I = 0; I < selPlayerIDs.length; I++)
	{
		for (var J = 0; J < currPlayerIDs.length; J++)
		{
			if (currPlayerIDs[J] == selPlayerIDs[I])
			{
				selPlayerMatch[I] = MATCHED;
				currPlayerMatch[J] = MATCHED;
				break;
			}
		}
	}
	//For each currPlayerMatch still set to NOTMATCHED, delete it
	for (var I = 0; I < currPlayerMatch.length; I++)
	{
		if (currPlayerMatch[I] == NOTMATCHED)
		{
			var affPlayerID = ModelStatic.getAffectedPlayerID(currPlayerIDs[I], stratID);
			if (affPlayerID != -1)
			{
				ModelStatic.deleteItemWithKeyFromTable(TABLE_AFFECTED_PLAYER, affPlayerID, true);
			}
			else
			{
				console.log("Unable to find Affected_player of player ID: " + currPlayerIDs[I] + ", strategy ID: " + stratID);
			}
		}
	}
	//For each selPlayerMatch still set to NOTMATCHED, add it
	for (var I = 0; I < selPlayerMatch.length; I++)
	{
		if (selPlayerMatch[I] == NOTMATCHED)
		{
			var newAffPlay = ModelStatic.getNewObject(TABLE_AFFECTED_PLAYER);
			MODEL[TABLE_AFFECTED_PLAYER].push(newAffPlay);
			newAffPlay["Player_ID"] = selPlayerIDs[I];
			newAffPlay["Strategy_ID"] = stratID;
		}
	}
};

ModelStatic.populateTempTableWithAffectedPlayersForStrategies = function()
{
	//Filter affected players to include only strategy IDs in selectedItems and store in TABLE_TEMPTABLE
	MODEL[TABLE_TEMPTABLE] = [];
	for (var I = 0; I < MODEL[TABLE_AFFECTED_PLAYER].length; I++)
	{
		if (ModelStatic.isInSelectedItems(MODEL[TABLE_AFFECTED_PLAYER][I].Strategy_ID)) 
		{
			MODEL[TABLE_TEMPTABLE].push(MODEL[TABLE_AFFECTED_PLAYER][I]);
		}
	}
};

//Returns a player or undefined
ModelStatic.getTrumpPlayerIfAny = function()
{
	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		if (MODEL[TABLE_PLAYER][I].Trump)
		{
			return MODEL[TABLE_PLAYER][I];
		}
	}
};
ModelStatic.clearTrump = function()
{
	var player = ModelStatic.getTrumpPlayerIfAny();
	if (player)
	{
		player.Trump = false;
		player.Weight = 1.0;
	}
};
ModelStatic.setTrump = function(playerID, weightNum)
{
	var player = ModelStatic.getRowBasedOnKey(TABLE_PLAYER, playerID);
	if (player)
	{
		player.Trump = true;
		player.Weight = weightNum;
	}
};
ModelStatic.getOpportAndObsRowsWithData = function()
{
	var rows = [];
	var allRows = MODEL[TABLE_PLAYER];
	for (var I = 0; I < allRows.length; I++)
	{
		if (ModelStatic.doesStringFieldHaveData(allRows[I].Player_obstacle) ||
			ModelStatic.doesStringFieldHaveData(allRows[I].Player_opportunity))
		{
			rows.push(allRows[I]);
		}
	}
	return rows;
};
ModelStatic.getPlayersNotYetOnCoalitionMap = function()
{
	var playerSubset = [];
	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		var playerFound = false;
		for (var J = 0; J < MODEL[TABLE_COALITION].length; J++)
		{
			if (MODEL[TABLE_COALITION][J].Coal_Type == 1 && 
				MODEL[TABLE_COALITION][J].Coal_Ent_ID == MODEL[TABLE_PLAYER][I].Player_ID)
			{
				playerFound = true;
				break;
			}
		}
		if (!playerFound)
		{
			playerSubset.push(MODEL[TABLE_PLAYER][I]);
		}
	}
	return playerSubset;
};
ModelStatic.addCoalitionEntry = function(type, value)
{
	var newCoalItem = ModelStatic.getNewObject(TABLE_COALITION);
	newCoalItem.Coal_Type = type;
	switch(type)
	{
	case 1:
		newCoalItem.Coal_XPos = -10;
		newCoalItem.Coal_YPos = -10;
		newCoalItem.Coal_Ent_ID = value;
		break;
	case 2:
		newCoalItem.Coal_XPos = -10;
		newCoalItem.Coal_YPos = -10;
		newCoalItem.Coal_Text = value;
		break;
	case 3:
		newCoalItem.Coal_Angle = value;
		break;
	default:
		return;	
	}
	MODEL[TABLE_COALITION].push(newCoalItem);
};
ModelStatic.getCoalitionItemDescription = function(item)
{
	switch(item.Coal_Type)
	{
	case 1:
		return "Player: " + ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Player_name", item.Coal_Ent_ID);
	case 2:
		return "Caption: " + item.Coal_Text;
	case 3:
		return "Angle: " + item.Coal_Angle;
	default:
		return "";	
	}
};
ModelStatic.getCoalitionCircleRadii = function()
{
	var circleRadii = ['', ''];
	if (!MODEL[TABLE_PROJECT][0].CoalitionShowCircles)
	{
		return circleRadii;
	}
	if (MODEL[TABLE_PROJECT][0].CoalitionCircleInner != 0)
	{
		circleRadii[0] = MODEL[TABLE_PROJECT][0].CoalitionCircleInner;
	}
	if (MODEL[TABLE_PROJECT][0].CoalitionCircleOuter != 0)
	{
		circleRadii[1] = MODEL[TABLE_PROJECT][0].CoalitionCircleOuter;
	}
	return circleRadii;
};
ModelStatic.setCoalitionCircleRadii = function(circleRadii)
{
	if (circleRadii[0] == '' && circleRadii[1] == '')
	{
		MODEL[TABLE_PROJECT][0].CoalitionShowCircles = false;
		MODEL[TABLE_PROJECT][0].CoalitionCircleInner = 0.0;
		MODEL[TABLE_PROJECT][0].CoalitionCircleOuter = 0.0;
		return;
	}
	MODEL[TABLE_PROJECT][0].CoalitionShowCircles = true;
	if (circleRadii[0] != '' && circleRadii[1] != '')
	{
		var n1st = parseInt(circleRadii[0]);
		var n2nd = parseInt(circleRadii[1]);
		if (n1st > n2nd)
		{
			MODEL[TABLE_PROJECT][0].CoalitionCircleInner = n2nd;
			MODEL[TABLE_PROJECT][0].CoalitionCircleOuter = n1st;
		}
		else
		{
			MODEL[TABLE_PROJECT][0].CoalitionCircleInner = n1st;
			MODEL[TABLE_PROJECT][0].CoalitionCircleOuter = n2nd;
		}
		return;
	}
	var nVal;
	if (circleRadii[0] != '')
	{
		nVal = parseInt(circleRadii[0]);
	}
	else
	{
		nVal = parseInt(circleRadii[1]);
	}
	MODEL[TABLE_PROJECT][0].CoalitionCircleInner = nVal;
	MODEL[TABLE_PROJECT][0].CoalitionCircleOuter = 0.0;
};

ModelStatic.doesStringFieldHaveData = function(field)
{
	if (field)
	{
		if (field.length > 0)
			return true;
	}
	return false;
};

ModelStatic.createArrayOfSize = function(sizeArr, setTo)
{
	var falseArr = [];
	for (var I = 0; I < sizeArr; I++)
	{
		falseArr.push(setTo);
	}
	return falseArr;
};

ModelStatic.addAllToSelectedItems = function(table)
{
	selectedItems = [];
	var tableLen = MODEL[table].length;
	var keyField = ModelStatic.getKeyFieldForTable(table);
	for (var I = 0; I < tableLen; I++)
	{
		selectedItems.push(MODEL[table][I][keyField]);
	}
};

ModelStatic.isInSelectedItems = function(item)
{
	for (var I = 0; I < selectedItems.length; I++)
	{
		if (selectedItems[I] == item)
		{
			return true;
		}
	}
	return false;
};
ModelStatic.getZeroPaddedNumber = function(num, lenPad)
{
	var valStr = "" + num;
	while(valStr.length < lenPad)
	{
		valStr = "0" + valStr;
	}
	return valStr;
};
ModelStatic.getSimpleTimestamp = function()
{
	var now = new Date();
	var dateString = now.getDate() + '-' + ModelStatic.getMonthString(now) + '-' + now.getFullYear() + ' ' + now.getHours() + ':' + ModelStatic.getZeroPaddedNumber(now.getMinutes(), 2);
	return dateString;
};
ModelStatic.getMonthString = function(dt)
{
	var MONTHS = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
	return MONTHS[dt.getMonth()];
};
ModelStatic.getDateTimeString = function(dtStr)
{
	if (dtStr)
	{
		if (dtStr.length > 0)
		{
			return dtStr;
		}
		else
		{
			return "";
		}
	}
	else
		return "";
};

//NOTE - any & ' > < or " must be escaped
ModelStatic.SUGGSTR = [
	{ id : 1, label : "Increase Organizational Strength", text : "Increase the organizational strength of supporters, by providing increased material resources or by providing experienced staff or by fostering political skills.", category : "POWER", type : "SUP" }, 
	{ id : 2, label : "Increase Access to Political Leaders", text : "Increase access to political leaders, by organizing through a lobbying campaign.", category : "POWER", type : "SUP" }, 
	{ id : 3, label : "Mobilize Supporters", text : "Mobilize supporters in groups and communities in public demonstrations to call for action", category : "POWER", type : "SUP" }, 
	{ id : 4, label : "Create Coalition of Supporters", text : "Create a coalition of supporting groups or players, with a recognizable name and sufficient resources.", category : "POWER", type : "SUP" }, 
	{ id : 5, label : "Provide Information to Supporters", text : "Provide information and evidence to supporters, including technical and political information.", category : "POWER", type : "SUP" }, 
	{ id : 6, label : "Persuade Supporters to Change", text : "Persuade supporters to strengthen their position, by reminding supporters of the promised benefits compared to other policies.", category : "POSITION", type : "SUP" }, 
	{ id : 7, label : "Add More Benefits", text : "Persuade supporters to strengthen their position, by adding more benefits as an incentive.", category : "POSITION", type : "SUP" }, 
	{ id : 8, label : "Remove Objections", text : "Persuade supporters to strengthen their position, by changing the policy to remove contested goals or mechanisms.", category : "POSITION", type : "SUP" }, 
	{ id : 9, label : "Add Additional Policy Elements", text : "Persuade supporters to strengthen their position, by adding desired goals and mechanisms to the policy.", category : "POSITION", type : "SUP" }, 
	{ id : 10, label : "Create New Organization", text : "Create a new organization or partnership of existing organizations and individuals.", category : "PLAYER", type : "SUP" }, 
	{ id : 11, label : "Persuade Non-mobilized Groups", text : "Persuade non-mobilized groups to take a supporting position, by providing incentives, removing objections, or adding desired policy elements.", category : "PLAYER", type : "SUP" }, 
	{ id : 12, label : "Attract Political Leadership", text : "Persuade political candidates or elected officials in the legislature or executive to adopt your issue, through personal meetings, position papers, or political incentives.", category : "PLAYER", type : "SUP" }, 
	{ id : 13, label : "Change Decision-making Processes", text : "Change the decision-making processes (eg, through public hearings) in order to expand the number of supporters.", category : "PLAYER", type : "SUP" }, 
	{ id : 14, label : "Enhance Legitimacy", text : "Enhance the legitimacy of supporters, by connecting them to positive social values.", category : "PERCEPTION", type : "SUP" }, 
	{ id : 15, label : "Use Symbols of Public Support", text : "Use symbols to Increase public support of the policy, by organizing a media campaign or finding sympathetic victims.", category : "PERCEPTION", type : "SUP" }, 
	{ id : 16, label : "Use the Media", text : "Use the media to increase public visibility of the issue and change perception of problem and solution", category : "PERCEPTION", type : "SUP" }, 
	{ id : 17, label : "Publicize Supporters\' Position", text : "Persuade supporters to take a more public stand on the policy.", category : "PERCEPTION", type : "SUP" }, 
	{ id : 18, label : "Persuade Supporters to Change", text : "Persuade non-mobilized to take a position of support, by promising them benefits compared to other policies.", category : "POSITION", type : "NMOB" }, 
	{ id : 19, label : "Add More Benefits", text : "Persuade non-mobilized to strengthen their position, by adding more benefits as an incentive.", category : "POSITION", type : "NMOB" }, 
	{ id : 20, label : "Remove Objections", text : "Persuade supporters to take a position of support, by changing the policy to remove contested goals or mechanisms.", category : "POSITION", type : "NMOB" }, 
	{ id : 21, label : "Add Additional Policy Elements", text : "Persuade non-mobilized to take a position of support, by adding desired goals and mechanisms to the policy.", category : "POSITION", type : "NMOB" }, 
	{ id : 22, label : "Create New Organization", text : "Create a new organization or partnership of existing organizations and individuals, to involve non-mobilized", category : "PLAYER", type : "NMOB" }, 
	{ id : 23, label : "Seek Common Goals or Values", text : "Seek common goals or values with non-mobilized, to persuade them to take a public position of support", category : "POSITION", type : "NMOB" }, 
	{ id : 24, label : "Persuade Non-mobilized Groups", text : "Persuade non-mobilized groups to take a supporting position, by providing incentives, removing objections, or adding desired policy elements.", category : "PLAYER", type : "NMOB" }, 
	{ id : 25, label : "Enhance Legitimacy", text : "Enhance the legitimacy of policy, by connecting it to positive social values.", category : "PERCEPTION", type : "NMOB" }, 
	{ id : 26, label : "Increase Public Support", text : "Increase the public support for the policy, by organizing a media campaign or by finding sympathetic victims.", category : "PERCEPTION", type : "NMOB" }, 
	{ id : 27, label : "Use the Media", text : "Use the media to increase public visibility of the issue and change perception of problem and solution", category : "PERCEPTION", type : "NMOB" }, 
	{ id : 28, label : "Publicize Supporters\' Position", text : "Persuade supporters to take a more public stand on the policy.", category : "PERCEPTION", type : "NMOB" }, 
	{ id : 29, label : "Undermine Legitimacy of Opposition", text : "Undermine the legitimacy of the opposition, by connecting them to negative social values through negative publicity.", category : "POWER", type : "OPP" }, 
	{ id : 30, label : "Decrease Public Visibility", text : "Decrease the public visibility of opponents, by reducing their media exposure or access.", category : "POWER", type : "OPP" }, 
	{ id : 31, label : "Decrease Organizational Strength", text : "Decrease the organizational strength of the opposition, by denying them material resources.", category : "POWER", type : "OPP" }, 
	{ id : 32, label : "Reduce Opposition Coalitions", text : "Reduce the strength of coalitions of opposing groups or individuals, by fostering internal tensions or by winning over a key member.", category : "POWER", type : "OPP" }, 
	{ id : 33, label : "Deny Information to Opponents", text : "Deny information to opponents, including both technical and political information.", category : "POWER", type : "OPP" }, 
	{ id : 34, label : "Hire PR Firm to Monitor Opponents", text : "Hire a professional public relations firm to monitor the opposition or to design a negative public relations campaign directed against the opposition.", category : "POWER", type : "OPP" }, 
	{ id : 35, label : "Seek Common Goals", text : "Meet with opponents to seek common goals or mechanisms, and thereby reduce the intensity of their opposition.", category : "POSITION", type : "OPP" }, 
	{ id : 36, label : "Compensate Opponents", text : "Provide compensation to opponents for real and perceived harms, in order to reduce the intensity of their opposition.", category : "POSITION", type : "OPP" }, 
	{ id : 37, label : "Add Additional Policy Elements", text : "Persuade opponents to weak their position, by adding desired goals or mechanisms to the policy.", category : "POSITION", type : "OPP" }, 
	{ id : 38, label : "Remove Existing Organization", text : "Decrease the number of opponents, by removing existing organizations or federations.", category : "PLAYER", type : "OPP" }, 
	{ id : 39, label : "De-mobilize Opposition", text : "Persuade opposing groups to move to a non-mobilized or supporting position, by providing incentives, removing objections, or adding desired policy elements.", category : "PLAYER", type : "OPP" }, 
	{ id : 40, label : "Find Persuasive Mediator", text : "Find a persuasive mediator, to negotiate with opponents and find acceptable agreement to end their opposition.", category : "PLAYER", type : "OPP" }, 
	{ id : 41, label : "Threaten Legal Action", text : "Threaten legal action against an opponent, raising the costs of opposition and persuading the player to cease its opposition.", category : "PLAYER", type : "OPP" }, 
	{ id : 42, label : "Change Decision-making Processes", text : "Change decision-making processes, in order to prevent some opponents from participating.", category : "PLAYER", type : "OPP" }, 
	{ id : 43, label : "Negotiate on Other Issues", text : "Negotiate with the opposition, and offer concessions on other policies of interest, in exchange for reversal of opposition.", category : "PLAYER", type : "OPP" }, 
];
ModelStatic.getSuggestedStrategiesForCategory = function(category)
{
	var subset = [];
	for (var I = 0; I < ModelStatic.SUGGSTR.length; I++)
	{
		if (ModelStatic.SUGGSTR[I].category == category)
		{
			subset.push(ModelStatic.SUGGSTR[I]);
		}
	}
	return subset;
};
ModelStatic.getSuggestedStrategyFromID = function(id)
{
	for (var I = 0; I < ModelStatic.SUGGSTR.length; I++)
	{
		if (ModelStatic.SUGGSTR[I].id == id)
		{
			return ModelStatic.SUGGSTR[I];
		}
	}
};

/**
 * Get a subset of players for a position category: Support_vs_opposition
 * 1,2,3 or 4 (unassigned), sorted by player name
 */
ModelStatic.getSortedPlayersWithPositionCategory = function(positionCategory)
{
	var subset = [];
	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		if (MODEL[TABLE_PLAYER][I].Support_vs_opposition == positionCategory)
		{
			subset.push(MODEL[TABLE_PLAYER][I]);
		}
	}
	if (subset.length < 1)
		return subset;
	var sortedIndexArray = GridStatic.getIndexForField(subset, "Player_name");
	var sortedSubset = [];
	for (var I = 0; I < sortedIndexArray.length; I++)
	{
		sortedSubset.push(subset[sortedIndexArray[I]]);
	}
	return sortedSubset;
};

ModelStatic.getListOptionDefaults = function()
{
	var listOptions = 
	[
	    { "List_value" : "Private", "List_value_ID" : 1, "List_type" : 1 }, 
	    { "List_value" : "Governmental", "List_value_ID" : 2, "List_type" : 1 }, 
	    { "List_value" : "International", "List_value_ID" : 3, "List_type" : 1 }, 
	    { "List_value" : "Media", "List_value_ID" : 4, "List_type" : 1 }, 
	    { "List_value" : "Local Non-Governmental", "List_value_ID" : 5, "List_type" : 1 }, 
	    { "List_value" : "Political", "List_value_ID" : 6, "List_type" : 1 }, 
	    { "List_value" : "Social", "List_value_ID" : 7, "List_type" : 1 }, 
	    { "List_value" : "Financial", "List_value_ID" : 8, "List_type" : 2 }, 
	    { "List_value" : "Ideological", "List_value_ID" : 9, "List_type" : 2 }, 
	    { "List_value" : "Organizational", "List_value_ID" : 10, "List_type" : 2 }, 
	    { "List_value" : "Humanitarian", "List_value_ID" : 11, "List_type" : 2 }, 
	    { "List_value" : "Self-Interest", "List_value_ID" : 12, "List_type" : 2 }, 
	    { "List_value" : "Political", "List_value_ID" : 13, "List_type" : 2 }, 
	    { "List_value" : "Other", "List_value_ID" : 14, "List_type" : 2 }, 
	    { "List_value" : "Religious", "List_value_ID" : 15, "List_type" : 2 }, 
	    { "List_value" : "Public", "List_value_ID" : 16, "List_type" : 3 }, 
	    { "List_value" : "Political", "List_value_ID" : 17, "List_type" : 3 }, 
	    { "List_value" : "Bureaucracy", "List_value_ID" : 18, "List_type" : 3 }, 
	    { "List_value" : "Media", "List_value_ID" : 19, "List_type" : 3 }, 
	    { "List_value" : "Government", "List_value_ID" : 20, "List_type" : 3 }, 
	    { "List_value" : "Our Organization", "List_value_ID" : 21, "List_type" : 3 }, 
	    { "List_value" : "Financial", "List_value_ID" : 22, "List_type" : 4 }, 
	    { "List_value" : "Administrative", "List_value_ID" : 23, "List_type" : 4 }, 
	    { "List_value" : "Beneficial", "List_value_ID" : 24, "List_type" : 4 }, 
	    { "List_value" : "Harmful", "List_value_ID" : 25, "List_type" : 4 }, 
	    { "List_value" : "Indirect", "List_value_ID" : 26, "List_type" : 4 }, 
	    { "List_value" : "Geographical", "List_value_ID" : 27, "List_type" : 4 }, 
	    { "List_value" : "Symbolic", "List_value_ID" : 28, "List_type" : 4 }, 
	    { "List_value" : "National", "List_value_ID" : 29, "List_type" : 5 }, 
	    { "List_value" : "Regional", "List_value_ID" : 30, "List_type" : 5 }, 
	    { "List_value" : "Local", "List_value_ID" : 31, "List_type" : 5 }, 
	    { "List_value" : "Religious", "List_value_ID" : 32, "List_type" : 1 }, 
	    { "List_value" : "International NGO", "List_value_ID" : 33, "List_type" : 1 }, 
	    { "List_value" : "Professional", "List_value_ID" : 34, "List_type" : 1 }, 
	    { "List_value" : "Donor", "List_value_ID" : 35, "List_type" : 1 }, 
	    { "List_value" : "UN System", "List_value_ID" : 36, "List_type" : 1 }, 
	];
	return listOptions;
};

/* OBJECT DEFINITIONS */
/* Sample prototype
Player.prototype =
{
	getIDField : function()
	{
		return "Player_ID";
	} //put in a comma here if there are more...
};
END SAMPLE */

function Affected_player()
{
    this.Affected_player_ID = ModelStatic.getNextID(TABLE_AFFECTED_PLAYER);
    this.Assign_Person = "";
    this.Custom_sort = "";
    this.Dominant_Strat = false;
    this.Fut_PosValue = 0.0;
    this.Fut_PowValue = 0.0;
    this.Future_position_rating = 8;
    this.Future_power_rating = 4;
    this.IncludeInPosCalc = true;
    this.IncludeInPowCalc = true;
    this.Pct_Success_1 = 0.0;
    this.Pct_Success_2 = 0.0;
    this.Pct_Success_3 = 0.0;
    this.Player_ID = 0;
    this.Project_ID = 0;
    this.Strategy_ID = 0;
    this.id = 0;
}

function AnnotationGoals()
{
    this.Annotation_ID = ModelStatic.getNextID(TABLE_ANNOTATIONGOALS);
    this.Comments = "";
    this.Goal_ID = 0;
    this.More_research_needed = false;
    this.Project_ID = 0;
    this.id = 0;
}

function AnnotationPlayers()
{
    this.Annotation_ID = ModelStatic.getNextID(TABLE_ANNOTATIONPLAYERS);
    this.Comments = "";
    this.More_research_needed = false;
    this.Player_ID = 0;
    this.Project_ID = 0;
    this.id = 0;
}

function AnnotationStrats()
{
    this.Annotation_ID = ModelStatic.getNextID(TABLE_ANNOTATIONSTRATS);
    this.Comments = "";
    this.More_research_needed = false;
    this.Project_ID = 0;
    this.Strategy_ID = 0;
    this.id = 0;
}

function Coalition()
{
    this.Coal_ID = ModelStatic.getNextID(TABLE_COALITION);
    this.Coal_Angle = 0.0;
    this.Coal_Ent_ID = 0;
    this.Coal_Text = "";
    this.Coal_Type = 0;
    this.Coal_X2pos = 0.0;
    this.Coal_Xpos = 0.0;
    this.Coal_Y2pos = 0.0;
    this.Coal_Ypos = 0.0;
    this.Project_ID = 0;
    this.id = 0;
}

function Consequences()
{
    this.Conseq_ID = ModelStatic.getNextID(TABLE_CONSEQUENCES);
    this.Conseq_identity = "";
    this.Conseq_intensity = "";
    this.Conseq_intensity_rating = 0;
    this.Conseq_player_ID = 0;
    this.Conseq_qual = "";
    this.Conseq_size = "";
    this.Conseq_timing = "";
    this.Custom_sort = "";
    this.Project_ID = 0;
    this.id = 0;
}

function List_options()
{
    this.List_value_ID = ModelStatic.getNextID(TABLE_LIST_OPTIONS);
    this.List_type = 0;
    this.List_value = "";
    this.Project_ID = 0;
    this.id = 0;
}

function Objectives()
{
    this.Objective_ID = ModelStatic.getNextID(TABLE_OBJECTIVES);
    this.Custom_sort = "";
    this.Objective = "";
    this.Player_ID = 0;
    this.Priority = 4;
    this.Project_ID = 0;
    this.Type = "";
    this.id = 0;
}

function PlayQues()
{
    this.PlayQues_ID = ModelStatic.getNextID(TABLE_PLAYQUES);
    this.PlayQues_Player_ID = 0;
    this.PlayQues_Ques_ID = 0;
    this.PlayQues_Type = 0;
    this.PlayQues_Value = 0.0;
    this.Project_ID = 0;
    this.id = 0;
}

function Player()
{
    this.Player_ID = ModelStatic.getNextID(TABLE_PLAYER);
    this.CalcFuturePosMethod = 1;
    this.CalcFuturePowMethod = 1;
    this.Custom_sort = "";
    this.FutPosValue = 0.0;
    this.FutPosition_rating = 0;
    this.FutPowValue = 0.0;
    this.FutPower_rating = 0;
    this.Include = true;
    this.Include_Strat_Creation = true;
    this.Level = "";
    this.Org_or_indiv = 5;
    this.Player_abbrev = "";
    this.Player_details = "";
    this.Player_name = "";
    this.Player_obstacle = "";
    this.Player_opportunity = "";
    this.PosCalcMethod = 0;
    this.PosValue = 0.0;
    this.Position_rating = 8;
    this.PowValue = 0.0;
    this.Project_ID = 0;
    this.Sector = "";
    this.Strength_of_influence = 4;
    this.Strength_of_position = 4;
    this.Support_vs_opposition = 4;
    this.Trump = false;
    this.Votes = 0.0;
    this.Weight = 1.0;
    this.id = 0;
}

function Policy_Goal()
{
    this.Goal_ID = ModelStatic.getNextID(TABLE_POLICY_GOAL);
    this.Custom_sort = "";
    this.Goal = "";
    this.Indicator = "";
    this.Mechanism = "";
    this.On_agenda = "";
    this.Project_ID = 0;
    this.Rel_priority = 4;
    this.id = 0;
}

function Project()
{
    this.Project_ID = ModelStatic.getNextID(TABLE_PROJECT);
    this.Alg_Option = 0;
    this.Alg_OptionOrFormula = 0;
    this.Alg_PP = 0;
    this.Alg_PV = 0;
    this.Alg_PosOp = 0;
    this.Alg_PosVal = 0.0;
    this.Alg_PowOp = 0;
    this.Alg_PowVal = 0.0;
    this.Alg_VteOp = 0;
    this.Alg_VteVal = 0.0;
    this.Date_LocalStorage_Save = "";
    this.Analysis_Date = "";
    this.Analyst = "";
    this.As_of_date = "";
    this.CalcFuturePos = false;
    this.CalcFuturePow = false;
    this.Client = "";
    this.CoalitionCircleInner = 0.0;
    this.CoalitionCircleOuter = 0.0;
    this.CoalitionShowCircles = false;
    this.ImpDt_01 = "";
    this.ImpDt_02 = "";
    this.ImpDt_03 = "";
    this.Policy_Date = "";
    this.PosCalcDefault = 0;
    this.System_label = "";
    this.Use_Prob_Success = false;
    this.User_label = "";
    this.id = 0;
    this.notTheExampleProject = true;
}

function Question()
{
    this.Ques_ID = ModelStatic.getNextID(TABLE_QUESTION);
    this.Project_ID = 0;
    this.Ques_Text = "";
    this.Ques_Type = 0;
    this.id = 0;
}

function ReportLbl()
{
    this.RepLbl_ID = ModelStatic.getNextID(TABLE_REPORTLBL);
    this.Project_ID = 0;
    this.RepLbl_01 = "";
    this.RepLbl_02 = "";
    this.RepLbl_03 = "";
    this.RepLbl_04 = "";
    this.RepLbl_05 = "";
    this.RepLbl_06 = "";
    this.RepLbl_07 = "";
    this.RepLbl_08 = "";
    this.RepLbl_09 = "";
    this.RepLbl_10 = "";
    this.RepLbl_11 = "";
    this.RepLbl_12 = "";
    this.RepLbl_FullTitle = "";
    this.RepLbl_OtherAxis = "";
    this.RepLbl_Text = "";
    this.id = 0;
}

function ReportTbl()
{
    this.Rep_ID = ModelStatic.getNextID(TABLE_REPORTTBL);
    this.Project_ID = 0;
    this.Rep_01 = "";
    this.Rep_01Num = 0.0;
    this.Rep_02 = "";
    this.Rep_03 = "";
    this.Rep_04 = "";
    this.Rep_05 = "";
    this.Rep_06 = "";
    this.Rep_07 = "";
    this.Rep_08 = "";
    this.Rep_09 = "";
    this.Rep_10 = "";
    this.Rep_11 = "";
    this.Rep_12 = "";
    this.Rep_Text = "";
    this.Rep_X_ID = 0;
    this.id = 0;
}

function ScaleParm()
{
    this.Scale_ID = ModelStatic.getNextID(TABLE_SCALEPARM);
    this.Project_ID = 0;
    this.Scale_Level = 0;
    this.Scale_Value = 0.0;
    this.Scale_Which = 0;
    this.id = 0;
}

function Strategy()
{
    this.Strategy_ID = ModelStatic.getNextID(TABLE_STRATEGY);
    this.Action = "";
    this.Benefit = "";
    this.Cost = 0.0;
    this.Custom_sort = "";
    this.Implications = "";
    this.Pct_Success = 100.0;
    this.Problem = "";
    this.Project_ID = 0;
    this.Strategy_name = "";
    this.Timeline = "";
    this.id = 0;
}

