/* 
 * PolicyMaker 5: 
 * Copyright (c) 2015 Michael Reich and David Cooper
 * All rights reserved.
 */

function PositionCluster(posGroup, posLabel, value)
{
	this.posGroup = posGroup;
	this.posLabel = posLabel;
	this.value = value;
	this.items = [];
	this.svgRect = 
	{
		x : 0, y : 0, width : 1, height : 1
	};
}
function PlayersOfPower(powerIndex)
{
	this.Strength_of_influence = powerIndex;
	this.players = [];
}
function Point(x, y)
{
	this.x = x;
	this.y = y;
}
function TickLocation(pos, textvalue)
{
	this.pos = pos;
	this.textvalue = textvalue;
}


VisStatic = {};
VisStatic.Feas = {};
VisStatic.Feas.curPositionClusterArr = [];
VisStatic.Feas.fillCurrentPositionClusterArr = function()
{
	//Create the empty clusters
	VisStatic.Feas.curPositionClusterArr = VisStatic.Feas.getEmptyFeasibilityClusterArray();
	
	//Apply values to the clusters
	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		var positionRating = MODEL[TABLE_PLAYER][I].Position_rating;
		var posValue = MODEL[TABLE_PLAYER][I].PosValue;
		var powValue = MODEL[TABLE_PLAYER][I].PowValue;
		var weight = MODEL[TABLE_PLAYER][I].Weight;
		
		VisStatic.Feas.addValueToCluster(true, MODEL[TABLE_PLAYER], positionRating, posValue, powValue, weight);
	}
};

VisStatic.Feas.futPositionClusterArr = [];
VisStatic.Feas.fillFuturePositionClusterArr = function()
{
	//Create the empty clusters
	VisStatic.Feas.futPositionClusterArr = VisStatic.Feas.getEmptyFeasibilityClusterArray();;
	
	//Iterate through the players, look at current values, then apply AffectedPlayer data to it
	VisStatic.Pos.calculateFuturePosition(VisStatic.Feas.addValueToCluster);
};

VisStatic.Feas.addValueToCluster = function(isCurrent, playr, positionRating, posValue, powValue, weight)
{
	var thisClusterGroup;
	switch(positionRating)
	{
	case 1:
	case 2:
	case 3:
		thisClusterGroup = "SUP";
		break;
	case 4:
		thisClusterGroup = "NMOB";
		break;
	case 5:
	case 6:
	case 7:
		thisClusterGroup = "OPP";
		break;
	case 0:
	default:
		thisClusterGroup = "NOTSET";
		break;
	}
	
	if (thisClusterGroup == "NOTSET")
		return; //skip
		
	var thisCluster = VisStatic.Feas.getClusterForGroup(isCurrent, thisClusterGroup);

	if (thisClusterGroup == "NMOB")
	{
		posValue = SCALETYPE_NMOB_VALUE;
	}
	if (posValue < 0) 
	{
		posValue = -1 * posValue;
	}
	
	//".Include" is not recognized - there is currently (v4.0) no way to set it
	var incrementValue = posValue * powValue * weight;
	thisCluster.value += incrementValue;
};

