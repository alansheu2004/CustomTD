function MouseHandler(state) {
	var thisState = state;
	var thisHandler = this;

	this.state = state;

    //Disables double clicking on the canvas to select text
	state.canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	
	state.canvas.addEventListener('mousedown', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.startDraggingTower(mouse)) {
			return;
		} else if (thisHandler.startPressingButton(mouse)) {
			return;
		}
	}, true);

	state.canvas.addEventListener('mousemove', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.dragTower(mouse)){
			return;
		} else if (thisHandler.checkButtonPressed(mouse)) {
			return;
		} else if (thisHandler.hoverTowerOption(mouse)) {
			return;
		} else if (thisHandler.hoverTower(mouse)) {
			return;
		} 
		
		thisHandler.stopHovering();
	}, true);

	state.canvas.addEventListener('mouseup', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisHandler.dropTower(mouse)){
			return;
		} else if (thisHandler.releaseButton(mouse)) {
			return;
		}
	}, true);



	state.canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisHandler.touchToMouseEvent(e, 'mousedown'));
		if (thisHandler.startDragging(mouse)) {
			
		} else if (thisHandler.towerHovering(mouse)) {
			return;
		} else if (thisHandler.optionHovering(mouse)) {
			return;
		}
		//Stops focusing if nothing returned
		thisHandler.stopFocusing();
	}, true);

	state.canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisHandler.touchToMouseEvent(e, 'mousemove'));
		if (thisHandler.moveDragging(mouse)){
			//Do nothing
		} 
	}, true);

	state.canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		var mouse = thisState.mouse;
		if (thisHandler.dropTowerTouch(mouse)){
			return;
		} else if (thisHandler.releaseButton(mouse)) {
			return;
		}
	}, true);
}

//Returns whether dragging tower actually started
MouseHandler.prototype.startDraggingTower = function(mouse) {
	for (var i = 0; i < this.state.towerTypes.length; i++) {
		if (this.state.panel.optionContains(i, mouse.x, mouse.y) && this.state.money >= this.state.towerTypes[i].cost) {
			this.state.draggingTower = true;
			this.state.selectionNumber = i;
			this.state.selection = this.state.towerTypes[i];
			this.state.towerDraggedOutOfOptionBox = false;

			this.state.valid = false;
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

			this.state.valid = false;
			return true;
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
				this.state.valid = false;
			}
		} else {
			this.state.valid = false;
		}
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
			this.state.valid = false;
			return true;
		}
	} else {
		return false;
	}
}

//Returns whether started hovering over aplaced tower
MouseHandler.prototype.hoverTower = function(mouse) {
	if (mouse.x <= MAP_WIDTH) {
		for (var i = 0; i < this.state.towers.length; i++) {
			if (this.state.towers[i].inBounds(mouse.x, mouse.y)) {
				this.state.selection = this.state.towers[i];
				this.state.hoveringTower = true;
				this.state.valid = false;
				return true;
			}
		}
	}
	return false;
}

//Returns whether hovering over a tower option
MouseHandler.prototype.hoverTowerOption = function(mouse) {
	if (mouse.x > PANEL_X) {
		for (var i = 0; i < this.state.towerTypes.length; i++) {
			if(this.state.panel.optionContains(i, mouse.x, mouse.y)) {
				this.state.hoveringTowerOption = true;
				this.state.selectionNumber = i;
				this.state.selection = this.state.towerTypes[i];
				this.state.valid = false;
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
		this.state.valid = false;
	}

	if (this.state.hoveringTowerOption) {
		this.state.hoveringTowerOption = false;
		this.state.valid = false;
	}
}

MouseHandler.prototype.dropTower = function(mouse) {
	if (this.state.draggingTower) {

		if(this.state.towerDraggedOutOfOptionBox) {
			if (mouse.x <= MAP_WIDTH) {
				this.state.addTower(this.state.selection, mouse.x, mouse.y);
				this.state.money -= this.state.selection.cost;
			}
		}
		this.state.valid = false;
		this.state.draggingTower = false;
		return true;
	}
	return false;
}

MouseHandler.prototype.dropTowerTouch = function(mouse) {
	if (this.state.dragging){
		if(this.state.draggedOutOfOption) {
			if (mouse.x < 480) {
				this.state.towers.push(new Tower(this.state, this.state.selection, mouse.x, mouse.y));
				this.state.money -= this.state.selection.cost;
			}
			this.state.valid = false;
			this.state.dragging = false;
			return true;
		} else {
			this.state.optionFocusing = true;
			this.state.dragging = false;
		}
		this.state.valid = false;
		return true;
	}
	return false;
}

MouseHandler.prototype.releaseButton = function(mouse) {
	if (this.state.buttonPressed) {
		this.state.buttonPressed = false;
		if(this.state.selection.inBounds(mouse.x, mouse.y)) {
			this.state.selection.action(this.state);
			this.state.valid = false;
			return true;
		}
	}
	return false;
}



MouseHandler.prototype.touchToMouseEvent = function(me, eventName) {
	var touch = me.touches[0];
	return new MouseEvent(eventName, {clientX: touch.clientX, clientY: touch.clientY})
}