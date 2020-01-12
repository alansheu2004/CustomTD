var RED = new EnemyType(200, "red", null, 1, 1, 22);
var BLUE = new EnemyType(266, "skyblue", RED, 1, 2, 24);
var GREEN = new EnemyType(333, "limegreen", BLUE, 2, 3, 26);
var YELLOW = new EnemyType(667, "yellow", GREEN, 2, 4, 38);
var PINK = new EnemyType(733, "pink", YELLOW, 3, 5, 30);

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
	var point = state.map.path.pointOnPath(0);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.draw = function() {
	this.state.context.beginPath();
	this.state.context.arc(this.x, this.y, this.type.size, 0, 2*Math.PI);
	this.state.context.fillStyle = this.type.color;
	this.state.context.fill();
}

//Advances the distance of enemy traveled based on speed
Enemy.prototype.updateDist = function() {
	this.dist += this.state.interval * this.type.speed/1000.0;
}

//Set x and y coordinates based on distance
Enemy.prototype.updatePosition = function() {
	var point = this.state.map.path.pointOnPath(this.dist);
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