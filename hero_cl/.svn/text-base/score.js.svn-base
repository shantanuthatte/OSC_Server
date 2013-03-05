// Create the canvas for 1680 x 1050 screen (in Chrome, hit F11)
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 1620;
canvas.height = 1020;
document.body.appendChild(canvas);

// game start control
var StartGame = 0;

// globals

// websocket stuff
var Scs = ' | | |';
var ws = null;

window.onload = function () {
    // get a socket
    if ('WebSocket' in window) {
        ws = new WebSocket('ws://' + window.location.host + '/score');
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket('ws://' + window.location.host + '/score');
    } else {
        alert("WebSocket NOT supported by your Browser!");
        return;
    }
    // socket event handlers
    ws.onopen = function() { StartGame = 0; }
    ws.onmessage = function (evt) { 
        Scs = evt.data; 
    }
    ws.onclose = function() { StartGame = 0; }
}

// Background image
var bgReady = false;
var qrReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background_1620x1020.png";

myimage = new Image();
myimage.onload = function() {
    qrReady = true;
}
myimage.src = 'qr.png';

// render heros, monsters, and zombies.  display score until Shantanu fixes new function
function render() {
    var ha = Scs.split("|");
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "96px Helvetica";
    ctx.fillText(ha[0], 300, 200);
    ctx.fillText(ha[1], 300, 400);
    ctx.fillText(ha[2], 300, 600);
}

// The main game loop
var main = function () {
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
    if(qrReady){
        ctx.drawImage(myimage, 0, 0);
    }
    if (ws) ws.send('G');

    render();
};

setInterval(main, 1000); // Execute 1 time per second