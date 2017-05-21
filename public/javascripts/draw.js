/* JQUERY get API
$.get(
    "somepage.php",
    {paramOne : 1, paramX : 'abc'},
    function(data) {
       alert('page content: ' + data);
    }
);
*/

//plans

//allow zoom and scroll

//better drawing tools
//text, vertical and horizontal
//allow circles to be ovals

//checkbox that allows multiple uses of a tool after click rather than having to click many times
//"multi" or something of that sort

//better rendering
//layering so that images have a top-bottom organization

//ability to move or modify existing parts/shapes
//size
//position
//color
//outline + color

//mirroring
//some sort of way to easily center objects
//some way to disable outlines on parts or make a cohesive "complex object"

//
//END IDEAS/PLANS
//

//the ? data
//code from stackoverflow
//example expected params
//?w=10&h=10
var urlParams;
(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
})();

//---------------------
//GLOBAL SCOPE VARIABLES
//---------------------


//ship will have a series of objects
//each object will have a shape name
//and an x y coordinate
var ship = [];
//will be equal to an array if something is selected, containing all indexes of selected items
var selectedShipIndexes = null; 
//action will indicate what to do on click
//draw, erase, select, move, etc
var action = null;
//shape indicates what will be added to the ship
//once things are added, update the ship render.
var shape = null;
var complexShapeData = null;

var moveIndex = null;

var initialPosition = null;
var finalPosition = null;

var selectedShape = null;
var previousSelectedStack = null;

//----------------------
//INITIALIZATION FUNCTIONS
//  These are run at startup or by default, and not by other systems
//----------------------

function onPageLoad(){
    var canvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    var canvasDiv = document.getElementById("canvasDiv");

    //first I want to resize the canvas based on URL params
    //also resize the preview canvas and div
    if(urlParams.w && urlParams.h){
        canvas.height = urlParams.h;
        canvas.width = urlParams.w;
    }
    else if(urlParams.w){
        //width was given
        canvas.height = 600;
        canvas.width = urlParams.w;

    }
    else if(urlParams.h){
        //height was given
        canvas.height = urlParams.h;
        canvas.width = 800;
    }
    else{
        //none were given
        canvas.height = 600;
        canvas.width = 800;
    }
    previewCanvas.height = canvas.height;
    previewCanvas.width = canvas.width;
    canvasDiv.style.minHeight = canvas.height;



    var context = canvas.getContext("2d");
    var rulesCheck = document.getElementById("rulesCheckbox");
    rulesCheck.checked = false;
    canvas.addEventListener("mousedown", defaultOnCanvasClick, false);
    canvas.addEventListener("mouseleave", exitDrawReset);
    renderShip(canvas, ship, 0, 0);
}

//----------------------
//HELPER FUNCTIONS
//  These are run by other functions
//----------------------

function drawSelectedHighlight(canvas, shape){
    context = canvas.getContext("2d");
    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    if(shape){
        context.rect(shape.data[0], shape.data[1], 10, 10);
        context.closePath();
        switch(shape.shape){
            default:
                break;
        }
    }
    context.stroke();
}

function drawResizeHighlight(canvas, shape){
    context = canvas.getContext("2d");
    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    switch(shape.shape){
        case "rect":
            //draw a circle at the point at all four points
            break;
        case "circle":
            //draw a circle at the four points at the edge of the circle
            
            break;
        case "line":
            //draw a circle at start and end points
            break;
        case "complex":
            //draw a circle at each set of points
            break;
    }
}

function getGreaterLesserValues(xyArray){
    var greaterx = xyArray[0];
    var greatery = xyArray[1];
    var lesserx = xyArray[0];
    var lessery = xyArray[1];
    for(var i = 2; i < xyArray.length; i+=2){
        if(xyArray[i] > greaterx){
            greaterx = xyArray[i];
        }
        if(xyArray[i] < lesserx){
            lesserx = xyArray[i];
        }
        if(xyArray[i + 1] > greatery){
            greatery = xyArray[i + 1];
        }
        if(xyArray[i + 1] < lessery){
            lessery = xyArray[i + 1];
        }
    }
    return {greaterx: greaterx, lesserx: lesserx, greatery: greatery, lessery: lessery};
}

