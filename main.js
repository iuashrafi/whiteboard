const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
//initial settings
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 2;
ctx.strokeStyle = "#ac0000";

// list of all strokes drawn
let drawings = [];

// coordinates of our cursor
let cursorX, cursorY;
let prevCursorX, prevCursorY;

// distance from origin
let offsetX = 0;
let offsetY = 0;

// zoom amount
let scale = 1;

// convert coordinates
const toScreenX = (xTrue) => (xTrue + offsetX) * scale;

const toScreenY = (yTrue) => (yTrue + offsetY) * scale;

const toTrueX = (xScreen) => xScreen / scale - offsetX;

const toTrueY = (yScreen) => yScreen / scale - offsetY;

const trueHeight = () => canvas.clientHeight / scale;

const trueWidth = () => canvas.clientWidth / scale;

const reSize = () => {
  // resizing the canvas to fill the window
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
reSize();

const redrawCanvas = () => {
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  reSize();
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < drawings.length; i++) {
    const line = drawings[i];
    drawLine(
      toScreenX(line.x0),
      toScreenY(line.y0),
      toScreenX(line.x1),
      toScreenY(line.y1),
      line.color,
      line.width
    );
  }
};
window.addEventListener("resize", redrawCanvas);

// mouse functions
let leftMouseDown = false;
let rightMouseDown = false;
const onMouseDown = (e) => {
  // detect left clicks
  if (e.button == 0) {
    leftMouseDown = true;
    rightMouseDown = false;
  }
  // detect right clicks
  if (e.button == 2) {
    rightMouseDown = true;
    leftMouseDown = false;
  }

  // update the cursor coordinates
  cursorX = e.pageX;
  cursorY = e.pageY;
  prevCursorX = e.pageX;
  prevCursorY = e.pageY;
};
const onMouseMove = (e) => {
  // get mouse position
  cursorX = e.pageX;
  cursorY = e.pageY;
  const scaledX = toTrueX(cursorX);
  const scaledY = toTrueY(cursorY);
  const prevScaledX = toTrueX(prevCursorX);
  const prevScaledY = toTrueY(prevCursorY);

  if (leftMouseDown) {
    // add the line to our drawing history
    drawings.push({
      x0: prevScaledX,
      y0: prevScaledY,
      x1: scaledX,
      y1: scaledY,
      color: ctx.strokeStyle,
      width: ctx.lineWidth,
    });
    // draw a line
    drawLine(
      prevCursorX,
      prevCursorY,
      cursorX,
      cursorY,
      ctx.strokeStyle,
      ctx.lineWidth
    );
  }
  if (rightMouseDown) {
    // move the screen
    offsetX += (cursorX - prevCursorX) / scale;
    offsetY += (cursorY - prevCursorY) / scale;
    redrawCanvas();
  }
  prevCursorX = cursorX;
  prevCursorY = cursorY;
};
const onMouseUp = () => {
  leftMouseDown = false;
  rightMouseDown = false;
};
const onMouseWheel = (e) => {
  const deltaY = e.deltaY;
  const scaleAmount = -deltaY / 500;
  scale = scale * (1 + scaleAmount);

  // zoom the page based on where the cursor is
  var distX = e.pageX / canvas.clientWidth;
  var distY = e.pageY / canvas.clientHeight;

  // calculate how much we need to zoom
  const unitsZoomedX = trueWidth() * scaleAmount;
  const unitsZoomedY = trueHeight() * scaleAmount;

  const unitsAddLeft = unitsZoomedX * distX;
  const unitsAddTop = unitsZoomedY * distY;

  offsetX -= unitsAddLeft;
  offsetY -= unitsAddTop;

  redrawCanvas();
};

const drawLine = (x1, y1, x2, y2, color, width) => {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

// Mouse Event Handlers
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp, false);
canvas.addEventListener("mouseout", onMouseUp, false);
canvas.addEventListener("mousemove", onMouseMove, false);
canvas.addEventListener("wheel", onMouseWheel, false);

// Touch Event Handlers
canvas.addEventListener("touchstart", onTouchStart);
canvas.addEventListener("touchend", onTouchEnd);
canvas.addEventListener("touchcancel", onTouchEnd);
canvas.addEventListener("touchmove", onTouchMove);

