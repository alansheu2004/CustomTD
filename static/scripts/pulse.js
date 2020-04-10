const FREEZE_PULSE = new PulseType(null, 0.75, 120, [{"type":FREEZE, "time":1}], "#66ccff");

function PulseType(base, time, radius, effects, color) {
    this.time = time*1000; //time to expand to radius
    this.radius = radius;
    this.effects = effects; // {type, time}
    this.color = color;

    if(base) {
        for(let key of Object.keys(this)) {
            if(this[key] == INHERIT) {
                this[key] = base[key];
            }
        }
    }
}

const PULSE_GRAD_THICKNESS = 20;
PulseType.prototype.draw = function(context, x, y, radius, angle, angleWidth) {
    var grad = context.createRadialGradient(x, y, Math.max(0, radius-PULSE_GRAD_THICKNESS), x, y, radius);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, this.color);
    context.fillStyle = grad;

    context.beginPath();
    context.moveTo(x + Math.cos(angle-angleWidth/2), y+Math.sin(angle-angleWidth/2));
    context.arc(x, y, radius, angle-angleWidth/2, angleWidth);
    context.fill();
}

/*
    Dispersion can be:
    {type:"single"} A single projectile
    {type:"spray", number, angle} Sprays multiple projectiles with angle between them
    {type:"radial", number} Evenly shoots multiple projectiles in all directions
*/
function PusleAttack(pulsetype, cooldown, angleWidth, target) { //Targets a specific angle, default if null
    this.type = "pulse";
    this.pulsetype = pulsetype;
    this.cooldown = cooldown;
    this.angleWidth = angleWidth;
    this.target = target;
}

function Pulse(state, type, x, y, angle, angleWidth) {
    this.state = state;
    this.type = type;
    this.angle = angle;
    this.angleWidth = angleWidth;
    this.type = type;
    this.x = x;
    this.y = y;
    this.damagedEnemies = [];
    this.time = 0;
}

//Will return whether this projectiles should be deleted
Pulse.prototype.update = function() {
    this.time += this.state.interval;
    var radius = this.type.radius * this.time/this.type.time
    
    if(this.time > this.type.time) { // not >= for 0 second immediate pulses
        return true;
    }
    
    for (var i = 0; i < this.state.enemies.length; i++) {
        var enemy = this.state.enemies[i];
        if (!this.damagedEnemies.includes(enemy)) {
            if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size + radius) {
                enemy.damage(i, this.type.damage);
                for (let effect of this.type.effects) {
                    enemy.addEffect(effect.type, effect.time*1000);
                }
                this.damagedEnemies.push(enemy);
            }
        }
    }
    
    return false;
}

Pulse.prototype.draw = function() {
    this.type.draw(this.state.context, this.x, this.y, this.type.radius * this.time/this.type.time, this.angle, this.angleWidth);
}