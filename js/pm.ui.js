/*
 * PolicyMaker 5:
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */

var VERSION_STRING = "5.0.164";
var PageStatic = {};

PageStatic.getPage = function(code, mainUIobjectType)
{
	var html = '';
	var menuName = PageStatic.getMenuName(code);
	var headerDiv = '';
	if (GridStatic[code])
	{
		if (GridStatic[code].header)
		{
			var menuText = GridStatic[code].header.headerText;
			var relHeight = 0;
			var replegex = /<!--REPLACE-->/g;
			
			var buttonsArr = [];
			var legendsHtmlArr = [];
			if (GridStatic[code].header.headerReplaceContent)
			{
				menuText = menuText.replace(replegex, GridStatic[code].header.headerReplaceContent);
			}
			else
			{
				menuText = menuText.replace(replegex, "-");
			}
			
			relHeight = GridStatic[code].header.headerRelHeight - 30;
			
			if (GridStatic[code].hasAdd)
			{
				var addBtn = '<button id="bAddItem" class="gridaddbutton">' + GridStatic[code].addButtonText + '</button>';
				buttonsArr.push(addBtn);
			}
			if (GridStatic[code].otherButtonsAndDialogs)
			{
				var otherBtnDial = GridStatic[code].otherButtonsAndDialogs;
				for (var I = 0; I < otherBtnDial.length; I++)
				{
					var otherDialog = '<button id="' + otherBtnDial[I].btnName + '" class="gridaddbutton">' + otherBtnDial[I].name + '</button>';
					buttonsArr.push(otherDialog);
				}
			}
			
			if (GridStatic[code].header.legends)
			{
				legendsHtmlArr = PageStatic.createLegendHtmls(GridStatic[code].header.legends);
			}
			
			headerDiv = '<div class="gridpageheadertext" style="height: ' + relHeight + 'px;">' + 
				menuText + PageStatic.buildButtonsAndLegendsBar(buttonsArr, legendsHtmlArr) + '</div>';
		}
	}
	html += '<div id="page' + code +
			'" class="mainwin">' +
			'<div id="maingrid" class="maincontent">' +
			'<div class="gridpageheader">' + menuName +
			'</div>' + 
			headerDiv + 
			'<div class="rounded-corners gridframe">' +
			PageStatic.getMainUIDiv(mainUIobjectType) +
			'</div></div>' +
			'<div style="height: 72px;"></div>' +
			'</div>';
	return html;
};
PageStatic.getMenuName = function(code)
{
	var menuName = WINDOWMETADATA.getDisplayNameForWindow(code);
	if (GridStatic[code])
	{
		if (GridStatic[code].header)
		{
			var replegex = /<!--REPLACE-->/g;
			if (GridStatic[code].menuReplaceContent)
			{
				menuName = menuName.replace(replegex, GridStatic[code].menuReplaceContent);
			}
			else
			{
				menuName = menuName.replace(replegex, "-");
			}
		}
	}
	return menuName;
};

PageStatic.createLegendHtmls = function(legends)
{
	var legendsHtmlArr = [];
	for (var I = 0; I < legends.length; I++)
	{
		var blocksWidth = legends[I].values.length * 16;
		var leghtml = '<table><tr><td colspan="3" style="text-align: center">' + legends[I].name + '</td></tr>';
		leghtml += '<tr><td style="text-align: right; padding-right: 5px;">' + legends[I].lefttext + '</td>';
		leghtml += '<td style="width:' + blocksWidth + 'px; margin-left: 10px; margin-right: 10px">' + GridStatic.colorLegend(legends[I]) + '</td>';
		leghtml += '<td style="text-align: left; padding-left: 5px;">' + legends[I].righttext + '</td>';
		leghtml += '</tr></table>';
		legendsHtmlArr.push(leghtml);
	}
	return legendsHtmlArr;
};

/*
 * The scheme here is for buttons to appear on the left, and for legends to appear on the right
 */
PageStatic.buildButtonsAndLegendsBar = function(buttonsArr, legendsHtmlArr)
{
	if (buttonsArr.length == 0 && legendsHtmlArr.length == 0)
	{
		return "";
	}
	var htmlret = '<table width="100%" style="margin: 15px;"><tr>';
	var tdleftpct = "50%";
	var tdrightpct = "50%";
	
	if (legendsHtmlArr.length > 1)
	{
		tdleftpct = "40%";
		tdrightpct = "30%";//each
	}
	htmlret += '<td><div width="' + tdleftpct + '" style="float: left;">'; //"
	for (var I = 0; I < buttonsArr.length; I++)
	{
		htmlret += buttonsArr[I];
	}
	htmlret += '</div></td>';
	
	for (var L = 0; L < legendsHtmlArr.length; L++)
	{
		var rightLast = '';
		var rightLastEnd = '';
		if (L == legendsHtmlArr.length - 1)
		{
			rightLast = '<div style="float: right; margin-right: 20px;">';
			rightLastEnd = '</div>';
		}
		htmlret += '<td width="' + tdrightpct + '">' + rightLast + legendsHtmlArr[L] + rightLastEnd + '</td>';
	}
	
	htmlret += '</tr></table>';
//	console.log(htmlret);
	return htmlret;
};

PageStatic.getMainUIDiv = function(mainUIobjectType)
{
	switch(mainUIobjectType)
	{
	case "GRID":
		return '<div id="myGrid" class="thegrid"></div>';
	case "GRAPHIC":
		return '<div id="visGraphic"></div>';
	case "SUGGSTR":
		return '<div id="suggStrats"></div>';
	case "PROJSET":
		return '<div id="projSet"></div>';
	case "REPORT":
		return '<div id="report" class="repmain"></div>';
	default:
		return '';
	}
};

PageStatic.LIST_EDITOR_ADD_DIALOG = "ListEdAddDialog";
PageStatic.LIST_EDITOR_DEL_DIALOG = "ListEdDelDialog";
PageStatic.LIST_EDITOR_ADD_BOX = "ListEdAddBox";
PageStatic.PROJECT_SETTINGS_SAVE = "SavePJSettings";
PageStatic.listNames = [
	{ name: "On_agenda", label: "On Agenda", type: 3},
	{ name: "Level", label: "Level", type: 5},
	{ name: "Type", label: "Interest Type", type: 2},
	{ name: "Conseq_qual", label: "Consequence Type", type: 4},
	{ name: "Sector", label: "Sector", type: 1},
];

PageStatic.getProjectSettingsDisplay = function(parentID)
{
	var parIDSel = "#" + parentID;
	var listItems = '<table width="100%" class="listeditortable">' + 
	    '<tr><td colspan="2">' + PageStatic.getProjectSettingsDialogItems() + '</td></tr>' +
	    '<tr><td width="50%" class="listeditortd">' +
		PageStatic.getProjectListEditor(PageStatic.listNames[0]) + '</td><td width="50%" class="listeditortd">' +
		PageStatic.getProjectListEditor(PageStatic.listNames[1]) + '</td><tr><td width="50%" class="listeditortd">' +
		PageStatic.getProjectListEditor(PageStatic.listNames[2]) + '</td><td width="50%" class="listeditortd">' +
		PageStatic.getProjectListEditor(PageStatic.listNames[3]) + '</td></tr><tr><td colspan="2" class="listeditortd"><div style="width: 440px; margin: auto;">' +
		PageStatic.getProjectListEditor(PageStatic.listNames[4]) + '</div></td></tr>' + 
		'<tr><td colspan="2" class="listeditortd"><div style="width: 600px; margin: auto; padding: 12px;"><table><tr><td>' + 
		'<div style="font-size:1.6em;font-style:bold;">Delete this project (all data will be removed):</div></td><td><button id="' + 
		ProjectManager.DELETE_THIS_BUTTON_ID + '">Delete This Project</button></div></td></tr></table></td></tr>' + 
		'<tr><td colspan="2" class="listeditortd"><div style="font-size:1.6em;font-style:bold; padding: 12px;">PolicyMaker version: ' + 
		VERSION_STRING + 
		'</div></td></tr></table>';
		
	$(parIDSel).append(listItems);
	
    var pjfields = GridStatic.PJ.dialog.fields;	
    for (var P = 0; P < pjfields.length; P++)
    {
    	var fieldName = pjfields[P].field;
    	var selCtrl = '#' + fieldName;
    	var currVal = MODEL[TABLE_PROJECT][0][fieldName];
    	$(selCtrl).val(currVal);
    }
    var settingsSaveId = '#' + PageStatic.PROJECT_SETTINGS_SAVE;
	$( settingsSaveId ).button({ icons: { primary: "ui-icon-disk" } });
	$( settingsSaveId ).unbind('click');
	$( settingsSaveId ).click( PageStatic.getSaveSettingsAction() );
   
	for (var I = 0; I < PageStatic.listNames.length; I++)
	{
		var btnId = '#addBtn' + PageStatic.listNames[I].name;
		$( btnId ).button({ icons: { primary: "ui-icon-plus" } });
		$( btnId ).unbind('click');
		$( btnId ).click( PageStatic.getListAddButtonAction( PageStatic.listNames[I]) );
		
		var items = DialogStatic.getItemsForList(PageStatic.listNames[I].name);
		
		if (items.length > 1) //If there is only one item, it cannot be deleted
		{
			for (var J = 0; J < items.length; J++)
			{
				var itemID = items[J].List_value_ID;
				var delBtnId = '#del' + itemID;
				$( delBtnId ).button({ icons: { primary: "ui-icon-trash" } });
				$( delBtnId ).unbind('click');
				$( delBtnId ).click( PageStatic.getListDelButtonAction( PageStatic.listNames[I].label, itemID ) );
			}
		}
	}
	
	ProjectManager.activateDeleteThisProjectButton();
};
PageStatic.getProjectSettingsDialogItems = function()
{
	var divSet = '<table width="100%"><tbody>';
	var fields = GridStatic.PJ.dialog.fields;
	var TMP = "(value goes here)";
	for (var I = 0; I < fields.length; I++)
	{
		divSet += '<tr><td width="30%" style="text-align: right;"><span style="font-size: 1.4em;">' + fields[I].title + 
		'</span></td><td width="70%" style="text-align: left;"><input id="' + fields[I].field + 
		'" class="projectsettingsinput" ' + DialogStatic.getTextBoxStyling(fields[I].type) + '/></td></tr>';
	}
	
	divSet += '<tr><td colspan="2"><table width="100%"><tr>';
	divSet += '<td width="90%" height="24px;"><div id="' + DialogStatic.errorFieldName + 
		'" style="font-size: 1.4em;"></div></td>';
	divSet += '<td width="10%" style="text-align: right;"><button id="' + PageStatic.PROJECT_SETTINGS_SAVE + '" class="ui-widget-input">Save</button></td>';
	divSet += '</tr></table></td></tr></table>';
	return divSet;
};
PageStatic.getProjectListEditor = function(listNameObj)
{
	var items = DialogStatic.getItemsForList(listNameObj.name);
	var delButtonOK = (items.length > 1) ? true : false;
	var listEd = '<div style="font-size:1.6em;font-style:bold;margin-top: 5px;">' + listNameObj.label + '</div>';
	listEd += '<ol style= "list-style-type: none; float: left;" id="' + listNameObj.name + 'Editor">';
	for (var I = 0; I < items.length; I++)
	{
		listEd += '<li class="ui-widget-content" style="width: 280px; height: 20px; padding-top: 2px; font-size: 1.4em;" id="' + 
		items[I].List_value_ID + '">' + items[I].List_value;
		if (delButtonOK) //cannot delete the last item
		{
			listEd += '<button id="del' + items[I].List_value_ID + '" style="float:right; width:36px;"></button>'; 
		}
		listEd += '</li>';
	}
	listEd += '</ol>';
	listEd += '<button id="addBtn' + listNameObj.name + '" class="gridaddbutton" style="float:right; width:84px; height:32px; font-size:1.5em;">Add</button>';
	return listEd;
};