// touch functions
const prevTouches = [null, null]; // up to 2 touches
let singleTouch = false;
let doubleTouch = false;
function onTouchStart(event) {
  if (event.touches.length == 1) {
    singleTouch = true;
    doubleTouch = false;
  }
  if (event.touches.length >= 2) {
    singleTouch = false;
    doubleTouch = true;
  }

  // store the last touches
  prevTouches[0] = event.touches[0];
  prevTouches[1] = event.touches[1];
}
function onTouchMove(event) {
  // get first touch coordinates
  const touch0X = event.touches[0].pageX;
  const touch0Y = event.touches[0].pageY;
  const prevTouch0X = prevTouches[0].pageX;
  const prevTouch0Y = prevTouches[0].pageY;

  const scaledX = toTrueX(touch0X);
  const scaledY = toTrueY(touch0Y);
  const prevScaledX = toTrueX(prevTouch0X);
  const prevScaledY = toTrueY(prevTouch0Y);

  if (singleTouch) {
    // add to history
    drawings.push({
      x0: prevScaledX,
      y0: prevScaledY,
      x1: scaledX,
      y1: scaledY,
      color: ctx.strokeStyle,
      width: ctx.lineWidth,
    });
    drawLine(
      prevTouch0X,
      prevTouch0Y,
      touch0X,
      touch0Y,
      ctx.strokeStyle,
      ctx.lineWidth
    );
  }

  if (doubleTouch) {
    // get second touch coordinates
    const touch1X = event.touches[1].pageX;
    const touch1Y = event.touches[1].pageY;
    const prevTouch1X = prevTouches[1].pageX;
    const prevTouch1Y = prevTouches[1].pageY;

    // get midpoints
    const midX = (touch0X + touch1X) / 2;
    const midY = (touch0Y + touch1Y) / 2;
    const prevMidX = (prevTouch0X + prevTouch1X) / 2;
    const prevMidY = (prevTouch0Y + prevTouch1Y) / 2;

    // calculate the distances between the touches
    const hypot = Math.sqrt(
      Math.pow(touch0X - touch1X, 2) + Math.pow(touch0Y - touch1Y, 2)
    );
    const prevHypot = Math.sqrt(
      Math.pow(prevTouch0X - prevTouch1X, 2) +
        Math.pow(prevTouch0Y - prevTouch1Y, 2)
    );

    // calculate the screen scale change
    var zoomAmount = hypot / prevHypot;
    scale = scale * zoomAmount;
    const scaleAmount = 1 - zoomAmount;

    // calculate how many pixels the midpoints have moved in the x and y direction
    const panX = midX - prevMidX;
    const panY = midY - prevMidY;
    // scale this movement based on the zoom level
    offsetX += panX / scale;
    offsetY += panY / scale;

    // Get the relative position of the middle of the zoom.
    // 0, 0 would be top left.
    // 0, 1 would be top right etc.
    var zoomRatioX = midX / canvas.clientWidth;
    var zoomRatioY = midY / canvas.clientHeight;

    // calculate the amounts zoomed from each edge of the screen
    const unitsZoomedX = trueWidth() * scaleAmount;
    const unitsZoomedY = trueHeight() * scaleAmount;

    const unitsAddLeft = unitsZoomedX * zoomRatioX;
    const unitsAddTop = unitsZoomedY * zoomRatioY;

    offsetX += unitsAddLeft;
    offsetY += unitsAddTop;

    redrawCanvas();
  }
  prevTouches[0] = event.touches[0];
  prevTouches[1] = event.touches[1];
}
function onTouchEnd(event) {
  singleTouch = false;
  doubleTouch = false;
}

//Functionalities
// document.oncontextmenu = () => false;

// clear Canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawings = [];
};

const changeColor = (color) => (ctx.strokeStyle = color);
const toggleWidth = (w) => (ctx.lineWidth = w);

//Adding animations
const tl = anime.timeline({
  easing: "cubicBezier(0.760, 0.215, 0.275, 0.975)",
  duration: 750,
});
tl.add({
  targets: "footer",
  translateY: [250, 0],
  translateX: 0,
  translateX: ["-50%", "-50%"],
  //   translateY: 0,
  duration: 1000,
});

tl.add({
  targets: "header",
  opacity: [0, 1],
  duration: 500,
});
