var ab2str=function(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
};

function readUDP(readSock, callback)
{
  //console.log("Reading from port");
  chrome.socket.recvFrom(readSock, 1024, function(recvFromInfo){
      console.log('Server: recvFromInfo: ' + recvFromInfo.address + ":" + recvFromInfo.port.toString(), 'Message: ' + ab2str(recvFromInfo.data));
      if(recvFromInfo.resultCode >= 0)
      {
          //console.log(readSock, 'Received message from client ' + recvFromInfo.address + ':' + recvFromInfo.port.toString() + ': ' + ab2str(recvFromInfo.data), recvFromInfo.address, recvFromInfo.port);
          //console.log(new Uint8Array(recvFromInfo.data));
          callback(recvFromInfo.data)
          readUDP(readSock, callback);
      }
      else
          console.error('Server read error!');
  });
}

var acceptTCP = function(acceptInfo, callback, sockRef)
{
  console.log(acceptInfo, callback, sockRef);
  socket.read(acceptInfo.socketId, function(readInfo){
    var data = ab2str(readInfo.data);
    console.log(data);
    
    console.log("Entering callback..");
    callback(acceptInfo, data);
    console.log("Exited callback..");
    
    chrome.socket.destroy(acceptInfo.socketId);
    chrome.accept(sockRef.socket, function(accInfo){
      acceptTCP(accInfo, callback, sockRef);
    });
  });
  callback(acceptInfo);
}

function connect(sockRef, callback){
  chrome.socket.create(sockRef.protocol, null, function(createInfo){
  sockRef.socket = createInfo.socketId;
    
    if(sockRef.type == "bind" && sockRef.protocol == "udp")
    {
      chrome.socket.bind(sockRef.socket, '0.0.0.0', sockRef.port, function(result){
        console.log('chrome.socket.bind: result = ' + result.toString());
        if(result >= 0)
          readUDP(sockRef.socket, callback);
        else
          console.log("Bind Error!!");
      });
    }

    if(sockRef.type == "listen" && sockRef.protocol == "tcp")
    {
      chrome.socket.listen(sockRef.socket, '0.0.0.0', sockRef.port, function(result) {
        console.log('chrome.socket.listen: result = ' + result.toString());
        if(result >= 0)
        {
          chrome.socket.accept(sockRef.socket, function(acceptInfo){
            acceptTCP(acceptInfo, callback, sockRef);
          });
        }
      });
      //readUDP(sockRef.socket)
    }

  });
}