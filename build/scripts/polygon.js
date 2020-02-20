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

Polygon.prototype.contains = function(point) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point.x, y = point.y;

    var inside = false;
    for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
        var xi = this.points[i].x, yi = this.points[i].y;
        var xj = this.points[j].x, yj = this.points[j].y;

        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}