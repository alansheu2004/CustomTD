    Map = function(background,
				path,
				obstacles,
				waters) {
	this.background = new Image();
	this.background.src = background;
	this.path = path;
	this.obstacles = obstacles;
	this.waters = waters;
    this.polydist = this.setPolyDist(); //2 dimensional boolean array of whether a point is on the bath.boundaries (every 10 points)
    this.waterpolydist = this.setWaterPolyDist();
}

Map.prototype.drawPath = function(context, color, lineWidth) {
    this.path.draw(context, color, lineWidth)
}

Map.prototype.drawPathBoundary = function(context, color, lineWidth, fillOpacity) {
    this.path.drawBoundary(context, color, lineWidth, fillOpacity);
}

Map.prototype.drawObstacles = function (context, color, lineWidth, fillOpacity) {
    for (let obstacle of this.obstacles) {
        obstacle.draw(context, color, lineWidth, fillOpacity);
    }
}

Map.prototype.drawWaterBoundary = function (context, color, lineWidth, fillOpacity) {
    for (let poly of this.waters) {
        poly.draw(context, color, lineWidth, fillOpacity);
    }
}

Map.prototype.setPolyDist = function() {
    var rows = [];
    for(var i = 0; i <= MAP_HEIGHT/MAP_TOWER_GRAIN; i++) {
        var row = []

        outerLoop:
        for(var j = 0; j <= MAP_WIDTH/MAP_TOWER_GRAIN; j++) {
            let distance = this.path.boundary.distance({x: MAP_TOWER_GRAIN*j, y: MAP_TOWER_GRAIN*i});
            if (distance <= 0) {
                row.push(0);
                continue;
            }

            for (let obstacle of this.obstacles) {
                distance = Math.min(distance, obstacle.distance({x: MAP_TOWER_GRAIN*j, y: MAP_TOWER_GRAIN*i}));
                if (distance <= 0) {
                    row.push(0);
                    continue outerLoop;
                }
            }

            for (let water of this.waters) {
                distance = Math.min(distance, water.distance({x: MAP_TOWER_GRAIN*j, y: MAP_TOWER_GRAIN*i}));
                if (distance <= 0) {
                    row.push(0);
                    continue outerLoop;
                }
            }
            row.push(distance);
        }

        rows.push(row);
    }
    return rows;
}

Map.prototype.getPolyDist = function(point) {
    var x = point.x;
    var y = point.y;

    return this.polydist[Math.round(y/MAP_TOWER_GRAIN)][Math.round(x/MAP_TOWER_GRAIN)];
}

Map.prototype.setWaterPolyDist = function() {
    var rows = [];
    for(var i = 0; i <= MAP_HEIGHT/MAP_TOWER_GRAIN; i++) {
        var row = []

        outerLoop:
        for(var j = 0; j <= MAP_WIDTH/MAP_TOWER_GRAIN; j++) {
            let inwater = false;
            for (let water of this.waters) {
                if (water.contains({x:MAP_TOWER_GRAIN*j, y:MAP_TOWER_GRAIN*i})) {
                    inwater = true;
                    break;
                }
            }
            if(!inwater) {
                row.push(0);
                continue;
            }

            let distance = this.path.boundary.distance({x: MAP_TOWER_GRAIN*j, y: MAP_TOWER_GRAIN*i});
            if (distance <= 0) {
                row.push(0);
                continue;
            }

            for (let obstacle of this.obstacles) {
                distance = Math.min(distance, obstacle.distance({x: MAP_TOWER_GRAIN*j, y: MAP_TOWER_GRAIN*i}));
                if (distance <= 0) {
                    row.push(0);
                    continue outerLoop;
                }
            }

            row.push(distance);
        }

        rows.push(row);
    }
    return rows;
}

Map.prototype.getWaterPolyDist = function(point) {
    var x = point.x;
    var y = point.y;

    return this.waterpolydist[Math.round(y/MAP_TOWER_GRAIN)][Math.round(x/MAP_TOWER_GRAIN)];
}


// const defaultMap = new Map("images/map.png",
// 	defaultPath,
// 	[new Polygon([{x:0, y:480}, {x:355, y:720}, {x:0, y:720}]),
//         new Polygon([{x:960, y:460}, {x:840, y:615}, {x:780, y:600}, {x:500, y:720}, {x:960, y:720}]),
//         new Polygon([{x:505, y:495}, {x:510, y:450}, {x:450, y:435}, {x:430, y:450}, {x:440, y:500}]),
//         new Polygon([{x:700, y:320}, {x:825, y:185}, {x:935, y:220}, {x:900, y:290}]),
//         new Polygon([{x:635, y:5}, {x:640, y:105}, {x:770, y:60}]),
//         new Polygon([{x:195, y:295}, {x:220, y:250}, {x:270, y:280}, {x:265, y:310}]),
//         new Polygon([{x:0, y:120}, {x:55, y:100}, {x:90, y:0}, {x:0, y:0}]),
//         new Polygon([{x:170, y:65}, {x:130, y:95}, {x:145, y:175}, {x:220, y:190}])
//         ],
// 	[new Polygon([{x:185, y:0}, {x:250, y:95}, {x:260, y:220}, {x:495, y:440}, {x:655, y:540}, {x:655, y:650}, {x:715, y:650}, {x:700, y:495}, {x:645, y:431}, {x:550, y:390}, {x:300, y:130}, {x:370, y:110}, {x:535, y:0}])]
// );

const defaultMap = new Map("images/pool.png",
	defaultPath,
	[
        new Polygon([{x:960, y:0}, {x:960, y:105}, {x:620, y:65},{x:220, y:70}, {x:50, y:124}, {x:22, y:255}, {x:0, y:260}, {x:0, y:0}]),
        new Polygon([{x:500, y:345}, {x:600, y:350}, {x:550, y:525},{x:450, y:515}])
    ],
	[
        new Polygon([{x:95, y:335}, {x:95, y:515}, {x:960, y:515}, {x:960, y:335}])
    ]
);