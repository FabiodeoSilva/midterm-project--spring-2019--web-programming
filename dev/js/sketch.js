"use strict";

/*remove face tracking canvas from page*/
document.querySelector("canvas#_imageData").style.display = "none";

let webcamH = document.getElementById("_imageData").height;
let webcamW = document.getElementById("_imageData").width;

function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}


let dist, point1x, point1y, point2x, point2y;  
let eye, face, skin;
let leftEye = null;
let rightEye = null;


/*loads every pixel from the webcam raw canvas to p5 canvas*/
let getWebcamVid = (faces, d, img) => {
  d.loadPixels();
  for (let i = 0; i <= img.length; i++) {
    d.pixels[i] = img[i];
  }
  d.updatePixels();
};

/*Math Section*/
let populateRandomLinesArray = (amount) =>{
    let point1, point2;
     randomLines = [];
    for(let i = -3; i<= amount; i++){
      point1 = Math.floor(random(0, 33));
      point2 = Math.floor(random(34, 67));
       randomLines.push(point1);
       randomLines.push(point2);
    }
    return randomLines;
}



let goldenRatio = (brfv4, faces, d, img) => {
  basicAR(brfv4,  faces,  d,  img, (face, d)=>{   
    d.noFill();
    d.rect(
      face.vertices[0], 
      face.vertices[39], 
      face.vertices[32] - face.vertices[0], 
      face.vertices[39] - face.vertices[17]);
      d.line(face.vertices[48],face.vertices[49], face.vertices[16], face.vertices[17] )
   /* d.rect(
    face.vertices[0], 
    face.vertices[9], 
    (face.vertices[32] - face.vertices[0])/2, 
    (face.vertices[39] - face.vertices[17]));
    d.rect(
      face.vertices[0], 
      face.vertices[9], 
      (face.vertices[32] - face.vertices[0])/2, 
      (face.vertices[39] - face.vertices[17])/2);*/
});

}
let numberOnFace = (brfv4, faces, d, img) => {

  basicAR(brfv4,  faces,  d,  img, (face, d) => {
    for(let i = 0; i <= face.vertices.length-1; i++){
      console.log(i);
      d.textSize(30);
      d.text(random(1, 10), face.vertices[i*8], face.vertices[(i*8)+1]);
    }
  });
}

let faceCoor = [
  0, 8,
  36, 45,
  0, 15,
  8, 15,
  27, 8,
  48, 54,
  17, 26,
  31, 35,
  24, 44,
  19, 38
];      

let lineForms = (brfv4, faces, d, img) =>{

  basicAR(brfv4,  faces,  d,  img, (face, d)=>{   
    for(let i = 0; i <= (faceCoor.length/2)-1; i++){

      point1x = face.vertices[(faceCoor[i*2])*2];
      point1y = face.vertices[((faceCoor[i*2]+1)*2)+1];

      point2x = face.vertices[faceCoor[(i*2)+1]*2]; 
      point2y = face.vertices[(faceCoor[(i*2)+1]*2)+1];

      dist = Math.floor(d.dist( point1x, point1y, point2x, point2y));
      d.text(dist, point1x + dist/2, point1y);
      d.line(point1x, point1y, point2x, point2y);
    }
  });
}
let o = 0;

let drawLine = (brfv4,  faces,  d,  img) =>{
  basicAR(brfv4,  faces,  d,  img, (face, d)=>{  
   
    d.ellipse(face.vertices[0*2], face.vertices[(0*2)+1], 10, 10);
    d.ellipse(face.vertices[17*2], face.vertices[(17*2)+1], 10, 10);


    if((face.vertices[(0*2)])+o <= face.vertices[(17*2)]) {

      d.line (
      face.vertices[0*2],
      face.vertices[(0*2)+1],
      face.vertices[0*2]+o,
      face.vertices[(0*2)+1]-o);

     o += 0.5;
    } else{
      d.line (face.vertices[0*2], face.vertices[(0*2)+1], face.vertices[36*2], face.vertices[(36*2)+1]);
    }
  
  });
}

let stopMouth = (brfv4, faces, d, img) => {
  basicAR(brfv4, faces, d, img, noMouth);
};

let stopEyes = (brfv4, faces, d, img) => {
  basicAR(brfv4, faces, d, img, noEyes);
};

function basicAR(brfv4, faces, d, img, ...funcs) {
  getWebcamVid(faces, d, img);

  for (let i = 0; i < faces.length; i++) {
    face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      funcs.forEach(func => {
        func(face, d);
      });
    }
  }
}

function cyclops(brfv4, faces, d, img) {
  getWebcamVid(faces, d, img);

    eye = null,
    face = null,
    skin = null;

  for (let i = 0; i < faces.length; i++) {
    face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      eye = d.get(face.vertices[72] - 5, face.vertices[72 + 1] - 10, 45, 20);

      skin = d.get(face.vertices[54], face.vertices[54 + 1] - 50, 40, 20);

      d.image(eye, face.vertices[54] - 27, face.vertices[54 + 1] - 50);

      d.image(skin, face.vertices[72] - 10, face.vertices[72 + 1] - 10);
      d.image(skin, face.vertices[84] - 10, face.vertices[84 + 1] - 10);

      /*  anonymous eyes
               d.rect(face.vertices[72] - 10, face.vertices[72 + 1] - 20, 150, 40);
               d.fill(0);*/
    }
  }
}

