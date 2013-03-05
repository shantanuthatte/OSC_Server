document.getElementById('enter').addEventListener('click', function(e) {
  document.body.webkitRequestFullscreen();
});
document.getElementById('exit').addEventListener('click', function(e) {
  document.webkitExitFullscreen();
});

var split1 = window.location.search.substring(1);
    console.log(split1);

// Create the canvas for 1680 x 1050 screen (in Chrome, hit F11)
// 1920 x 1200 on right screens
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
//canvas.width = screen.width;
//canvas.height = screen.height;
canvas.width = 1620;
canvas.height = 1020;
document.body.appendChild(canvas);

// game start control
var StartGame = 0;

// globals
var HEROSPEED = 150;
var MONSPEEDN = 80;    // monster normal speed
var MONSPEEDF = 250;    // red-eyed monster speed
var ZOMBSPEED = 120;
var LEFTWALL = 64;
var TOPWALL = 64;
var RIGHTWALL = canvas.width - 64;
var BTMWALL = canvas.height - 64;
var ZCNT = 4;       // zombie random wall angle countdown
var ZSCORE = 5;     // score for killing a zombie
var ZHIT = -2;      // penalty for touching a zombie
var MHIT = -1;      // penalty for touching a red eyed monster

// websocket stuff
var kDown = 'k r1';
var ws = null;

window.onload = function () {
/*    // get a socket
    if ('WebSocket' in window) {
        ws = new WebSocket('ws://' + window.location.host + '/p2game');
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket('ws://' + window.location.host + '/p2game');
    } else {
        alert("WebSocket NOT supported by your Browser!");
        return;
    }
    // socket event handlers
    ws.onopen = function() { StartGame = 0; }
    ws.onmessage = function (evt) { 
        kDown = evt.data; 
        if (kDown.search('s1') > -1) StartGame = 1;
    }
    ws.onclose = function() { StartGame = 0; }
*/}

function rndNegate() {
    var r = -1;
    if (Math.random() > 0.5) r = 1;
    return r;
}

// Background image
var bgReady = false;
var bgImage = new Image();
bgImage.onload = function () {
    bgReady = true;
};
bgImage.src = "images/background_1620x1020.png";

// Hero array
var heros = [];

// Hero constructor
function Hero(I,x,y,w,h,n,isrc,ku,kd,kl,kr) {
    I.x = x; I.y = y; I.x2=x+w; I.y2=y+h; I.n = n;
    I.speed = HEROSPEED; I.ku = ku; I.kd = kd; I.kl = kl; I.kr = kr;
    I.score = 0;
    I.zkills = 0;
    I.image = new Image();
    I.image.src = isrc;
    I.imageReady = false;
    I.w = w;
    I.h = h;
    // update hero position based on keys pressed (but stop at walls)
    I.update = function(dtime) {
        /*var d = this.speed*dtime;
        if ((kDown.search(this.ku)>-1)&&(this.y>TOPWALL)) {this.y-=d; this.y2-=d;}
        if ((kDown.search(this.kd)>-1)&&(this.y2<BTMWALL)) {this.y+=d; this.y2+=d;}
        if ((kDown.search(this.kl)>-1)&&(this.x>LEFTWALL)) {this.x-=d; this.x2-=d;}
        if ((kDown.search(this.kr)>-1)&&(this.x2<RIGHTWALL)) {this.x+=d; this.x2+=d;}
        */
        //console.log("update");
        if(this.y < TOPWALL) {this.y = TOPWALL;}
        if((this.y+this.h) > BTMWALL) {this.y = BTMWALL-this.h;}
        if(this.x < LEFTWALL) {this.x = LEFTWALL;}
        if((this.x+this.w) > RIGHTWALL) {this.x = RIGHTWALL-this.w;}
        this.x = this.x || 0;
        this.x2 = this.x+this.w;
        this.y = this.y || 0;
        this.y2 = this.y+this.h;
        //console.log(this);
        //console.log("Finished update");
    }
    // draw a here if the image is ready
    I.draw = function() {
        if (this.imageReady) ctx.drawImage(this.image, this.x, this.y);
    }
    // put hero into array
    heros.push(I);
    return I;
}

// monster array
var monsters = [];

