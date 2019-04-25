// Even for a minimal example there are several functions that are commonly used by all minimal examples, eg. adding
// the correct script (wasm or asm.js), starting the webcam etc.

// Once we know whether wasm is supported we add the correct library script and initialize the example.

let _isWebAssemblySupported = (function() {
  function testSafariWebAssemblyBug() {
    let bin = new Uint8Array([
      0,
      97,
      115,
      109,
      1,
      0,
      0,
      0,
      1,
      6,
      1,
      96,
      1,
      127,
      1,
      127,
      3,
      2,
      1,
      0,
      5,
      3,
      1,
      0,
      1,
      7,
      8,
      1,
      4,
      116,
      101,
      115,
      116,
      0,
      0,
      10,
      16,
      1,
      14,
      0,
      32,
      0,
      65,
      1,
      54,
      2,
      0,
      32,
      0,
      40,
      2,
      0,
      11
    ]);
    let mod = new WebAssembly.Module(bin);
    let inst = new WebAssembly.Instance(mod, {});

    // test storing to and loading from a non-zero location via a parameter.
    // Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations

    return inst.exports.test(4) !== 0;
  }

  let isWebAssemblySupported = typeof WebAssembly === "object";

  if (isWebAssemblySupported && !testSafariWebAssemblyBug()) {
    isWebAssemblySupported = false;
  }

  return isWebAssemblySupported;
})();

function readWASMBinary(url, onload, onerror, onprogress) {
  let xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = function xhr_onload() {
    if (xhr.status === 200 || (xhr.status === 0 && xhr.response)) {
      onload(xhr.response);
      return;
    }
    onerror();
  };
  xhr.onerror = onerror;
  xhr.onprogress = onprogress;
  xhr.send(null);
}

function addBRFScript() {
  let script = document.createElement("script");

  script.setAttribute("type", "text/javascript");
  script.setAttribute("async", true);
  script.setAttribute("src", brfv4BaseURL + brfv4SDKName + ".js");

  document.getElementsByTagName("head")[0].appendChild(script);
}

// Some necessary global let s... (will need to refactor Stats for BRFv5.)

let brfv4Example = { stats: {} };
let brfv4BaseURL = _isWebAssemblySupported
  ? "libs/brf_wasm/"
  : "libs/brf_asmjs/";
let brfv4SDKName = "BRFv4_JS_TK101018_v4.1.0_trial"; // the currently available library
let brfv4WASMBuffer = null;

let handleTrackingResults = function(brfv4, faces, d, img) {};

/*function getPixels(img, W, x, y, w, h){
    
    let retval = [];
    let O = (x+y*W);
    
    for(let  i = 0; i < img.length; i++){
            
        if(img[i] < (O+w)*4 && img[i] < (O+(h*W+h)*4) ){
         retval.push(img[i]);   
        }
    }

    return retval;  
}*/

let onResize = function() {
  // fill whole browser

  console.log("resize");

  let imageData = document.querySelector(".p5Canvas");
  let oldervid = document.getElementById("_imageData");
  oldervid.style.display = "none";

  let ww = window.innerWidth;
  let wh = window.innerHeight;

  let s = wh / imageData.height;

  if (imageData.width * s < ww) {
    s = ww / imageData.width;
  }

  let iw = imageData.width * s;
  let ih = imageData.height * s;
  let ix = (ww - iw) * 0.5;
  let iy = (wh - ih) * 0.5;

  imageData.style.transformOrigin = "0% 0%";
  imageData.style.transform =
    "matrix(" + s + ", 0, 0, " + s + ", " + ix + ", " + iy + ")";
};

