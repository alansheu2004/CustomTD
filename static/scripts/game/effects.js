function Effect(base, speedMultiplier) {
    this.speedMultiplier = speedMultiplier;

    if(base) {
        for(let key of Object.keys(this)) {
            if(this[key] == INHERIT) {
                this[key] = base[key];
            }
        }
    }
}

const FREEZE = new Effect(null, 0);
const COLD = new Effect(null, 0.5);

const FLUSTERED = new Effect(null, 0.75);