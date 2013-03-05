var sockets = {
    "recv": {
      protocol: "udp",
      port: 8897,
      socket: null,
      type: 'bind'
    }
}

var players = new Array();
var player = function(P,id,s,k){
    P.id = id;
    P.s = s;
    P.k = k;
    players.push(P);
}
var maxScore = 0;
var maxKills = 0;
var readScore = function (data) {
    var msg = ab2str(data);
    var data = msg.split(",");
    //console.log(msg);
    if(data[0] == "score")
    {
        var playerIndex = -1;
        for(i=0;i<players.length;i++)
        {
            var p = players[i];
            if(p.id == data[1])
                playerIndex = i;
        }
        if(playerIndex >=0 )
        {
            players[playerIndex].s = data[2];
            if(parseInt(data[2]) > parseInt(maxScore))
                maxScore = data[2];
            players[playerIndex].k = data[3];
            if(parseInt(data[3]) > parseInt(maxKills))
                maxKills = data[3];
        }else{
            player({}, data[1], data[2], data[3]);
        }
    }
    if(data[0] == "end")
    {
        var playerIndex = -1;
        for(i=0;i<players.length;i++)
        {
            var p = players[i];
            if(parseInt(p.id) == parseInt(data[1]))
                playerIndex = i;
        }
        if(playerIndex >=0 )
        {
            players.splice(playerIndex, 1);
        }
    }
}

var dispScore = function (){
    var scores = document.getElementById('scores');
    scores.innerHTML = "";
    for(i=0;i<players.length;i++)
    {
        var p = players[i];
        scores.innerHTML += "<b>Player "+ p.id +":</b> Score: <b><i>"+ p.s +"</i></b>&nbsp;&nbsp;&nbsp;Kills: <b><i>"+ p.k +"</i></b><br>";
    }

    var score = document.getElementById('score');
    var kill = document.getElementById('kill');
    score.innerHTML = maxScore;
    kill.innerHTML = maxKills;
}
window.onload = function () {
    connect(sockets['recv'], readScore);
    setInterval(dispScore, 500);
}