let onInitBRFv4 = function(brfManager, resolution) {
  // Will be called when BRFv4 was initialized.
  // implement this function in your minimal example.
};
let c = null;
let brfv4 = null;
let centerX = null;
let centerY = null;
function initExample() {
  // This function is called after the BRFv4 script was added.

  // BRFv4 needs the correct input image data size for initialization.
  // That's why we need to start the camera stream first and get the correct
  // video stream dimension. (startCamera, onStreamFetched, onStreamDimensionsAvailable)

  // Once the dimension of the video stream is known we need to wait for
  // BRFv4 to be ready to be initialized (waitForSDK, initSDK)

  // Once BRFv4 was initialized, we can track faces (trackFaces)

  let webcam = document.getElementById("_webcam"); // our webcam video
  let imageData = document.getElementById("_imageData"); // image data for BRFv4
  let imageDataCtx = null; // only fetch the context once

  // the library namespace
  let brfManager = null; // the API
  let resolution = null; // the video stream resolution (usually 640x480)
  let timeoutId = -1;

  let canvasDraw = function(d) {
    d.setup = function() {
      c = document.querySelector("canvas.p5Canvas").getContext("2d");
      d.noLoop();
      d.pixelDensity(1);
      centerX = d.width / 2;
      centerY = d.height / 2;
    };
    d.draw = function() {};
  };

  let draw = new p5(canvasDraw);

  // iOS has this weird behavior that it freezes the camera stream, if the CPU get's
  // stressed too much, but it doesn't unfreeze the stream upon CPU relaxation.
  // A workaround is to get the video stream dimension and then turn the stream off
  // until BRFv4 was successfully initialized (takes about 3 seconds of heavy CPU work).

  let isIOS =
    /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;

  startCamera();

  function startCamera() {
    console.log("startCamera");

    // Start video playback once the camera was fetched to get the actual stream dimension.
    function onStreamFetched(mediaStream) {
      console.log("onStreamFetched");

      webcam.srcObject = mediaStream;
      webcam.play();

      // Check whether we know the stream dimension yet, if so, start BRFv4.
      function onStreamDimensionsAvailable() {
        console.log(
          "onStreamDimensionsAvailable: " + (webcam.videoWidth !== 0)
        );

        if (webcam.videoWidth === 0) {
          setTimeout(onStreamDimensionsAvailable, 100);
        } else {
          // Resize the canvas to match the webcam video size.
          imageData.width = webcam.videoWidth;
          imageData.height = webcam.videoHeight;
          imageDataCtx = imageData.getContext("2d");
          draw.createCanvas(
            imageDataCtx.canvas.width,
            imageDataCtx.canvas.height
          );

          centerX = imageData.width / 2;
          centerY = imageData.height / 2;

          //window.addEventListener("resize", onResize);

          //console.log(onResize);
          //onResize();

          // on iOS we want to close the video stream first and
          // wait for the heavy BRFv4 initialization to finish.
          // Once that is done, we start the stream again.

          // as discussed above, close the stream on iOS and wait for BRFv4 to be initialized.

          if (isIOS) {
            webcam.pause();
            webcam.srcObject.getTracks().forEach(function(track) {
              track.stop();
            });
          }

          waitForSDK();
        }
      }

      // imageDataCtx is not null if we restart the camera stream on iOS.

      if (imageDataCtx === null) {
        onStreamDimensionsAvailable();
      } else {
        trackFaces();
      }
    }

    // start the camera stream...
    /*navigator.mediaDevices.enumerateDevices()
         .then(function(devices){
          
         devices.forEach(function(device) {
              if(device.label === "Logitech HD Pro Webcam C920 (046d:082d)"){*/

    window.navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480, frameRate: 30 } })
      .then(onStreamFetched)
      .catch(function() {
        alert("No camera available.");
      });
    /*  }
             
         });

     })
     .catch(function(err) {
        console.log(err.name + ": " + err.message);
    });*/
  }

  function waitForSDK() {
    if (brfv4 === null && window.hasOwnProperty("initializeBRF")) {
      // Set up the namespace and initialize BRFv4.
      // locateFile tells the asm.js version where to find the .mem file.
      // wasmBinary gets the preloaded .wasm file.

      brfv4 = {
        locateFile: function(fileName) {
          return brfv4BaseURL + fileName;
        },
        wasmBinary: brfv4WASMBuffer // Add loaded WASM file to Module
      };

      initializeBRF(brfv4);
    }

    if (brfv4 && brfv4.sdkReady) {
      let s2 = document.createElement("script");
      s2.setAttribute("src", "sketch.js");
      document.querySelector("body").append(s2);

      initSDK();
    } else {
      setTimeout(waitForSDK, 250); // wait a bit...
    }
  }

  function initSDK() {
    // The brfv4 namespace is now filled with the API classes and objects.
    // We can now initialize the BRFManager and the tracking API.

    resolution = new brfv4.Rectangle(0, 0, imageData.width, imageData.height);
    brfManager = new brfv4.BRFManager();
    brfManager.init(
      resolution,
      resolution,
      "com.tastenkunst.brfv4.js.examples.minimal.webcam"
    );

    onInitBRFv4(brfManager, resolution);

    if (isIOS) {
      // Start the camera stream again on iOS.

      setTimeout(function() {
        console.log("delayed camera restart for iOS");

        startCamera();
      }, 2000);
    } else {
      trackFaces();
    }
  }

  function trackFaces() {
    // if(brfv4Example.stats.start) brfv4Example.stats.start();

    let timeStart = window.performance.now();

    imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // A virtual mirror should be... mirrored
    imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);
    imageDataCtx.setTransform(1.0, 0, 0, 1, 0, 0); // unmirrored for drawing the results

    brfManager.update(
      imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data
    );

    handleTrackingResults(
      brfv4,
      brfManager.getFaces(),
      draw,
      imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data
    );

    //if(brfv4Example.stats.end) brfv4Example.stats.end();

    if (timeoutId >= 0) {
      clearTimeout(timeoutId);
    }

    let elapstedMs = window.performance.now() - timeStart;

    // We don't need 60 FPS, the camera will deliver at 30 FPS anyway.
    timeoutId = setTimeout(function() {
      trackFaces();
    }, 1000 / 30 - elapstedMs);
  }
}

(function() {
  // detect WebAssembly support and load either WASM or ASM version of BRFv4

  console.log(
    "Checking support of WebAssembly: " +
      _isWebAssemblySupported +
      " " +
      (_isWebAssemblySupported
        ? "loading WASM (not ASM)."
        : "loading ASM (not WASM).")
  );

  if (_isWebAssemblySupported) {
    readWASMBinary(
      brfv4BaseURL + brfv4SDKName + ".wasm",
      function(r) {
        brfv4WASMBuffer = r; // see function waitForSDK. The ArrayBuffer needs to be added to the module object.

        addBRFScript();
        initExample();
      },
      function(e) {
        console.error(e);
      },
      function(p) {
        console.log(p);
      }
    );
  } else {
    addBRFScript();
    initExample();
  }
})();
