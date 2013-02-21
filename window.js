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

var sockets = {
    "recv": {
      protocol: "udp",
      port: 8899,
      socket: null,
      type: 'bind'
    },
    "http": {
      protocol: "tcp",
      port: 8080,
      socket: null,
      type: 'listen'
    }
}

var readTimeout;
var readSocket;

var readOSC = function (data) {
  console.log(new Uint8Array(data));
}

var writeHTTP = function(socketId, data) {
    var contentType = "text/plain";
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + "\n\n");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
       view.set(new Uint8Array(e.target.result), header.byteLength); 
       socket.write(socketId, outputBuffer, function(writeInfo) {
         console.log("WRITE", writeInfo);
         socket.destroy(socketId); 
         socket.accept(socketInfo.socketId, onAccept);
      });
    };

    fileReader.readAsArrayBuffer("reply.html");
}

document.getElementById('test').addEventListener('click', function(e) {

// Create the Socket
connect(sockets['recv'], readOSC);
connect(sockets['http'], writeHTTP);

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