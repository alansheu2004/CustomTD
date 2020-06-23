function Panel(state) {
	this.state = state;
	this.game = state.game;
	

	var thisPanel = this;

	this.playButton = new Button(state, 
		function(x, y) {return Math.hypot(x-PLAY_BUTTON_X, y-PLAY_BUTTON_Y) <= PLAY_BUTTON_R;},
		function(state) {state.nextRound();},
		true);
	state.addButton(this.playButton);

	this.fullscreenButton = new Button(state, 
		function(x, y) {return Math.hypot(x-FULLSCREEN_BUTTON_X, y-FULLSCREEN_BUTTON_Y) <= FULLSCREEN_BUTTON_R;},
		function(state) {state.toggleFullscreen();},
		true);
	state.addButton(this.fullscreenButton);

	this.sellButton = new Button(state,
		function(x, y) {return (x >= SELL_BUTTON_MID_X - SELL_BUTTON_WIDTH/2 && x <= SELL_BUTTON_MID_X + SELL_BUTTON_WIDTH/2) && (y >= SELL_BUTTON_Y && y<= SELL_BUTTON_Y + SELL_BUTTON_HEIGHT);},
		function(state) {state.sellFocusedTower();},
		false);
	state.addButton(this.sellButton);

	this.upgradeButton = new Button(state,
		function(x, y) {return Math.abs(x-UPGRADE_BUTTON_MID_X) <= UPGRADE_BUTTON_WIDTH/2 && y >= UPGRADE_BUTTON_Y && y<= UPGRADE_BUTTON_Y + UPGRADE_BUTTON_HEIGHT},
		function(state) {state.focusedTower.nextUpgrade()},
		false);
	state.addButton(this.upgradeButton);
}

//Draws the panel
Panel.prototype.draw = function() {
	
	this.drawBase();

	if (this.state.focusedTower == null) {
		this.drawTopBox();
		this.drawTowerBox();
	} else {
		this.drawDescriptionBox();
		this.drawSellButton();
		this.drawUpgrades();
	}

	this.drawButtons();
}

Panel.prototype.drawBase = function() {
	this.state.panelContext.fillStyle = this.game.panelBaseColor;
	this.state.panelContext.fillRect(PANEL_X, PANEL_Y, PANEL_WIDTH, PANEL_HEIGHT);
}

Panel.prototype.drawTopBox = function() {
	this.state.panelContext.fillStyle = this.game.panelBoxColor;
	this.state.panelContext.fillRect(PANEL_TOWER_BOX_X, PANEL_TOWER_BOX_Y, PANEL_TOWER_BOX_WIDTH, PANEL_TOWER_BOX_HEIGHT);
	
	this.state.panelContext.textAlign = "center";
	this.state.panelContext.textBaseline = "middle";
	this.state.panelContext.fillStyle = this.game.panelTextColor;

	if(this.state.draggingTower || this.state.hoveringTowerOption) {
		this.state.setFontFit(this.state.panelContext, "$" + this.state.selection.upgrades[0].cost, PANEL_TOWER_BOX_TOWER_COST_FONT_SIZE, PANEL_TOWER_BOX_INNER_WIDTH);
		this.state.panelContext.fillText("$" + this.state.selection.upgrades[0].cost, PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_COST_OFFSET_Y);
		this.state.setFontFit(this.state.panelContext, this.state.selection.name, PANEL_TOWER_BOX_TOWER_NAME_FONT_SIZE, PANEL_TOWER_BOX_INNER_WIDTH);
		this.state.panelContext.fillText(this.state.selection.name, PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_NAME_OFFSET_Y);
	} else {
		this.state.setFontFit(this.state.panelContext, "Towers", PANEL_TOWER_BOX_TOWER_TEXT_FONT_SIZE, PANEL_TOWER_BOX_INNER_WIDTH);
		this.state.panelContext.fillText("Towers", PANEL_TOWER_BOX_MID_X, PANEL_TOWER_BOX_Y + PANEL_TOWER_BOX_TOWER_TEXT_OFFSET_Y);
	}
}