VisStatic.Feas.getClusterForGroup = function(isCurrent, clusterGroup)
{
	var thisClusterArr;
	if (isCurrent)
	{
		thisClusterArr = VisStatic.Feas.curPositionClusterArr;
	}
	else
	{
		thisClusterArr = VisStatic.Feas.futPositionClusterArr;
	}
	
	for (var I = 0; I < thisClusterArr.length; I++)
	{
		if (thisClusterArr[I].posGroup == clusterGroup)
		{
			return thisClusterArr[I];
		}
	}
};
VisStatic.Feas.getEmptyFeasibilityClusterArray = function()
{
	var feasClustArr = [];
	feasClustArr.push(new PositionCluster("SUP", "Supporters", 0.0));
	feasClustArr.push(new PositionCluster("NMOB", "Non-Mobilized", 0.0));
	feasClustArr.push(new PositionCluster("OPP", "Opponents", 0.0));
	return feasClustArr;
};
VisStatic.Feas.graphFeasibility = function(isCurrent, parDiv)
{
	var parIDSel = "#" + parDiv;
	
	var data;
	if (isCurrent)
	{
		VisStatic.Feas.fillCurrentPositionClusterArr();
		data = VisStatic.Feas.curPositionClusterArr;
	}
	else
	{
		VisStatic.Feas.fillFuturePositionClusterArr();
		data = VisStatic.Feas.futPositionClusterArr;
	}
	
	var maxVal = VisStatic.Feas.getMaxFeasVal(data);
	if (maxVal == 0)
	{
		VisStatic.Feas.showNoFeasData(parIDSel);
		return;
	}
	
	var fullview = { width: 960, height: 600 };
	var margin = {top: 20, right: 20, bottom: 30, left: 40, intraX: 30};
	
	var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" id="pmgraph" width="' + fullview.width + '" height="' + fullview.height + '" class="svgcanvas"><g transform="translate(' + margin.left + "," + margin.top + ')">';
	
	VisStatic.Feas.calculateFeasibilityRectangles(maxVal, fullview, margin, data);
	
	svgStr += VisStatic.Feas.getYAxis(maxVal, fullview, margin, "Value");
	
	var tickText = '<g transform="translate(0,' + VisStatic.Feas.getYAxisLength(fullview, margin) + ')">';
	for (var I = 0; I < data.length; I++)
	{
		if (data[I].value != 0.0)
		{
			svgStr += '<rect class="' + VisStatic.Feas.getStyleForPos(data[I].posGroup) + '" x="' + data[I].svgRect.x  + '" y="' + data[I].svgRect.y + '" width="' + data[I].svgRect.width + '" height="' + data[I].svgRect.height + '" />';
		}
		
		var midpointX = data[I].svgRect.x + (data[I].svgRect.width / 2.0);
		tickText += '<g transform="translate(' + midpointX + ',0.0)"><line x2="0" y2="9" class="tickline" />';
		tickText += '<text y="22" x="0" class="xaxistictext">' + data[I].posLabel + '</text>';
		if (data[I].value == 0.0)
		{ //If value is 0, show a "None" marker
			tickText += '<text y="-10" x="0" class="xaxisitaltext">(None)</text>';
		}
		tickText += '</g>';
	}
	
	svgStr += tickText + '</g></g></svg>';
	
	if ($("#pmgraph").length)
	{
		$("#pmgraph").remove;
	}
	var parentElement = $(parIDSel)[0];
	var svcDoc = new DOMParser().parseFromString(svgStr, 'application/xml');
	parentElement.appendChild(parentElement.ownerDocument.importNode(svcDoc.documentElement, true));
};
VisStatic.Feas.calculateFeasibilityRectangles = function(max, fullview, margin, data)
{
	var segWidth = (fullview.width - (2 * margin.intraX)) / data.length;
	var barWidth = segWidth - margin.intraX;
	var yAxisLen = VisStatic.Feas.getYAxisLength(fullview, margin);
	var unitSize = yAxisLen / max;
	var xCurr = margin.intraX;
	for (var I = 0; I < data.length; I++)
	{
		var rectHeight = data[I].value * unitSize;
		data[I].svgRect.x = xCurr;
		data[I].svgRect.y = yAxisLen - rectHeight;
		data[I].svgRect.width = barWidth;
		data[I].svgRect.height = rectHeight;
		xCurr += segWidth;
	}
};

VisStatic.Feas.getMaxFeasVal = function(data)
{
	var max = 0.0;
	for (var I = 0; I < data.length; I++)
	{
		if (data[I].value > max)
		{
			max = data[I].value;
		}
	}
	return max;
};