function manyEyes(brfv4, faces, d, img) {
  getWebcamVid(faces, d, img);

  leftEye = null;
  rightEye = null;

  face = null;

  for (let i = 0; i < faces.length; i++) {
    face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      leftEye = d.get(
        face.vertices[72] - 5,
        face.vertices[72 + 1] - 10,
        45,
        20
      );
      rightEye = d.get(
        face.vertices[84] - 5,
        face.vertices[84 + 1] - 10,
        45,
        20
      );

      //d.image(leftEye, face.vertices[i], face.vertices[i + 1]);

      for (let k = 0; k < face.vertices.length; k += 2) {
        if (k % 3 === 0) {
          d.image(leftEye, face.vertices[k], face.vertices[k + 1]);
        }
        if (k % 4 == 0) {
          d.image(rightEye, face.vertices[k], face.vertices[k + 1]);
        }
      }
    }
  }
}

function noEyes(face, d) {
  //window.max.outlet("noEyes");
  d.rect(
    face.vertices[72] - 5,
    face.vertices[72 + 1] - 10,
    face.vertices[90] + 10 - face.vertices[72],
    30
  );
  d.fill(0);
}

function noMouth(face, d) {
  //window.max.outlet("noMouth");
  d.rect(
    face.vertices[96],
    face.vertices[100 + 1] - 10,
    face.vertices[108] - face.vertices[96],
    face.vertices[115] - face.vertices[103] + 10
  );
  d.fill(0);
}

function censorSmile(face, d) {}

function checkBlink(brfv4, faces) {
  let _oldFaceShapeVertices = [];
  let _blinked = false;
  let _timeOut = -1;

  function blink() {
    _blinked = true;

    if (_timeOut > -1) {
      clearTimeout(_timeOut);
    }

    _timeOut = setTimeout(resetBlink, 150);
  }

  function resetBlink() {
    _blinked = false;
  }

  function storeFaceShapeVertices(vertices) {
    for (let i = 0, l = vertices.length; i < l; i++) {
      _oldFaceShapeVertices[i] = vertices[i];
    }
  }

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];

    if (face.state === brfv4.BRFState.FACE_TRACKING) {
      // simple blink detection

      // It basically compares the old positions of the eye points to the current ones.
      // If rapid movement of the current points was detected it's considered a blink.

      let v = face.vertices;

      if (_oldFaceShapeVertices.length === 0) storeFaceShapeVertices(v);

      let k, l, yLE, yRE;

      // Left eye movement (y)

      for (k = 36, l = 41, yLE = 0; k <= l; k++) {
        yLE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
      }
      yLE /= 6;

      // Right eye movement (y)

      for (k = 42, l = 47, yRE = 0; k <= l; k++) {
        yRE += v[k * 2 + 1] - _oldFaceShapeVertices[k * 2 + 1];
      }

      yRE /= 6;

      let yN = 0;

      // Compare to overall movement (nose y)

      yN += v[27 * 2 + 1] - _oldFaceShapeVertices[27 * 2 + 1];
      yN += v[28 * 2 + 1] - _oldFaceShapeVertices[28 * 2 + 1];
      yN += v[29 * 2 + 1] - _oldFaceShapeVertices[29 * 2 + 1];
      yN += v[30 * 2 + 1] - _oldFaceShapeVertices[30 * 2 + 1];
      yN /= 4;

      let blinkRatio = Math.abs((yLE + yRE) / yN);

      if (blinkRatio > 12 && (yLE > 0.4 || yRE > 0.4)) {
        console.log(
          "blink " +
            blinkRatio.toFixed(2) +
            " " +
            yLE.toFixed(2) +
            " " +
            yRE.toFixed(2) +
            " " +
            yN.toFixed(2)
        );

        blink();
      }

      // Let the color of the shape show whether you blinked.

      let color = 0x00a0ff;

      if (_blinked) {
        color = 0xffd200;
      }

      // Face Tracking results: 68 facial feature points.

      //draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
      //draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

      //nsole.log("BRFv4 - advanced - face tracking - simple blink" +"detection.\nDetects an eye  blink: " + (_blinked ? "Yes" : "No"));

      storeFaceShapeVertices(v);
      return _blinked ? 1 : 0;
    }
  }
}