PageStatic.getListAddButtonAction = function(listNameObj)
{
	return function()
	{
		var dialogId = PageStatic.LIST_EDITOR_ADD_DIALOG;
		var dialogIdAsSel = '#' + dialogId;
		var listName = listNameObj;
		
		var divDef = '<div id="' + dialogId + '" title="Add Item to List: ' + listName.label + '"><table width="100%"><tbody>';
		divDef += '<tr><td style="text-align: right; width: 30%; ">New ' + 
			listName.label + ' Item: </td><td style="width: 70%; height: 30px; text-align: left;">' + 
			'<input type="text" id="' + PageStatic.LIST_EDITOR_ADD_BOX + '" style="width: 390px; text-align:left;" />' +
			'</td></tr>';
		divDef += '<tr><td colspan="2" height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';

		divDef += '</tbody></table></div>';
		$("#dialogs").after(divDef);
		
		$(dialogIdAsSel).dialog({
			autoOpen: true,
			width: 700,
			height: "auto",
			buttons: [
				{
					id: "addListBtnOK",
					text: "Add",
					click: function()
					{
						if (PageStatic.handleAddListItemOK(listNameObj))
						{
							DialogStatic.onDialogClose(dialogId);
							$(this).dialog('destroy').remove();
						}
					}
				},
				{
					id: "addListBtnCancel",
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
	        	$("#deleteBtnCancel").focus(); //make Cancel the default
	    	},
	    	close: function()
	    	{
	    		DialogStatic.onDialogClose(dialogId);
	    	},
		});
		console.log("Add button clicked for list: " + listName.name);
	};
};
PageStatic.getListDelButtonAction = function(listName, listValueID)
{
	return function()
	{
		var dialogId = PageStatic.LIST_EDITOR_DEL_DIALOG;
		var dialogIdAsSel = '#' + dialogId;
		var displayListName = listName;
		var listItemValue = ModelStatic.getFieldFromRowBasedOnKey(TABLE_LIST_OPTIONS, "List_value", listValueID);
		
		var divDef = '<div id="' + dialogId + '" title="Delete Item From List: ' + displayListName + '"><table width="100%"><tbody>';
		divDef += '<tr><td colspan="2" class="dialUrgent">Are you sure you want to delete this item?</td></tr>';
		divDef += '<tr><td style="text-align: right; width: 50%; ">' + 
			displayListName + ' Item: </td><td style="width: 50%; height: 30px; text-align: left;">' + 
			listItemValue + '</td></tr>';
		divDef += '</tbody></table></div>';
		$("#dialogs").after(divDef);
		
		$(dialogIdAsSel).dialog({
			autoOpen: true,
			width: 700,
			height: "auto",
			buttons: [
				{
					id: "deleteListBtnOK",
					text: "Delete",
					click: function()
					{
						if (PageStatic.handleDeleteListItemOK(listValueID))
						{
							DialogStatic.onDialogClose(dialogId);
							$(this).dialog('destroy').remove();
						}
					}
				},
				{
					id: "deleteListBtnCancel",
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
	        	$("#deleteBtnCancel").focus(); //make Cancel the default
	    	},
	    	close: function()
	    	{
	    		DialogStatic.onDialogClose(dialogId);
	    	},
		});
		console.log("Show dialog to delete list item number " + listValueID + " for " + listName);
	};
};


PageStatic.handleDeleteListItemOK = function(listValueID)
{
	console.log("List item number " + listValueID + " would have been deleted.");
	
	ModelStatic.deleteItemWithKeyFromTable(TABLE_LIST_OPTIONS, listValueID, true);
	//Exit before here to avoid causing the model to be saved
	ProjectManager.saveProject();
	
	changePage("PS");
	return true;
};

PageStatic.handleAddListItemOK = function(listNameObj)
{ //if a duplicate or empty item, return false
	var inputFldSel = "#" + PageStatic.LIST_EDITOR_ADD_BOX;
	var inputVal = $(inputFldSel).val();
	inputVal = inputVal.trim();
	var errorCode = "";
	if (inputVal.length < 1)
	{
		errorCode = "error17";
	}
	else
	{
		items = DialogStatic.getItemsForList(listNameObj.name);
		for (var I = 0; I < items.length; I++)
		{
			if (items[I].List_value == inputVal)
			{
				errorCode = "error18";
				break;
			}
		}
	}
	if (errorCode.length > 0)
	{
		var ctrlSele = '#' + PageStatic.LIST_EDITOR_ADD_BOX;
		$(ctrlSele).addClass('ui-state-error');
		var errText = ErrorStatic.getErrorMessage(errorCode); 
		$('#' + DialogStatic.errorFieldName).html(errText);
		return false;
	}
	
	var aNewItem = ModelStatic.getNewObject(TABLE_LIST_OPTIONS);
	aNewItem.List_value = inputVal;
	aNewItem.List_type = listNameObj.type;
	
	//Exit before here to avoid causing the model to be saved
	MODEL[TABLE_LIST_OPTIONS].push(aNewItem);
	ProjectManager.saveProject();
	
	changePage("PS");
	
	return true;
};
PageStatic.getSaveSettingsAction = function()
{
	return function()
	{
		var fields = GridStatic.PJ.dialog.fields;
		for (var I = 0; I < fields.length; I++)
		{
			var fieldKey = '#' + fields[I].field;
			var fieldVal = $(fieldKey).val();
			if (fields[I].required && fields[I].required.length > 0)
			{
				if (fieldVal.length < 1)
				{
					//console.log("Error: " + fields[I].required);
					$(fieldKey).addClass('ui-state-error');
					var errText = ErrorStatic.getErrorMessage(fields[I].required); 
					$('#' + DialogStatic.errorFieldName).html(errText);
					return;
				}
			}
		}
		//Is user changing the name of the project?
		var projNameAsEntered = $("#User_label").val();
		var projNameCurrent = MODEL[TABLE_PROJECT][0].User_label;
		if (projNameAsEntered != projNameCurrent)
		{
			if (!ProjectManager.isNewProjectNameUnique(projNameAsEntered))
			{
				$("#User_label").addClass('ui-state-error');
				var errText = ErrorStatic.getErrorMessage("error19"); 
				$('#' + DialogStatic.errorFieldName).html(errText);
				return;
			}
		}
		console.log("Settings will be saved.");
		
		var wasValueChanged = false;
		for (var I = 0; I < fields.length; I++)
		{
			var fieldKey = '#' + fields[I].field;
			var newFieldVal = $(fieldKey).val();
			var currFieldVal = MODEL[TABLE_PROJECT][0][fields[I].field];
			if (newFieldVal != currFieldVal)
			{
				MODEL[TABLE_PROJECT][0][fields[I].field] = newFieldVal;
				wasValueChanged = true;
			}
		}
		if (wasValueChanged)
		{
		//If the user saved the Full Project Name ("User_label"), the project will 
		//be saved to a new name.
			if (projNameAsEntered != projNameCurrent)
			{
				if (MODEL[TABLE_PROJECT][0].notTheExampleProject) //do not save the example project
				{
				//Delete the project as saved under the pre-existing name
				//(Delete is done before saving under the new key to avoid exceeding storage limits)
					var currKey = ProjectManager.getKeyForProject(projNameCurrent);
					localStorage.removeItem(currKey);	
						
				//Make this the current project
					ProjectManager.currentProject = projNameAsEntered;
					ProjectManager.markProjectAsCurrent();
				}
			}
			
			ProjectManager.saveProject();
				
			changePage("PS");
			
			console.log("Settings were saved.");
		}
	};	
};

PageStatic.getSuggestedStrategiesDisplay = function(parentID)
{
	var parIDSel = "#" + parentID;
	var idSelectBox = "suggStratsSelect";
	var selForSelectBox = "#" + idSelectBox;

	var selbox = '<div style="width: 953px; display: block; font-size: 1.2em;">';
	selbox += '<ul id="' + idSelectBox + '">';
	selbox += PageStatic.getSuggestedStrategiesOptGroup("Power Strategies", ModelStatic.getSuggestedStrategiesForCategory("POWER"), idSelectBox);
	selbox += PageStatic.getSuggestedStrategiesOptGroup("Position Strategies", ModelStatic.getSuggestedStrategiesForCategory("POSITION"), idSelectBox);
	selbox += PageStatic.getSuggestedStrategiesOptGroup("Player Strategies", ModelStatic.getSuggestedStrategiesForCategory("PLAYER"), idSelectBox);
	selbox += PageStatic.getSuggestedStrategiesOptGroup("Perception Strategies", ModelStatic.getSuggestedStrategiesForCategory("PERCEPTION"), idSelectBox);
	selbox += '</ul></div>';
	
	$(parIDSel).append(selbox);
	
	$(selForSelectBox).selectable({
		filter: ".ssOpt",
		selected: function(event, ui)
		{
			var ssID;
			$(".ui-selected", this).each(function() 
			{
      			ssID = this.id; //$(this).attr('id');
      			selectedItems[0] = ModelStatic.getSuggestedStrategyFromID(ssID);
 			});			
			console.log("Sugg Strat Selected: " + selectedItems[0].text);
			DialogStatic.showStandardDialog("SH", true);
		}
	});
};

PageStatic.getSuggestedStrategiesOptGroup = function(labelText, suggStratSubset, idSelectBox)
{
	var selbox = '<li class="ssGroupLabel">'+ labelText +'</li>';
	for (var I = 0; I < suggStratSubset.length; I++)
	{
		var ssID = suggStratSubset[I]["id"];
		var ssText = suggStratSubset[I]["text"];
		selbox += PageStatic.getSuggestedStrategyHtml(ssID, ssText);
	}
	return selbox;
};
PageStatic.getSuggestedStrategyHtml = function(ssID, ssText)
{
	return '<li id="' + ssID + '" class="ui-widget-content ssOpt" style="width: 940px; height: 34px; padding-top: 2px; font-size: 1.2em;">' + ssText + '</li>';
};

var MenuStatic = {};
MenuStatic.getAllMenusHtml = function()
{
	var html = "";
	for (var I = 0; I < MENUOBJS.length; I++)
	{
		html += MenuStatic.getMenuHtml(MENUOBJS[I]);
	}
	return html;
};

MenuStatic.getMenuHtmlNamed = function(code)
{
	for (var I = 0; I < MENUOBJS.length; I++)
	{
		if (MENUOBJS[I].code == code)
		{
			return MenuStatic.getMenuHtml(MENUOBJS[I]);
		}
	}
};

MenuStatic.getMenuHtml = function(menu)
{
	var menuHtml = '<div id="page' + menu.code + '" class="mainwin">' +
		'<div id="mainnav' + menu.code + '" class="maincontent">' +
		'<div class="mainnavheader">' + menu.label + '</div>' +
		MenuStatic.getMenuTextItems(menu, true) + 
		'<div class="mainnavcontent"><table width="100%">' +
		MenuStatic.getMenuItemsHtml(menu) +
		'</table>' +
		MenuStatic.getMenuTextItems(menu, false) + 
		'</div></div><div class="mainnavfooter"></div>' +
		'</div>';
	//console.log(menuHtml);
	return menuHtml;
};

MenuStatic.getMenuTextItems = function(menu, isTop)
{
	var html = "";
	var hasShownDisplayOptions = false;
	for (var I = 0; I < menu.items.length; I++)
	{
		if (!menu.items[I].isDisplayOption)
		{
			if (isTop && !hasShownDisplayOptions)
			{
				html += MenuStatic.getMenuTextItem(menu.items[I]);
			}
			else
			{
				if (!isTop && hasShownDisplayOptions)
				{
					html += MenuStatic.getMenuTextItem(menu.items[I]);
				}
			}
		}
		else
		{
			hasShownDisplayOptions = true;
		}
	}
	if (html.length > 0)
	{
		return '<div class="mainnavplaintextback">' + html + '</div>';
	}
	return "";
};

MenuStatic.getMenuTextItem = function(menuItem)
{
	return '<div class="mainnavplaintext">' + menuItem.text + '</div>';
};

MenuStatic.getMenuItemsHtml = function(menu)
{
	var html = "";
	for (var I = 0; I < menu.items.length; I++)
	{
		if (!menu.items[I].isDisplayOption)
		{
			continue;
		}
		html += '<tr><td width="90%"><div class="rounded-corners mainnavitem"' +
			'  onclick="changePage(\'' + menu.items[I].code + 
			'\')"><table><tr>' +
			MenuStatic.getMenuItemIconHtml(menu.items[I]) +
			MenuStatic.getMenuItemTextHtml(menu.items[I]) +
			'</tr></table></div></td></tr>';
	}
	return html;
};

MenuStatic.getMenuItemIconHtml = function(menuItem)
{
	var tdImg = '<td class="mainnaviconcell"><img src="css/images/' +
		'step-' + menuItem.code + '.png' +
		'" width="34px" class="mainnavicon"></img></td>';
	return tdImg;
};

MenuStatic.getMenuItemTextHtml = function(menuItem)
{
	var html = "";
	html += '<td class="mainnavtextcell"><div class="mainnavtextdiv"><p class="mainnavtexttitle">';
	html += menuItem.label;
	html += '</p>';
	if (menuItem.text != "")
	{
		html += '<p class="mainnavtextdetail">' + menuItem.text + '</p>';
	}
	html += '</div></td>';
	return html;
};

var ToolbarStatic = {};
ToolbarStatic.createToolbar = function(parentSelector)
{
	/* Toggle Menu Button; See AccordionStatic */
	$( "#toggleMenu" ).button({ icons: { primary: "ui-icon-home" } });
	$( "#toggleMenu" ).unbind('click');
	$( "#toggleMenu" ).click(function()
	{
		AccordionStatic.toggleMenu();
		return false;
	});

	/* Up Button */
	$( "#upButton" ).button({ icons: { primary: "ui-icon-circle-arrow-w" } });
	$( "#upButton" ).unbind('click');
	$( "#upButton" ).click(function()
	{
		if (modalDialogShown)
		{
			return; //do not allow an Up action when a dialog is shown 
		}
		AccordionStatic.closeMenuIfVisible();
   	//Go to next highest menu
		ToolbarStatic.goToNextHighestMenu();
	});
	
	//Help button
	
	$( "#helpButton" ).button({ icons: { primary: "ui-icon-help" } });
	$( "#helpButton" ).unbind('click');
	$( "#helpButton" ).click(function()
	{
		var win = window.open("help.html", '_blank');
  		win.focus();		
	});
};

ToolbarStatic.goToNextHighestMenu = function()
{
	switch(winID)
	{
	//case "DI"://Policy (1A. - no menu)
	case "DX":
		changePage("WE"); //Welcome screen
		break;
	case "CT":
	case "DP":
	case "DS":
	case "DM":
	case "DR":
		changePage("DX"); //Main Menu
		break;
	case "PL":
	case "PC":
	case "FC":
	case "CN":
	case "PI":
	case "CL":
		changePage("DP"); //Players
		break;
	case "OS":
	case "SH":
	case "ST":
		changePage("DS"); //Strategies
		break;
	case "SI":
	case "PF":
	case "FF":
	case "SM":
		changePage("DM"); //Impacts
		break;
	case "RE":
	case "PS":
		changePage("DR"); //Summary and Settings
		break;
	case "XX":
		break; //intentionally invalid page ID
	default:
		changePage("DX"); //Main Menu
	}
};

var AccordionStatic = {};
AccordionStatic.defineAccordion = function()
{
	/* Toggle-able Accordion Menu */
	$( "#main-menu-sidebar" ).hide();

	$( "#bCloseMenu" ).button({ icons: { primary: "ui-icon-closethick" } });
	$( "#bCloseMenu" ).button( "option", "text", false );
	$( "#bCloseMenu" ).unbind('click');
	$( "#bCloseMenu" ).click(function()
	{
		AccordionStatic.toggleMenu();
		return false;
	});

	$( "[id^='sidenav']" ).unbind('click');
	$( "[id^='sidenav']" ).click(function(event)
	{
		var newPageId = this.id.substring(7,9);
		if (newPageId != "XX") //intentionally invalid page code
		{
	   		event.preventDefault();
	 		AccordionStatic.toggleMenu();
	     	changePage(newPageId);
	     }
	});
};

AccordionStatic.toggleMenu = function()
{
	if (modalDialogShown)
	{
		return; //do not show the accordion when a dialog is shown (user might lose data)
	}
	if ($("#contextMenu").is(':visible'))
	{
		$("#contextMenu").hide(); //showing the accordion causes the context menu to be hidden
	}
	var SLIDE_TIMING_MS = 550;
	$( "#main-menu-sidebar" ).toggle("slide", {}, SLIDE_TIMING_MS);
};

AccordionStatic.closeMenuIfVisible = function()
{
	if ($("#main-menu-sidebar").is(":visible") )
	{
		AccordionStatic.toggleMenu();
	}
};

ScalarStatic = {};
ScalarStatic.setPositionRelatedValues = function(row, posValue, isCurrent)
{
/*
    POSITION VALUE UPDATING:
    *Four values are kept in sync:
           Support_vs_opposition:  1=Support, 2=Non-mob, 3=Opposition, 4=Not Set
           Strength_of_position:   1=High, 2=Medium, 3=Low, 4=Not Set
           Position_rating (a combination of Support_vs_opposition and Strength_of_position):
               1=High Sup, 2=Med Sup, 3=Low Sup, 4=Non-mob, 5=Low opp, 6=Med opp, 7=High opp, 8=Not set
           PosValue:  A value on a user defined scale.
    *The on-screen controls maintain the sync between the PosValue and Position_rating,
      This code must keep up Strength_of... and Support_vs_Opp...
*/
    var nSupVOpp = 0;
    var nStrngPos = 0;
    var nPosRate = ScalarStatic.setRangeFlagFromValue(posValue, "Position");
    switch(nPosRate)
    {
    case 1:
        {
            nSupVOpp = 1;
            nStrngPos = 1;
        }
        break;
    case 2:
        {
            nSupVOpp = 1;
            nStrngPos = 2;
        }
        break;
    case 3:
        {
            nSupVOpp = 1;
            nStrngPos = 3;
        }
        break;
    case 4:
        {
            nSupVOpp = 2;
            nStrngPos = 4;
        }
        break;
    case 5:
        {
            nSupVOpp = 3;
            nStrngPos = 3;
        }
        break;
    case 6:
        {
            nSupVOpp = 3;
            nStrngPos = 2;
        }
        break;
    case 7:
        {
            nSupVOpp = 3;
            nStrngPos = 1;
        }
        break;
    default:
        {
            nSupVOpp = 4;
            nStrngPos = 4;
        }
        break;
    }

	if (isCurrent)
	{ //Row is Player
		row.PosValue = posValue;
    	row.PosCalcMethod = 2; //System default
		row.Position_rating = nPosRate;
		row.Support_vs_opposition = nSupVOpp;
		row.Strength_of_position = nStrngPos;
 	}
	else
	{ //Row is Affected_player
		row.Fut_PosValue = posValue;
		row.Future_position_rating = nPosRate;
	}
};

ScalarStatic.setPowerRelatedValues = function(row, powValue, isCurrent)
{
	if (isCurrent)
	{ //Row is Player
		row.PowValue = powValue;
		row.Strength_of_influence = ScalarStatic.setRangeFlagFromValue(powValue, "Power");
	}
	else
	{ //Row is Affected_player
		row.Fut_PowValue = powValue;
		row.Future_power_rating = ScalarStatic.setRangeFlagFromValue(powValue, "Power");
	}
};

ScalarStatic.setRangeFlagFromValue = function(dVal, which)
{
	var upperBound = ScalarStatic.getPosPowUpperBound(which);
    for (var I = 0; I < upperBound; I++)
    {
        if ((dVal == ScalarStatic.getScaleBound(which, I)) ||
            (dVal == ScalarStatic.getScaleBound(which, I + 1)) ||
            ((dVal < ScalarStatic.getScaleBound(which, I)) &&
            (dVal > ScalarStatic.getScaleBound(which, I + 1))))
        {
            return I + 1;
        }
    }
    //Error
    return 0;
};

ScalarStatic.getScalarTypeFromField = function(whichField)
{
	switch(whichField)
	{
	case "PosValue":
	case "Fut_PosValue":
		return "Position";
	case "PowValue":
	case "Fut_PowValue":
		return "Power";
	case "Rel_priority":
	case "Priority":
		return "Priority";
	case "Conseq_intensity_rating":
		return "Importance";
	case "Pct_Success":
	case "Pct_Success_1":
	case "Pct_Success_2":
	case "Pct_Success_3":
		return "Probability";
	}
	return "";
};

ScalarStatic.getPosPowUpperBound = function(which)
{
	switch(which)
	{
	case "Position":
		return 7;
	case "Power":
	case "Weight":
		return 3;
	}
	return 0;
};

ScalarStatic.getSliderControlBound = function(which, isHigher)
{
	switch(which)
	{
	case "Power":
	case "Position":
		{
			if (isHigher)
				return ScalarStatic.getScaleBound(which, 0);
			else
				return ScalarStatic.getScaleBound(which, ScalarStatic.getPosPowUpperBound(which));
		}
	case "Priority":
	case "Importance":
		{
			if (isHigher == true)
			{
				return 3;
			}
			else
			{
				return 1;
			}
		}
	case "Probability":
		{
			if (isHigher == true)
			{
				return 100;
			}
			else
			{
				return 0;
			}
		}
	}
};

ScalarStatic.getScaleBound = function(type, nWhich)
{
//TODO - confirm dropping of project-specific scales
    switch(type)
    {
    case "Position":
	    {
	        switch(nWhich)
	        {
	            case 0:
	                return 7.0;
	            case 1:
	                return 5.0;
	            case 2:
	                return 3.0;
	            case 3:
	                return 1.0;
	            case 4:
	                return -1.0;
	            case 5:
	                return -3.0;
	            case 6:
	                return -5.0;
	            case 7:
	                return -7.0;
	        }
	    }
        break;

    case "Power":
	    {
	        switch(nWhich)
	        {
	            case 0:
	                return 7.0;
	            case 1:
	                return 5.0;
	            case 2:
	                return 3.0;
	            case 3:
	                return 1.0;
	        }
	    }
        break;

    case "NonMob":
        return 5.0;

    case "Weight":
	    {
	        switch(nWhich)
	        {
	            case 0:
	                return 6.0;
	            case 1:
	                return 4.0;
	            case 2:
	                return 2.0;
	            case 3:
	                return 0.0;
	        }
	    }
        break;
    }
    return 0.0;

};

ScalarStatic.Position =
{
	minVal : ScalarStatic.getSliderControlBound("Position", false),
	minText : "Opposes",
	maxVal : ScalarStatic.getSliderControlBound("Position", true),
	maxText : "Supports",
	isReverse : false,
	type : "POSITION",
	notSetVal : 8,
	step : 0.1
};
ScalarStatic.Power =
{
	minVal : ScalarStatic.getSliderControlBound("Power", false),
	minText : "Low",
	maxVal : ScalarStatic.getSliderControlBound("Power", true),
	maxText : "High",
	isReverse : false,
	type : "POWER-AND-PRIORITY",
	notSetVal : 4,
	step : 0.1
};
ScalarStatic.Probability =
{
	minVal : 0,
	minText : "Low",
	maxVal : 100,
	maxText : "High",
	isReverse : false,
	type : "PROBABILITY",
	notSetVal : 0.0,
	step : 1
};
ScalarStatic.Priority =
{
	minVal : ScalarStatic.getSliderControlBound("Priority", false),
	minText : "Low",
	maxVal : ScalarStatic.getSliderControlBound("Priority", true),
	maxText : "High",
	isReverse : true,
	getReverseValue : function(value)
	{
		switch(value)
		{
		case 1:
			return 3;
		case 3:
			return 1;
		default:
			return value;
		}
	},
	type : "POWER-AND-PRIORITY",
	notSetVal : 4,
	step : 1
};
ScalarStatic.Importance =
{
	minVal : ScalarStatic.getSliderControlBound("Importance", false),
	minText : "Low",
	maxVal : ScalarStatic.getSliderControlBound("Importance", true),
	maxText : "High",
	isReverse : true,
	getReverseValue : function(value)
	{
		switch(value)
		{
		case 1:
			return 3;
		case 3:
			return 1;
		default:
			return value;
		}
	},
	type : "POWER-AND-PRIORITY",
	notSetVal : 4,
	step : 1
};
ScalarStatic.ID_SUFFIX_ICON = "sficon";
ScalarStatic.ID_SUFFIX_TEXT = "sftext";
ScalarStatic.getScalarControl = function(pageCode, fieldEntry)
{
	var scalVal = ScalarStatic.getScalarDefinition(fieldEntry);
	var idForScalar = DialogStatic.getIdForField(fieldEntry);
	var idForIcon = idForScalar + ScalarStatic.ID_SUFFIX_ICON;
	var idForText = idForScalar + ScalarStatic.ID_SUFFIX_TEXT;
	var ctrl = "<table width='100%' style='margin-top: 7px; margin-bottom: 5px;'><tr><td width='70px;' style='text-align: right; padding-right: 10px;'>" + scalVal.minText + "</td>";
	ctrl += "<td><div id=\'" + idForScalar + "'></div></td>";
	ctrl += "<td width='75px;' style='padding-left: 10px; padding-top: 3px;'>" + scalVal.maxText + "</td></tr>";
	ctrl += "<tr><td colspan=\'3\' style='padding-top: 3px;'>" + GridStatic.colorCodedCellDialog(idForIcon, idForText, scalVal.type, scalVal.notSetVal) + "</td></tr>";
	ctrl += "</table>";
	return ctrl;
};
ScalarStatic.setScalarControlAsJQueryUIControl = function(fieldEntry)
{
	var scalVal = ScalarStatic.getScalarDefinition(fieldEntry);
	var idForScalar = DialogStatic.getIdForField(fieldEntry);
	var selIdForScalar = '#' + idForScalar;
	var scalarType = ScalarStatic.getScalarTypeFromField(fieldEntry.field);
	
	var scalarLowerBound = ScalarStatic.getSliderControlBound(scalarType, false);
	var scalarUpperBound = ScalarStatic.getSliderControlBound(scalarType, true);
	
	$(selIdForScalar).slider()
					 .slider( "option", "min", scalarLowerBound )
					 .slider( "option", "max", scalarUpperBound )
					 .slider( "option", "step", scalVal.step )  //sometimes 1, sometimes 0.1
					 .slider({ change: function( event, ui ) 
					 {
					 	ScalarStatic.setScalarIndicatorView(fieldEntry, ui.value);
					 }
					 });
};
ScalarStatic.setScalarIndicatorView = function(fieldEntry, actualScalValue)
{
	console.log("Field: " + fieldEntry.field + " changed to " + actualScalValue);
	var type = ScalarStatic.getScalarTypeFromField(fieldEntry.field);
	var selIdForScalar = "#" + DialogStatic.getIdForField(fieldEntry);
	var scalarDef = ScalarStatic.getScalarDefinition(fieldEntry);
	var indicatorValue;
	switch(type)
	{
	case "Position":
		indicatorValue = ScalarStatic.setRangeFlagFromValue(actualScalValue, "Position");
		break;
	case "Power":
		indicatorValue = ScalarStatic.setRangeFlagFromValue(actualScalValue, "Power");
		break;
	case "Probability":
		indicatorValue = GridStatic.evaluateProbabilityValue(actualScalValue);
		break;
	default:
		{
			if (scalarDef.isReverse)
			{
				indicatorValue = scalarDef.getReverseValue(actualScalValue);
			}
			else
			{
				indicatorValue = actualScalValue;
			}
		}
	}
	if (indicatorValue)
	{
		var selIcon = selIdForScalar + ScalarStatic.ID_SUFFIX_ICON;
		var selText = selIdForScalar + ScalarStatic.ID_SUFFIX_TEXT;
		
		var colorCell = GridStatic.colorCell(scalarDef.type, indicatorValue);
		
		$(selIcon).css("background-color", colorCell.color);
		$(selText).html(colorCell.text);
	}
};

ScalarStatic.getScalarDefinition = function(fieldEntry)
{
	if (fieldEntry.field == "PosValue" ||
		fieldEntry.field == "Fut_PosValue")
	{
		return ScalarStatic.Position;
	}
	if (fieldEntry.field == "PowValue" ||
		fieldEntry.field == "Fut_PowValue")
	{
		return ScalarStatic.Power;
	}
	if (fieldEntry.field == "Rel_priority" || fieldEntry.field == "Priority")
	{
		return ScalarStatic.Priority;
	}
	if (fieldEntry.field == "Conseq_intensity_rating")
	{
		return ScalarStatic.Importance;
	}
	if (fieldEntry.field == "Pct_Success" ||
		fieldEntry.field == "Pct_Success_1" ||
		fieldEntry.field == "Pct_Success_2" ||
		fieldEntry.field == "Pct_Success_3")
	{
		return ScalarStatic.Probability;
	}
};

ScalarStatic.setScalarJoinedValues = function(row, field, value)
{
	if (field == "PosValue")
	{
		ScalarStatic.setPositionRelatedValues(row, value, true);
	}
	if (field == "Fut_PosValue")
	{
		ScalarStatic.setPositionRelatedValues(row, value, false);
	}
	if (field == "PowValue")
	{
		ScalarStatic.setPowerRelatedValues(row, value, true);
	}
	if (field == "Fut_PowValue")
	{
		ScalarStatic.setPowerRelatedValues(row, value, false);
	}
	if (field == "Rel_priority")
	{
		var revVal = ScalarStatic.Priority.getReverseValue(value);
		row.Rel_priority = revVal;
	}
	if (field == "Conseq_intensity_rating")
	{
		var revVal = ScalarStatic.Importance.getReverseValue(value);
		row.Conseq_intensity_rating = revVal;
	}
	if (field == "Priority")
	{
		var revVal = ScalarStatic.Priority.getReverseValue(value);
		row.Priority = revVal;
	}
	if (field == "Pct_Success")
	{
		row.Pct_Success = value;
	}
	if (field == "Pct_Success_1")
	{
		row.Pct_Success_1 = value;
	}
	if (field == "Pct_Success_2")
	{
		row.Pct_Success_2 = value;
	}
	if (field == "Pct_Success_3")
	{
		row.Pct_Success_3 = value;
	}
};

var DialogStatic = {};
/* While static, this can host a global setting used only by DialogStatic methods, in effect a static variable */
DialogStatic.targetRow = {};
DialogStatic.isException = ""; //In special cases, the dialog can be used to edit a row outside the current grid, in which case, this will have a winCode


//Every dialog (except Select a Project dialogs) open must call this before it opens
DialogStatic.onDialogOpen = function(dialogCode)
{
	console.log("Dialog opening: " + dialogCode);
	modalDialogShown = true;
};

//Every dialog (except Select a Project dialogs) must call this when it closes
DialogStatic.onDialogClose = function(dialogCode)
{
	console.log("Dialog closing: " + dialogCode);
	modalDialogShown = false;
    $("#dialogs").empty();
};

DialogStatic.showTrumpDialog = function() 
{
	var dialDef = GridStatic.PL.otherButtonsAndDialogs[0];
	var dialogId = dialDef.dialogId;
	var dialogIdAsSel = '#' + dialogId;
	
	var currentTrumpPlayer = ModelStatic.getTrumpPlayerIfAny(); //often returns undefined
	var showChooseOne = (currentTrumpPlayer) ? false : true;
	
	//Same field name and scheme as use in standard dialog of type: 'player', except CSS tweaked to make longer
	var fieldEntryPlayer = dialDef.fields[0];
	var fieldIDPlayer = DialogStatic.getIdForField(fieldEntryPlayer);
	var selCtrlPlayer = '#' + fieldIDPlayer;
	
	var fieldEntryWeight = dialDef.fields[1];
	var fieldIDWeight = DialogStatic.getIdForField(fieldEntryWeight);
	var selCtrlWeight = '#' + fieldIDWeight;
	
	var divDef = '<div id="' + dialogId + '" title="' + dialDef.objectDisplayName + '"><table width="100%"><tbody>';
	divDef += '<tr><td colspan="2" style="text-align: center;" >Optionally, one player can be set as the trump player.</td></tr>';
	divDef += '<tr><td></td><td></td></tr>';
	divDef += '<tr><td style="text-align: right; ">' + fieldEntryPlayer.title + ':</td>';
	divDef += '<td>';
	divDef += DialogStatic.getPlayerSelectControl(fieldEntryPlayer, showChooseOne, MODEL[TABLE_PLAYER]);
	divDef += '</td></tr>';
	divDef += '<tr><td></td><td></td></tr>';
	divDef += '<tr><td style="text-align: right; width="30%">' + fieldEntryWeight.title + ':</td><td><input id="' + fieldIDWeight + '" size="3"/></td></tr>';
	divDef += '<tr><td colspan="2" height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';
	divDef += '</tbody></table></div>';
	$("#dialogs").after(divDef);
	
	$(selCtrlPlayer).css("width", "360px");
	
	if (currentTrumpPlayer)
	{
		$(selCtrlPlayer).val(currentTrumpPlayer[fieldEntryPlayer.field]); //selects the option with the Player_ID as its value
		$(selCtrlWeight).val(currentTrumpPlayer[fieldEntryWeight.field]);
	}
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 500,
		height: "auto",
		buttons: [
			{
				id: "otherBtnUnselect",
				class : 'dialogLeftButton',
				text: "Unselect",
				click: function()
				{
					$(selCtrlPlayer).val("");
					$(selCtrlWeight).val("");
				}
			},
			{
				id: "otherBtnOK",
				text: "OK",
				click: function()
				{
					if (DialogStatic.handleTrumpDialogOK(dialDef))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
					}
				}
			},
			{
				id: "otherBtnCancel",
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
        	$("#otherBtnCancel").focus(); //make Cancel the default
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
	
	//did not work $("#otherBtnUnselect").css("float", "left");
};
DialogStatic.showCoalitionDialog = function(btnName)
{
	if (btnName == "bDelCoal" && MODEL[TABLE_COALITION].length == 0)
	{
		ErrorStatic.showSimpleErrorBox("error24");
		return;
	}
	var dialDef;
	for (var I = 0; I < GridStatic.CL.otherButtonsAndDialogs.length; I++)
	{
		if (GridStatic.CL.otherButtonsAndDialogs[I].btnName == btnName)
		{
			dialDef = GridStatic.CL.otherButtonsAndDialogs[I];
			break;
		}
	}
	var dialogId = dialDef.dialogId;
	var dialogIdAsSel = '#' + dialogId;
	
	var divDef = '<div id="' + dialogId + '" title="' + dialDef.objectDisplayName + '"><table width="100%"><tbody>';
	var dialDef;
	switch(btnName)
	{
	case "bAddCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[0];
		divDef += DialogStatic.getHTMLforCoalitionAddDialog(dialDef);
		break;	
	case "bDelCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[1];
		divDef += DialogStatic.getHTMLforCoalitionRemoveDialog(dialDef);
		break;	
	case "bOptCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[2];
		divDef += DialogStatic.getHTMLforCoalitionOptionsDialog(dialDef);
		break;	
	}
	
	divDef += '<tr><td colspan="2" height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';
	divDef += '</tbody></table></div>';
	$("#dialogs").after(divDef);
	
	//TODO: Fill in current data
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 500,
		height: "auto",
		buttons: [
			{
				id: "clBtnOK",
				text: "OK",
				click: function()
				{
					if (DialogStatic.handleCoalitionDialogOK(btnName))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
					}
				}
			},
			{
				id: "clBtnCancel",
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
        	$("#clBtnCancel").focus(); //make Cancel the default
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
};
DialogStatic.getHTMLforCoalitionAddDialog = function(dialDef)
{
	var playerSubset = ModelStatic.getPlayersNotYetOnCoalitionMap();
	var htm = '<tr><td colspan="2"><input type="radio" name="' +
	DialogStatic.getIdForField(dialDef.fields[0]) + 
	'" value="player"> Select a player to add to the coalition map:</input></td></tr>' +
	'<tr><td width="14%"></td><td>(Players not yet on the coalition map)</td></tr>' + 
	'<tr><td width="14%"></td><td>' + DialogStatic.getPlayerSelectControl(dialDef.fields[1], true, playerSubset) + '</td></tr>' +
	'<tr><td colspan="2"><input type="radio" name="' + 
	DialogStatic.getIdForField(dialDef.fields[0]) + 
	'" value="caption"> Add a caption:</input></td></tr>' +
	'<tr><td width="14%"></td><td><input id="' +
	DialogStatic.getIdForField(dialDef.fields[2]) + '" type="text" style="width: 360px; text-align:left;"/></td></tr>' + 
	'<tr><td colspan="2"><input type="radio" name="' +
	DialogStatic.getIdForField(dialDef.fields[0]) + 
	'" value="divider"> Create a coalition divider at angle: </input>&nbsp;<input id="' +
	DialogStatic.getIdForField(dialDef.fields[3]) +
	'" type="text" style="width: 40px; text-align:left;"/></td></tr>' + 
	'<tr><td width="14%"></td><td>(Angles range from 0 to 360 clockwise from top.)</td></tr>';
	return htm;
};
DialogStatic.getHTMLforCoalitionRemoveDialog = function(dialDef)
{
	var htm = '<tr><td colspan="2">Select the item to be removed and click "OK".  (Removing a player here will not delete the player from your project, it will only remove it from the Coalition Map.)</td></tr>' + 
	'<tr><td colspan="2">' + DialogStatic.getCoalitionMapSelectControl(dialDef.fields[0]) + '</td></tr>';
	return htm;
};
DialogStatic.getHTMLforCoalitionOptionsDialog = function(dialDef)
{
	var circleRadii = ModelStatic.getCoalitionCircleRadii();
	var htm = '<tr><td colspan="2">Show Circles:  To display circles on the Coalition Map, enter radii values for one or two circles.  Radii values are a percentage of the image height.  Typical values are 28 and 56.</td></tr>' + 
	'<tr><td width="30%" style="text-align: right;">Inner Circle:</td><td width="70%" style="text-align: left;"><input id="' + 
	DialogStatic.getIdForField(dialDef.fields[0]) + 
	'" type="text" style="width: 40px; text-align:left;" value="' +  
	circleRadii[0] +
	'"></td></tr>' +
	'<tr><td width="30%" style="text-align: right;">Outer Circle:</td><td width="70%" style="text-align: left;"><input id="' + 
	DialogStatic.getIdForField(dialDef.fields[1]) + 
	'" type="text" style="width: 40px; text-align:left;" value="' + 
	circleRadii[1] +
	'"></td></tr>';
	return htm;
};

DialogStatic.showDeleteConfirmationDialog = function(pageCode)
{
	DialogStatic.targetRow = currentGrid.contextMenuSelectedDataRow;
	var dialogId = DialogStatic.getIdForDialog(pageCode);
	var deleteDialog = GridStatic[pageCode].deleteDialog;
	var dialDef = GridStatic[pageCode].dialog;
	var dialogIdAsSel = '#' + dialogId;
	
	var divDef = '<div id="' + dialogId + '" title="Delete ' + dialDef.objectDisplayName + '"><table width="100%"><tbody>';
	divDef += '<tr><td colspan="2" class="dialUrgent">Are you sure you want to delete this item?</td></tr>';
	divDef += '<tr><td style="text-align: right; width: 25%; ">' + deleteDialog.title + ': </td><td style="width: 75%; height: 30px;">' + deleteDialog.getDeleteDescriptionField( DialogStatic.targetRow[deleteDialog.deleteDescriptionIDField] ) + '</td></tr>';
	divDef += '</tbody></table></div>';
	$("#dialogs").after(divDef);
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 700,
		height: "auto",
		buttons: [
			{
				id: "deleteBtnOK",
				text: "Delete",
				click: function()
				{
					if (DialogStatic.handleDeleteOK(dialogIdAsSel))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
					}
				}
			},
			{
				id: "deleteBtnCancel",
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
        	$("#deleteBtnCancel").focus(); //make Cancel the default
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
};
DialogStatic.getTextBoxStyling = function(type)
{
	switch(type)
	{
	case 'longtext':
		return 'style="width: 493px; height: 100px; text-align:left;"';
	case 'shorttext':
		return 'style="width: 100px; text-align:left;"';
	case 'text':
		return 'style="width: 493px; text-align:left;"';
	}

};
DialogStatic.showStandardDialog = function(pageCodeIn, isAddIn)
{
	var isAdd = isAddIn;
	var pageCode = pageCodeIn;
	var dialDef = GridStatic[pageCode].dialog;
	
	//Set the target row for this dialog; in most cases, it is the current row in the
	//current grid
	if (isAdd && dialDef.isAddException)
	{
		if (pageCode == "SI") //this is more of an Edit than an Add
		{
			//Even though this is the SI grid, show the ST dialog, and update this 
			//detail display afterwards
			//See also: DialogStatic.handleDialogOK, PreSelectStrategy, and PreSelectDialogStatic
			//Plus core functions changePage and removePage
			pageCode = "ST";
			isAdd = false;
			dialDef = GridStatic[pageCode].dialog;
			DialogStatic.isException = "SI";
			DialogStatic.targetRow = ModelStatic.getRowBasedOnKey(TABLE_STRATEGY, selectedItems[0]);
		}
		else if (pageCode == "SH") //show the ST dialog, with the 
		{
			pageCode = "ST";
			dialDef = GridStatic[pageCode].dialog;
			DialogStatic.isException = "SH";
		}
		else
		{
			return;
		}
	}
	else
	{
		if (pageCode == "PJ")
		{
			DialogStatic.isException = "PJ";
			DialogStatic.targetRow = MODEL[TABLE_PROJECT][0];
		}
		else
		{
			DialogStatic.isException = "";
			DialogStatic.targetRow = currentGrid.contextMenuSelectedDataRow;
		}
	}

	var titleAddOrEdit = (isAdd) ? 'Add New' : 'Edit';
	var fullTitle = titleAddOrEdit + ' ' + dialDef.objectDisplayName;
	if (DialogStatic.isException == "SH")
	{
		fullTitle = GridStatic.SH.dialog.objectDisplayName;
	}
	else
	{
		if (DialogStatic.isException == "PJ")
		{
			fullTitle = GridStatic.PJ.dialog.objectDisplayName;
		}
	}
	var dialogId = DialogStatic.getIdForDialog(pageCode);
	var dialogIdAsSel = '#' + dialogId;
	var divDef = '<div id="' + dialogId + '" title="' + fullTitle + '"><table width="100%"><tbody>';
	var scalarIncluded = false;
	var affectedPlayerIncluded = false;
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		var fieldEntry = dialDef.fields[I];
		divDef += '<tr><td style="text-align: right; width: 25%; ">' + fieldEntry.title + ': </td><td style="width: 75%; height: 30px;">';
		switch(fieldEntry.type)
		{
		case 'longtext':
			divDef += '<textarea id="' + DialogStatic.getIdForField(fieldEntry) + '" ' + DialogStatic.getTextBoxStyling(fieldEntry.type) + '></textarea>';
			break;
		case 'shorttext':
			divDef += '<input type="text" id="' + DialogStatic.getIdForField(fieldEntry) + '" ' + DialogStatic.getTextBoxStyling(fieldEntry.type) + '/>';
			break;
		case 'text':
			divDef += '<input type="text" id="' + DialogStatic.getIdForField(fieldEntry) + '" ' + DialogStatic.getTextBoxStyling(fieldEntry.type) + '/>';
			break;
		case 'select':
			{
				if (isAdd)
					divDef += DialogStatic.getSelectControl(pageCode, fieldEntry, true);
				else
				{  //if the value is blank, then a "Choose One" entry should be displayed, as if adding
					if (DialogStatic.targetRow[fieldEntry.field].length < 1)
						divDef += DialogStatic.getSelectControl(pageCode, fieldEntry, true);
					else
						divDef += DialogStatic.getSelectControl(pageCode, fieldEntry, false);
				}
			}
			break;
		case 'affectedplayer': //a special multi-select for player (stored in Affected_player)
			{
				divDef += DialogStatic.getAffectedPlayerMultiSelectControl(pageCode, fieldEntry, isAdd);
				affectedPlayerIncluded = true;
			}
			break;
		case 'player': //a specialized form of select
			{
				if (isAdd)
					divDef += DialogStatic.getPlayerSelectControl(fieldEntry, true, MODEL[TABLE_PLAYER]);
				else
				{  //if the value is blank, then a "Choose One" entry should be displayed, as if adding
					if (DialogStatic.targetRow[fieldEntry.field] < 1)
						divDef += DialogStatic.getPlayerSelectControl(fieldEntry, true, MODEL[TABLE_PLAYER]);
					else
						divDef += DialogStatic.getPlayerSelectControl(fieldEntry, false, MODEL[TABLE_PLAYER]);
				}
			}
			break;

		case 'scalar':
			{
				divDef += ScalarStatic.getScalarControl(pageCode, fieldEntry);
				scalarIncluded = true;
			}
			break;
		case 'colorcodedcell':
			{ //Supported only on edit; non-modifiable
		    	var currVal = ModelStatic.getFieldFromRowBasedOnKey("Player", fieldEntry.field, DialogStatic.targetRow[fieldEntry.foreignkey]);
		    	var colorCell = GridStatic.colorCell(fieldEntry.celltype, currVal);
				var currCellCtrl = '<table class="centerdiv"><tr><td width="50%"><div class="colorcelltextdial">' + colorCell.text + '</div></td><td width="50%"><div class="colorcellicondial" style="background-color:' + colorCell.color + ';"></div></td></tr></table>';
		    	divDef += currCellCtrl;
			}
			break;
		case 'statictext':
			{
				if (isAdd)
				{
					//TODO - this control does not support the Add case.
				}
				else
				{
					if (!fieldEntry.source)
					{
						divDef += DialogStatic.targetRow[fieldEntry.field];
					}
					else
					{
						divDef += fieldEntry.source(DialogStatic.targetRow[fieldEntry.field]);
					}
				}
			}
		}
		divDef += '</td></tr>';
	}
	divDef += '<tr><td colspan="2" height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';
	divDef += '</tbody></table></div>';

	$("#dialogs").append(divDef);

	if (scalarIncluded || affectedPlayerIncluded)
	{
		for (var I = 0; I < dialDef.fields.length; I++)
		{
			if (dialDef.fields[I].type == 'scalar')
			{
				ScalarStatic.setScalarControlAsJQueryUIControl(dialDef.fields[I]);
			}
			else
			{
				if (dialDef.fields[I].type == 'affectedplayer')
				{
					var selIdForAffPlay = '#' + DialogStatic.getIdForField(dialDef.fields[I]);
					$(selIdForAffPlay).multiselect({
						height: 300,
						minWidth: 500,
						noneSelectedText: 'Select Player(s)',
						selectedText: '# Players selected',
						selectedList: 4
					}); //The special Multiselect widget
				}
			}
		}
	}

	if (!isAdd)
	{  //For edit, prepopulate with existing values
		for (var I = 0; I < dialDef.fields.length; I++)
		{
			var fieldEntry = dialDef.fields[I];
			var idForFld = DialogStatic.getIdForField(fieldEntry);
			var selCtrl = '#' + idForFld;
			switch(fieldEntry.type)
			{
			case 'scalar':
				{
					var actualScalValue = DialogStatic.targetRow[fieldEntry.field];
					var currentScalValue = actualScalValue;
					if (ScalarStatic.getScalarDefinition(fieldEntry).isReverse)
					{
						currentScalValue = ScalarStatic.getScalarDefinition(fieldEntry).getReverseValue(actualScalValue);
					}
					$(selCtrl).slider("option", "value", currentScalValue);
				}
				break;
			case 'statictext':
				break;
			case 'affectedplayer':
				//No op: affected players are pre-selected in Multiselect control creation function
				break;
			default:
				{
					$(selCtrl).val(DialogStatic.targetRow[fieldEntry.field]);
				}
			}
		}
	}
	else
	{
		if (DialogStatic.isException == "SH") //an add, but with a value prefilled 
		{
			var fieldEntry;
			for (var I = 0; I < dialDef.fields.length; I++)
			{
				if (dialDef.fields[I].field == "Strategy_name")
				{
					fieldEntry = dialDef.fields[I];
				}
			}
			var idForFld = DialogStatic.getIdForField(fieldEntry);
			var selCtrl = '#' + idForFld;
			var suggStratText = selectedItems[0].text;
			$(selCtrl).val(suggStratText);
		}
	}

	var buttonsDefinition = [
		{
			text: "OK",
			click: function()
			{
				if (DialogStatic.handleDialogOK(dialogIdAsSel, isAdd))
				{
					DialogStatic.onDialogClose(dialogId);
					$(this).dialog('destroy').remove();
				}
			}
		},
		{
			text: "Cancel",
			click: function()
			{
				DialogStatic.onDialogClose(dialogId);
				$(this).dialog('destroy').remove();
			}
		}
	];
	if (isAdd && (GridStatic[pageCode].addAnother))
	{
		buttonsDefinition.push(
			{
				id: "addAnotherBtn",
				class : 'dialogLeftButton',
				text: GridStatic[pageCode].addAnother,
				click: function()
				{
					if (DialogStatic.handleDialogOK(dialogIdAsSel, isAdd))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
						DialogStatic.showStandardDialog(pageCode, true);
					}
				}
			}
		);
	}
	if (!isAdd && (GridStatic[pageCode].nextPreviousButtons)) 
	{
		buttonsDefinition.push(
			{
				id: "prevBtn",
				class : 'dialogLeftButton',
				text: "Previous",
				click: function()
				{
					if (DialogStatic.handleDialogOK(dialogIdAsSel, isAdd))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
						DialogStatic.nextOrPrevious(false, pageCode);
						DialogStatic.showStandardDialog(pageCode, false);
					}
				}
			}
		);
		buttonsDefinition.push(
			{
				id: "nextBtn",
				class : 'dialogLeftButtonNext',
				text: "Next",
				click: function()
				{
					if (DialogStatic.handleDialogOK(dialogIdAsSel, isAdd))
					{
						DialogStatic.onDialogClose(dialogId);
						$(this).dialog('destroy').remove();
						DialogStatic.nextOrPrevious(true, pageCode);
						DialogStatic.showStandardDialog(pageCode, false);
					}
				}
			}
		);
	}
	
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 700,
		height: "auto",
		buttons: buttonsDefinition,
		open: function() 
		{
			DialogStatic.onDialogOpen(dialogId);
    	},
    	close: function()
    	{
    		$(dialogIdAsSel).dialog('destroy').remove();
    		DialogStatic.onDialogClose(dialogId);
    	},
	});
};

