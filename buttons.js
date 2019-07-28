function Button(state, inBounds, action, active) {
    this.state = state;
    this.inBounds = inBounds;
    this.action = action;
    this.active = active || true;
}