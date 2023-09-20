/*
 * PolicyMaker 5:
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */
/* PolicyMaker Main Logic */

//Static strings
var PAGEPREFIX = "page";
var NULL_PAGE = "(No former page)";

//Key Objects
var MODEL = {}; 
ProjectManager.readForCurrentProject();

var winID = NULL_PAGE;
var currentGrid = new GridSettings(MODEL.Player, "Player_name", 28);
var selectedItems = [];
var modalDialogShown = false;

function changePage(pageCode)
{
    console.log("Changing page to: " + pageCode + ", from page: " + winID);
    if (winID != NULL_PAGE)
    {
        removePage(winID);
    }
    winID = pageCode;
    switch(pageCode)
    {
    case "WE":
        {
            $("#welcomefull").show();
            $(".toolbarbuttons").hide();
            FileSelectorStatic.enableButtons(ProjectManager.hasProject);
        }
        break;
    case "CT":
    case "PL":
    case "CN":
    case "PI":
    case "OS":
    case "ST":
    case "ES": //Notes table
        {
            currentGrid = new GridSettings
            (
                MODEL[GridStatic[pageCode].table],
                GridStatic[pageCode].initialSortColumn,
                GridStatic[pageCode].rowHeight
            );
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "GRID"));
            GridStatic.buildGrid("myGrid");
            GridStatic.additionalPageSetup(pageCode);
        }
        break;
    case "SI":
        {
            PreSelectStrategy.callingPage = pageCode;
            PreSelectDialogStatic.showSelectorDialog(PreSelectStrategy);
        }
        break;
    case "FF":
    case "PF":
    case "SM":
        {  //Future Feasibility, Future Position, and Strat Implem require pre-selection of strategies
            selectedItems = [];
            PreSelectMultipleStrategies.callingPage = pageCode;
            PreSelectDialogStatic.showSelectorDialog(PreSelectMultipleStrategies);
        }
        break;
    case "DX": //Menus
    //case "DI":
    case "DP":
    case "DS":
    case "DM":
    case "DR":
        {
            $("#thetoolbar").after(MenuStatic.getMenuHtmlNamed(pageCode));
        }
        break;
    case "PC":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "GRAPHIC"));
            VisStatic.Pos.graphCurrentPositionMap("visGraphic");
        }
        break;
    case "FC":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "GRAPHIC"));
            VisStatic.Feas.graphFeasibility(true, "visGraphic");
        }
        break;
    case "CL":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "GRAPHIC"));
            VisStatic.Coal.graphCoalitionMap("visGraphic", true);
            GridStatic.additionalPageSetup(pageCode);
        }
        break;
    case "SH":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "SUGGSTR"));
            PageStatic.getSuggestedStrategiesDisplay("suggStrats");
        }
        break;
    case "PS":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "PROJSET"));
            PageStatic.getProjectSettingsDisplay("projSet");
        }
        break;
    case "RE":
        {
            $("#thetoolbar").after(PageStatic.getPage(pageCode, "REPORT"));
            ReportStatic.getReportForCurrentModel("report");
        }
        break;
    }
}

function removePage(formerPage)
{
    var formerPageSel = "#" + PAGEPREFIX + formerPage;
    $(formerPageSel).remove();
}

$(function()
{
    ToolbarStatic.createToolbar("#thetoolbar");
    FileSelectorStatic.defineDialogs();
    
    ContextMenuStatic.defineContextMenu();

    AccordionStatic.defineAccordion();

    $(".toolbarbuttons").hide();
    
    FileSelectorStatic.enableButtons(ProjectManager.hasProject);
});
