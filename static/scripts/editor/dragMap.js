var glassPane = document.getElementById("glassPane");

var dragMap = document.getElementById("dragMap");
var dragMapDisplay = document.getElementById("dragMapDisplay");
var dragMapPanel = document.getElementById("dragMapPanel");
var pointGroup = document.getElementById("pointGroup");
var pointDivTemplate = document.getElementById("pointDivTemplate");

var editPathButton = document.getElementById("editPath");

function setUpDragMapInputs() {
    editPathButton.addEventListener("click", function() {
        dragMapPanel.children[0].textContent = "Edit Path";
        var polyline = document.createElementNS("http://www.w3.org/2000/svg", 'polyline');
        var points = "";
        for (let point of currentState.game.map.path.points) {
            var pointDiv = pointDivTemplate.cloneNode(true);
            pointDiv.id = "";
            pointDiv.getElementsByTagName("input")[0].value = point.x;
            pointDiv.getElementsByTagName("input")[1].value = point.y;
            pointGroup.appendChild(pointDiv);

            points += point.x + "," + point.y + " ";
            var circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
            circle.setAttribute("cx", point.x)
            circle.setAttribute("cy", point.y);
            dragMapDisplay.appendChild(circle);
        }
        polyline.setAttribute("points", points);
        dragMapDisplay.appendChild(polyline);
        showDragMap();
    });
}

function showDragMap() {
    dragMapDisplay.style.backgroundImage = "url(" + currentState.game.map.background.src + ")";
    glassPane.style.display = "flex";
}