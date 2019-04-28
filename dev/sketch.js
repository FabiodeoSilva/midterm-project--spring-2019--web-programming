"use strict";

document.querySelector("canvas#_imageData").style.display = "none";

class Screens {
  constructor() {
    this.screens = [manyEyes];
    this.draw = this.screens[0];
  }
  rand() {
    this.draw = this.screens[Math.floor(Math.random() * this.screens.length)];
  }
}

let mainCanvas = new Screens();

handleTrackingResults = function(brfv4, faces, d, img) {
  mainCanvas.draw(brfv4, faces, d, img);

  d.redraw();
};

let webcamH = document.getElementById("_imageData").height;
let webcamW = document.getElementById("_imageData").width;

function getWebcamVid(faces, d, img) {
  d.loadPixels();
  for (let i = 0; i <= img.length; i++) {
    d.pixels[i] = img[i];
  }
  d.updatePixels();
}

function stopMouth(brfv4, faces, d, img) {
  basicAR(brfv4, faces, d, img, noMouth);
}

function stopEyes(brfv4, faces, d, img) {
  basicAR(brfv4, faces, d, img, noEyes);
}

function onFace(brfv4, faces, d, img, func) {
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      for (let k = 0; k < face.vertices.length; k += 2) {}
    }
  }
}

function basicAR(brfv4, faces, d, img, ...funcs) {
  getWebcamVid(faces, d, img);

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];

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

  let eye = null,
    face = null,
    skin = null;

  for (let i = 0; i < faces.length; i++) {
    face = faces[i];

    if (
      face.state === brfv4.BRFState.FACE_TRACKING_START ||
      face.state === brfv4.BRFState.FACE_TRACKING
    ) {
      eye = d.get(face.vertices[72] - 5, face.vertices[72 + 1] - 10, 45, 20);

      // skin = d.get(face.vertices[54], face.vertices[54 + 1] - 50, 40, 20);

      d.image(eye, face.vertices[54] - 27, face.vertices[54 + 1] - 50);

      //d.image(skin, face.vertices[72] - 10, face.vertices[72 + 1] - 10);
      //d.image(skin, face.vertices[84] - 10, face.vertices[84 + 1] - 10);

      /*  anonymous eyes
               d.rect(face.vertices[72] - 10, face.vertices[72 + 1] - 20, 150, 40);
               d.fill(0);*/

      d.rect(
        face.vertices[96] - 5,
        face.vertices[100 + 1] - 20,
        face.vertices[108] - face.vertices[96],
        face.vertices[115] - face.vertices[103] + 10
      );
      d.fill(0);
    }
  }
}

function manyEyes(brfv4, faces, d, img) {
  getWebcamVid(faces, d, img);

  let leftEye = null;
  let rightEye = null;

  let face = null;

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

(function(lib) {
  "use strict";

  lib.BRFv4PointUtils = {
    setPoint: function(v, i, p) {
      p.x = v[i * 2];
      p.y = v[i * 2 + 1];
    },
    applyMovementVector: function(p, p0, pmv, f) {
      p.x = p0.x + pmv.x * f;
      p.y = p0.y + pmv.y * f;
    },
    interpolatePoint: function(p, p0, p1, f) {
      p.x = p0.x + f * (p1.x - p0.x);
      p.y = p0.y + f * (p1.y - p0.y);
    },
    getAveragePoint: function(p, ar) {
      p.x = 0.0;
      p.y = 0.0;
      for (let i = 0, l = ar.length; i < l; i++) {
        p.x += ar[i].x;
        p.y += ar[i].y;
      }
      p.x /= l;
      p.y /= l;
    },
    calcMovementVector: function(p, p0, p1, f) {
      p.x = f * (p1.x - p0.x);
      p.y = f * (p1.y - p0.y);
    },
    calcMovementVectorOrthogonalCW: function(p, p0, p1, f) {
      lib.BRFv4PointUtils.calcMovementVector(p, p0, p1, f);
      let x = p.x;
      let y = p.y;
      p.x = -y;
      p.y = x;
    },
    calcMovementVectorOrthogonalCCW: function(p, p0, p1, f) {
      lib.BRFv4PointUtils.calcMovementVector(p, p0, p1, f);
      let x = p.x;
      let y = p.y;
      p.x = y;
      p.y = -x;
    },
    calcIntersectionPoint: function(p, pk0, pk1, pg0, pg1) {
      //y1 = m1 * x1  + t1 ... y2 = m2 * x2 + t1
      //m1 * x  + t1 = m2 * x + t2
      //m1 * x - m2 * x = (t2 - t1)
      //x * (m1 - m2) = (t2 - t1)

      let dx1 = pk1.x - pk0.x;
      if (dx1 == 0) dx1 = 0.01;
      let dy1 = pk1.y - pk0.y;
      if (dy1 == 0) dy1 = 0.01;

      let dx2 = pg1.x - pg0.x;
      if (dx2 == 0) dx2 = 0.01;
      let dy2 = pg1.y - pg0.y;
      if (dy2 == 0) dy2 = 0.01;

      let m1 = dy1 / dx1;
      let t1 = pk1.y - m1 * pk1.x;

      let m2 = dy2 / dx2;
      let t2 = pg1.y - m2 * pg1.x;

      let m1m2 = m1 - m2;
      if (m1m2 == 0) m1m2 = 0.01;
      let t2t1 = t2 - t1;
      if (t2t1 == 0) t2t1 = 0.01;
      let px = t2t1 / m1m2;
      let py = m1 * px + t1;

      p.x = px;
      p.y = py;
    },
    calcDistance: function(p0, p1) {
      return Math.sqrt(
        (p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y)
      );
    },
    calcAngle: function(p0, p1) {
      return Math.atan2(p1.y - p0.y, p1.x - p0.x);
    },
    toDegree: function(x) {
      return (x * 180.0) / Math.PI;
    },
    toRadian: function(x) {
      return (x * Math.PI) / 180.0;
    }
  };
})(brfv4);

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
