function MouseHandler(state) {
	var thisState = state;

    //Disables double clicking on the canvas to select text
	state.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
	
	
	state.addEventListener('mousedown', function(e) {
		var mouse = thisState.setMouse(e);
		if (!thisState.startDragging(mouse)) {
			return;
		}
	}, true);

	canvas.addEventListener('mousemove', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.moveDragging(mouse)){
			//Do nothing
		} else if (thisState.towerHovering(mouse)) {
			return;
		} else if (thisState.optionHovering(mouse)) {
			return;
		}
		//Stops focusing if nothing returned
		thisState.stopFocusing();
	}, true);

	state.addEventListener('mouseup', function(e) {
		var mouse = thisState.setMouse(e);
		if (thisState.dropTower(mouse)){
			return;
		} else if (thisState.releaseButton(mouse)) {
			return;
		}
	}, true);



	canvas.addEventListener('touchstart', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisState.touchToMouseEvent(e, 'mousedown'));
		if (thisState.startDragging(mouse)) {
			
		} else if (thisState.towerHovering(mouse)) {
			return;
		} else if (thisState.optionHovering(mouse)) {
			return;
		}
		//Stops focusing if nothing returned
		thisState.stopFocusing();
	}, true);

	canvas.addEventListener('touchmove', function(e) {
		e.preventDefault();
		var mouse = thisState.setMouse(thisState.touchToMouseEvent(e, 'mousemove'));
		if (thisState.moveDragging(mouse)){
			//Do nothing
		} 
	}, true);

	canvas.addEventListener('touchend', function(e) {
		e.preventDefault();
		var mouse = thisState.mouse;
		if (thisState.dropTowerTouch(mouse)){
			return;
		} else if (thisState.releaseButton(mouse)) {
			return;
		}
	}, true);
}

//Returns whether dragging tower actually started
CanvasState.prototype.startDragging = function(mouse) {
	if (!this.dragging) {
		for (var i = 0; i < this.towerTypes.length; i++) {
			if (this.panel.optionContains(i, mouse.x, mouse.y) && this.money >= this.towerTypes[i].cost) {
				this.dragging = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.draggedOutOfOption = false;
				this.valid = false;
				return true;
			}
		}

		for (var i = 0; i < this.buttons.length; i++) {
			
			if (this.buttons[i].active && this.buttons[i].inBounds(mouse.x, mouse.y)) {
				this.buttonPressed = true;
				this.selection = this.buttons[i];
				this.valid = false;
				return true;
			}
		}
		//Not selected any option
		return false;
	} else {
		this.valid = false;
		return true;
	}
}

//Returns whether currently dragging
CanvasState.prototype.moveDragging = function(mouse) {
	if (this.dragging){
		if(!this.draggedOutOfOption) {
			if(!this.panel.optionContains(this.selectionNumber, mouse.x, mouse.y)) {
				this.draggedOutOfOption = true;
			}
		}
		this.valid = false;
		return true;
	} else if (this.buttonPressed){
		if (!this.selection.inBounds(mouse.x, mouse.y)) {
			this.buttonPressed = false;
			this.valid = false;
			return true;
		}
	} else {
		return false;
	}
}

CanvasState.prototype.towerHovering = function(mouse) {
	if (mouse.x <= 480) {
		for (var i = 0; i < this.towers.length; i++) {
			if (this.towers[i].inBounds(mouse.x, mouse.y)) {
				this.selection = this.towers[i];
				this.focusing = true;
				this.valid = false;
				return true;
			}
		}
	}
	return false;
}

CanvasState.prototype.optionHovering = function(mouse) {
	if (mouse.x > 480) {
		for (var i = 0; i < this.towerTypes.length; i++) {
			if(this.panel.optionContains(i, mouse.x, mouse.y)) {
				this.optionFocusing = true;
				this.selectionNumber = i;
				this.selection = this.towerTypes[i];
				this.valid = false;
				return true;;
			}
		}
	}
	return false;
	
}

CanvasState.prototype.stopFocusing = function() {
	if (this.focusing) {
		this.focusing = false;
		this.valid = false;
	}

	if (this.optionFocusing) {
		this.optionFocusing = false;
		this.valid = false;
	}
}

CanvasState.prototype.dropTower = function(mouse) {
	if (this.dragging){
		if(this.draggedOutOfOption) {
			if (mouse.x < 480) {
				this.towers.push(new Tower(this, this.selection, mouse.x, mouse.y));
				this.money -= this.selection.cost;
			}
			this.valid = false;
			this.dragging = false;
			return true;
		} else {
			this.draggedOutOfOption = true;
			this.dragging = true;
		}
		this.valid = false;
		return true;
	}
	return false;
}

CanvasState.prototype.dropTowerTouch = function(mouse) {
	if (this.dragging){
		if(this.draggedOutOfOption) {
			if (mouse.x < 480) {
				this.towers.push(new Tower(this, this.selection, mouse.x, mouse.y));
				this.money -= this.selection.cost;
			}
			this.valid = false;
			this.dragging = false;
			return true;
		} else {
			this.optionFocusing = true;
			this.dragging = false;
		}
		this.valid = false;
		return true;
	}
	return false;
}

CanvasState.prototype.releaseButton = function(mouse) {
	if (this.buttonPressed) {
		this.buttonPressed = false;
		if(this.selection.inBounds(mouse.x, mouse.y)) {
			this.selection.action(this);
			this.valid = false;
			return true;
		}
	}
	return false;
}



CanvasState.prototype.touchToMouseEvent = function(me, eventName) {
	var touch = me.touches[0];
	return new MouseEvent(eventName, {clientX: touch.clientX, clientY: touch.clientY})
}