//Receives a #dialCdCODE, returns true (if validation passes), or false, if not (in current logic, always true)
DialogStatic.handleDeleteOK = function(dialogIdAsSel)
{
	var pageCode = DialogStatic.getPageCodeFromDialogIDSel(dialogIdAsSel);
	var pageObject = GridStatic[pageCode];
	
	//Currently, no item is selected after delete
	//If we want one to be, set it here 
	var idOfAutoSelectedItem;
	
	ModelStatic.deleteItemWithKeyFromTable(pageObject.table, currentGrid.contextMenuSelectedDataRow[pageObject.idColumn], true);

	GridStatic.buildGrid("myGrid");
	selectedRows = [];
	if (idOfAutoSelectedItem)
	{
		selectedRows[0] = currentGrid.findGridRowIndexForCellWithValue(idOfAutoSelectedItem, currentGrid.keyColumnIndex);
	}
	currentGrid.grid.setSelectedRows(selectedRows);
	
	//Exit before here to avoid causing the model to be saved
	ProjectManager.saveProject();
	
	return true;
};
DialogStatic.nextOrPrevious = function(isNext, pageCode)
{
	//var keyfieldName = GridStatic[pageCode].idColumn;
	var currentIndex = GridStatic.getIndexOfSelectedRow();
	if (currentIndex > -1)
	{
		GridStatic.selectNextOrPrevRow(isNext, currentIndex);
	}
};