VisStatic.Feas.getYAxis = function(max, fullview, margin, textValue)
{
	var yTickLocs = VisStatic.Feas.getYTickLocations(max, fullview, margin);
	
	var ax = '<g class="yaxis"><line y2="' + VisStatic.Feas.getYAxisLength(fullview, margin) + '" class="axisline" />';
	for (var I = 0; I < yTickLocs.length; I++)
	{
		ax += '<g transform="translate(0,' + yTickLocs[I].pos + ')">';
		ax += '<line x2="-6" y2="0" class="tickline"/>';
		ax += '<text x="-9" y="0" dy=".40em" class="yaxistictext">' + yTickLocs[I].textvalue  + '</text>';
		ax += '</g>';
	}
	ax += '<text transform="rotate(-90)" y="6" dy="0.80em" class="yaxistext">' + textValue + '</text>';
	ax += '</g>';
	return ax;
};
VisStatic.Feas.getYAxisLength = function(fullview, margin)
{
	return (fullview.height - (margin.top + margin.bottom));
};
VisStatic.Feas.getYTickLocations = function(max, fullview, margin)
{
	var tickLocs = [];
	var ticRange = VisStatic.Feas.getTickRange(max);
	var yAxisLen = VisStatic.Feas.getYAxisLength(fullview, margin);
	var unitSize = yAxisLen / max;
	var ticSize = ticRange * unitSize;
	
	var currPos = 0.0;
	var tickValue = 0.0;
	while (tickValue < max)
	{
		var textvalue = "" + tickValue;
		var ypos = yAxisLen - currPos;
		tickLocs.push(new TickLocation(ypos, textvalue));
		tickValue += ticRange;
		currPos += ticSize;
	}
	return tickLocs;
};
VisStatic.Feas.getTickRange = function(max)
{
	if (max < 10)
		return 1.0;
	if (max < 50)
		return 5.0;
	if (max < 100)
		return 10.0;
	if (max < 500)
		return 20.0;
	if (max < 1000)
		return 100.0;
	if (max < 5000)
		return 500.0;
	if (max < 10000)
		return 1000.0;
	if (max < 50000)
		return 5000.0;
	if (max < 100000)
		return 10000.0;
	if (max < 500000)
		return 50000.0;
	if (max < 1000000)
		return 100000.0;
	if (max < 5000000)
		return 500000.0;
	return 1000000.0;
};
VisStatic.Feas.getStyleForPos = function(posGroup)
{
	switch(posGroup)
	{
	case "OPP":
		return "barOpp";
	case "NMOB":
		return "barNMob";
	case "SUP":
		return "barSup";
	default:
		return "barNMob";
	}
};
VisStatic.Feas.showNoFeasData = function(parIDSel)
{
	//TODO
};

VisStatic.Pos = {};
VisStatic.Pos.curPositionClusterArr = [];
VisStatic.Pos.futPositionClusterArr = [];
VisStatic.Pos.Measures = 
[
	{start: 0, width: 138}, 
	{start: 138, width: 137}, 
	{start: 275, width: 137}, 
	{start: 412, width: 137}, 
	{start: 549, width: 137}, 
	{start: 686, width: 137}, 
	{start: 823, width: 138}
];
VisStatic.Pos.graphCurrentPositionMap = function(parDiv)
{
	VisStatic.Pos.curPositionClusterArr = VisStatic.Pos.getEmptyPositionClusterArray();

	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		VisStatic.Pos.placePlayerInPositionClusterArray
		(
			VisStatic.Pos.curPositionClusterArr, 
			MODEL[TABLE_PLAYER][I],  
			MODEL[TABLE_PLAYER][I].Position_rating,
			MODEL[TABLE_PLAYER][I].Strength_of_influence
		);
	}
	
	VisStatic.Pos.graphPositionClusterArray(parDiv, VisStatic.Pos.curPositionClusterArr);
};

VisStatic.Pos.graphFuturePositionMap = function(parDiv)
{
	VisStatic.Pos.futPositionClusterArr = VisStatic.Pos.getEmptyPositionClusterArray();
	
	VisStatic.Pos.calculateFuturePosition(VisStatic.Pos.placeFuturePlayerInPositionClusterArray);
	
	VisStatic.Pos.graphPositionClusterArray(parDiv, VisStatic.Pos.futPositionClusterArr);
};

