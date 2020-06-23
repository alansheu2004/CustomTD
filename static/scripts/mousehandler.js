function MouseHandler(state) {
	var thisState = state;
	var thisHandler = this;

	this.state = state;

    //Disables double clicking on the canvas to select text
	state.canvasDiv.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	
	state.canvasDiv.addEventListener('mousedown', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.startDraggingTower(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.startPressingButton(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.startPressingTower(thisState.selectionCoors)) {
			return;
		}
	}, true);

	state.canvasDiv.addEventListener('mousemove', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.dragTower(thisState.selectionCoors)){
			return;
		} else if (thisHandler.checkButtonPressed(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.checkTowerPressed(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.hoverTower(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.hoverTowerOption(thisState.selectionCoors)) {
			return;
		}
		thisHandler.stopHovering();
	}, true);

	state.canvasDiv.addEventListener('mouseup', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.dropTower(thisState.selectionCoors)){
			return;
		} else if (thisHandler.releaseButton(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.releaseTower(thisState.selectionCoors)) {
			return;
		}
		if(mouse.x < MAP_WIDTH) {
			thisState.unfocus();
			thisState.towerContext.valid = false;
		}
	}, true);



	state.canvasDiv.addEventListener('touchstart', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisHandler.touchToMouseEvent(e, 'mousedown'));
		if (thisHandler.startDraggingTower(mouse)) {
			return;
		} else if (thisHandler.startPressingButton(mouse)) {
			return;
		} else if (thisHandler.startPressingTower(thisState.selectionCoors)) {
			return;
		} else if (thisHandler.hoverTowerOption(mouse)) {
			return;
		} 
		thisHandler.stopHovering();
	}, true);

	state.canvasDiv.addEventListener('touchmove', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisHandler.touchToMouseEvent(e, 'mousemove'));
		if (thisHandler.dragTower(mouse)){
			return;
		} else if (thisHandler.checkButtonPressed(mouse)) {
			return;
		} else if (thisHandler.checkTowerPressed(thisState.selectionCoors)) {
			return;
		}
	}, true);

	state.canvasDiv.addEventListener('touchend', function(e) {
		e.preventDefault();
		var mouse = thisState.mouse;
		if (thisHandler.dropTower(mouse)){
			return;
		} else if (thisHandler.releaseButton(mouse)) {
			return;
		} else if (thisHandler.releaseTower(thisState.selectionCoors)) {
			return;
		}
		if(mouse.x < MAP_WIDTH) {
			thisState.unfocus();
			thisState.towerContext.valid = false;
		}
	}, true);
}

//Returns whether dragging tower actually started
MouseHandler.prototype.startDraggingTower = function(mouse) {
	if(this.state.focusedTower != null) {
		return false;
	}
	for (var i = 0; i < this.state.towerTypes.length; i++) {
		if (this.state.panel.optionContains(i, mouse.x, mouse.y) && this.state.money >= this.state.towerTypes[i].upgrades[0].cost) {
			this.state.draggingTower = true;
			this.state.selectionNumber = i;
			this.state.selection = this.state.towerTypes[i];
			this.state.towerDraggedOutOfOptionBox = false;

			this.state.valid = false;
			this.setDropValid(mouse);
			return true;
		}
	}
	return false;
}

//Returns whether a button was actually pressed down
MouseHandler.prototype.startPressingButton = function(mouse) {
	for (var i = 0; i < this.state.buttons.length; i++) {
		if (this.state.buttons[i].active && this.state.buttons[i].inBounds(mouse.x, mouse.y)) {
			this.state.buttonPressed = true;
			this.state.selection = this.state.buttons[i];
			//this.state.valid = false;
			return true;
		}
	}
	return false;
}

//Returns whether mouse down over a placed tower
MouseHandler.prototype.startPressingTower = function(mouse) {
	if (mouse.x <= MAP_WIDTH) {
		for (var i = 0; i < this.state.towers.length; i++) {
			if (this.state.towers[i].inBounds(mouse.x, mouse.y)) {
				this.state.selection = this.state.towers[i];
				this.state.selectionNumber = i;
				this.state.pressingTower = true;
				this.state.valid = false;
				return true;
			}
		}
	}
	return false;
}

//Returns whether currently dragging a tower
MouseHandler.prototype.dragTower = function(mouse) {
	if (this.state.draggingTower){
		if(!this.state.towerDraggedOutOfOptionBox) {
			if(!this.state.panel.optionContains(this.state.selectionNumber, mouse.x, mouse.y)) {
				this.state.towerDraggedOutOfOptionBox = true;
				this.state.panelCanvas.valid = false;
				this.state.dragCanvas.valid = false;
			}
		} else {
			this.setDropValid(mouse);
			this.state.dragCanvas.valid = false;
		}
		console.log();
		return true;
	} else {
		return false;
	}
}