DialogStatic.handleCoalitionDialogOK = function(btnName)
{
	var dialDef;
	switch(btnName)
	{
	case "bAddCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[0];
		DialogStatic.clearError(dialDef);
		DialogStatic.actionForCoalitionAddDialog(dialDef);
		break;	
	case "bDelCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[1];
		DialogStatic.clearError(dialDef);
		dialDef.errorCode = "";
		DialogStatic.actionForCoalitionRemoveDialog(dialDef);
		break;	
	case "bOptCoal":
		dialDef = GridStatic.CL.otherButtonsAndDialogs[2];
		DialogStatic.clearError(dialDef);
		dialDef.errorCode = "";
		DialogStatic.actionForCoalitionOptionsDialog(dialDef);
		break;	
	}
	if (dialDef.errorCode.length > 0)
	{
		var ctrlSele = '#' + dialDef.fields[dialDef.errorFieldIndex].field;
		$(ctrlSele).addClass('ui-state-error');
		var errText = ErrorStatic.getErrorMessage(dialDef.errorCode); 
		$('#' + DialogStatic.errorFieldName).html(errText);
		return false;
	}
	
	//Exit before here to avoid causing the model to be saved
	ProjectManager.saveProject();
	
	changePage("CL");
	return true;
};
DialogStatic.actionForCoalitionAddDialog = function(dialDef)
{
	dialDef.errorCode = "";
	dialDef.errorFieldIndex = -1;
	
	var optField = dialDef.fields[0];
	var idOptField = DialogStatic.getIdForField(optField);
	//a radio button group is a group of separate objects, so querying it via jQuery is a bit more complicated than other input controls
	var optSel = "input:radio[name='" + idOptField + "']:checked";
	var opt = $(optSel).val();
	
	switch(opt)	
	{
	case "player":
		{
			var selPlay = '#' + DialogStatic.getIdForField(dialDef.fields[1]);
			var playr = $(selPlay).val();
			if (!playr)
			{
				dialDef.errorCode = "error23";
				dialDef.errorFieldIndex = 1;
				return;
			}
			ModelStatic.addCoalitionEntry(1, playr);
		}
		break;
	case "caption":
		{
			var selCapt = '#' + DialogStatic.getIdForField(dialDef.fields[2]);
			var capt = $(selCapt).val();
			if (!capt || capt.length < 1)
			{
				dialDef.errorCode = "error21";
				dialDef.errorFieldIndex = 2;
				return;
			}
			ModelStatic.addCoalitionEntry(2, capt);
		}
		break;
	case "divider":
		{
			var selDvd = '#' + DialogStatic.getIdForField(dialDef.fields[3]);
			var dvdAngle = $(selDvd).val();
			if (!dvdAngle || dvdAngle.length < 1)
			{
				dialDef.errorCode = "error22";
				dialDef.errorFieldIndex = 3;
				return;
			}
			var angl = parseInt(dvdAngle);
			if (isNaN(angl))
			{
				dialDef.errorCode = "error22";
				dialDef.errorFieldIndex = 3;
				return;
			}
			if (angl < 0 || angl > 360)
			{
				dialDef.errorCode = "error22";
				dialDef.errorFieldIndex = 3;
				return;
			}
			ModelStatic.addCoalitionEntry(3, angl);
		}
		break;
	default:
		{
			dialDef.errorCode = "error20";
			dialDef.errorFieldIndex = 0;
			return;
		}	
	}
};
DialogStatic.actionForCoalitionRemoveDialog = function(dialDef)
{
	dialDef.errorCode = "";
	dialDef.errorFieldIndex = -1;
	var remItemField = dialDef.fields[0];
	var selRemItemField = '#' + DialogStatic.getIdForField(remItemField);
	var remItem = $(selRemItemField).val();
	if (!remItem || remItem.length < 1)
	{
		return;
	}
	ModelStatic.deleteItemWithKeyFromTable(TABLE_COALITION, remItem, false);
};
DialogStatic.actionForCoalitionOptionsDialog = function(dialDef)
{
	dialDef.errorCode = "";
	dialDef.errorFieldIndex = -1;
	
	var innField = dialDef.fields[0];
	var selInnField = '#' + DialogStatic.getIdForField(innField);
	var inner = $(selInnField).val();
	if (!DialogStatic.isValidCoalitionCircle(inner))
	{
		dialDef.errorCode = "error25";
		dialDef.errorFieldIndex = 0;
		return;
	}
	
	var outField = dialDef.fields[1];
	var selOutField = '#' + DialogStatic.getIdForField(outField);
	var outer = $(selOutField).val();
	if (!DialogStatic.isValidCoalitionCircle(outer))
	{
		dialDef.errorCode = "error25";
		dialDef.errorFieldIndex = 0;
		return;
	}
	
	var circleRadii = ['', ''];
	var ix = 0;
	if (inner.trim().length > 0)
	{
		circleRadii[ix] = inner.trim();
		ix++;
	}
	if (outer.trim().length > 0)
	{
		circleRadii[ix] = outer.trim();
	}
	ModelStatic.setCoalitionCircleRadii(circleRadii);
};
DialogStatic.isValidCoalitionCircle = function(val)
{
	if (!val)
		return true;
		
	var value = val.trim();
	var numVal = parseInt(value);
	if (isNaN(numVal))
		return false;
	if (numVal < 1 || numVal > 80)
		return false;
	return true;
};