Panel.prototype.drawDescriptionBox = function() {
	this.state.panelContext.fillStyle = this.game.panelBoxColor;
	this.state.panelContext.fillRect(PANEL_TOWER_DESCRIPTION_BOX_X, PANEL_TOWER_DESCRIPTION_BOX_Y, PANEL_TOWER_DESCRIPTION_BOX_WIDTH, PANEL_TOWER_DESCRIPTION_BOX_HEIGHT);
	
	this.state.focusedTower.upgrade.drawFit(this.state.panelContext, PANEL_TOWER_DESCRIPTION_BOX_MID_X, PANEL_TOWER_DESCRIPTION_IMAGE_Y, PANEL_TOWER_DESCRIPTION_IMAGE_SIZE)
	
	this.state.panelContext.textAlign = "center";
	this.state.panelContext.textBaseline = "middle";
	this.state.panelContext.fillStyle = this.game.panelTextColor;
	
	this.state.setFontFit(this.state.panelContext, this.state.focusedTower.type.name, PANEL_TOWER_DESCRIPTION_TITLE_FONT_SIZE, PANEL_TOWER_BOX_INNER_WIDTH);
	this.state.panelContext.fillText(this.state.focusedTower.type.name, PANEL_TOWER_DESCRIPTION_BOX_MID_X, PANEL_TOWER_DESCRIPTION_BOX_Y + PANEL_TOWER_DESCRIPTION_TITLE_OFFSET_Y);
}

Panel.prototype.drawSellButton = function() {
	this.state.panelContext.fillStyle = this.game.sellButtonColor;
	this.state.panelContext.fillRect(SELL_BUTTON_MID_X - SELL_BUTTON_WIDTH/2, SELL_BUTTON_Y, SELL_BUTTON_WIDTH, SELL_BUTTON_HEIGHT);

	this.state.panelContext.textAlign = "center";
	this.state.panelContext.textBaseline = "middle";
	this.state.panelContext.fillStyle = this.game.sellButtonTextColor;
	
	this.state.setFontFit(this.state.panelContext, "Sell-$" + Math.ceil(this.state.focusedTower.baseSellPrice*this.state.game.sellMultiplier), SELL_BUTTON_FONT_SIZE, SELL_BUTTON_INNER_WIDTH);
	this.state.panelContext.fillText("Sell-$" + Math.ceil(this.state.focusedTower.baseSellPrice*this.state.game.sellMultiplier), SELL_BUTTON_MID_X, SELL_BUTTON_Y + SELL_BUTTON_HEIGHT/2);
}

Panel.prototype.drawUpgrades = function() {
	this.state.panelContext.textAlign = "center";
	this.state.panelContext.textBaseline = "bottom";
	this.state.panelContext.fillStyle = this.game.panelTextColor;

	this.state.setFontFit(this.state.panelContext, "Upgrades", UPGRADE_TEXT_FONT_SIZE, UPGRADE_TEXT_WIDTH);
	this.state.panelContext.fillText("Upgrades", UPGRADE_TEXT_MID_X, UPGRADE_TEXT_Y);


	var nextUpgrade = this.state.focusedTower.type.upgrades[this.state.focusedTower.upgradeNum+1];
	if(nextUpgrade == undefined || this.state.money < nextUpgrade.cost) {
		this.upgradeButton.active = false;
	} else {
		this.upgradeButton.active = true;
	}
	

	if (nextUpgrade == undefined) {
		this.state.panelContext.filter = "opacity(50%)";

		this.state.panelContext.fillStyle = this.game.panelBoxColor;
		this.state.panelContext.fillRect(UPGRADE_BUTTON_MID_X - UPGRADE_BUTTON_WIDTH/2, UPGRADE_BUTTON_Y, UPGRADE_BUTTON_WIDTH, UPGRADE_BUTTON_HEIGHT);

		this.state.panelContext.textAlign = "center";
		this.state.panelContext.textBaseline = "middle";
		this.state.panelContext.fillStyle = this.game.panelTextColor;

		this.state.setFontFit(this.state.panelContext, "No Upgrades", UPGRADE_BUTTON_NONE_FONT_SIZE, UPGRADE_BUTTON_NONE_WIDTH);
		this.state.panelContext.fillText("No Upgrades", UPGRADE_BUTTON_MID_X, UPGRADE_BUTTON_NONE_Y);

		this.state.panelContext.filter = "none"
	} else {
		if (this.state.money < nextUpgrade.cost) {
			this.state.panelContext.filter = "opacity(50%)";
		}

		this.state.panelContext.fillStyle = this.game.panelBoxColor;
		this.state.panelContext.fillRect(UPGRADE_BUTTON_MID_X - UPGRADE_BUTTON_WIDTH/2, UPGRADE_BUTTON_Y, UPGRADE_BUTTON_WIDTH, UPGRADE_BUTTON_HEIGHT);

		this.state.panelContext.textAlign = "left";
		this.state.panelContext.textBaseline = "middle";
		this.state.panelContext.fillStyle = this.game.panelTextColor;

		nextUpgrade.drawFit(this.state.panelContext, UPGRADE_BUTTON_ICON_X, UPGRADE_BUTTON_ICON_Y, UPGRADE_BUTTON_ICON_MAX);

		this.state.setFontFit(this.state.panelContext, "$" + nextUpgrade.cost, UPGRADE_BUTTON_COST_FONT_SIZE, UPGRADE_BUTTON_TEXT_WIDTH);
		this.state.panelContext.fillText("$" + nextUpgrade.cost, UPGRADE_BUTTON_TEXT_X, UPGRADE_BUTTON_COST_Y);

		this.state.setFontFit(this.state.panelContext, nextUpgrade.name, UPGRADE_BUTTON_NAME_FONT_SIZE, UPGRADE_BUTTON_TEXT_WIDTH);
		this.state.panelContext.fillText(nextUpgrade.name, UPGRADE_BUTTON_TEXT_X, UPGRADE_BUTTON_NAME_Y);
	
		this.state.panelContext.filter = "none";

	}
	
}

