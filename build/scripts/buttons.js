function Button(state, inBounds, action, active) {
    this.state = state;
    this.inBounds = inBounds;
    this.action = action;
    this.active = active;
}

const RESTART_BUTTON = new Button(this, 
    function(x, y) { //inbounds
        return x>=RESTART_BUTTON_MID_X-RESTART_BUTTON_W/2 && x<=RESTART_BUTTON_MID_X+RESTART_BUTTON_W/2 &&
        y>=RESTART_BUTTON_MID_Y-RESTART_BUTTON_H/2 && y<=RESTART_BUTTON_MID_Y+RESTART_BUTTON_H/2;
    },
    function(state) { //action
        state.restartButton.active = false; window.clearInterval(state.loop); init();
    },
    false);