var glassPane = document.getElementById("glassPane");

var dragMap = document.getElementById("dragMap");
var closeDragMapPopup = document.getElementById("closeDragMapPopup");
var dragMapDisplay = document.getElementById("dragMapDisplay");
var dragMapPanel = document.getElementById("dragMapPanel");
var pointGroup = document.getElementById("pointGroup");
var pointDivTemplate = document.getElementById("pointDivTemplate");

var editPathButton = document.getElementById("editPath");
var editObstaclesButton = document.getElementById("editObstacles");

var selectedElement = null;
var pt = dragMapDisplay.createSVGPoint();
var dx = 0;
var dy = 0;

function setUpDragMapInputs() {

    closeDragMapPopup.addEventListener("click", function() {
        dragMapDisplay.textContent = "";
        pointGroup.textContent = "";
        glassPane.style.display = "none";
    })

    //Edit Path
    editPathButton.addEventListener("click", function() {
        dragMap.style.display = "flex";
        dragMapPanel.children[0].textContent = "Edit Path";

        let polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        dragMapDisplay.appendChild(polyline);
        let circleGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        circleGroup.classList.add("pathCircleGroup")
        dragMapDisplay.appendChild(circleGroup);

        for (let point of currentState.game.map.path.points) {
            addPoint(point, currentState.game.map.path.points, pointGroup, polyline, circleGroup, MAX_PATH_LENGTH);
        }

        showDragMap();
    });

    //Edit Obstacles
    editObstaclesButton.addEventListener("click", function() {
        dragMap.style.display = "flex";
        dragMapPanel.children[0].textContent = "Edit Obstacles";

        for(let obstacle of currentState.game.map.obstacles) {
            let pointSubgroup = document.createElement("div");
            pointSubgroup.classList.add("pointSubgroup");
            pointGroup.appendChild(pointSubgroup);
            let polygon = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
            polygon.classList.add("obstacle");
            dragMapDisplay.appendChild(polygon);
            let circleGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            circleGroup.classList.add("obstacleCircleGroup")
            dragMapDisplay.appendChild(circleGroup);
            for(let point of obstacle.points) {
                addPoint(point, obstacle.points, pointSubgroup, polygon, circleGroup, MAX_OBSTACLE_LENGTH);
            }
        }
        
        showDragMap();
    });

    dragMapDisplay.addEventListener('mouseup', function(e) {
        selectedElement = null;
    });
}