function distance(x, y, x2, y2){
    return Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
}

function findShapesAtPoint(ship, x, y){
    var foundShapes = [];
    for(var i = 0; i < ship.length; i++){
        switch(ship[i].shape){
            case "line":
                //here we have the "line". just treating it as a rectangle for now.
                //maybe want to have special cases here.
            case "complex":
                //also treating this one as a rect for now
                //seems like a common theme.
                var xyVals = ship[i].data;
            case "rect":
                if(ship[i].shape == "rect"){
                    xyVals = [ship[i].data[0], ship[i].data[1], ship[i].data[0] + ship[i].data[2], ship[i].data[1] + ship[i].data[3]];
                }
                
                var boundingValues = getGreaterLesserValues(xyVals);
                //make it so that if the targets are too small they are expanded
                if(boundingValues.greaterx - boundingValues.lesserx < 5){
                    boundingValues.greaterx = boundingValues.greaterx + 4;
                    boundingValues.lesserx = boundingValues.lesserx - 4;
                }
                if(boundingValues.greatery - boundingValues.lessery < 5){
                    boundingValues.greatery = boundingValues.greatery + 4;
                    boundingValues.lessery = boundingValues.lessery - 4;
                }
                //do the search
                if(x < boundingValues.greaterx && x > boundingValues.lesserx && 
                    y > boundingValues.lessery && y < boundingValues.greatery){
                    //point falls inside the square
                    foundShapes.push(ship[i]);
                }
                break;
            case "circle":
                    if(distance(x, y, ship[i].data[0], ship[i].data[1]) < ship[i].data[2]){
                        //point falls inside the circle
                        foundShapes.push(ship[i]);
                    }
                break;
        }
    }
    return foundShapes;
}

function renderShip(canvas, ship, startx, starty){
    //get canvas and context for render;
    var context = canvas.getContext("2d");
    context.globalAlpha = 1.0;
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.closePath();
    context.stroke();
    //roll over each part of the ship to draw
    ship.forEach(function(shapeObj){
        var data = shapeObj.data;
        switch(shapeObj.shape){
            case "rect":
                context.beginPath();
                context.rect(data[0] + startx, data[1] + starty, data[2] + startx, data[3] + starty);
                if(shapeObj.fill.type == "fill"){
                    context.fillStyle = shapeObj.fill.color;
                    context.fill();
                }
                context.closePath();
                context.stroke();
                break;
            case "circle":
                context.beginPath();
                context.arc(data[0]  + startx, data[1] + starty, data[2], 0, 2*Math.PI);
                if(shapeObj.fill.type == "fill"){
                    context.fillStyle = shapeObj.fill.color;
                    context.fill();
                }
                context.closePath();
                context.stroke();
                break;
            case "line":
                context.beginPath();
                context.moveTo(data[0] + startx, data[1] + starty);
                context.lineTo(data[2] + startx, data[3] + starty);
                context.closePath();
                context.stroke();
                break;
            case "complex":
                context.beginPath();
                context.moveTo(data[0],data[1]);
                for(i = 2; i < data.length; i += 2){
                    context.lineTo(data[i], data[i+1]);
                }
                if(shapeObj.fill.type == "fill"){
                    context.fillStyle = shapeObj.fill.color;
                    context.fill();
                }
                context.closePath();
                context.stroke();
                break;
            default: 
                break;
        };
    });
}

function selectNone(){
    action = null;
    shape = null;
}

function moveRelease(){
    ship.splice(moveIndex, 0, selectedShape);
    moveIndex = null;
}



//----------------------
//EVENT FUNCTIONS
//  These are run due to a .addEventListener
//----------------------

function adjustcoords(newx, newy, data){
    var xdiff = newx - data[0];
    var ydiff = newy - data[1];
    var retdata = [newx, newy];
    for(i = 2; i < data.length; i+=2){
        retdata.push(data[i] + xdiff);
        retdata.push(data[i + 1] + ydiff);
    }
    return retdata
}