//Draws the container and its contexts for the tower options
Panel.prototype.drawTowerBox = function() {
	this.state.panelContext.fillStyle = this.game.panelBoxColor;
	this.state.panelContext.fillRect(PANEL_TOWER_OPTION_BOX_X, PANEL_TOWER_OPTION_BOX_Y, PANEL_TOWER_OPTION_BOX_WIDTH, PANEL_TOWER_OPTION_BOX_HEIGHT);
	
	for (var i=0; i<this.state.towerTypes.length; i++) {
		this.state.panelContext.filter = "none";
		this.state.panelContext.fillStyle = this.game.panelTowerOptionBoxFillColor;
		var towerCoors = this.getTowerOptionCoors(i);
		this.state.panelContext.fillRect(towerCoors.x+PANEL_TOWER_OPTION_PADDING, towerCoors.y+PANEL_TOWER_OPTION_PADDING, PANEL_TOWER_OPTION_SIZE-(2*PANEL_TOWER_OPTION_PADDING), PANEL_TOWER_OPTION_SIZE-(2*PANEL_TOWER_OPTION_PADDING));

		if((this.state.draggingTower || this.state.hoveringTowerOption) && this.state.selection==this.state.towerTypes[i]) {
			this.state.panelContext.strokeStyle = this.game.panelTowerOptionBoxHoverOutlineColor;
			this.state.panelContext.lineWidth = PANEL_TOWER_OPTION_SIZE/15;
			this.state.panelContext.strokeRect(towerCoors.x+PANEL_TOWER_OPTION_PADDING, towerCoors.y+PANEL_TOWER_OPTION_PADDING, PANEL_TOWER_OPTION_SIZE-(2*PANEL_TOWER_OPTION_PADDING), PANEL_TOWER_OPTION_SIZE-(2*PANEL_TOWER_OPTION_PADDING));
		}

		if (this.state.money < this.state.towerTypes[i].upgrades[0].cost) {
			this.state.panelContext.filter = "brightness(40%)";
		}
		
		this.state.towerTypes[i].upgrades[0].drawFit(this.state.panelContext, towerCoors.x+PANEL_TOWER_OPTION_SIZE/2, towerCoors.y+PANEL_TOWER_OPTION_SIZE/2, PANEL_TOWER_OPTION_SIZE);
		this.state.panelContext.filter = "none";
	}
	
	this.drawScrollBar();
}

//Draws the scrollbar in the tower box
Panel.prototype.drawScrollBar = function() {
	this.state.panelContext.fillStyle = this.game.panelTowerOptionScrollBarColor;
	this.state.panelContext.fillRect(PANEL_TOWER_OPTION_SCROLL_BAR_X, PANEL_TOWER_OPTION_SCROLL_BAR_Y, PANEL_TOWER_OPTION_SCROLL_BAR_WIDTH, PANEL_TOWER_OPTION_SCROLL_BAR_HEIGHT);
}

