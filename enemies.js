var RED = new EnemyType(100, "red", null, 1, 1);
var BLUE = new EnemyType(133, "skyblue", RED, 1, 2);
var GREEN = new EnemyType(167, "limegreen", BLUE, 2, 3);
var YELLOW = new EnemyType(333, "yellow", GREEN, 2, 4);
var PINK = new EnemyType(367, "pink", YELLOW, 3, 5);

function EnemyType(speed, color, child, rbe, damage) {
	this.speed = speed; // px per sec
	this.color = color;
	this.child = child;
	this.rbe = rbe;
	this.damage = damage;
}

function Enemy(type) {
	this.type = type;
	this.dist = 0;
	var point = state.path.pointOnPath(0);
	this.x = point.x;
	this.y = point.y;
}

Enemy.prototype.draw = function(context) {
	context.beginPath();
	context.arc(this.x, this.y, 13, 0, 2*Math.PI);
	context.fillStyle = this.type.color;
	context.fill();
}

Enemy.prototype.updateDist = function() {
	this.dist += state.interval * this.type.speed/1000.0;
}

Enemy.prototype.updatePosition = function() {
	var point = state.path.pointOnPath(this.dist);
	this.x = point.x;
	this.y = point.y;
}