function drawPreview(shape, data, x, y){
    switch(shape.shape){
        case "rect":
            context.beginPath();
            context.rect(x, y, data[2], data[3]);
            if(shape.fill.type == "fill"){
                context.fillStyle = shape.fill.color;
                context.fill();
            }
            context.closePath();
            context.stroke();
            break;
        case "circle":
            context.beginPath();
            context.arc(x, y, data[2], 0, 2*Math.PI);
            if(shape.fill.type == "fill"){
                context.fillStyle = shape.fill.color;
                context.fill();
            }
            context.closePath();
            context.stroke();
            break;
        case "line":
            var adjData = adjustcoords(x, y, shape.data);
            context.beginPath();
            context.moveTo(adjData[0], adjData[1]);
            context.lineTo(adjData[2], adjData[3]);
            context.closePath();
            context.stroke();
            break;
        case "complex":
            var adjData = adjustcoords(x, y, shape.data);
            context.beginPath();
            context.moveTo(adjData[0],adjData[1]);
            for(i = 2; i < adjData.length; i += 2){
                context.lineTo(adjData[i], adjData[i+1]);
            }
            if(shape.fill.type == "fill"){
                context.fillStyle = shape.fill.color;
                context.fill();
            }
            context.closePath();
            context.stroke();
            break;
        default: 
            break;
    };
}


//if the mouse leaves the canvas, end the present draw operation
function exitDrawReset(event){
    var drawCanvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    var previewContext = previewCanvas.getContext("2d");
    previewContext.beginPath();
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewContext.stroke();
    if(action == "move" && moveIndex != null){
        moveRelease();
    }
    drawSelectedHighlight(previewCanvas, selectedShape)
    drawCanvas.removeEventListener("mousemove", mouseTrack, false);
    drawCanvas.removeEventListener("mouseup", mouseUp, false);
    initialPosition = null;
    finalPosition = null;
    complexShapeData = null;
    selectNone();
}

//this will initialize the action
//doing this will cause the mouseTrack and mouseUp events to be registered
//mouseUp will finalize the event/add the item to the ship
//mouseTrack will draw the preview object for what will be drawn
//may want to draw the preview on a separate canvas rather than redrawing the original
function defaultOnCanvasClick(event){
    var canvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    initialPosition = [x, y];
    switch(action){
        case "draw":
            switch(shape){
                case "complex":
                    if(complexShapeData == null){
                        complexShapeData = [x, y];
                        //on click, set point and add event listener for mousemovement
                        canvas.addEventListener("mousemove", mouseTrack);
                    }
                    else{
                        //complete the drawing if original point is clicked again
                        //may want to make this a range of a few pixels eventually
                        //use difference and Math.abs to do that
                        if(Math.abs(x-complexShapeData[0]) < 5 && Math.abs(y-complexShapeData[1]) < 5){
                            console.log("runHereThisHere");
                            //get color data
                            //get color data
                            var fillCheckbox = document.getElementById("colorCheckbox");
                            var colorSelect = document.getElementById("fillColorInput");
                            var shouldFill = fillCheckbox.checked;
                            var color = colorSelect.value;
                            var fill = null;
                            if(!shouldFill){
                                color = null;
                            }
                            else{
                                fill = "fill";
                            }
                            //create the actual object
                            ship.push({shape: "complex", data: complexShapeData, fill: {type: fill, color: color}});
                            //remove the event listener
                            canvas.removeEventListener("movemouse", mouseTrack);
                            selectNone();
                        }
                        else{
                            complexShapeData.push(x);
                            complexShapeData.push(y);
                        }
                    }
                    break;
                    
                default:
                    //start the draw process by adding the needed event listeners
                    canvas.addEventListener("mousemove", mouseTrack, false);
                    canvas.addEventListener("mouseup", mouseUp, false);
                    break;
            }
            break;
        case "erase":
            //do something to erase.  
            break;
        case "select":
            var selectedStack = findShapesAtPoint(ship, x, y);
            console.log(selectedStack);
            console.log(selectedStack.length);
            if(selectedStack.length == 0){
                selectedShape = null;
                previousSelectedStack = null;
            }
            else if(selectedShape == null){
                selectedShape = selectedStack[selectedStack.length - 1];
            }
            else{
                var index = selectedStack.indexOf(selectedShape);
                //if the shape is the first shape
                //or the shape just doesn't exist in the stack
                //start over from the beginning
                if(index == 0 || index == -1){
                    index = selectedStack.length;
                }
                selectedShape = selectedStack[index - 1];
            }
            previousSelectedStack = selectedStack;
            drawSelectedHighlight(previewCanvas, selectedShape);
            console.log("Selected:", selectedShape);
            break;
        case "move":
            //remove selected shape from the canvas
            //store initial x/y coords
            //re-render the ship as to remove the shape
            //on mouse move, draw preview of where the shape will be
            //on mouse release, adjust the shape that was moved and all points necessary to change
            //on exit screen, re-add the shape to the ship where it was
            if(selectedShape){
                initialPosition = [x, y];
                var index = ship.indexOf(selectedShape);
                ship.splice(index, 1);
                moveIndex = index;
                canvas.addEventListener("mousemove", mouseTrack, false);
                canvas.addEventListener("mouseup", mouseUp, false);
            }
            break;
        default:
            break;
    }
    renderShip(canvas, ship, 0, 0);
    console.log(initialPosition);
}