Panel.prototype.drawButtons = function() {
	this.drawPlayButton();
	this.drawFullscreenButton();
}

Panel.prototype.drawPlayButton = function() {
	if (!this.playButton.active) {
		this.state.panelContext.filter = "opacity(30%)";
	}
	if(this.state.buttonPressed && this.state.selection == this.playButton) {
		this.state.panelContext.fillStyle = "#664321"; //This should probably be changed
	} else {
		this.state.panelContext.fillStyle = this.game.panelButtonFillColor;
	}

	this.state.panelContext.beginPath();
	this.state.panelContext.arc(PLAY_BUTTON_X, PLAY_BUTTON_Y, PLAY_BUTTON_R, 0, 2*Math.PI);
	this.state.panelContext.fill();

	this.state.panelContext.fillStyle = this.game.panelButtonSymbolColor;
	this.state.panelContext.beginPath();
	this.state.panelContext.moveTo(PLAY_BUTTON_X - PLAY_BUTTON_R/4, PLAY_BUTTON_Y - PLAY_BUTTON_R/2);
	this.state.panelContext.lineTo(PLAY_BUTTON_X - PLAY_BUTTON_R/4, PLAY_BUTTON_Y + PLAY_BUTTON_R/2);
	this.state.panelContext.lineTo(PLAY_BUTTON_X + PLAY_BUTTON_R/2, PLAY_BUTTON_Y);
	this.state.panelContext.closePath();
	this.state.panelContext.fill();

	this.state.panelContext.filter = "none";
}

Panel.prototype.drawFullscreenButton = function() {
	if(this.state.buttonPressed && this.state.selection == this.fullscreenButton) {
		this.state.panelContext.fillStyle = "#664321"; //This should probably be changed
	} else {
		this.state.panelContext.fillStyle = this.game.panelButtonFillColor;
	}

	this.state.panelContext.beginPath();
	this.state.panelContext.arc(FULLSCREEN_BUTTON_X, FULLSCREEN_BUTTON_Y, FULLSCREEN_BUTTON_R, 0, 2*Math.PI);
	this.state.panelContext.fill();

	this.state.panelContext.strokeStyle = this.game.panelButtonSymbolColor;
	this.state.panelContext.lineWidth = FULLSCREEN_BUTTON_R / 6;

	var nfss = 8;
	var nfsb = 2;
	var fss = 4.5;
	var fsb = 1.75;

	if(document.fullscreenElement == null) {
		this.state.panelContext.beginPath();
		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/nfss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/nfsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/nfss);
	} else {
		this.state.panelContext.beginPath();
		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fss);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fss);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fsb, FULLSCREEN_BUTTON_Y - FULLSCREEN_BUTTON_R/fss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fss);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X - FULLSCREEN_BUTTON_R/fsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fss);

		this.state.panelContext.moveTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fsb);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fss, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fss);
		this.state.panelContext.lineTo(FULLSCREEN_BUTTON_X + FULLSCREEN_BUTTON_R/fsb, FULLSCREEN_BUTTON_Y + FULLSCREEN_BUTTON_R/fss);
	}

	this.state.panelContext.stroke();

	this.state.panelContext.filter = "none";
}

//Gets the coordinates of the top left corner of the tower option in the panel
Panel.prototype.getTowerOptionCoors = function(num) {
	return {
		x: PANEL_TOWER_OPTIONS_X + (PANEL_TOWER_OPTION_SIZE + PANEL_TOWER_OPTION_GAP) * (num%2), 
		y: PANEL_TOWER_OPTIONS_Y + (PANEL_TOWER_OPTION_SIZE + PANEL_TOWER_OPTION_GAP) * Math.floor(num/2)
	};
}

//Returns whether a coordinate pair is inside a tower option
Panel.prototype.optionContains = function(num, x, y) {
	var towerCoors = this.getTowerOptionCoors(num);
	if(x>=towerCoors.x && y>=towerCoors.y && x<=towerCoors.x+PANEL_TOWER_OPTION_SIZE && y<=towerCoors.y+PANEL_TOWER_OPTION_SIZE) {
		return true;
	} else {
		return false;
	}
}