//Receives a #dialCdCODE, returns true (if validation passes), or false, if not (in current logic, always true)
DialogStatic.handleTrumpDialogOK = function(dialDef) 
{
	DialogStatic.clearError(dialDef);
	
	var fieldEntryPlayer = dialDef.fields[0];
	var fieldIDPlayer = DialogStatic.getIdForField(fieldEntryPlayer);
	var selCtrlPlayer = '#' + fieldIDPlayer;
	
	var fieldEntryWeight = dialDef.fields[1];
	var fieldIDWeight = DialogStatic.getIdForField(fieldEntryWeight);
	var selCtrlWeight = '#' + fieldIDWeight;
	
	var playerID = $(selCtrlPlayer).val();
	if (!playerID)
	{
		playerID = "";
	}
	var weightStr = $(selCtrlWeight).val().trim();

	//DO VALIDATION, if in error, return false
	var validFlag = true;
	var fieldInErr; //dialDef field object
	var errorCode; //a number
	if ((playerID.length < 1 && weightStr.length > 0) ||
		(playerID.length > 0 && weightStr.length < 1))
	{
		validFlag = false;
		fieldInErr = fieldEntryWeight;
		errorCode = "error7";
	}
	if (validFlag && weightStr.length > 0)
	{
		var weightNum = parseFloat(weightStr);
		if (isNaN(weightNum))
		{
			validFlag = false;
			fieldInErr = fieldEntryWeight;
			errorCode = "error8";
		}
		else
		{
			if (!(weightNum >= 2.0 && weightNum <= 5.0))
			{
				validFlag = false;
				fieldInErr = fieldEntryWeight;
				errorCode = "error8";
			}
		}
	}
	if (!validFlag)
	{
		var ctrlSele = '#' + DialogStatic.getIdForField(fieldInErr);
		$(ctrlSele).addClass('ui-state-error');
		var errText = ErrorStatic.getErrorMessage(errorCode); 
		$('#' + DialogStatic.errorFieldName).html(errText);
		return false;
	}
	
	//If there is already a trump player, and a new one is selected, clear it
	if (playerID.length > 0)
	{
		ModelStatic.clearTrump();
		ModelStatic.setTrump(playerID, weightNum);
	}
	else
	{
		ModelStatic.clearTrump();
	}
	
	//Exit before here to avoid causing the model to be saved
	ProjectManager.saveProject();
	
	return true;
};

