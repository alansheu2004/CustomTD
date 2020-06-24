const FREEZE_PULSE = new PulseType(null, 0.5, 120, 0, [{"type":FREEZE, "time":1}], [], "#66ccff");
const DEEP_FREEZE_PULSE = new PulseType(null, 0.5, 120, 0, [{"type":FREEZE, "time":1}, {"type":COLD, "time":1.5}], [], "#66ccff");

const CABBAGE_EXPLOSION = new PulseType(null, 0.25, 60, 1, [], [], "#42a653");
const MELON_EXPLOSION = new PulseType(CABBAGE_EXPLOSION, INHERIT, INHERIT, 2, [], [], INHERIT);

function PulseType(base, time, radius, damage, effects, attacks, color) {
    this.time = time; //time to expand to radius
    this.radius = radius;
    this.damage = damage;
    this.effects = effects; // {type, time}
    this.attacks = attacks;
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
function PulseAttack(pulsetype, cooldown, angleWidth, target) { //Targets a specific angle, default if null
    this.type = "pulse";
    this.pulsetype = pulsetype;
    this.cooldown = cooldown;
    this.angleWidth = angleWidth;
    this.target = target;
}

function Pulse(state, type, tower, x, y, angle, angleWidth) {
    this.state = state;
    this.type = type;
    this.tower = tower;
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
    var radius = this.type.radius * this.time/(1000*this.type.time)
    
    if(this.time > 1000*this.type.time) { // not >= for 0 second immediate pulses
        return true;
    }
    
    for (var i = 0; i < this.state.enemies.length; i++) {
        var enemy = this.state.enemies[i];
        if (!this.damagedEnemies.includes(enemy)) {
            if (Math.hypot(enemy.x - this.x, enemy.y - this.y) <= enemy.type.size + radius) {
                if (this.type.damage > 0) {
                    enemy.damage(i, this.type.damage);
                }
                for (let effect of this.type.effects) {
                    enemy.addEffect(effect.type, effect.time*1000);
                }
                this.damagedEnemies.push(enemy);

                for (let attack of this.type.attacks) {
                    tower.addAttack(attack, attack.target||Math.atan2(enemy.y-this.y, enemy.x-this.x), enemy.x, enemy.y);
                }
            }
        }
    }
    
    return false;
}

Pulse.prototype.draw = function() {
    this.type.draw(this.state.attackContext, this.x, this.y, this.type.radius * this.time/(1000*this.type.time), this.angle, this.angleWidth);
}