// monster constructor
function Monster(I,w,h,isrc,isrcred) {
    I.x = canvas.width/5 + (Math.random()*canvas.width*3/5);
    I.y = canvas.height/10 + (Math.random()*canvas.height*4/5); 
    I.x2=I.x+w; I.y2=I.y+h;
    I.speed = MONSPEEDN;
    // random monster directions (normalized to lenght of 1)
    I.dx = (0.5 + Math.random()/2.2)*rndNegate(); 
    I.dy = (Math.sqrt(1 - I.dx*I.dx))*rndNegate();
    I.red = false;      // true means monster is red-eyed!
    I.hero = null;
    I.image = new Image();
    I.image.src = isrc;
    I.imageReady = false;
    I.imageR = new Image();
    I.imageR.src = isrcred;
    I.imageRReady = false;
    // update monster's x,y based on direction
    I.update = function(dtime) {
        var d = this.speed*dtime;
        var xch = this.dx*d;
        var ych = this.dy*d;
        this.x += xch; this.x2 += xch;
        this.y += ych; this.y2 += ych;
    }
    // see if monster hit a wall and make him bounce
    I.hitwall = function() {
        var hw = false;
        if (this.x <= LEFTWALL) {
            if (this.dx < 0) this.dx *= -1;
            hw = true;
        } else if (this.x2 > RIGHTWALL) {
            if (this.dx > 0) this.dx *= -1;
            hw = true;
        } else if (this.y < TOPWALL) {
            if (this.dy < 0) this.dy *= -1;
            hw = true;
        } else if (this.y2 > BTMWALL) {
            if (this.dy > 0) this.dy *= -1;
            hw = true;
        }
        // if he is red-eyed, take his zombie killing powers away when he hits wall
        if (hw && this.red) {
            this.dx = (0.5 + Math.random()/2.2)*rndNegate(); 
            this.dy = (Math.sqrt(1 - this.dx*this.dx))*rndNegate();
            this.red = false;
            this.speed = MONSPEEDN;
            this.hero = null;
            var j = this.ip;
            // reset all hero flags that he touched
            for (var i=0;i<heros.length;i++) heros[i].m[j] = false;
        }
    }
    // draw the correct monster
    I.draw = function() {
        if (this.red) ctx.drawImage(this.imageR, this.x, this.y);
        else ctx.drawImage(this.image, this.x, this.y);
    }
    // push monster onto the monster array
    monsters.push(I);
    return I;
}

// zombie array
var zombies = [];

// zombie constructor
function Zombie(I,w,h,isrc) {
    I.x = canvas.width/5 + (Math.random()*canvas.width*3/5);
    I.y = canvas.height/10 + (Math.random()*canvas.height*4/5); 
    I.x2=I.x+w; I.y2=I.y+h;
    I.speed = ZOMBSPEED;
    I.dx = (0.5 + Math.random()/2.2)*rndNegate(); 
    I.dy = (Math.sqrt(1 - I.dx*I.dx))*rndNegate();
    // a red-eyed monster can kill a zombie
    I.alive = true;
    I.cnt = ZCNT;
    I.image = new Image();
    I.image.src = isrc;
    I.imageReady = false;
    
    I.update = function(dtime) {
        var d = this.speed*dtime;
        var xch = this.dx*d;
        var ych = this.dy*d;
        this.x += xch; this.x2 += xch;
        this.y += ych; this.y2 += ych;
    }
    // see if zombie hit a wall and make him bounce.
    // He changes directions every ZCNT wall hits.
    I.hitwall = function() {
        if (this.x <= LEFTWALL) {
            if (this.dx < 0) {this.dx *= -1; this.cnt-=1;}
        } else if (this.x2 > RIGHTWALL) {
            if (this.dx > 0) {this.dx *= -1; this.cnt-=1;}
        } else if (this.y < TOPWALL) {
            if (this.dy < 0) {this.dy *= -1; this.cnt-=1;}
        } else if (this.y2 > BTMWALL) {
            if (this.dy > 0) {this.dy *= -1; this.cnt-=1;}
        }
        if (this.cnt < 0) {
            this.dx = (0.5 + Math.random()/2.2)*rndNegate(); 
            this.dy = (Math.sqrt(1 - this.dx*this.dx))*rndNegate();
            var j = this.ip;
            // reset hero flags when zombie hits the wall
            for (var i=0;i<heros.length;i++) heros[i].z[j] = false;
            this.cnt = ZCNT;
        }
    }
    I.draw = function() {
        if (this.imageReady && this.alive) 
            ctx.drawImage(this.image, this.x, this.y);
    }
    // push zombie onto the zombie array
    zombies.push(I);
    return I;
}

