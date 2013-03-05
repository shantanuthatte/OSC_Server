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

var stringToUint8Array = function(string) {
    var buffer = new ArrayBuffer(string.length);
    var view = new Uint8Array(buffer);
    for(var i = 0; i < string.length; i++) {
      view[i] = string.charCodeAt(i);
    }
    return view;
};

var readOSC = function (data) {
  chrome.socket.create('udp', {}, function(CreateInfo){
    //console.log(CreateInfo);
    var socketId = CreateInfo.socketId;
    chrome.socket.connect(socketId, '127.0.0.1', 8898, function(result) {
     // We are now connected to the socket so send it some data
      if(result>=0){
        chrome.socket.write(socketId, data, function(sendInfo) {
           //console.log("wrote " + sendInfo);
        });
      }
    });
  });
}

/*
var writeHTTP = function(socketId, data, sockRef, callback) {
  chrome.socket.getInfo(sockRef.socket, function(result){console.log("Listen socket",result);});
  if(data.length > 0){
    var contentType = "text/html";
    var files = document.getElementById("files").files;
    console.log(files);
    var file = files[0];
    var contentLength = file.size;
    var header = stringToUint8Array("HTTP/1.0 200 OK\nContent-length: " + file.size + "\nContent-type:" + contentType + "\n\n");
    var outputBuffer = new ArrayBuffer(header.byteLength + file.size);
    var view = new Uint8Array(outputBuffer)
    view.set(header, 0);

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
      view.set(new Uint8Array(e.target.result), header.byteLength);
      console.log("Socket to write",socketId); 
      chrome.socket.write(socketId, outputBuffer, function(writeInfo) {
        console.log("WRITE", writeInfo);
        chrome.socket.disconnect(socketId);
        chrome.socket.destroy(socketId);
        console.log("destroyed!!", socketId, sockRef);
        chrome.socket.getInfo(socketId, function(result){console.log("Destroyed socket",result);});
        chrome.socket.getInfo(sockRef.socket, function(result){console.log("Listen socket",result);});
        chrome.socket.accept(sockRef.socket, function(accInfo){
          chrome.socket.getInfo(sockRef.socket, function(result){console.log("Listen socket",result);});
          console.log("Accepting from socket.write in writeHTTP");
          acceptTCP(accInfo, callback, sockRef);
        });     
      });
    };

    fileReader.readAsArrayBuffer(file);
  }else{
    chrome.socket.accept(sockRef.socket, function(accInfo){
        console.log("Accepting from else in writeHTTP");
        acceptTCP(accInfo, callback, sockRef);
    });
  }
}*/

document.getElementById('test').addEventListener('click', function(e) {

  // Create the Socket
  connect(sockets['recv'], readOSC);
  //connect(sockets['http'], writeHTTP);

  console.log("Avail Height: "+screen.availHeight);
  console.log("Avail Width: "+screen.availWidth);
  console.log("Screen Height: "+screen.height);
  console.log("Screen Width: "+screen.width);
  console.log("outer Height: "+window.outerHeight);
  console.log("outer Width: "+window.outerWidth);

  var hosts = document.getElementById("hosts");
  chrome.app.window.create('hero_cl/score.html?', {width: screen.width-200, height: screen.height-200});
  chrome.app.window.create('hero_cl/index.html');
  

});

// Attempt fullscreen on window creation.
// It will fail, but hopefully some day it won't:
// http://code.google.com/p/chromium/issues/detail?id=164624
document.body.webkitRequestFullscreen();

var hosts = document.getElementById("hosts");
var socket = chrome.experimental.socket || chrome.socket;
socket.getNetworkList(function(interfaces) {
    for(var i in interfaces) {
      var interface = interfaces[i];
      var opt = document.createElement("option");
      opt.value = interface.address;
      console.log(interface.address);
      opt.innerText =  interface.address;
      hosts.appendChild(opt);
    }
  });

