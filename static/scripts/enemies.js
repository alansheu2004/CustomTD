var RED = new EnemyType(100, "red", null, 3, 1, 18);
var BLUE = new EnemyType(133, "skyblue", RED, 3, 2, 18);
var GREEN = new EnemyType(167, "limegreen", BLUE, 4, 3, 18);
var YELLOW = new EnemyType(333, "yellow", GREEN, 4, 4, 18);
var PINK = new EnemyType(367, "pink", YELLOW, 5, 5, 18);

function EnemyType(speed, color, child, rbe, damage, size) {
	this.speed = speed; // px per sec
	this.color = color;
	this.child = child;
	this.rbe = rbe;
	this.damage = damage;
	this.size = size;
}

function Enemy(state, type) {
	this.type = type;
	this.dist = 0;
	this.state = state;
	var point = state.path.pointOnPath(0);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.draw = function() {
	this.state.context.beginPath();
	this.state.context.arc(this.x, this.y, 13, 0, 2*Math.PI);
	this.state.context.fillStyle = this.type.color;
	this.state.context.fill();
}

//Advances the distance of enemy traveled based on speed
Enemy.prototype.updateDist = function() {
	this.dist += this.state.interval * this.type.speed/1000.0;
}

//Set x and y coordinates based on distance
Enemy.prototype.updatePosition = function() {
	var point = this.state.path.pointOnPath(this.dist);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.damage = function(id) {
	this.state.money += this.type.rbe;
	if(this.type.child == null) {
		this.state.enemies.splice(id, 1);
	} else {
		this.type = this.type.child;
	}
}