// render heros, monsters, and zombies.  display score until Shantanu fixes new function
function render(aliveZombies) {
    var i;
    for (i=0;i<heros.length;i++) heros[i].draw();
    for (i=0;i<monsters.length;i++) monsters[i].draw();
    for (i=0;i<zombies.length;i++) zombies[i].draw();

    // score on this screen for now
    var scx = 16
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    for (i=0;i<heros.length;i++) {
        h = heros[i];
        ctx.fillText("Hero"+h.n+": "+String(h.score)+","+String(h.zkills), scx, 16);
        scx += 150;
    }
    // game is over when all zombies are dead
    if (aliveZombies < 1) {
        ctx.font = "96px Helvetica";
        ctx.fillText("GAME OVER!", 500, 200);
        StartGame = -1;
    }
    // game is starting
    if (StartGame == 0) {
        ctx.font = "128px Helvetica";
        ctx.fillText("DodgE PonG", 450, 440);
    }
}

// update positions for heros, monsters, and zombies
function update(dms) {
    var i;
    for (i=0;i<heros.length;i++) heros[i].update(dms);
    for (i=0;i<monsters.length;i++) monsters[i].update(dms);
    for (i=0;i<monsters.length;i++) monsters[i].hitwall();
    for (i=0;i<zombies.length;i++) 
        if (zombies[i].alive) zombies[i].update(dms);
    for (i=0;i<zombies.length;i++) 
        if (zombies[i].alive) zombies[i].hitwall();
}

// return true if object's rectangles overlap
function collides(a, b) {
  return a.x < b.x2 && a.x2 > b.x && a.y < b.y2 && a.y2 > b.y;
}

// Hero/Monster collisions.
// Two cases:
//    case 1: monster is not red-eyed and he bounces off of hero, becoming
//            the hero's red-eyed monster
//    case 2: monster is red-eyed; he hurts other heros and kills zombies
function heroMonsterCollisions() {
    for (var i=0;i<heros.length;i++) {
        var h = heros[i];
        for (var j=0;j<monsters.length;j++) {
            var m = monsters[j];
            if (collides(h,m)) {
                if (!m.red) {
                    // not red-eyed so he bounces
                    if (h.x < m.x) m.dx = Math.abs(m.dx);
                    else m.dx = -Math.abs(m.dx);
                    m.speed = MONSPEEDF;
                    m.red = true;
                    m.hero = h;
                    h.m[j] = true;
                } else if (!h.m[j]) {
                    // uh-oh, hero has been touched so make a point deduction
                    h.score += MHIT;
                    h.m[j] = true;
                }
            }
        }
    }
}
//
// Hero/Zombie collisions cause a point deduction for the Hero.
function heroZombieCollisions() {
    for (var i=0;i<heros.length;i++) {
        var h = heros[i];
        for (var j=0;j<zombies.length;j++) {
            var z = zombies[j];
            if (!z.alive) continue;
            if (collides(h,z)) {
                if (!h.z[j]) {
                    h.score += ZHIT;
                    h.z[j] = true;
                }
            }
        }
    }
}

// zombie/monster collision
// if monster is red-eyed, the zombie is killed, with kill credit going to
// the Hero who bounced the monster
function zombieMonsterCollisions() {
    for (var i=0;i<zombies.length;i++) {
        var z = zombies[i];
        if (!z.alive) continue;
        for (var j=0;j<monsters.length;j++) {
            var m = monsters[j];
            if (collides(z,m)) {
                if (m.red) {
                    z.alive = false;
                    m.hero.score += ZSCORE;
                    m.hero.zkills += 1;
                }
            }
        }
    }
}

// init the arrays that keep track of who has hit whom
function initHeroC() {
    var i;
    for(i=0;i<heros.length;i++) {
        var h = heros[i];
        h.m = new Array(monsters.length);
        for(var j=0;j<monsters.length;j++) h.m[j] = false;
        h.z = new Array(zombies.length);
        for(var j=0;j<zombies.length;j++) h.z[j] = false;
    }
    for(i=0;i<zombies.length;i++) {
        var z = zombies[i];
        z.m = new Array(monsters.length);
        for(var j=0;j<monsters.length;j++) z.m[j] = false;
    }
    for(i=0;i<monsters.length;i++) monsters[i].ip = i;
    for(i=0;i<zombies.length;i++) zombies[i].ip = i;
}