function smileCheck(brfv4, faces) {
  let p0 = new brfv4.Point();
  let p1 = new brfv4.Point();

  let setPoint = brfv4.BRFv4PointUtils.setPoint;
  let calcDistance = brfv4.BRFv4PointUtils.calcDistance;

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      // Smile Detection

      setPoint(face.vertices, 48, p0); // mouth corner left
      setPoint(face.vertices, 54, p1); // mouth corner right

      let mouthWidth = calcDistance(p0, p1);

      setPoint(face.vertices, 39, p1); // left eye inner corner
      setPoint(face.vertices, 42, p0); // right eye outer corner

      let eyeDist = calcDistance(p0, p1);
      let smileFactor = mouthWidth / eyeDist;

      smileFactor -= 1.4; // 1.40 - neutral, 1.70 smiling

      if (smileFactor > 0.25) smileFactor = 0.25;
      if (smileFactor < 0.0) smileFactor = 0.0;

      smileFactor *= 4.0;

      if (smileFactor < 0.0) {
        smileFactor = 0.0;
      }
      if (smileFactor > 1.0) {
        smileFactor = 1.0;
      }

      // Let the color show you how much you are smiling.

      let color =
        (((0xff * (1.0 - smileFactor)) & 0xff) << 16) +
        (((0xff * smileFactor) & 0xff) << 8);

      // Face Tracking results: 68 facial feature points.

      //draw.drawTriangles(	face.vertices, face.triangles, false, 1.0, color, 0.4);
      //draw.drawVertices(	face.vertices, 2.0, false, color, 0.4);

      return (smileFactor * 100).toFixed(0);
    }
  }
}

let x = null;
let y = null;
let radius = 10;
let angle = 0;
let speed = 0.005;
let t = 0;
let k = null;

function imineStart(brfv4, faces, d, img) {
  d.background(0);

  d.push();
  d.translate(centerX, centerY);
  d.rotate(angle);
  for (let i = 1; i <= 12; i++) {
    x = 0 + radius * d.cos(angle);
    y = 0 + radius * d.sin(angle);

    if (i % 2 == 0) {
      d.rotate(-angle);
    }
    c.setLineDash([3, 20]);
    d.noFill();
    d.stroke("white");
    d.strokeWeight(2);
    d.ellipse(y, x, i * 30, i * 30);
  }
  radius = 0;
  d.pop();
  c.setLineDash([1, 0]);
  d.noFill();
  d.strokeWeight(3);
  d.stroke(" #add8e6");
  //rect(centerX - 150, centerY -150 , 300, 300);

  d.noStroke();

  d.fill(255);
  d.ellipse(centerX, centerY, 150, 80);
  k = d.map(d.noise(angle), 0, 1, 0, 70, true);
  d.fill(155);
  d.ellipse(centerX - k + 10, centerY, 80, 80);
  d.fill(0);
  d.ellipse(centerX - k + 10, centerY, 40, 40);
  d.fill(255);
  d.ellipse(centerX - k + 10 + 13, centerY - 13, 10, 10);
  d.ellipse(centerX - k + 10 + 5, centerY - 5, 5, 5);
  d.fill(0);
  //d.ellipse(k,  -40*d.sin(t/50) + centerY - 40 , 150, 80*d.sin(t/50)) ;

  d.fill(" #add8e6");
  d.textSize(50);
  d.text("iMine", centerX - 60, centerY + 120);
  d.textSize(40);
  d.text("hold metal sides to start", centerY - 120, centerY + 170);

  radius = 0;

  angle = angle + speed;

  if (t < 80) t++;
}

let inc = 0.01;
function whiteNoise(brfv4, faces, d, img) {
  let yoff = 0;
  d.loadPixels();
  for (let y = 0; y < d.height; y++) {
    let xoff = 0;
    for (let x = 0; x < d.width; x++) {
      let index = (x + y * d.width) * 4;
      let r = d.random(255);
      d.pixels[index + 0] = r;
      d.pixels[index + 1] = r;
      d.pixels[index + 2] = r;
      d.pixels[index + 3] = 255;
      xoff += inc;
    }
    yoff += inc;
  }
  d.updatePixels();
}


class Imine {
  constructor(periodSecs, screens, order = null) {
    this.period = periodSecs;
    this.screens = screens;
    this.currSec = 0;
    this.draw = this.screens[0];
    this.periodMultiplier = 1;
    this.currScreen = 0;
    this.order = order;
    this.orderIndex = 0;
  }
  setTimer() {
    this.timer = setInterval(() => {
      //determines the beginning of every period in seconds
      if (this.currSec == this.period * this.periodMultiplier) {
       //visual effects change by each period
        this.nextScreen();
        this.periodMultiplier++;
      }
      this.currSec++;
    }, 1000);
  }
  killTimer() {
    clearInterval(this.timer);
    this.currSec = 0;
  }

  init() {
    this.setTimer();
  }

  rand() {
    this.draw = this.screens[Math.floor(Math.random() * this.screens.length)];
  }
  nextScreen() {
    if (this.order) {
      this.draw = this.screens[this.order[this.orderIndex]];
      this.orderIndex++;
    } else {
      this.rand();
    }
  }
}

let mainCanvas = new Imine(10, [manyEyes, stopEyes, stopMouth, lineForms, cyclops]);
mainCanvas.init();

/*Loop below: everytime the lib finds a face, it executes this callback*/
handleTrackingResults = function(brfv4, faces, d, img) {

  mainCanvas.draw(brfv4, faces, d, img);

  /*P5's draw loop is turned off because this loop is running. Redraw updates the p5 canvas.*/
  d.redraw();
};
