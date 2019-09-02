function Button(state, inBounds, draw, action, active) {
    this.state = state;
    this.inBounds = inBounds;
    this.draw = draw;
    this.action = action;
    this.active = active;
}

const RESTART_BUTTON = new Button(this, 
    function(x, y) { //inbounds
        return x>=RESTART_BUTTON_MID_X-RESTART_BUTTON_W/2 && x<=RESTART_BUTTON_MID_X+RESTART_BUTTON_W/2 &&
        y>=RESTART_BUTTON_MID_Y-RESTART_BUTTON_H/2 && y<=RESTART_BUTTON_MID_Y+RESTART_BUTTON_H/2;
    }, function(context) { //draw
        context.fillStyle = "#a6703c";
		context.strokeStyle = "#664321";
		context.lineWidth = 5;
		context.fillRect(RESTART_BUTTON_MID_X-RESTART_BUTTON_W/2, RESTART_BUTTON_MID_Y-RESTART_BUTTON_H/2, RESTART_BUTTON_W, RESTART_BUTTON_H);
		context.strokeRect(RESTART_BUTTON_MID_X-RESTART_BUTTON_W/2, RESTART_BUTTON_MID_Y-RESTART_BUTTON_H/2, RESTART_BUTTON_W, RESTART_BUTTON_H);

		context.font = "small-caps " + 0.8*RESTART_BUTTON_H + "px Oeztype";
		context.textAlign = "center";
		context.fillStyle = "#664321";
		context.fillText("Restart", RESTART_BUTTON_MID_X, RESTART_BUTTON_MID_Y+0.3*RESTART_BUTTON_H);
    },
    function(state) { //action
        state.restartButton.active = false; window.clearInterval(state.loop); init();
    },
    false);