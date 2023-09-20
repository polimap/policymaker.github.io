/* 
 * PolicyMaker 5: 
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */
ERRORMSGS = 
[ 
	{ id: "error1", text : "A player name must be given", caption: "Player Name Required"},
	{ id: "error2", text : "A player level value must be selected.", caption: "Player Level is required"},
	{ id: "error3", text : "The project name must be given and must be unique.", caption: "Unique Project Name Required"},
	{ id: "error4", text : "A project with this name has already been created.  Please choose a different name.", caption: "Unique Name Required"},
	{ id: "error5", text : "Analyst name is required", caption: "Analyst is Required"},
	{ id: "error6", text : "A strategy must be selected to continue, or click on Cancel to cancel.", caption: "Strategy Selection Error"},
	{ id: "error7", text : "Trump player: Both Player and Weight are required, or neither.", caption: "Both Player and Weight Required"},
	{ id: "error8", text : "Trump player: Weight can be between 2 and 5", caption: "Weight Range Error"},
	{ id: "error9", text : "A goal for the item must be defined", caption: "Goal Definition Required"},
	{ id: "error10", text : "A consequence description must be provided", caption: "Consequence Description Error"},
	{ id: "error11", text : "A player must be selected", caption: "Consequence/Player Name Error"},
	{ id: "error12", text : "An interest must be given.", caption: "Interest Creation Error"},
	{ id: "error13", text : "A player must be selected", caption: "Interest/Player Name Error"},
	{ id: "error14", text : "One or more players must be selected", caption: "Select a Player"},
	{ id: "error15", text : "A strategy name must be given", caption: "Strategy Name Required"},
	{ id: "error16", text : "An action for the strategy must be given", caption: "Strategy/Action Error"},
	{ id: "error17", text : "A list item cannot be empty or blank. (Click Cancel to exit without adding one.)", caption: "Invalid List Item"},
	{ id: "error18", text : "This list item already exists in the list.", caption: "Duplicate List Item is Not Allowed"},
	{ id: "error19", text : "The Project Name cannot be changed to the value given because that project already exists.", caption: "Duplicate Project Name"},
	{ id: "error20", text : "Choose one of the 3 options: a player, a caption, or a divider, or click Cancel to exit.", caption: "Choose an option"},
	{ id: "error21", text : "If you choose the caption choice, please fill in a caption, or click Cancel to exit.", caption: "Option requires a caption"},
	{ id: "error22", text : "If you choose the divider choice, please fill in an angle value between 0 and 360, or click Cancel to exit.", caption: "Option requires aan angle value"},
	{ id: "error23", text : "If you choose the player choice, please select a player from the list, or click Cancel to exit.", caption: "Option requires a player selection"},
	{ id: "error24", text : "There are no items on the Coalition Map to remove.", caption: "No Items Available to Remove"},
	{ id: "error25", text : "A coalition circle value, if given, must be a number between 1 and 80.", caption: "Invalid Coalition Circle Value"},
	{ id: "error26", text : "There is no current project, so no project can be exported.", caption: "No Current Project Defined"},
	{ id: "error27", text : "The maximum length of a player name is 70 characters.", caption: "Player Name Exceeds Max Length"},
	
];

ErrorStatic = {};
ErrorStatic.getErrorMessage = function(errorCode)
{
	for (var I = 0; I < ERRORMSGS.length; I++)
	{
		if (ERRORMSGS[I].id == errorCode)
			return ERRORMSGS[I].text;
	}
};
ErrorStatic.showSimpleErrorBox = function(errorCode)
{
	var errData;
	for (var I = 0; I < ERRORMSGS.length; I++)
	{
		if (ERRORMSGS[I].id == errorCode)
		{
			errData = ERRORMSGS[I];
		}
	}
	if (!errData)
	{
		return;
	}
	
	var dialogId = "minErrorBox";
	var dialogIdAsSel = '#' + dialogId;
	
	var divDef = '<div id="' + dialogId + '" title="' + errData.caption + '"><table width="100%"><tbody>' +
		'<tr><td colspan="2" height="24px;">' + errData.text + '</td></tr>' +
		'</tbody></table></div>';
		
	$("#dialogs").after(divDef);
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 330,
		height: "auto",
		buttons: [
			{
				id: "mebBtnClose",
				text: "Close",
				click: function()
				{
					DialogStatic.onDialogClose(dialogId);
					$(this).dialog('destroy').remove();
				}
			},
		],
		open: function() 
		{
			DialogStatic.onDialogOpen(dialogId);
        	$("#mebBtnClose").focus(); //make Close the default
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
};