VisStatic.Pos.getEmptyPositionClusterArray = function()
{
	var posClustArr = []; 
	for (var I = 0; I < GridStatic.positionValueArr.length; I++)
	{
		posClustArr[I] = new PositionCluster(I, GridStatic.positionValueArr[I].text, 0.0);
		posClustArr[I].playersOfPower = [];
		for (var P = 0; P < 4; P++)
		{
			var strOfInf = P + 1;
			if (strOfInf == 5)
			{
				strOfInf = 0;
			}
			posClustArr[I].playersOfPower.push(new PlayersOfPower(strOfInf));
		}
	}
	return posClustArr;
};
VisStatic.Pos.calculateFuturePosition = function(clusterPlacementFunction)
{
	//Fills the temp table with Affected Players which reference one of the selected strategies
	//Relies on the selected strategies selected by the PreSelectMultipleStrategies dialog scheme,
	//that stores data in index.html/selectedItems[]
	ModelStatic.populateTempTableWithAffectedPlayersForStrategies();
	
	//Iterate through the players, look at current values, then apply AffectedPlayer data to it
	for (var I = 0; I < MODEL[TABLE_PLAYER].length; I++)
	{
		var playerID = MODEL[TABLE_PLAYER][I].Player_ID;
		var positionRating = MODEL[TABLE_PLAYER][I].Position_rating;
		if (positionRating < 1 || positionRating > ScalarStatic.getPosPowUpperBound("Position"))
		{
			continue; //ignore players without a current position
		}
		var posValue = MODEL[TABLE_PLAYER][I].PosValue;
		var powerRating = MODEL[TABLE_PLAYER][I].Strength_of_influence;
		var powValue = MODEL[TABLE_PLAYER][I].PowValue;
		var weight = MODEL[TABLE_PLAYER][I].Weight;
		
		var dTotalDeviationPosition = 0.0;
		var nCountFuturePositionValues = 0;
		var dTotalDeviationPower = 0.0;
		var nCountFuturePowerValues = 0;
		
		//Apply AffectedPlayer values to these calculations
		for (var A = 0; A < MODEL[TABLE_TEMPTABLE].length; A++)
		{
			if (MODEL[TABLE_TEMPTABLE][A].Player_ID != playerID)
			{
				continue; //filter for this player
			}
			var affPositionRating = MODEL[TABLE_TEMPTABLE][A].Future_position_rating;
			var affPosValue = MODEL[TABLE_TEMPTABLE][A].Fut_PosValue;
			var affPowerRating = MODEL[TABLE_TEMPTABLE][A].Future_power_rating;
			var affPowValue = MODEL[TABLE_TEMPTABLE][A].Fut_PowValue;
			
			var futPosSet = !(affPositionRating < 1 || affPositionRating > ScalarStatic.getPosPowUpperBound("Position"));
			var futPowSet = !(affPowerRating < 1 || affPowerRating > ScalarStatic.getPosPowUpperBound("Power"));
			if (!futPosSet && !futPowSet)
			{
			//If neither future rating is set, skip this AffectedPlayer
				continue;
			}
			
			if (futPosSet)
			{
				dTotalDeviationPosition += affPosValue - posValue;
				nCountFuturePositionValues++;
			}
		
			if (futPowSet)
			{
				dTotalDeviationPower += affPowValue - powValue;
				nCountFuturePowerValues++;
			}
		}
		
		if (nCountFuturePositionValues > 0)
		{
			posValue += (dTotalDeviationPosition / nCountFuturePositionValues);
		}
		if (nCountFuturePowerValues > 0)
		{
			powValue += (dTotalDeviationPower / nCountFuturePowerValues);
		}
		positionRating = ScalarStatic.setRangeFlagFromValue(posValue, "Position");
		
		//Add the changed value to whichever (Position or Feasibility) cluster
		clusterPlacementFunction(false, MODEL[TABLE_PLAYER][I], positionRating, posValue, powValue, weight);
	}	
};
VisStatic.Pos.placeFuturePlayerInPositionClusterArray = function(isCurrent, playr, positionRating, posValue, powValue, weight)
{
	VisStatic.Pos.placePlayerInPositionClusterArray
	(
		VisStatic.Pos.futPositionClusterArr, 
		playr, 
		positionRating, 
		ScalarStatic.setRangeFlagFromValue(powValue, "Power")
	);
};