//Receives a #dialCdCODE, returns true (if validation passes), or false, if not
DialogStatic.handleDialogOK = function(dialogIdAsSel, isAdd)
{
	var pageCode = DialogStatic.getPageCodeFromDialogIDSel(dialogIdAsSel);
	var dialDef = GridStatic[pageCode].dialog;

	DialogStatic.clearError(dialDef);

	//DO VALIDATION, if in error, return false
	var validResp = DialogStatic.validateFields(dialDef);
	if (!validResp.response)
	{
		var fieldInErr = DialogStatic.getFieldByName(dialDef, validResp.fieldName);
		var ctrlSele = '#' + DialogStatic.getIdForField(fieldInErr);
		$(ctrlSele).addClass('ui-state-error');
		var errText = ErrorStatic.getErrorMessage(validResp.errorCode); 
		$('#' + DialogStatic.errorFieldName).html(errText);
		return false;
	}

	var idOfNewItem;
	if (isAdd)
	{
		if (DialogStatic.isException.length == 0)
		{
			var aNewItem = ModelStatic.getNewObject(GridStatic[pageCode].table);
			currentGrid.gridTable.push(aNewItem);
			DialogStatic.targetRow = aNewItem;
			idOfNewItem = aNewItem[ModelStatic.getKeyFieldForTable(GridStatic[pageCode].table)];
		}
		else
		{
			if (DialogStatic.isException == "SH") //add a strategy from a suggested strategy
			{
				var aNewItem = ModelStatic.getNewObject(GridStatic[pageCode].table);
				MODEL[TABLE_STRATEGY].push(aNewItem); //no current grid, so add directly to the model
				DialogStatic.targetRow = aNewItem;
				idOfNewItem = aNewItem[ModelStatic.getKeyFieldForTable(GridStatic[pageCode].table)];
			}
		}
	}
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		var fieldEntry = dialDef.fields[I];
		var currVal = DialogStatic.getCurrentDialogValueForField(fieldEntry);
		switch(fieldEntry.type)
		{
		case 'longtext':
		case 'shorttext':
		case 'text':
			DialogStatic.targetRow[fieldEntry.field] = currVal;
			break;
		case 'select':
		case 'player':
			DialogStatic.targetRow[fieldEntry.field] = currVal;
			break;
		case 'scalar':
			ScalarStatic.setScalarJoinedValues(DialogStatic.targetRow, fieldEntry.field, currVal);
			break;
		case 'statictext':
			break;
		case 'affectedplayer': //a special multi-select for player (stored in Affected_player)
			{
				var idForField = DialogStatic.getIdForField(fieldEntry);
				var selPlayerIds = DialogStatic.getMultiSelectedIDs(idForField);
				//console.log(selPlayerIds);
				var stratID;
				if (isAdd)
					stratID = idOfNewItem;
				else
					stratID = DialogStatic.targetRow[ModelStatic.getKeyFieldForTable(GridStatic[pageCode].table)];
				ModelStatic.synchronizeAffectedPlayerIDsForStrategy(stratID, selPlayerIds);
			}
			break;

		}
	}

	if (isAdd)
	{
		if (DialogStatic.isException.length == 0)
		{
			GridStatic.buildGrid("myGrid");
			selectedRows = [];
			selectedRows[0] = currentGrid.findGridRowIndexForCellWithValue(idOfNewItem, currentGrid.keyColumnIndex);
			currentGrid.grid.setSelectedRows(selectedRows);
		}
	}
	else
	{
		if (DialogStatic.isException.length == 0)
		{
			currentGrid.grid.updateRow(currentGrid.grid.getSelectedRows()[0]);
			currentGrid.indices = GridStatic.buildIndices(currentGrid.columns); //recreates the indices used in sorting;
		}
		else
		{
			if (DialogStatic.isException == "SI")
			{
				removePage("SI");
				PreSelectStrategy.action(); //redisplays SI
				return true;
			}
			if (DialogStatic.isException == "PJ")
			{
				ProjectManager.addNewProject(MODEL[TABLE_PROJECT][0].User_label);
				FileSelectorStatic.showMainMenuForProject();
				return true;
			}
		}
	}
	//Exit before here to avoid causing the model to be saved
	ProjectManager.saveProject();
	
	return true;
};

DialogStatic.getSelectControl = function(pageCode, fieldEntry, isAdd)
{
	var items = DialogStatic.getSelectValuesForField(fieldEntry.field);
	if (items)
	{
		var selbox = '<select id="' + DialogStatic.getIdForField(fieldEntry) + '">';
		if (isAdd)
		{
			selbox += "<option value=''>(Choose one)</option>";
		}
		for (var I = 0; I < items.length; I++)
		{
			selbox += "<option value='" + items[I] + "'>" + items[I] + "</option>";
		}
		selbox += '</select>';
		return selbox;
	}
	else
	{
		return "(Select box undefined.)";
	}
};

DialogStatic.getStrategyMultiSelectControl = function(idForFld)
{
	var selbox = '<select id="' + idForFld + '" multiple="multiple">';
	if (MODEL[TABLE_STRATEGY].length > 0)
	{
		selbox += '<optgroup label="Strategies">';
		for (var I = 0; I < MODEL[TABLE_STRATEGY].length; I++)
		{
			var strategyID = MODEL[TABLE_STRATEGY][I]["Strategy_ID"];
			var strategyName = DialogStatic.getLongFieldTruncation(MODEL[TABLE_STRATEGY][I]["Strategy_name"], 85);
			var selectd = ModelStatic.isInSelectedItems(strategyID) ? " selected" : "";
			selbox += '<option value="' + idForFld + strategyID + '"' + selectd + '>' + strategyName + '</option>';
		}
		selbox += '</optgroup>';
	}
	else
	{
		selbox += '<optgroup label="(Define strategies and their impacts before using this feature.)"></optgroup>';
	}
	selbox += '</select>';
	return selbox;
};

DialogStatic.getLongFieldTruncation = function(longFld, limit)
{
	if (longFld.length > limit)
	{
		return longFld.substring(0, limit - 2) + "...";
	}
	else
	{
		return longFld;
	}
};

//Two types PLANNED, but not implemented in each possible mechanism - players from Strat ID, strats from Player ID
DialogStatic.getAffectedPlayerMultiSelectControl = function(pageCode, fieldEntry, isAdd)
{
	if (fieldEntry.linkID == "Strategy_ID")
	{
		var affPlayerPlayers = [];
		if (!isAdd)
		{
			var stratID = DialogStatic.targetRow["Strategy_ID"];
			affPlayerPlayers = ModelStatic.getPlayerIDsForAffectedPlayerForStrategy(stratID);
		}
		var hasPlayers = false;
		var idForFld = DialogStatic.getIdForField(fieldEntry);
		var selbox = '<select id="' + DialogStatic.getIdForField(fieldEntry) + '" multiple="multiple">';

		var sortedForPositionSup = ModelStatic.getSortedPlayersWithPositionCategory(1);
		if (sortedForPositionSup.length > 0)
		{
			selbox += DialogStatic.getPlayersForMultiselectOptGroup("Supporters", sortedForPositionSup, idForFld, affPlayerPlayers);
			hasPlayers = true;
		}

		var sortedForPositionOpp = ModelStatic.getSortedPlayersWithPositionCategory(3);
		if (sortedForPositionOpp.length > 0)
		{
			selbox += DialogStatic.getPlayersForMultiselectOptGroup("Opponents", sortedForPositionOpp, idForFld, affPlayerPlayers);
			hasPlayers = true;
		}

		var sortedForPositionNonMob = ModelStatic.getSortedPlayersWithPositionCategory(2);
		if (sortedForPositionNonMob.length > 0)
		{
			selbox += DialogStatic.getPlayersForMultiselectOptGroup("Non-mobilized", sortedForPositionNonMob, idForFld, affPlayerPlayers);
			hasPlayers = true;
		}

		var sortedForPositionNS = ModelStatic.getSortedPlayersWithPositionCategory(4);
		if (sortedForPositionNS.length > 0)
		{
			selbox += DialogStatic.getPlayersForMultiselectOptGroup("Unassigned", sortedForPositionNS, idForFld, affPlayerPlayers);
			hasPlayers = true;
		}

		if (!hasPlayers)
		{
			selbox += '<optgroup label="(Define Players First.)"></optgroup>';
		}
		selbox += '</select>';
		return selbox;
	}
	else
	{
		//TODO
	}
};

DialogStatic.getPlayersForMultiselectOptGroup = function(labelText, sortedForPosition, idForFld, affPlayerPlayers)
{
	var selbox = '<optgroup label="' + labelText + '">';
	for (var I = 0; I < sortedForPosition.length; I++)
	{
		var playerID = sortedForPosition[I]["Player_ID"];
		var playerName = sortedForPosition[I]["Player_name"];
		var selectd = DialogStatic.isItemInArray(affPlayerPlayers, playerID) ? " selected" : "";
		selbox += '<option value="' + idForFld + playerID + '"' + selectd + '>' + playerName + '</option>';
	}
	selbox += '</optgroup>';
	return selbox;
};

DialogStatic.getMultiSelectedIDs = function(idForField)
{
	var ctrlSele = '#' + idForField;
	var checkedItems = $(ctrlSele).val();
	var selPlayerIds = [];
	if (checkedItems)
	{
		for (var I = 0; I < checkedItems.length; I++)
		{
			var idAsInt = checkedItems[I].substring(idForField.length);
			var idAsInt = parseInt(idAsInt, 10);
			selPlayerIds.push(idAsInt);
		}
	}
	return selPlayerIds;
};

DialogStatic.isItemInArray = function(thisArray, thisItem)
{
	for (var I = 0; I < thisArray.length; I++)
	{
		if (thisArray[I] == thisItem)
			return true;
	}
	return false;
};