function drawRules(event){
    var canvas = document.getElementById("previewCanvas");
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    var context = canvas.getContext("2d");
    context.beginPath();
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSelectedHighlight(canvas, selectedShape);
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.closePath();
    context.stroke();
}

function mouseTrack(event){
    console.log(initialPosition);
    //by default just draw a square
    //if drawing a shape, then draw the shape
    var canvas = document.getElementById("previewCanvas");
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    finalPosition = [x, y];
    var context = canvas.getContext("2d");

    context.beginPath();
    //erase the preview before redraw
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSelectedHighlight(canvas, selectedShape);


    //get color data
    var fillCheckbox = document.getElementById("colorCheckbox");
    var colorSelect = document.getElementById("fillColorInput");
    var shouldFill = fillCheckbox.checked;
    var color = colorSelect.value;
    var fill = null;
    if(!shouldFill){
        color = null;
    }
    else{
        fill = "fill";
    }

    switch(action){
        case "draw":
            switch(shape){
                case "rect":
                    var width =  -(initialPosition[0] - x);
                    var height = -(initialPosition[1] - y);
                    context.rect(initialPosition[0], initialPosition[1], width, height);
                    if(fill == "fill"){
                        context.fillStyle = color;
                        context.fill();
                    }
                    context.closePath();
                    context.stroke();
                    break;
                case "circle":
                    var rad = Math.sqrt(Math.pow(x - initialPosition[0], 2) + Math.pow(y - initialPosition[1], 2));
                    context.moveTo(initialPosition[0], initialPosition[1]);
                    //note
                    //by making x and y the current position, the circle draws with one edge touching the initial point
                    //it's an interesting style that some may find useful
                    context.arc(initialPosition[0], initialPosition[1], rad, 0, 2*Math.PI);
                    if(fill == "fill"){
                        context.fillStyle = color;
                        context.fill();
                    }
                    context.closePath();
                    context.stroke();
                    break;
                case "line":
                    context.moveTo(initialPosition[0], initialPosition[1]);
                    context.lineTo(x, y);
                    context.closePath()
                    context.stroke();
                    break;
                case "complex":
                    //draw the complex shape ending at current X Y
                    context.moveTo(complexShapeData[0], complexShapeData[1]);
                    context.arc(complexShapeData[0], complexShapeData[1], 5, 0, 2*Math.PI);
                    context.moveTo(complexShapeData[0], complexShapeData[1]);
                    for(i = 2; i < complexShapeData.length; i+=2){
                        context.lineTo(complexShapeData[i], complexShapeData[i+1]);
                    }
                    context.lineTo(x, y);
                    if(fill == "fill"){
                        context.fillStyle = color;
                        context.fill();
                    }
                    context.closePath();
                    context.stroke();
                    break;
            }
            break;
        case "move":
            drawSelectedHighlight(canvas, null);
            drawPreview(selectedShape, selectedShape.data, x, y);
            break;
        default:
            break;
    }

}