VisStatic.Pos.placePlayerInPositionClusterArray = function(posClustArr, playr, posRating, strengthOfInflu)
{
	var posRateIx = posRating - 1; //MODEL[TABLE_PLAYER][I].Position_rating - 1; 
	if (posRateIx < 0 || posRateIx > 6)
		return; //Not Set
		
	var ixPow = strengthOfInflu; //MODEL[TABLE_PLAYER][I].Strength_of_influence;
	switch(ixPow)
	{
	case 1:
	case 2:
	case 3:
		posClustArr[posRateIx].playersOfPower[ixPow - 1].players.push(playr); //MODEL[TABLE_PLAYER][I] = playr
		break;
	case 0:
	default:
		posClustArr[posRateIx].playersOfPower[3].players.push(playr); //MODEL[TABLE_PLAYER][I] = playr
		break;
	}
};
VisStatic.Pos.graphPositionClusterArray = function(parDiv, posClustArr)
{
	var selID = '#' + parDiv;
	var legend = '<table height="45" width="100%" style="background: #ffffff; font-size: 1.55em;"><tr>';
	for (var I = 0; I < GridStatic.positionValueArr.length; I++)
	{
		legend += '<td width="' + VisStatic.Pos.Measures[I].width + '">' + GridStatic.positionValueArr[I].text + '</td>';
	}
	legend += '</tr></table>';
 	var htmlStr = legend + '<svg width="960" height="720" class="svgcanvas">'; 
 	for (var I = 0; I < GridStatic.positionValueArr.length; I++)
 	{
 		htmlStr += '<rect x="' + VisStatic.Pos.Measures[I].start + '" width="' + VisStatic.Pos.Measures[I].width + 
 		'" y="0" height="720" fill="' + GridStatic.positionValueArr[I].color + '" stroke="gray" stroke-width="0.5' +
 		'" />';
 		
 		var yStart = 6;
 		
 		for (var K = 0; K < 4; K++)
 		{
	 		for (var J = 0; J < posClustArr[I].playersOfPower[K].players.length; J++)
	 		{
	 			var powerIndex = K + 1;
	 			if (powerIndex == 4)
	 				powerIndex = 0;
	 			var xStart = VisStatic.Pos.Measures[I].start + 6;
	 			var xTextStart = xStart + 6;
	 			var yTextStart = yStart + 18;
		 		htmlStr += '<g><rect x="' + xStart + '" width="123" y="' + 
		 		yStart + '" height="27" fill="' + 
		 		GridStatic.powerValueArr[powerIndex].color + '" stroke="' + 
		 		GridStatic.powerValueArr[powerIndex].textColor + '" stroke-width="0.5' +
		 		'" /><text x="' + xTextStart + 
		 		'" y="' + yTextStart + 
		 		'" class="powerText' + 
		 		'" fill="' + GridStatic.powerValueArr[powerIndex].textColor +
		 		'">' + posClustArr[I].playersOfPower[K].players[J].Player_abbrev +
		 		'</text></g>';	
		 		yStart += 37;
	 		}
 		}
 	}
 	htmlStr += '</svg>';
 	$(selID).append(htmlStr);
};




VisStatic.Coal = {};
VisStatic.Coal.cx = 960 / 2;
VisStatic.Coal.cy = 738 / 2;
VisStatic.Coal.Scaling = 0.96;
VisStatic.Coal.PlayerWidth = 76;
VisStatic.Coal.PlayerHeight = 19;
VisStatic.Coal.EstCharWidth = 6.6;
//prefixes must be the same length
VisStatic.Coal.SVGIDPrefix      = 'coalgSvg';
VisStatic.Coal.SVGIDinnerTextPrefix = 'coaltSvg'; 
VisStatic.Coal.SVGIDinnerRectPrefix = 'coalrSvg';

