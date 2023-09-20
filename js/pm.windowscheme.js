/* 
 * PolicyMaker 5: 
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */
var MENUOBJS = [{
    code : "DX",
    label : "MAIN MENU",
    text : "",
    items : [
        { isDisplayOption : false, text : "PolicyMaker allows you to: (1) define a policy to analyze, (2) do a stakeholder analysis of key players (groups, organizations, and individuals) by analyzing their position and power, (3) develop political strategies to improve the feasibility of your policy, and (4) assess the likely impacts of your strategies and envision possible future scenarios. This tool of political analysis is designed to help you improve the political feasibility of your policy." },
        { isDisplayOption : false, text : "PolicyMaker involves the following steps:" },
        { isDisplayOption : true, text : "Define and analyze the content of the policy", code : "CT", label : "1. POLICY" },
        { isDisplayOption : true, text : "Do a stakeholder analysis of key players, assessing their position and power on the policy", code : "DP", label : "2. PLAYERS" },
        { isDisplayOption : true, text : "Develop political strategies for improving the feasibility of your policy", code : "DS", label : "3. STRATEGIES" },
        { isDisplayOption : true, text : "Assess the likely impacts of your strategies", code : "DM", label : "4. IMPACTS" },
        { isDisplayOption : true, text : "Set general items for the project.  View a summary of the project", code : "DR", label : "Summary and Settings" },
        { isDisplayOption : false, text : "To start implementing PolicyMaker, click on the 'Policy' option, above." },
    ]
},
/*
{
    code : "DI",
    label : "1. Policy",
    text : "",
    items : [
    	{ isDisplayOption : true, text : "A policy is defined and analyzed through the following steps:"},
        { isDisplayOption : true, text : "", code : "CT", label : "1A. Policy Content" },
        { isDisplayOption : false, text : "Select a policy which is specific. A policy involving multiple players with varying positions is most suitable for PolicyMaker." },
        { isDisplayOption : false, text : "Next: identify who are the key players influencing the policy." },
    ]
},
*/
{
    code : "DP",
    label : "2. PLAYERS",
    text : "",
    items : [
        { isDisplayOption : false, text : "Key players (groups, organizations and individuals) influencing the policy are identified and analyzed." },
        { isDisplayOption : true, text : "Identify key players, analyze their position and power on the policy. This analysis provides the basic data for your stakeholder analysis.", code : "PL", label : "2A. Player Table" },
        { isDisplayOption : true, text : "View the players according to their current positions of support, non-mobilized, and opposition, and also see their levels of power.", code : "PC", label : "2B. Current Position Map" },
        { isDisplayOption : true, text : "View a graphical representation of the extent of current support and opposition on the policy.", code : "FC", label : "2C. Current Feasibility" },
        { isDisplayOption : true, text : "Assess the consequences of your policy for key players.", code : "CN", label : "2D. Consequences" },
        { isDisplayOption : true, text : "Analyze the interests of key players involved in your policy.", code : "PI", label : "2E. Interests" },
        { isDisplayOption : true, text : "Construct and view a graphical map of the coalitions among key players.", code : "CL", label : "2F. Coalition Map" },
        { isDisplayOption : false, text : "The input of the player table will generate the current position map and feasibility graph. This analysis leads to player-specific strategy development." },
    ]
},
{
    code : "DS",
    label : "3. STRATEGIES",
    text : "",
    items : [
    	{ isDisplayOption : false, text : "Develop political strategies to improve the feasibility of your policy." },
        { isDisplayOption : true, text : "Identify potential opportunities and obstacles pertaining to players.", code : "OS", label : "3A. Opportunities and Obstacles" },
        { isDisplayOption : true, text : "View the suggested strategies grouped into 3 categories (i) strengthening support (ii) mobilizing non-mobilized (iii) minimizing opposition.", code : "SH", label : "3B. Suggested Strategies" },
        { isDisplayOption : true, text : "Design strategies to influence players to strengthen support and minimize opposition to the policy.", code : "ST", label : "3C. Strategy Table" },
    ]
},
{
    code : "DM",
    label : "4. IMPACTS",
    text : "",
    items : [
    	{ isDisplayOption : false, text : "This step assesses the impacts of strategies on the future position and power of players."},
        { isDisplayOption : true, text : "Estimate future position and power of players for a given strategy.", code : "SI", label : "4A. Strategy Impacts" },
        { isDisplayOption : true, text : "View the players according to their future positions of support, non-mobilized and opposition to the policy.", code : "PF", label : "4B. Future Position Map" },
        { isDisplayOption : true, text : "View a graphical representation of the extent of future support and opposition on the policy.", code : "FF", label : "4C. Future Feasibility" },
        { isDisplayOption : true, text : "Track the implementation of your strategies, to evaluate whether the actual impacts match the expected impacts.", code : "SM", label : "4D. Strategy Implementation" },
        { isDisplayOption : false, text : "" },
    ]
},
{
    code : "DR",
    label : "Summary and Settings",
    text : "",
    items : [
        { isDisplayOption : true, text : "View a summary of the project.", code : "RE", label : "Summary" },
        { isDisplayOption : true, text : "General Project Settings", code : "PS", label : "Project Settings" },
    ]
} ];

