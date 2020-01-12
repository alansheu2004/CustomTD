//Each point should be an object {x:0, y: 0}
Polygon = function(points) {
    this.points = points;
}

Polygon.prototype.draw = function(context, color, lineWidth, fillOpacity) {
    context.strokeStyle = color;
    context.lineWidth = lineWidth.toString();
    context.fillStyle = color;

    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for(let point of this.points) {
        context.lineTo(point.x, point.y);
    }
    context.closePath();

    if (fillOpacity < 1) {
        context.filter = "opacity(" + fillOpacity + ")";
    }
    context.fill();
    context.filter = "none";
    context.stroke();
}

Polygon.prototype.addPoint = function(x,y) {
    this.points.push({x:x, y:y});
}