VisStatic.Coal.SvgCanvas = "clSvgCanvas";
VisStatic.Coal.DivCanvas = "clEditorSpace"; 
VisStatic.Coal.DivIDSprite = "clEditorSprite"; 
VisStatic.Coal.ItemBeingEdited;
VisStatic.Coal.graphCoalitionMap = function(parDiv, isInteractive)
{
	var selID = '#' + parDiv;
	var fullwid = 960;
	var fullhite = 738;
	var htmlStr = '';
	var idInteractiveCanvas = VisStatic.Coal.DivCanvas;
	VisStatic.Coal.ItemBeingEdited = undefined;
	if (isInteractive)
	{
		htmlStr += '<div id="' + idInteractiveCanvas + '">';
	}
 	htmlStr += '<svg id="' + VisStatic.Coal.SvgCanvas + '" width="' + fullwid + '" height="' + fullhite + '" class="svgcanvas">';
 	 
 	//Circles
 	if (MODEL[TABLE_PROJECT][0].CoalitionShowCircles)
 	{
 		var radiusOuter = fullhite * (MODEL[TABLE_PROJECT][0].CoalitionCircleOuter / 100);
 		var radiusInner = fullhite * (MODEL[TABLE_PROJECT][0].CoalitionCircleInner / 100);
 		
 		htmlStr += '<circle cx="' + VisStatic.Coal.cx + '" cy="' + VisStatic.Coal.cy + '" r="' + radiusOuter + 
 		'" stroke="black" stroke-width="1" fill="white" /><circle cx="'+ VisStatic.Coal.cx + '" cy="' + VisStatic.Coal.cy + '" r="' + radiusInner + 
 		'" stroke="black" stroke-width="1" fill="white" />';
 	}

 	var allTokens = MODEL[TABLE_COALITION];
 	
 	//Radials
  	for (var I = 0; I < allTokens.length; I++)
 	{
 		if (allTokens[I].Coal_Type == 3)
 		{
 			htmlStr += VisStatic.Coal.getCoalitionRadial(allTokens[I], VisStatic.Coal.cx, VisStatic.Coal.cy);
 		}
 	}
 	
 	//Player Tokens
 	for (var I = 0; I < allTokens.length; I++)
 	{
 		if (allTokens[I].Coal_Type == 1)
 		{
 			htmlStr += VisStatic.Coal.getCoalitionPlayerToken(allTokens[I], VisStatic.Coal.cx, VisStatic.Coal.cy);
 		}
 	}
 	
 	//Labels
 	for (var I = 0; I < allTokens.length; I++)
 	{
 		if (allTokens[I].Coal_Type == 2)
 		{
 			htmlStr += VisStatic.Coal.getCoalitionLabel(allTokens[I], VisStatic.Coal.cx, VisStatic.Coal.cy);
 		}
 	}
 	
 	//The legend appears on the top bar, so it is not added here as it is in PM4
 	
 	htmlStr += '</svg>';
 	if (isInteractive)
 	{
 		htmlStr += '<div id="' + VisStatic.Coal.DivIDSprite + '" class="colorcellcoalitionsprite" /></div>';
 	}
 	$(selID).append(htmlStr);
 	
 	//Accept clicks
 	if (isInteractive)
 	{
 		var selIdInteractiveCanvas = '#' + idInteractiveCanvas;
 		$(selIdInteractiveCanvas).click(function(evt)
 		{
 			if (evt.originalEvent.path && evt.originalEvent.path.length > 0)
 			{
 				if (evt.originalEvent.path[0].id && VisStatic.Coal.isCoalSvgEditableElement(evt.originalEvent.path[0].id))
 				{
 					var idThis = evt.originalEvent.path[0].id;
 					var keyCoal = VisStatic.Coal.getCoalSvgEditableKey(idThis);
 					VisStatic.Coal.startEditing(idThis, keyCoal);
 				}
 			}
 		});
 	}
};
VisStatic.Coal.isCoalSvgEditableElement = function(id)
{
	if (id.length > VisStatic.Coal.SVGIDPrefix.length)
	{
		if (id.substring(0, VisStatic.Coal.SVGIDPrefix.length) == VisStatic.Coal.SVGIDPrefix)
			return true;
		if (id.substring(0, VisStatic.Coal.SVGIDPrefix.length) == VisStatic.Coal.SVGIDinnerTextPrefix)
			return true;
		if (id.substring(0, VisStatic.Coal.SVGIDPrefix.length) == VisStatic.Coal.SVGIDinnerRectPrefix)
			return true;
	}
	return false;
};
VisStatic.Coal.getCoalSvgEditableKey = function(fullID)
{
	return fullID.substring(VisStatic.Coal.SVGIDPrefix.length);
};