var WINDOWMETADATA = [
    { code : "CN", displayname : "2D. Consequences", longdesc : "Assess the consequences of your policy for key players.", image : "step-CN.png"},
    { code : "CL", displayname : "2F. Coalition Map", longdesc : "Construct a map of the coalitions among key players by clicking on a player and dragging it to an appropriate place.", image : "step-CL.png"},
    { code : "CT", displayname : "1. Policy Content", longdesc : "In this step, you will define a policy for political analysis.", image : "step-CT.png"},
    { code : "DI", displayname : "Policy Step", longdesc : "", image : "step-DI.png"},
    { code : "DM", displayname : "Impacts Step", longdesc : "", image : "step-DM.png"},
    { code : "DP", displayname : "Players Step", longdesc : "", image : "step-PL.png"},
    { code : "DR", displayname : "Report Step", longdesc : "", image : "step-DR.png"},
    { code : "DS", displayname : "Strategies Step", longdesc : "", image : "step-DS.png"},
    { code : "DX", displayname : "Main Menu", longdesc : "Describes the steps of the methodology and provides access to features."},
    { code : "ES", displayname : "Notes", longdesc : "Displays comments and items marked for further research."},
    { code : "FC", displayname : "2C. Current Feasibility", longdesc : "View a graph that shows a feasibility index for your policy, based on your assessment of player positions and power.", image : "step-FC.png"},
    { code : "FF", displayname : "4C. Future Feasibility", longdesc : "View a graph that shows a feasibility index for your policy to show the changes in power and position of players after implementing the selected strategies.", image : "step-FF.png"},
    { code : "MM", displayname : "Main Menu", longdesc : "Describes the steps of the methodology and provides access to features."},
    { code : "NT", displayname : "2F. Network", longdesc : "Analyze the networks among key players.", image : "step-NT.png"},
    { code : "OS", displayname : "3A. Opportunities &amp; Obstacles", longdesc : "Define opportunities to improve your policy's feasibility and actions that would take advantage of these opportunities.", image : "step-OP.png"},
    { code : "PC", displayname : "2B. Current Position Map", longdesc : "View the players according to their current positions of support, non-mobilized, and opposition for the entire policy.", image : "step-PC.png"},
    { code : "PF", displayname : "4B. Future Position Map", longdesc : "View the expected future positions of players after implementing the strategies selected in a particular package.", image : "step-PF.png"},
    { code : "PI", displayname : "2E. Interests", longdesc : "Analyze the interests of key players involved in your policy.", image : "step-PI.png"},
    { code : "PL", displayname : "2A. Player Table", longdesc : "Identify the players that are involved in your policy and assess the position and power of each player.", image : "step-PL.png"},
    { code : "PS", displayname : "Project Settings", longdesc : "Edit settings for the project, including list items and project name and analyst.", image : "step-PS.png"},
    { code : "RE", displayname : "Summary", longdesc : "Print or Export information.  Preview output prior to printing.", image : "step-RE.png"},
    { code : "SH", displayname : "3B. Suggested Strategies", longdesc : "Use expert hints provided by the program and data you have entered to create strategies that improve the political feasibility of your policy.", image : "step-SH.png"},
    { code : "SI", displayname : "4A. Strategy Impacts: <!--REPLACE-->", longdesc : "Identify the impacts of your strategies on the players, by estimating how each strategy is expected to change the power and position of players.", image : "step-SI.png"},
    { code : "SM", displayname : "4D. Strategy Implementation", longdesc : "Track the implementation of your strategies, to evaluate whether the actual impacts match the expected impacts. Assign success percentages to strategies for time periods.", image : "step-SM.png"},
    { code : "ST", displayname : "3C. Strategy Table", longdesc : "View and sort your strategies in a tabular display.", image : "step-ST.png"},
    { code : "WE", displayname : "Select a Project", longdesc : "Select a Project", image : "step-TT.png"},
];
WINDOWMETADATA.getDisplayNameForWindow = function(code)
{
	for (var I = 0; I < WINDOWMETADATA.length; I++)
	{
		if (WINDOWMETADATA[I].code == code)
		{
			return WINDOWMETADATA[I].displayname;
		}
	}
};

