var glassPane = document.getElementById("glassPane");

var dragMap = document.getElementById("dragMap");
var closeDragMapPopup = document.getElementById("closeDragMapPopup");
var dragMapDisplay = document.getElementById("dragMapDisplay");
var dragMapPanel = document.getElementById("dragMapPanel");
var pointGroup = document.getElementById("pointGroup");
var pointDivTemplate = document.getElementById("pointDivTemplate");

var editPathButton = document.getElementById("editPath");

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
        circleGroup.classList.add("circleGroup")
        dragMapDisplay.appendChild(circleGroup);

        let counter = 0;
        for (let point of currentState.game.map.path.points) {
            addPoint(point, pointGroup, polyline, circleGroup, counter);
            counter++;
        }

        dragMapDisplay.addEventListener('mouseup', function(e) {
            selectedElement = null;
        });
        showDragMap();
    });
}

function addPoint(point, group, polyline, circleGroup, newIndex) {
    let svgPoint = dragMapDisplay.createSVGPoint();
    svgPoint.x = point.x;
    svgPoint.y = point.y;
    if(newIndex && newIndex<polyline.points.length) {
        polyline.points.insertItemBefore(svgPoint, polyline.points[newIndex]);
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
    if(newIndex && newIndex<group.length) {
        group.insertBefore(pointDiv, group.children[newIndex]);
    } else {
        group.appendChild(pointDiv);
    }

    let xInput = pointDiv.getElementsByTagName("input")[0]
    let yInput = pointDiv.getElementsByTagName("input")[1]
    xInput.value = point.x;
    yInput.value = point.y;
    xInput.addEventListener("input", function() {
        point.x = xInput.value;
        let index = Array.from(pointDiv.parentNode.children).indexOf(pointDiv);
        polyline.points[index].x = point.x;
        circle.setAttribute("cx", point.x);
    });
    xInput.addEventListener("focus", function() {circle.classList.add("focused")});
    xInput.addEventListener("blur", function() {circle.classList.remove("focused")});
    yInput.addEventListener("input", function() {
        point.y = yInput.value;
        let index = Array.from(pointDiv.parentNode.children).indexOf(pointDiv);
        polyline.points[index].y = point.y;
        circle.setAttribute("cy", point.y);
    });
    yInput.addEventListener("focus", function() {circle.classList.add("focused")});
    yInput.addEventListener("blur", function() {circle.classList.remove("focused")});

    let addButton = pointDiv.getElementsByTagName("button")[0]
    let deleteButton = pointDiv.getElementsByTagName("button")[1]
    addButton.addEventListener("click", function() {
        
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