VisStatic.Coal.getCoalitionPlayerToken = function(coalRow, cx, cy)
{
	var playerHite = VisStatic.Coal.PlayerHeight;
	var playerWid = VisStatic.Coal.PlayerWidth;
	var posRating = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Position_rating", coalRow.Coal_Ent_ID);
	var colorCell = GridStatic.getPositionColorCell(posRating);
	var abbrev = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Player_abbrev", coalRow.Coal_Ent_ID);
	var x = VisStatic.Coal.getAdjustedPosition(true, coalRow.Coal_Xpos);
	var y = VisStatic.Coal.getAdjustedPosition(false, coalRow.Coal_Ypos);
	var xTextStart = x + 3;
	var yTextStart = y + 15;
	return '<g id="' + VisStatic.Coal.SVGIDPrefix + coalRow.Coal_ID +
		'"><rect x="' + x + '" width="' + playerWid + 
		'" id="' + VisStatic.Coal.SVGIDinnerRectPrefix + coalRow.Coal_ID +
		'" y="' + y + '" height="' + playerHite + '" fill="' + 
 		colorCell.color + '" stroke="' + 
 		'black' + '" stroke-width="0.5' +
 		'" /><text x="' + xTextStart + 
 		'" y="' + yTextStart + 
 		'" id="' + VisStatic.Coal.SVGIDinnerTextPrefix + coalRow.Coal_ID +
 		'" class="powerText' + 
 		'" fill="' + colorCell.textColor +
 		'">' + abbrev +
 		'</text></g>';
};
VisStatic.Coal.getAdjustedPosition = function(isX, val)
{
	if (isX)
		return (val * 0.96) + VisStatic.Coal.cx;
	else
		return (val * 0.96) + VisStatic.Coal.cy;
};
VisStatic.Coal.getStoredPosition = function(isX, val)
{
	if (isX)
		return (val - VisStatic.Coal.cx) * (1 / 0.96);
	else
		return (val - VisStatic.Coal.cy) * (1 / 0.96);
};
VisStatic.Coal.getCoalitionLabel = function(coalRow, cx, cy)
{
	var xTextStart = (coalRow.Coal_Xpos * 0.96) + cx + 4;
	var yTextStart = (coalRow.Coal_Ypos * 0.96) + cy + 4;
	return '<text x="' + xTextStart + 
 		'" y="' + yTextStart + 
 		'" id="' + VisStatic.Coal.SVGIDPrefix + coalRow.Coal_ID +
 		'" class="powerText' + 
 		'" fill="black">' + coalRow.Coal_Text +
 		'</text>';
};
VisStatic.Coal.getCoalitionRadial = function(coalRow, cx, cy)
{
	var endPoint = VisStatic.Coal.getCoalitionRadialEndpoint(coalRow.Coal_Angle, cx, cy);
	return '<line x1="' + cx + 
 		'" y1="' + cy + 
 		'" x2="' + endPoint.x + 
 		'" y2="' + endPoint.y + 
 		'" style="stroke: black; stroke-width: 1" />';
	
};
VisStatic.Coal.getCoalitionRadialEndpoint = function(angle, cx, cy)
{
	if (!angle)
		return new Point(cx, cy);
	if (angle < 0 || angle > 360)
		return new Point(cx, cy);
	if (angle == 0)
		return new Point(cx, 0);
	if (angle == 90)
		return new Point(cx * 2, cy);
	if (angle == 180)
		return new Point(cx, cy * 2);
	if (angle == 270)
		return new Point(0, cy);
	//TODO: See CoalitionMap.cs, ConvertAngleToEndpoint
	
	var HYPOTEN = 1250;
    var nQuad = 0;
    
    var dCalcAngle = angle;
    if (angle > 270)
    {
        nQuad = 3;
        dCalcAngle = angle - 270;
    }
    else if (angle > 180)
    {
        nQuad = 2;
        dCalcAngle = angle - 180;
    }
    else if (angle > 90)
    {
        nQuad = 1;
        dCalcAngle = angle - 90;
    }

    var dAsRad = Math.PI * dCalcAngle / 180.0;
    
    var sinAng = Math.sin(dAsRad);
    var cosAng = Math.cos(dAsRad);
    var dXUnit = Math.abs(sinAng);
    var dYUnit = Math.abs(cosAng);

    switch(nQuad)
    {
    case 0:
        return new Point(cx + (dXUnit * HYPOTEN), cy - (dYUnit * HYPOTEN));
    case 1:
        return new Point(cx + (dYUnit * HYPOTEN), cy + (dXUnit * HYPOTEN));
    case 2:
        return new Point(cx - (dXUnit * HYPOTEN), cy + (dYUnit * HYPOTEN));
    default:
        return new Point(cx - (dYUnit * HYPOTEN), cy - (dXUnit * HYPOTEN));
    }
};
VisStatic.Coal.startEditing = function(id, key)
{
	if (VisStatic.Coal.ItemBeingEdited)
	{
		return; //an item is already being edited
	}
	console.log("ID being edited: " + id + ", key: " + key);
	var ix = ModelStatic.getIndexForItemInTable(TABLE_COALITION, ModelStatic.getKeyFieldForTable(TABLE_COALITION), key);
	VisStatic.Coal.ItemBeingEdited = MODEL[TABLE_COALITION][ix];
	
	//Delete the existing SVG sprite
	var selId = '#' + VisStatic.Coal.SVGIDPrefix + key; //delete the parent object (<g> or <text>)
	$(selId).remove(); 
	var selIdSprite = '#' + VisStatic.Coal.DivIDSprite;
	
	//Transform the sprite into what we need
	VisStatic.Coal.convertSpriteToIconForItemBeingEdited(selIdSprite);
	
	//Make the sprite visible 
	$(selIdSprite).css("display", "block");
	
};
VisStatic.Coal.convertSpriteToIconForItemBeingEdited = function(selIdSprite)
{
	var x = VisStatic.Coal.getAdjustedPosition(true, VisStatic.Coal.ItemBeingEdited.Coal_Xpos);
	var y = VisStatic.Coal.getAdjustedPosition(false, VisStatic.Coal.ItemBeingEdited.Coal_Ypos);
	
	if (VisStatic.Coal.ItemBeingEdited.Coal_Type == 1)
	{
		$(selIdSprite).css("width", "79px");
		var posRating = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Position_rating", VisStatic.Coal.ItemBeingEdited.Coal_Ent_ID);
		var colorCell = GridStatic.getPositionColorCell(posRating);
		var abbrev = ModelStatic.getFieldFromRowBasedOnKey(TABLE_PLAYER, "Player_abbrev", VisStatic.Coal.ItemBeingEdited.Coal_Ent_ID);
		$(selIdSprite).html(abbrev);
		$(selIdSprite).css("background-color", colorCell.color);
		$(selIdSprite).css("color", colorCell.textColor);
		//$(selIdSprite).css("border", "solid");
		//$(selIdSprite).css("border-width", "thin");
	}
	else
	{
		y -= 8;
		$(selIdSprite).css("width", "");
		$(selIdSprite).html(VisStatic.Coal.ItemBeingEdited.Coal_Text);
		$(selIdSprite).css("background-color", "#fff");
		$(selIdSprite).css("color", "#000");
		//$(selIdSprite).css("border", "none");
	}
	$(selIdSprite).css("top", y);
	$(selIdSprite).css("left", x);
	$(selIdSprite).css("font-size", "1.5em");
	$(selIdSprite).css("text-align", "left");
	
	var selWrapper = '#' + VisStatic.Coal.DivCanvas;
	$(selIdSprite).draggable(
	{ 
		containment: selWrapper, 
		scroll: false,
		stop: function(evt, ui) 
		{
			VisStatic.Coal.completeDragging($(this).position());
		} 
	});
};

VisStatic.Coal.completeDragging = function(position)
{
//Based on the position, alter and save the data 
	VisStatic.Coal.ItemBeingEdited.Coal_Xpos = VisStatic.Coal.getStoredPosition(true, position.left);
	VisStatic.Coal.ItemBeingEdited.Coal_Ypos = VisStatic.Coal.getStoredPosition(false, position.top);

//Clean up
	VisStatic.Coal.ItemBeingEdited = undefined;
	var selIdSprite = '#' + VisStatic.Coal.DivIDSprite;
	$(selIdSprite).draggable("destroy");
	$(selIdSprite).css("display", "none");
	
//Save
	ProjectManager.saveProject();

//Redisplay - jQuery cannot manipulate SVG objects in all cases (no 'innerSvg' function)	
	changePage("CL");
};