DialogStatic.getPlayerSelectControl = function(fieldEntry, isAdd, playerSet)
{
	var sortedIndexArray = GridStatic.getIndexForField(playerSet, "Player_name");

	if (sortedIndexArray)
	{
		var selbox = '<select id="' + DialogStatic.getIdForField(fieldEntry) + '">';
		if (isAdd)
		{
			selbox += "<option value=''>(Choose one)</option>";
		}
		for (var I = 0; I < sortedIndexArray.length; I++)
		{
			selbox += "<option value='" + playerSet[sortedIndexArray[I]]["Player_ID"] + "'>" + playerSet[sortedIndexArray[I]]["Player_name"] + "</option>";
		}
		selbox += '</select>';
		return selbox;
	}
	else
	{
		return "(No players are defined.)";
	}
};

DialogStatic.getCoalitionMapSelectControl = function(fieldEntry)
{
	var sortedIndexArray = GridStatic.getIndexForCoalition();
	
	if (sortedIndexArray && sortedIndexArray.length > 0)
	{
		var selbox = '<select id="' + DialogStatic.getIdForField(fieldEntry) + '"><option value="">(Choose one)</option>';
		for (var I = 0; I < sortedIndexArray.length; I++)
		{
			var item = MODEL[TABLE_COALITION][sortedIndexArray[I]];
			selbox += "<option value='" + item.Coal_ID + "'>" + ModelStatic.getCoalitionItemDescription(item) + "</option>";
		}
		selbox += '</select>';
		return selbox;
	}
	else
	{
		return "(No coalition map items are defined.)";
	}
};

DialogStatic.getSelectValuesForField = function(field)
{
	var thisType = DialogStatic.getListTypeForField(field);
	var items = [];
	for(var I = 0; I < MODEL[TABLE_LIST_OPTIONS].length; I++)
	{
		if (MODEL[TABLE_LIST_OPTIONS][I]["List_type"] == thisType)
		{
			var item = MODEL[TABLE_LIST_OPTIONS][I]["List_value"];
			items.push(item);
		}
	}
	return items;
};

DialogStatic.getItemsForList = function(field)
{
	var thisType = DialogStatic.getListTypeForField(field);
	var items = [];
	for(var I = 0; I < MODEL[TABLE_LIST_OPTIONS].length; I++)
	{
		if (MODEL[TABLE_LIST_OPTIONS][I]["List_type"] == thisType)
		{
			items.push(MODEL[TABLE_LIST_OPTIONS][I]);
		}
	}
	return items;
};

DialogStatic.getListTypeForField = function(field)
{
	switch(field)
	{
	case "Sector": //Players
		return 1;
	case "Type": //Interests
		return 2;
	case "On_agenda": //Goals
		return 3;
	case "Conseq_qual": //Consequences
		return 4;
	case "Level": //Players
		return 5;
	}
};

DialogStatic.errorFieldName = "dialError"; //refd in CSS
DialogStatic.idFieldPrefix = "dialFd";
DialogStatic.getIdForField = function(fieldEntry)
{
	return DialogStatic.idFieldPrefix + fieldEntry.field;
};
DialogStatic.idDialogPrefix = "dialCd";
DialogStatic.getIdForDialog = function(pageCode)
{
	return DialogStatic.idDialogPrefix + pageCode;
};
DialogStatic.getPageCodeFromDialogIDSel = function(dialogID)
{
	return dialogID.substring(DialogStatic.idDialogPrefix.length + 1);
};
DialogStatic.getFieldByName = function(dialDef, fieldName)
{
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		if (dialDef.fields[I].field == fieldName)
		{
			return dialDef.fields[I];
		}
	}
};

DialogStatic.validateFields = function(dialDef)
{
//Required fields
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		var fieldEntry = dialDef.fields[I];
		if (fieldEntry.required)
		{
			var currVal = DialogStatic.getCurrentDialogValueForField(fieldEntry);
			switch(fieldEntry.type)
			{
			case 'longtext':
			case 'shorttext':
			case 'text':
			case 'select':
			case 'player':
			case 'affectedplayer': //THE COUNT IS RETURNED
				{
					if (currVal.length < 1)
					{
						return new ErrorValidationResponse(fieldEntry.field, fieldEntry.required);
					}
				}
				break;
			}
		}
	}
//Other validation - validationFunction property of the field
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		var fieldEntry = dialDef.fields[I];
		if (fieldEntry.validationFunction)
		{
			var currVal = DialogStatic.getCurrentDialogValueForField(fieldEntry);
			var msgNumber = fieldEntry.validationFunction(currVal); //returns "" or "errorN"
			if (msgNumber.length > 0)
			{
				return new ErrorValidationResponse(fieldEntry.field, msgNumber);
			}
		}
	}
	return new OKValidationResponse();
};

DialogStatic.getCurrentDialogValueForField = function(fieldEntry)
{
	var idForField = DialogStatic.getIdForField(fieldEntry);
	var ctrlSele = '#' + idForField;

	switch(fieldEntry.type)
	{
	case 'longtext':
	case 'shorttext':
	case 'text':
	case 'select':
	case 'player':
		return $(ctrlSele).val().trim();
	case 'affectedplayer': 
		return DialogStatic.getMultiSelectedIDs(idForField);
	case 'scalar':
		return $(ctrlSele).slider( "option", "value" );
	case 'statictext':
		break;
	}

};

DialogStatic.clearError = function(dialDef)
{
	for (var I = 0; I < dialDef.fields.length; I++)
	{
		var ctrlSele = '#' + DialogStatic.getIdForField(dialDef.fields[I]);
		if ($(ctrlSele).hasClass('ui-state-error'))
		{
			$(ctrlSele).removeClass('ui-state-error');
		}
	}
	$('#' + DialogStatic.errorFieldName).html("");
};

var ContextMenuStatic = {};
ContextMenuStatic.defineContextMenu = function()
{
	/* Standard Context Menu */
	$( "#contextMenu" ).unbind('click');
  	$( "#contextMenu" ).click(function (e)
  	{
		if (modalDialogShown)
		{
			return; //do not show allow context menu actions when a dialog is shown 
		}
 		if (!$(e.target).is("li"))
		{
		  return;
		}
		if (!currentGrid.grid.getEditorLock().commitCurrentEdit())
		{
		  return;
		}

		currentGrid.contextMenuSelectedOption = $(e.target).attr("data");

		if (currentGrid.contextMenuSelectedOption == "UpRowHeight" || currentGrid.contextMenuSelectedOption == "DownRowHeight")
		{
			if (currentGrid.contextMenuSelectedOption == "UpRowHeight")
			{
				currentGrid.rowHeight += 25;
			}
			else
			{
				if (currentGrid.rowHeight > 50)
				{
					currentGrid.rowHeight -= 25;
				}
			}
    		currentGrid.options.rowHeight = currentGrid.rowHeight;
    		GridStatic.buildGrid("myGrid");
		}
		else
		{
			//CHECK backup older than 026 - var row = $(this).grid("row");
			switch(currentGrid.contextMenuSelectedOption)
			{
			case "Edit":
				{
					DialogStatic.showStandardDialog(winID, false);
				}
				break;
			case "Add":
				{
					DialogStatic.showStandardDialog(winID, true);
				}
				break;
			case "Delete":
				{
					DialogStatic.showDeleteConfirmationDialog(winID);
				}
				break;
			}

			//Not sure this is necessary event.preventDefault();

			//Example data change
			//CHECK backup older than 026 - gridTable[row].priority = $(e.target).attr("data");
			//grid.updateRow(row);
		}
  	});

};

/* This is a "config" handled by PreSelectDialogStatic */
var PreSelectStrategy = {};
PreSelectStrategy.id = "preSelStratForSI";
PreSelectStrategy.selectId = "preSelStratForSISelect";
PreSelectStrategy.title = "Select a Strategy";
PreSelectStrategy.toptext = "The Strategy Impacts view will allow identification of impacts of the following strategy:";
PreSelectStrategy.selectType = "single";
PreSelectStrategy.items = [];
PreSelectStrategy.callingPage;
PreSelectStrategy.populateItems = function()
{
	PreSelectStrategy.items = [];
	for (var I = 0; I < MODEL[TABLE_STRATEGY].length; I++)
	{
		var item = {};
		item.id = MODEL[TABLE_STRATEGY][I].Strategy_ID;
		item.text = DialogStatic.getLongFieldTruncation(MODEL[TABLE_STRATEGY][I].Strategy_name, 70);
		PreSelectStrategy.items.push(item);
	}
};
PreSelectStrategy.validate = function()
{
	var ctrlSele = '#' + PreSelectStrategy.selectId;
	var val = $(ctrlSele).val();
	if (!val)
	{
		var errText = ErrorStatic.getErrorMessage("error6"); 
		$('#' + DialogStatic.errorFieldName).html(errText);
		
		return false;
	}
	else
	{  //single select
		selectedItems = [];
		selectedItems.push(val);
		return true;
	}
};
PreSelectStrategy.action = function()
{
	if (selectedItems.length < 1)
	{
		//TODO Show no Strategies have been created yet message
		return;
	}
	//Based on the Strategy_ID in selectedItems[0], shows affected players
	var pageCode = "SI";
	ModelStatic.populateTempTableWithAffectedPlayersForStrategies();
	var timeline = ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Timeline", selectedItems[0]);
	GridStatic[pageCode].header.headerReplaceContent = DialogStatic.getLongFieldTruncation(timeline, 60);
	var strategyName = ModelStatic.getFieldFromRowBasedOnKey("Strategy", "Strategy_name", selectedItems[0]);
	GridStatic[pageCode].menuReplaceContent = DialogStatic.getLongFieldTruncation(strategyName, 48);

	currentGrid = new GridSettings
	(
		MODEL[TABLE_TEMPTABLE],
		GridStatic[pageCode].initialSortColumn,
		GridStatic[pageCode].rowHeight
	);
	$("#thetoolbar").after(PageStatic.getPage(pageCode, "GRID"));
	GridStatic.buildGrid("myGrid");
	GridStatic.additionalPageSetup(pageCode);
};


/* This is a "config" handled by PreSelectDialogStatic */
var PreSelectMultipleStrategies = {};
PreSelectMultipleStrategies.id = "preSelMultStrats";
PreSelectMultipleStrategies.selectId = "preSelMultStratsSelect";
PreSelectMultipleStrategies.title = "Select Strategies";
PreSelectMultipleStrategies.toptext = "This view will show the impacts of the following selected strategies.  Select one or more strategies: ";
PreSelectMultipleStrategies.selectType = "multiple";
PreSelectMultipleStrategies.items = [];
PreSelectMultipleStrategies.callingPage;
PreSelectMultipleStrategies.populateItems = function()
{
	/* NOT NEEDED
	//See DialogStatic.getStrategyMultiSelectControl(config.selectId);
	*/
};
PreSelectMultipleStrategies.validate = function()
{
	var seleItems = DialogStatic.getMultiSelectedIDs(PreSelectMultipleStrategies.selectId);
	//multiple select: id's of selected strategies; allows no strategies to be selected
	// so 0 - many are allowed
	selectedItems = seleItems;
	return true;
};
PreSelectMultipleStrategies.action = function()
{
	//These pages expect a set of strategy ids in the global selectedItems
	switch(PreSelectMultipleStrategies.callingPage)
	{
	case "FF": //Future Feasibility
		{
			if (winID != NULL_PAGE)
			{
				removePage(winID);
			}
			$("#thetoolbar").after(PageStatic.getPage("FF", "GRAPHIC"));
			VisStatic.Feas.graphFeasibility(false, "visGraphic");
			$( "#bAddItem" ).button({ icons: { primary: "ui-icon-plus" } });
			$( "#bAddItem" ).unbind('click');
			$( "#bAddItem" ).click(function()
			{
				if (modalDialogShown)
				{
					return; //do not allow an a second dialog to be shown 
				}
				PreSelectDialogStatic.showSelectorDialog(PreSelectMultipleStrategies);
			});
		} 
		break;	
	case "PF": //Future Position
		{
			if (winID != NULL_PAGE)
			{
				removePage(winID);
			}
			$("#thetoolbar").after(PageStatic.getPage("PF", "GRAPHIC"));
			VisStatic.Pos.graphFuturePositionMap("visGraphic");
			$( "#bAddItem" ).button({ icons: { primary: "ui-icon-plus" } });
			$( "#bAddItem" ).unbind('click');
			$( "#bAddItem" ).click(function()
			{
				if (modalDialogShown)
				{
					return; //do not allow an a second dialog to be shown 
				}
				PreSelectDialogStatic.showSelectorDialog(PreSelectMultipleStrategies);
			});
		} 
		break;	
	case "SM":
		{
			if (winID != NULL_PAGE)
			{
				removePage(winID);
			}
			var pageCode = PreSelectMultipleStrategies.callingPage;
			
			ModelStatic.populateTempTableWithAffectedPlayersForStrategies(); //to TABLE_TEMPTABLE
			
			GridStatic.SM.insertImplementationPeriodLabels(); //edits a mostly static object
			
			currentGrid = new GridSettings
			(
				MODEL[TABLE_TEMPTABLE],
				GridStatic[pageCode].initialSortColumn,
				GridStatic[pageCode].rowHeight
			);
			$("#thetoolbar").after(PageStatic.getPage(pageCode, "GRID"));
			GridStatic.buildGrid("myGrid");
			
			$( "#bAddItem" ).button({ icons: { primary: "ui-icon-plus" } });
			$( "#bAddItem" ).unbind('click');
			$( "#bAddItem" ).click(function()
			{
				if (modalDialogShown)
				{
					return; //do not allow an a second dialog to be shown 
				}
				PreSelectDialogStatic.showSelectorDialog(PreSelectMultipleStrategies);
			});
		}
		break;
	}	
};

