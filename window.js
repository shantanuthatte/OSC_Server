// Log events:

document.onwebkitfullscreenchange = function () {
  console.log("onwebkitfullscreenchange");
}

document.onwebkitfullscreenerror = function () {
  console.log("onwebkitfullscreenerror");
}

// Button handlers:

document.getElementById('enter').addEventListener('click', function(e) {
  document.body.webkitRequestFullscreen();
});

document.getElementById('exit').addEventListener('click', function(e) {
  document.webkitExitFullscreen();
});

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

var handleDataEvent = function(d) {
  var data = chrome.socket.read(d.socketId);
  console.log(data);
};

document.getElementById('test').addEventListener('click', function(e) {

// Create the Socket
chrome.socket.create('udp', { onEvent: handleDataEvent }, function(socketInfo) {
   // The socket is created, now we want to connect to the service
   var socketId = socketInfo.socketId;
   chrome.socket.connect(socketId, function(result) {
     // We are now connected to the socket so send it some data
     chrome.socket.write(socketId, arrayBuffer,
       function(sendInfo) {
         console.log("wrote " + sendInfo.bytesWritten);
       }
     );
   });
 }
);

console.log("Avail Height: "+screen.availHeight);
console.log("Avail Width: "+screen.availWidth);
console.log("Screen Height: "+screen.height);
console.log("Screen Width: "+screen.width);
console.log("outer Height: "+window.outerHeight);
console.log("outer Width: "+window.outerWidth);
});

// Attempt fullscreen on window creation.
// It will fail, but hopefully some day it won't:
// http://code.google.com/p/chromium/issues/detail?id=164624
document.body.webkitRequestFullscreen();

console.log(screen.availHeight);
console.log(screen.availWidth);
console.log(screen.height);
console.log(screen.width);