//Returns whether a button is current being pressed
MouseHandler.prototype.checkButtonPressed = function(mouse) {
	if (this.state.buttonPressed) {
		if (!this.state.selection.inBounds(mouse.x, mouse.y)) {
			this.state.buttonPressed = false;
			return true;
		}
	} else {
		return false;
	}
}

//Returns whether a tower is current being pressed
MouseHandler.prototype.checkTowerPressed = function(mouse) {
	if (this.state.towerPressed) {
		if (!this.state.selection.inBounds(mouse.x, mouse.y)) {
			this.state.pressingTower = false;
			this.state.towerCanvas.valid = false;
			return true;
		}
	} else {
		return false;
	}
}

//Returns whether started hovering over a placed tower
MouseHandler.prototype.hoverTower = function(mouse) {
	if (mouse.x <= MAP_WIDTH) {
		for (var i = 0; i < this.state.towers.length; i++) {
			if (this.state.towers[i].inBounds(mouse.x, mouse.y)) {
				this.state.selection = this.state.towers[i];
				this.state.hoveringTower = true;
				this.state.towerCanvas.valid = false;
				return true;
			}
		}
	}
	return false;
}

//Returns whether hovering over a tower option
MouseHandler.prototype.hoverTowerOption = function(mouse) {
	if (this.state.focusedTower != null) {
		this.stopHovering();
		return true;
	} else if (mouse.x > PANEL_X) {
		for (var i = 0; i < this.state.towerTypes.length; i++) {
			if(this.state.panel.optionContains(i, mouse.x, mouse.y)) {
				this.state.hoveringTowerOption = true;
				this.state.selectionNumber = i;
				this.state.selection = this.state.towerTypes[i];
				this.state.panelCanvas.valid = false;
				return true;
			}
		}
	}
	return false;
	
}

//Stops hovering 
MouseHandler.prototype.stopHovering = function() {
	if (this.state.hoveringTower) {
		this.state.hoveringTower = false;
		this.state.towerCanvas.valid = false;
	}

	if (this.state.hoveringTowerOption) {
		this.state.hoveringTowerOption = false;
		this.state.panelCanvas.valid = false;
	}

	if (this.state.pressingTower) {
		this.state.pressingTower = false;
		this.state.towerCanvas.valid = false;
	}
}

MouseHandler.prototype.dropTower = function(mouse) {
	if (this.state.draggingTower) {

		if(this.state.towerDraggedOutOfOptionBox) {
			if (this.state.dropValid) {
				this.state.addTower(this.state.selection, mouse.x, mouse.y);
				this.state.money -= this.state.selection.upgrades[0].cost;
				this.state.hoveringTowerOption = false;
			}
		} else {
			this.state.hoveringTowerOption = true;
		}
		this.state.dragCanvas.valid = false;
		this.state.towerCanvas.valid = false;
		this.state.labelCanvas.valid = false;
		this.state.panelCanvas.valid = false;
		this.state.draggingTower = false;

		return true;
	}
	return false;
}

MouseHandler.prototype.releaseButton = function(mouse) {
	if (this.state.buttonPressed) {
		this.state.buttonPressed = false;
		if(this.state.selection.inBounds(mouse.x, mouse.y)) {
			this.state.selection.action(this.state);
			for (let canvas of this.state.selection.validationCanvas) {
				canvas.valid = false;
			}
			return true;
		}
	}
	return false;
}

MouseHandler.prototype.releaseTower = function(mouse) {
	if (this.state.pressingTower) {
		this.state.pressingTower = false;
		if(this.state.selection.inBounds(mouse.x, mouse.y)) {
			this.state.focusTower(this.state.selection, this.state.selectionNumber);
			return true;
		}
	}
	return false;
}

MouseHandler.prototype.setDropValid = function(mouse) {
	if(mouse.x >= MAP_WIDTH) {
		this.state.dropValid = false;
		return;
	} 
	if((this.state.selection.water ? this.state.map.getWaterPolyDist(mouse) : this.state.map.getPolyDist(mouse)) < this.state.selection.footprint) {
		this.state.dropValid = false;
		return;
	}
	
	for(let tower of this.state.towers) {
		if(Math.hypot(tower.x - mouse.x, tower.y - mouse.y) < this.state.selection.footprint + tower.type.footprint) {
			this.state.dropValid = false;
			return;
		}
	}

	this.state.dropValid = true;
}



MouseHandler.prototype.touchToMouseEvent = function(me, eventName) {
	var touch = me.touches[0];
	return new MouseEvent(eventName, {clientX: touch.clientX, clientY: touch.clientY})
}