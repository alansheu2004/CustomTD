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

Polygon.prototype.distance = function(point) {
    if (this.contains(point)) {
        return 0;
    } else {
        let shortest = Infinity;
        let x = point.x;
        let y = point.y;

        for (var i = 0; i < this.points.length; i++) {
            let x1 = this.points[i].x;
            let y1 = this.points[i].y;
            let x2 = this.points[(i+1)%this.points.length].x;
            let y2 = this.points[(i+1)%this.points.length].y;

            var A = x - x1;
            var B = y - y1;
            var C = x2 - x1;
            var D = y2 - y1;

            var dot = A * C + B * D;
            var len_sq = C * C + D * D;
            var param = -1;
            if (len_sq != 0) //in case of 0 length line
              param = dot / len_sq;

            var xx, yy;

            if (param < 0) {
            xx = x1;
            yy = y1;
            }
            else if (param > 1) {
            xx = x2;
            yy = y2;
            }
            else {
            xx = x1 + param * C;
            yy = y1 + param * D;
            }

            var dx = x - xx;
            var dy = y - yy;
            shortest = Math.min(shortest, Math.sqrt(dx * dx + dy * dy));
        }

        return shortest;
    }
}