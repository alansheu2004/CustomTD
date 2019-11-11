function Path(data) {
	this.start_x = data.start_x;
	this.start_y = data.start_y;
	this.steps = data.steps;
	
	this.stepLengths = [];
	this.stepXs = [];
	this.stepYs = [];
	this.totalLength = 0;

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
Path.prototype.draw = function(context) {
	context.lineWidth = "2";
	context.strokeStyle = "green";
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
});