function mouseUp(event){
    //create canvas for event removal
    var drawCanvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    if(finalPosition == null){
        //remove events
        drawCanvas.removeEventListener("mousemove", mouseTrack, false);
        drawCanvas.removeEventListener("mouseup", mouseUp, false);
        selectNone();
        return;
    }
    //clear the preview
    var previewCanvas = document.getElementById("previewCanvas");
    var previewContext = previewCanvas.getContext("2d");
    previewContext.beginPath();
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewContext.stroke();

    //ensure constant selected shape indicator remains
    drawSelectedHighlight(previewCanvas, selectedShape);

    //get color data
    var fillCheckbox = document.getElementById("colorCheckbox");
    var colorSelect = document.getElementById("fillColorInput");
    var shouldFill = fillCheckbox.checked;
    var color = colorSelect.value;
    var fill = null;
    if(!shouldFill){
        color = null;
    }
    else{
        fill = "fill";
    }
    console.log(fill, color);
    
    //perform final draw action
    var initialx = initialPosition[0];
    var initialy = initialPosition[1];
    var finalx = finalPosition[0];
    var finaly = finalPosition[1];
    initialPosition = null;
    finalPosition = null;
    switch(action){
        case "draw":
            switch(shape){
                case "rect":
                    var width = -(initialx - finalx);
                    var height = -(initialy - finaly);
                    ship.push({shape: "rect", data: [initialx, initialy, width, height], fill: {type: fill, color: color}});
                    renderShip(drawCanvas, ship, 0, 0);
                    break;
                case "circle":
                    var rad = Math.sqrt(Math.pow(finalx - initialx, 2) + Math.pow(finaly - initialy, 2));
                    ship.push({shape: "circle", data: [initialx, initialy, rad], fill: {type: fill, color: color}});
                    renderShip(drawCanvas, ship, 0, 0);
                    break;
                case "line":
                    ship.push({shape: "line", data: [initialx, initialy, finalx, finaly], fill: {fill: null, color: null}});
                    renderShip(drawCanvas, ship, 0, 0);
                    break;
            }
            break;
        case "move":
            //move shape to mouse cursor
            switch(selectedShape.shape){
                case "rect":
                case "circle":
                    selectedShape.data[0] = finalx;
                    selectedShape.data[1] = finaly;
                case "line":
                case "complex":
                    var newData = adjustcoords(finalx, finaly, selectedShape.data);
                    selectedShape.data = newData;
                    break;
            }
            
            moveRelease();
            renderShip(drawCanvas, ship, 0, 0);
            drawSelectedHighlight(previewCanvas, selectedShape);
            break;
        default:
            break;
    }
    //remove events
    drawCanvas.removeEventListener("mousemove", mouseTrack, false);
    drawCanvas.removeEventListener("mouseup", mouseUp, false);
    selectNone();
}



//----------------------
//INTERACTION FUNCTIONS
//  These are run by buttons or other inputs inside of the html
//----------------------


//these work for just loading the ship
//however
//have them create an object that also includes width and height
//data
//then use that data to adjust the size of the canvas/previewcanvas/etc all over again
//also may want to auto-shrink the ship to the 0,0 position on canvas
function save(){
    alert(JSON.stringify(ship));
    console.log(JSON.stringify(ship));
}

function load(){
    var canvas = document.getElementById("drawCanvas");
    var x = window.prompt("Load",null);
    console.log(x);
    if(x && JSON.parse(x)){
        ship = JSON.parse(x);
        renderShip(canvas, ship, 0, 0);
    }
}

function importShip(){
    //this will set the "import action"
    //load the ship to be imported
    //on click, adjust the values of the importing ship
    //then add those into the current ship
}

