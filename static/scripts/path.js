function Path(data) {
	this.start_x = data.start_x;
	this.start_y = data.start_y;
	this.steps = data.steps;
	
	this.stepLengths = [];
	this.stepXs = [];
	this.stepYs = [];
	this.totalLength = 0;

	this.width = data.width;
	this.boundary = this.getBoundary();

	this.setStepProperties();
}

//Returns the coordinates given a distance traveled on the path
Path.prototype.pointOnPath = function(dist) {
	var counter = 0;
	var totalDistance = 0;
	while(dist > totalDistance + this.stepLengths[counter]) {
		totalDistance += this.stepLengths[counter];
		counter++;
	}
	
	return this.pointOnStep(counter, this.steps[counter], dist-totalDistance);
	
}

//Returns the coordinates given a distance traveled on a step
Path.prototype.pointOnStep = function(num, step, dist) {
	switch(step.type) {
		case "line":
			return {x: this.stepXs[num] + (step.x-this.stepXs[num])*(dist/this.stepLengths[num]), y: this.stepYs[num] + (step.y-this.stepYs[num])*(dist/this.stepLengths[num])};
			break;
		case "arc":
			var multiplier = 1;
			
			if(step.widdershins) {
				return [step.center_x - step.radius * Math.cos(step.angle_s + dist/step.radius), step.center_y + step.radius * Math.sin(step.angle_s + dist/step.radius)];
			} else {
				return [step.center_x - step.radius * Math.cos(step.angle_s + dist/step.radius), step.center_y + step.radius * Math.sin(step.angle_s + dist/step.radius)];
			}
			break;
	}
}

//Calculates thelengths and starting points for all steps
Path.prototype.setStepProperties = function() {
	var x = this.start_x;
	var y = this.start_y;
	var length = 0;
	this.stepXs.push(x);
	this.stepYs.push(y);
	
	for (let step of this.steps) {
		switch(step.type) {
			case "line":
				length = Math.hypot(step.x-x, step.y-y);
				
				x = step.x;
				y = step.y;
				break;
			case "arc":
				if(step.widdershins) {
					length = 2 * Math.PI * step.radius * (2*Math.PI - (step.angle_e - step.angle_s))/(2*Math.PI);
				}else {
					length = 2 * Math.PI * step.radius * (step.angle_e - step.angle_s)/(2*Math.PI);
				}
				length %= 2 * Math.PI * step.radius;
				x = step.center_x + step.radius * Math.cos(step.angle_e);
				y = step.center_y + step.radius * Math.sin(step.angle_e);
				break;
		}
		
		this.stepLengths.push(length);
		this.totalLength += length;
		this.stepXs.push(x);
		this.stepYs.push(y);
	}
}

//Draws the path (currently not used)
Path.prototype.draw = function(context, color, lineWidth) {
	context.lineWidth = lineWidth.toString();
	context.strokeStyle = color;
	context.beginPath();
	
	context.moveTo(this.start_x, this.start_y);
	for (let step of this.steps) {
		switch(step.type) {
			case "line":
				context.lineTo(step.x, step.y);
				break;
			case "arc":
				context.arc(step.center_x, step.center_y, step.radius, step.angle_s, step.angle_e, step.widdershins);
				break;
			case "quadratic":
				context.quadraticCurveTo(step.control_x, step.control_y, step.end_x, step.end_y);
				break;
			case "cubic":
				context.bezierCurveTo(step.control1_x, step.control1_y, step.control2_x, step.control2_y, step.end_x, step.end_y);
				break;
		}
	}
	
	context.stroke();
}

//Draws the Starting points for each step (currently not used)
function drawCriticalPoints(context) {
	context.strokeStyle = "blue";
	context.fillStyle = "blue";
	context.lineWidth = 1;
	for (i=0 ; i<stepXs.length ; i++) {
		context.beginPath();
		context.arc(stepXs[i], stepYs[i], 3, 0, 2*Math.PI);
		context.fill();
	}
}

Path.prototype.getBoundary = function(context, color, lineWidth, fillOpacity) {
    var poly = new Polygon([]);

    var angles = [Math.atan2(this.steps[0].y-this.start_y, this.steps[0].x-this.start_x)];
    for (var i = 0; i<this.steps.length-1; i++) {
    	angles.push(Math.atan2(this.steps[i+1].y-this.steps[i].y, this.steps[i+1].x-this.steps[i].x));
 	}

    if(this.start_x == MAP_X || this.start_x == MAP_WIDTH) {
    	poly.addPoint(
    		this.start_x, 
    		this.start_y - (1/Math.cos(angles[0])) * this.width/2
    	);
    	poly.addPoint(
    		this.start_x, 
    		this.start_y + (1/Math.cos(angles[0])) * this.width/2
    	)
    } else if(this.start_y == MAP_Y || this.start_y == MAP_HEIGHT) {
    	poly.addPoint(
    		this.start_x - (1/Math.sin(angles[0])) * this.width/2,
    		this.start_y 
    	);
    	poly.addPoint(
    		this.start_x + (1/Math.sin(angles[0])) * this.width/2,
    		this.start_y 
    	)
    }

    for(var i = 0; i<this.steps.length; i++) {
    	var angle = (angles[i]+angles[i+1])/2 + Math.PI/2;
    	var mag = (1/Math.sin(angle - angles[i+1])) * this.width/2;
    	poly.addPoint(
    		this.steps[i].x + mag*Math.cos(angle),
    		this.steps[i].y + mag*Math.sin(angle)
    	);
    }

    var end = this.steps[this.steps.length - 1];
    var lastAngle = angles[angles.length - 1];

    if(end.x == MAP_X || end.x == MAP_WIDTH) {
    	poly.addPoint(
    		end.x, 
    		end.y + (1/Math.cos(lastAngle)) * this.width/2
    	);
    	poly.addPoint(
    		end.x, 
    		end.y - (1/Math.cos(lastAngle)) * this.width/2
    	)
    } else if(end.y == MAP_Y || end.y == MAP_HEIGHT) {
    	poly.addPoint(
    		end.x + (1/Math.sin(lastAngle)) * this.width/2, 
    		end.y
    	);
    	poly.addPoint(
    		end.x - (1/Math.sin(lastAngle)) * this.width/2, 
    		end.y
    	)
    }

    for(var i = this.steps.length-1; i>=0; i--) {
    	var angle = (angles[i]+angles[i+1])/2 + Math.PI/2;
    	var mag = (1/Math.sin(angle - angles[i+1])) * this.width/2;
    	poly.addPoint(
    		this.steps[i].x - mag*Math.cos(angle),
    		this.steps[i].y - mag*Math.sin(angle)
    	);
    }

    return poly;
}

Path.prototype.drawBoundary = function(context, color, lineWidth, fillOpacity) {
	this.boundary.draw(context, color, lineWidth, fillOpacity);
}

var defaultPath = new Path({
	start_x : 0,
	start_y : 360,
	steps : [
		{
			type : "line",
			x : 320,
			y : 360
		},
		{
			type : "line",
			x : 480,
			y : 90
		},
		{
			type : "line",
			x : 720,
			y : 180
		},
		{
			type : "line",
			x : 240,
			y : 540
		},
		{
			type : "line",
			x : 480,
			y : 630
		},
		{
			type : "line",
			x : 640,
			y : 360
		},
		{
			type : "line",
			x : 960,
			y : 360
		},
	],
	width : 60
});