// ok, make all the heros, monsters, and zombies
/*
var hero1 = Hero({},200,100,74,96,"1","images/pl_base.png",'u1','d1','l1','r1');
hero1.image.onload = function() { hero1.imageReady = true; }
var hero2 = Hero({},200,400,74,96,"2","images/pl_base.png",'u2','d2','l2','r2');
hero2.image.onload = function() { hero2.imageReady = true; }
var hero3 = Hero({},200,700,74,96,"3","images/pl_base.png",'u3','d3','l3','r3');
hero3.image.onload = function() { hero3.imageReady = true; }
*/
var mon1 = Monster({},96,87,"images/monster2.png","images/monster2r.png");
mon1.image.onload = function() { mon1.imageReady = true; }
mon1.imageR.onload = function() { mon1.imageRReady = true; }
var mon2 = Monster({},96,87,"images/monster2.png","images/monster2r.png");
mon2.image.onload = function() { mon2.imageReady = true; }
mon2.imageR.onload = function() { mon2.imageRReady = true; }
var mon3 = Monster({},96,87,"images/monster2.png","images/monster2r.png");
mon3.image.onload = function() { mon3.imageReady = true; }
mon3.imageR.onload = function() { mon3.imageRReady = true; }
var mon4 = Monster({},96,87,"images/monster2.png","images/monster2r.png");
mon4.image.onload = function() { mon4.imageReady = true; }
mon4.imageR.onload = function() { mon4.imageRReady = true; }

var zom1 = Zombie({},75,95,"images/zombie.png");
zom1.image.onload = function() { zom1.imageReady = true; }
var zom2 = Zombie({},75,95,"images/zombie.png");
zom2.image.onload = function() { zom2.imageReady = true; }
var zom3 = Zombie({},75,95,"images/zombie.png");
zom3.image.onload = function() { zom3.imageReady = true; }
var zom4 = Zombie({},75,95,"images/zombie.png");
zom4.image.onload = function() { zom4.imageReady = true; }
var zom5 = Zombie({},75,95,"images/zombie.png");
zom5.image.onload = function() { zom5.imageReady = true; }
var zom6 = Zombie({},75,95,"images/zombie.png");
zom6.image.onload = function() { zom6.imageReady = true; }
var zom7 = Zombie({},75,95,"images/zombie.png");
zom7.image.onload = function() { zom7.imageReady = true; }
var zom8 = Zombie({},75,95,"images/zombie.png");
zom8.image.onload = function() { zom8.imageReady = true; }


var sockets = {
    "recv": {
      protocol: "udp",
      port: 8898,
      socket: null,
      type: 'bind'
    }
}

var readPXY = function (data) {
  var msg = ab2str(data);
  var coor = msg.split(",");
  //console.log(coor);
  if(coor[3]){
    if(coor[3] == "add")
    {
        var hero1 = Hero({},200,100,74,96,(parseInt(coor[2])+1).toString(),"images/pl_base.png",'u1','d1','l1','r1');
        hero1.image.onload = function() { hero1.imageReady = true; }

        var hero2 = Hero({},200,400,74,96,"2","images/pl_base.png",'u2','d2','l2','r2');
        hero2.image.onload = function() { hero2.imageReady = true; }
        var hero3 = Hero({},200,700,74,96,"3","images/pl_base.png",'u3','d3','l3','r3');
        hero3.image.onload = function() { hero3.imageReady = true; }
        initHeroC();
        if(heros.length > 0)
        {
            StartGame = 1;
        }
    }
  }else{
      //console.log(heros[coor[2]]);
      var xDisp = Math.round(parseInt(coor[0])/10);
      var yDisp = Math.round(parseInt(coor[1])/10);
      //console.log("Displacement", xDisp, yDisp);
      heros[coor[2]].x += xDisp;
      //heros[coor[2]].x2 += xDisp;
      heros[coor[2]].y -= yDisp;
      //heros[coor[2]].y2 += yDisp;
        main();
      //console.log(heros[coor[2]]);
  }
}

// The main game loop
var main = function () {
    var now = Date.now();
    var dsecs = (now - then)/1000;
    if (bgReady) {
        ctx.drawImage(bgImage, 0, 0);
    }
    // get keys (every other iteration)
    if (get_keys == 0) {
        var scr = '';
        for (i=0;i<heros.length;i++) {
            var h = heros[i];
            scr = scr + "Hero"+h.n+": "+String(h.score)+","+String(h.zkills)+"|";
        }
        //ws.send(scr);
        get_keys = 0;
    } else get_keys = 0;

    // count number of alive zombies
    var aliveZombies = 0;
    for (var i=0;i<zombies.length;i++) 
        if (zombies[i].alive) aliveZombies += 1;
    if ((StartGame == 1) && (aliveZombies > 0)) {
        update(dsecs);
        zombieMonsterCollisions();
        heroMonsterCollisions();
        heroZombieCollisions();
    }
    render(aliveZombies);
    then = now;
};

var then = Date.now();
var get_keys = 0;

connect(sockets['recv'], readPXY);
setInterval(main, 1000/20); // Execute 30 times per second