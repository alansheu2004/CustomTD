var RED = new EnemyType(150, null, 1, 1, 22,
	"images/red.svg", 36, 48);
var BLUE = new EnemyType(200, RED, 1, 2, 23,
	"images/blue.svg", 38, 51);
var GREEN = new EnemyType(300, BLUE, 2, 3, 24,
	"images/green.svg", 40, 54);
var YELLOW = new EnemyType(500, GREEN, 2, 4, 26,
	"images/yellow.svg", 42, 57);
var PINK = new EnemyType(600, YELLOW, 3, 5, 28,
	"images/pink.svg", 44, 60);

function EnemyType(speed, child, rbe, damage, size,
					image, imgwidth, imgheight) {
	this.speed = speed; // px per sec
	this.child = child;
	this.rbe = rbe;
	this.damage = damage;
	this.size = size;

	this.image = new Image();
	this.image.src = image;
	this.imgwidth = imgwidth;
	this.imgheight = imgheight;
}

EnemyType.prototype.draw = function(context, x, y) {
	context.drawImage(this.image, x - this.imgwidth/2, y - this.imgheight/2, this.imgwidth, this.imgheight);
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
	this.type.draw(this.state.context, this.x, this.y);
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