var PreSelectDialogStatic = {};
PreSelectDialogStatic.showSelectorDialog = function(config)
{
	config.populateItems();
	
	var divDef = '<div id="' + config.id + '" title="' + config.title + '"><table width="100%"><tbody>';
	divDef += '<tr><td class="selectortoptext">' + config.toptext + '</td><tr>';

	if (config.selectType == "single")
	{
		divDef += '<tr><td>';
		divDef += '<select id="' + config.selectId + '" class="selectorsingle" size="5">';
		for (var I = 0; I < config.items.length; I++)
		{
			divDef += "<option value='" + config.items[I].id + "'>" + config.items[I].text + "</option>";
		}
		divDef += '</select></td><tr>';
	}
	else
	{
		divDef += '<tr><td>';
		divDef += DialogStatic.getStrategyMultiSelectControl(config.selectId);
		divDef += '</td><tr>';
	}
	divDef += '<tr><td height="24px;"><div id="' + DialogStatic.errorFieldName + '"></div></td></tr>';

	divDef += '</tbody></table></div>';
	$("#dialogs").after(divDef);
	
	var heightToSet = "auto";
	if (config.selectType == "multiple")
	{
		heightToSet = 350;
	}

	var dialogIdAsSel = '#' + config.id;
	$(dialogIdAsSel).dialog({
		autoOpen: true,
		width: 700,
		height: heightToSet,
		buttons: [
			{
				text: "OK",
				click: function()
				{
					if (config.validate())
					{
						config.action();
						DialogStatic.onDialogClose(config.id);
						$(this).dialog('destroy').remove();
					}
				}
			},
			{
				text: "Cancel",
				click: function()
				{
					DialogStatic.onDialogClose(config.id);
					$(this).dialog('destroy').remove();
					ToolbarStatic.goToNextHighestMenu(config.callingPage);
				}
			}
		],
		open: function() 
		{
			DialogStatic.onDialogOpen(config.id);
    	},
    	close: function()
    	{
    		DialogStatic.onDialogClose(config.id);
    	},
	});
	
	//Because this uses "autoOpen", it must follow the dialog open and positioning
	//Otherwise, the select box appears in upper right, separate from the dialog 
	//box that it is in.
	if (config.selectType == "multiple")
	{
		var selIdForMultStrat = '#' + config.selectId;
		$(selIdForMultStrat).multiselect({
			height: 150,
			minWidth: 550,
			noneSelectedText: 'Select Strategies',
			selectedText: '# Strategies selected',
			selectedList: 4,
			autoOpen: true
		}); //The special Multiselect widget; Limited control - have to have user open dropdown.
	}
};

var FileSelectorStatic = {};
FileSelectorStatic.enableButtons = function(hasCurrentProject)
{
//THIS HAS TO BE CALLED everytime the File/Welcome page is shown
	if (!hasCurrentProject)
	{
		$("#fsCurrent").css("display", "none");
		$("#fsCurrentMessage").css("display", "none");
	}
	else
	{
		$("#fsCurrent").css("display", "table-cell");
		$("#fsCurrentMessage").css("display", "table-cell");
		var divDef = 'Open your current project:&nbsp;&nbsp;<i>' + ProjectManager.getCurrentProjectName() + '</i>';
		$("#fsCurrentMessage").html(divDef);
	}
	//$("#downloadLink").attr("href", FileSelectorStatic.getDownloadLink());
	FileSelectorStatic.appendDownloadLink();

	$( "#fsCurrent" ).unbind('click');
	$( "#fsCurrent" ).click(function(e)
	{
		ProjectManager.loadCurrentProject();
		FileSelectorStatic.showMainMenuForProject();
		return false;
	});
	
	$( "#fsExample" ).unbind('click');
	$( "#fsExample" ).click(function(e)
	{
		MODEL = TESTDATA;
		FileSelectorStatic.showMainMenuForProject();
		return false;
	});
	
	$( "#fsCreate" ).unbind('click');
	$( "#fsCreate" ).click(function(e)
	{
		console.log("Create new project clicked.");
		//TODO DISPLAY A Download your project warning window.
		//UNLESS web-storage will take multiple projects.
		//Perhaps even if it will, it is a good idea for the user to download their project(s).
		MODEL = new NewModel();
		MODEL[TABLE_PROJECT].push(new Project()); //there will only be one row in TABLE_PROJECT
		
		//Project Dialog
		DialogStatic.showStandardDialog("PJ", false);
		
		return false;
	});
	
	$( "#fsDownload" ).unbind('click');
	$( "#fsDownload" ).click(function(e)
	{
		console.log("fsDownload clicked");
		AccordionStatic.closeMenuIfVisible();
		if (!ProjectManager.hasProject)
		{
			ErrorStatic.showSimpleErrorBox("error26");
			return false;
		}
		if (!MODEL[TABLE_PROJECT])
		{
			ProjectManager.loadCurrentProject();
		}
		var dataAsJSONString = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MODEL));
		$('#downloadToDisk').empty();
		$('<a href="data:' + dataAsJSONString + '" download="PolicyMakerProject.json">Export your project as a file (Chrome browser only.)</a>').appendTo('#downloadToDisk');
		$( "#saveToDiskDialog" ).dialog( "open" );
		return false;
	});
	
	$( "#fsUpload" ).unbind('click');
	$( "#fsUpload" ).click(function(e)
	{
		console.log("fsUpload clicked");
		AccordionStatic.closeMenuIfVisible();
		$( "#openFromDiskDialog" ).dialog( "open" ); //action occurs in FileSelectorStatic.handleFileSelect inner method
		return false;
	});
	
	$( "#fsProjects" ).unbind('click');
	$( "#fsProjects" ).click(function(e)
	{
		console.log("fsProjects clicked");
		ProjectManager.showProjectsDialog();
		return false;
	});
};

FileSelectorStatic.showMainMenuForProject = function()
{
	$("#welcomefull").hide();
	changePage("DX");
	$(".toolbarbuttons").show();
};

FileSelectorStatic.defineDialogs = function()
{
	$( "#saveToDiskDialog" ).dialog({
		autoOpen: false,
		width: 600,
		height: 160,
		buttons: [
			{
				text: "Close",
				click: function()
				{
					$( this ).dialog( "close" );
				}
			}
		]
	});

	$( "#openFromDiskDialog" ).dialog({
		autoOpen: false,
		width: 420,
		height: 200,
		buttons: [
			{
				text: "Close",
				click: function()
				{
					$( this ).dialog( "close" );
				}
			}
		]
	});

	try
	{
        $('#openFiles').change(function()
        {
			FileSelectorStatic.handleFileSelect(this.files);
        });
	}
	catch (e)
    {
		/* TODO better error handling */
		alert(e);
    }
};

FileSelectorStatic.appendDownloadLink = function()
{
//This feature works only with Chrome; 
//Safari shows the JSON text as a page.
//IE - yet to be tested
	if ($("#downloadLink").length > 0)
	{
		$("#downloadLink").remove();
	}
	var dataAsJSONString = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(MODEL));
	$('<a id="downloadLink" href="data:' + dataAsJSONString + '" download="PolicyMakerProject.json">Export</a>').appendTo('#fsDownload');
};

FileSelectorStatic.returnToWelcomePage = function()
{
	//TODO model creation failed. User exited out of Project Definition dialog with Cancel
	MODEL = {};
	changePage("WE");
};

/* PART OF Open File from Disk */
FileSelectorStatic.handleFileSelect = function(selectedFiles)
{
	var reader = new FileReader();
	reader.onload = function(event)
	{
		var dataFromFile = event.target.result;

		/* TEMP - HARDCODED to Player */
		MODEL = JSON.parse(dataFromFile);

		FileSelectorStatic.showMainMenuForProject();

		$( "#openFromDiskDialog" ).dialog( "close" );
	};
	reader.readAsText(selectedFiles[0]);
};

/*
FileSelectorStatic.getDownloadURL = function()
{
//Experiment to avoid Safari problem.  (See backup -089 and earlier for other experimental code)
	var blob = new Blob([JSON.stringify(MODEL)], {type: "text/json;charset=utf-8,"});

	var url = URL.createObjectURL(blob);

	console.log(url);
};
*/


var ReportStatic = {};
ReportStatic.getReportForCurrentModel = function(parDiv)
{
	GridStatic.SM.insertImplementationPeriodLabels(); //provides the three time period headers for implementation
	
	var proj = MODEL[TABLE_PROJECT][0];
	var parDivSel = '#' + parDiv;
	var rep = '<h2 class="reptitle">' + proj.User_label + '</h2>';
	var fields = GridStatic.PJ.dialog.fields;
	for (var I = 1; I < 5; I++)
	{
		rep += '<div class="repinfo">' + fields[I].title + ": " + proj[fields[I].field] + '</div>';
	}
	rep += ReportStatic.getGridReport("CT");
	rep += ReportStatic.getGridReport("PL");
	
	rep += ReportStatic.getVisGraphicParentDiv("PC");
	rep += ReportStatic.getVisGraphicParentDiv("FC");
	
	rep += ReportStatic.getGridReport("CN");
	rep += ReportStatic.getGridReport("PI");
	
	rep += ReportStatic.getVisGraphicParentDiv("CL");
	
	rep += ReportStatic.getGridReport("OS");
	rep += ReportStatic.getGridReport("ST");
	rep += ReportStatic.getGridReport("SI");
	
	rep += ReportStatic.getVisGraphicParentDiv("PF");
	rep += ReportStatic.getVisGraphicParentDiv("FF");
	
	rep += ReportStatic.getGridReport("SM");
	
	$(parDivSel).append(rep);
	
	ReportStatic.addVisGraphic("PC");
	ReportStatic.addVisGraphic("FC");
	ReportStatic.addVisGraphic("CL");
	ReportStatic.addVisGraphic("PF");
	ReportStatic.addVisGraphic("FF");
};
ReportStatic.getGridReport = function(pageCode)
{
	var sectionTitle = PageStatic.getMenuName(pageCode);
	if (pageCode == "SI")
	{
		sectionTitle = "4A. Strategy Impacts";
	}
	var rep = '<hr/><div class="repsectitle">' + sectionTitle + '</div>';
	rep += '<div class="reptablewrapper"><table class="reptable"><tbody><tr>';
	var cols = GridStatic[pageCode].columnDefs;
	var tot = GridStatic.getColumnPixelTotal(pageCode);
	for (var I = 0; I < cols.length; I++)
	{
		var pct = (cols[I].width / tot) * 100;
		rep += '<th class="reptableheadercell" width="' + pct + '%">' + cols[I].label + '</th>';
	}
	rep += '<tr>';
	var rows = MODEL[GridStatic[pageCode].table];
	if (pageCode == "OS")
	{
		rows = ModelStatic.getOpportAndObsRowsWithData();
	}
	var indexForField = GridStatic.getIndexForField(rows, cols[0].field);
	for (var I = 0; I < indexForField.length; I++)
	{
		var indexPos = indexForField[I];
		var row = rows[indexPos];
		rep += '<tr>';
		for (var C = 0; C < cols.length; C++)
		{
			switch(cols[C].type)
			{
			case "text":
				rep += '<td class="reptablecell">' + row[cols[C].field];
				break;
			case "POSITION":
			case "POWER-AND-PRIORITY":
				rep += '<td class="reptablecell">' + GridStatic.colorCodedReportCell(cols[C].type, row[cols[C].field]);
				break;
			case "POSITION-CURR":
			case "POWER-AND-PRIORITY-CURR":
				{
					var cellValue;
					var baseType;
					if (cols[C].type == "POSITION-CURR")
					{
						cellValue = ModelStatic.getFieldFromRowBasedOnKey("Player", "Position_rating", row["Player_ID"]);
						baseType = "POSITION";
					}
					else
					{
						cellValue = ModelStatic.getFieldFromRowBasedOnKey("Player", "Strength_of_influence", row["Player_ID"]);
						baseType = "POWER-AND-PRIORITY";
					}
					rep += '<td class="reptablecell">' + GridStatic.colorCodedReportCell(baseType, cellValue);
				}
				break;
			case "PROBABILITY":
				rep += '<td class="reptablecell" style="padding: 0px; text-align: center;">' + GridStatic.getProbabilityTableCell(row, cols[C].field, true);
				break;
			case "combination":
				{
					var combName = cols[C].field;
					if (cols[C].combinationName)
					{
						combName = cols[C].combinationName;
					}
					rep += '<td class="reptablecell">' + GridStatic.getCombinationFieldText(combName, row);
				}
				break;
			default:
				rep += '<td class="reptablecell">';
			}
			rep += '</td>';
		}
		rep += '</tr>';
	}
	rep += '</tbody></table></div>';
	return rep;
};
ReportStatic.getVisGraphicParentDiv = function(pageCode)
{
//Add the div that will be the parent for the respective graphic
//the graphic will be added to the DOM later.
	var sectionTitle = PageStatic.getMenuName(pageCode);
	var rep = '<hr/><div class="repsectitle">' + sectionTitle + '</div><div id="visGraphic' +
	pageCode + '"></div>';
	return rep;
};
ReportStatic.addVisGraphic = function(pageCode)
{
	switch(pageCode)	
	{
	case "PC":
		VisStatic.Pos.graphCurrentPositionMap("visGraphicPC");	
		break;
	case "FC":
		VisStatic.Feas.graphFeasibility(true, "visGraphicFC");	
		break;
	case "PF":
	case "FF":
		{
			ModelStatic.addAllToSelectedItems(TABLE_STRATEGY); //add all strategies
			if (pageCode == "PF")
			{
				VisStatic.Pos.graphFuturePositionMap("visGraphicPF");
			}
			else
			{
				VisStatic.Feas.graphFeasibility(false, "visGraphicFF");	
			}
		}
		break;
	case "CL":
		VisStatic.Coal.graphCoalitionMap("visGraphicCL", false);
		break;
	}
};