function addPoint(point, pointList, group, polyline, circleGroup, max, newIndex) {
    let svgPoint = dragMapDisplay.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    if(newIndex && newIndex<polyline.points.length) {
        polyline.points.insertItemBefore(svgPoint, newIndex);
    } else {
        polyline.points.appendItem(svgPoint);
    }

    let circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    if(newIndex && newIndex<circleGroup.length) {
        circleGroup.insertBefore(circle, circleGroup.children[newIndex]);
    } else {
        circleGroup.appendChild(circle);
    }

    let pointDiv = pointDivTemplate.cloneNode(true);
    pointDiv.id = "";
    pointDiv.point = point;
    pointDiv.addEventListener("mouseover", function() {circle.classList.add("hovered")});
    pointDiv.addEventListener("mouseout", function() {circle.classList.remove("hovered")});
    if(newIndex && newIndex<group.children.length) {
        group.insertBefore(pointDiv, group.children[newIndex]);
    } else {
        group.appendChild(pointDiv);
    }

    let xInput = pointDiv.getElementsByTagName("input")[0]
    let yInput = pointDiv.getElementsByTagName("input")[1]
    xInput.value = point.x;
    yInput.value = point.y;
    xInput.addEventListener("input", function() {
        if(xInput.value.length){
            point.x = xInput.value;
            svgPoint.x = point.x;
            circle.setAttribute("cx", point.x);

            currentState.game.map.path.setBoundary();
            currentState.game.map.path.setStepProperties();
            currentState.labelCanvas.valid = false;
        }
    });
    xInput.addEventListener("focus", function() {circle.classList.add("focused")});
    xInput.addEventListener("blur", function() {circle.classList.remove("focused")});
    yInput.addEventListener("input", function() {
        if(yInput.value.length){
            point.y = yInput.value;
            svgPoint.y = point.y;
            circle.setAttribute("cy", point.y);

            currentState.game.map.path.setBoundary();
            currentState.game.map.path.setStepProperties();
            currentState.labelCanvas.valid = false;
        }
    });
    yInput.addEventListener("focus", function() {circle.classList.add("focused")});
    yInput.addEventListener("blur", function() {circle.classList.remove("focused")});
    if(newIndex && newIndex<group.children.length) {
        xInput.focus();
    }

    let addButton = pointDiv.getElementsByClassName("addPointButton")[0]
    let deleteButton = pointDiv.getElementsByClassName("deletePointButton")[0]
    addButton.addEventListener("click", function() {
        let points = pointList;
        let index = points.indexOf(point);
        var newPoint = {
            x: Math.round((point.x + points[(index+1)%pointList.length].x)/2),
            y: Math.round((point.y + points[(index+1)%pointList.length].y)/2)
        };
        points.splice(index+1, 0, newPoint);
        addPoint(newPoint, pointList, group, polyline, circleGroup, max, index+1);

        if(pointList.length > 2) {
            for(let button of group.getElementsByClassName("deletePointButton")) {
                button.disabled = false;
            }
        }
        if(pointList.length >= max) {
            for(let button of group.getElementsByClassName("addPointButton")) {
                button.disabled = true;
            }
        }

        currentState.game.map.path.setBoundary();
        currentState.game.map.path.setStepProperties();
        currentState.labelCanvas.valid = false;
    });
    deleteButton.addEventListener("click", function() {
        let points = pointList;
        let index = points.indexOf(point);
        points.splice(index, 1);
        polyline.points.removeItem(index);
        circleGroup.removeChild(circle)
        group.removeChild(pointDiv);
        
        if(pointList.length <= 2) {
            for(let button of group.getElementsByClassName("deletePointButton")) {
                button.disabled = true;
            }
        }
        if (pointList.length < max) {
            for(let button of group.getElementsByClassName("addPointButton")) {
                button.disabled = false;
            }
        }

        currentState.game.map.path.setBoundary();
        currentState.game.map.path.setStepProperties();
        currentState.labelCanvas.valid = false;
    });

    circle.addEventListener('mousedown', function(e) {
        selectedElement = circle;
        pt.x = e.clientX;
        pt.y = e.clientY;
        let cursorpt =  pt.matrixTransform(dragMapDisplay.getScreenCTM().inverse());
        dx = cursorpt.x - point.x;
        dy = cursorpt.y - point.y;
    });
    dragMapDisplay.addEventListener('mousemove', function(e) {
        if(selectedElement == circle) {
            pt.x = e.clientX;
            pt.y = e.clientY;
            let cursorpt =  pt.matrixTransform(dragMapDisplay.getScreenCTM().inverse());

            let newX = Math.min(Math.max(Math.round(cursorpt.x - dx), 0), 960);
            let newY = Math.min(Math.max(Math.round(cursorpt.y - dy), 0), 720);
            let index = Array.from(pointDiv.parentNode.children).indexOf(pointDiv);

            circle.setAttribute("cx", newX);
            circle.setAttribute("cy", newY);
            polyline.points[index].x = point.x;
            polyline.points[index].y = point.y;
            xInput.value = newX;
            yInput.value = newY;
            point.x = newX;
            point.y = newY;

            currentState.game.map.path.setBoundary();
            currentState.game.map.path.setStepProperties();
            currentState.labelCanvas.valid = false;
        }
    });
}

function showDragMap() {
    dragMapDisplay.style.backgroundImage = "url(" + currentState.game.map.background.src + ")";
    glassPane.style.display = "flex";
}