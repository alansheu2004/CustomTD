function ProjectileType(state, pierce) {
	this.state = state;
}

function Projectile(state, type, x, y, angle) {
	this.state = state;
	this.pierce = pierce;
	this.angle = angle;
	this.x = x;
	this.y = y;
}

Projectile.prototype.draw = function(context) {
	context.fillStyle = "rgb(0, 0, 0)";
	context.beginPath();
	context.arc(x, y, 5, 0, 2*Math.PI);
	context.fill();
}