function test(){
    var canvas = document.getElementById("drawCanvas");
    for(i = 0; i < 50; i++){
        ship.push({shape: "rect", data: [canvas.height * Math.random(), canvas.width * Math.random(), 30, 30], fill: {type: null, color: null}});
        ship.push({shape: "circle", data: [canvas.height * Math.random(), canvas.width * Math.random(), 15], fill: {type: null, color: null}});
    }
    renderShip(canvas, ship, 0, 0);
}

function selectCircle(){
    action = "draw";
    shape = "circle";
}

function selectRect(){
    action = "draw";
    shape = "rect";
}

function reRender(){
    var canvas = document.getElementById("drawCanvas");
    var d = new Date();
    var start = Date.now();
    renderShip(canvas, ship, 0, 0);
    var d = new Date();
    var end = Date.now();
    console.log(end-start);
}

function removeShape(){
    var canvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    if(selectedShape){
        var index = ship.indexOf(selectedShape);
        ship.splice(index, 1);
        selectedShape = null;
        selectedStack = null;
        drawSelectedHighlight(previewCanvas, selectedShape);
    }
    else{
        ship.pop();
    }
    renderShip(canvas, ship, 0, 0);
}

function toggleRules(){
    var check = document.getElementById("rulesCheckbox");
    var canvas = document.getElementById("drawCanvas");
    var previewCanvas = document.getElementById("previewCanvas");
    var previewContext = previewCanvas.getContext("2d");
    if(check.checked){
        canvas.addEventListener("mousemove", drawRules, false);
    }
    else{
        canvas.removeEventListener("mousemove", drawRules);
        previewContext.beginPath();
        previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        previewContext.closePath();
        previewContext.stroke();
    }
}

function selectLine(){
    action = "draw";
    shape = "line";
}

function selectComplex(){
    action = "draw";
    shape = "complex";
}

function selectSelect(){
    selectedShape = null;
    previousSelectedStack = null;
    var previewCanvas = document.getElementById("previewCanvas");
    drawSelectedHighlight(previewCanvas, selectedShape);
    action = "select";
    shape = null;
}

function zForward(){
    var canvas = document.getElementById("drawCanvas");
    //if there are multiple shapes to consider in the first place
    if(selectedShape && ship.length > 1){
        //if I selected and the things I selected were layered atop one another
        var stackIndex = previousSelectedStack.indexOf(selectedShape);
        if(previousSelectedStack.length > 1 && stackIndex != -1 && stackIndex != previousSelectedStack.length-1){
            console.log("test");
            var nextShape = previousSelectedStack[previousSelectedStack.indexOf(selectedShape) + 1];
            var startIndex = ship.indexOf(selectedShape);
            var newIndex = ship.indexOf(nextShape);


            if(startIndex != ship.length - 1){
                //arr.splice(index, 0, item) (places item at index and deletes 0 items to do so) -stackoverflow
                //arr.splice(index, 1) to delete item at index
                var current = ship[startIndex];
                //remove ship
                console.log(startIndex, newIndex, current);
                ship.splice(startIndex, 1);
                //add the ship one forward
                ship.splice(newIndex + 1, 0, current);
                //should be done
            }
        }
        else{
            //if I have no context, just move the shape forward one in the array
            var index = ship.indexOf(selectedShape);
            var current = ship[index];
            //delete the current ship
            if(index != ship.length - 1){
                console.log("move");
                ship.splice(index, 1);
                //apply the ship to its previous position plus one
                ship.splice(index + 1, 0, current);
            }


        }
        renderShip(canvas, ship, 0, 0);
    }

}

function zBackward(){
    //do later, first move function
}

function colorChange(){
    var colorSelect = document.getElementById("fillColorInput");
    console.log("test?", colorSelect.value);
    var canvas = document.getElementById("drawCanvas");
    if(selectedShape && selectedShape.fill.type != null){
        selectedShape.fill.color = colorSelect.value;
    }
    renderShip(canvas, ship, 0, 0);
}

function selectMove(){
    if(selectedShape){
        action = "move";
        shape = null;
    }
}

function resizeShape(){

}