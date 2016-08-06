var n = 0;
function siren1(t) {
  var x = Math.sin(t * 262 + Math.sin(n));
  n += Math.sin(t);
  return x;
}

/*
function oneHz(t) {
    return Math.sin(t * Math.PI * 2);
}

function Hertz(frequency) {
  return function(t) {
    return oneHz(t * frequency);
  }
}

return Hertz(440)(t);
*/

var userFunction = null;

function generate(t) {
  if (userFunction) {
    return userFunction(t);
  } else {
    return 0;
  }
}

function showError(e) {
  killLove();
  $('#errorToast')
    .stop()
    .css({"top":-100})
    .show()
    .html(e)
    .animate({"top":10});
}

function hideError(e) {
  $('#errorToast')
   .animate({"top":-100});
}

function killError() {
  $('#errorToast')
    .stop()
    .animate({"top":-100}, 200);
}

function toastError(e) {
  showError(e);
  setTimeout(function() {
    hideError();
  }, 2500);
}

function showLove(e) {
  killError();
  $('#loveToast')
    .stop()
    .css({"top":-100})
    .show()
    .html(e)
    .animate({"top":10});
}

function hideLove(e) {
  $('#loveToast')
   .animate({"top":-100});
}

function killLove() {
  $('#loveToast')
    .stop()
    .animate({"top":-100}, 200);
}

function toastLove(e) {
  showLove(e);
  setTimeout(function() {
    hideLove();
  }, 2500);
}

function updateGenerator(code) {
  try {
    var cc = new Function('t', code);
  } catch(e) {
    toastError("Error Compiling Function:<br/><pre>" + e + "</pre>");
    return;
  }

  try {
    for (var i = 0; i < 10; i++) {
      cc(i/10);
    }
  } catch(e) {
    toastError("Error Executing Function:<br/><pre>" + e + "</pre>");
  }

  userFunction = cc;
  sampleI = 0;
  drawWave();
  var history = Lockr.get("history");
  if (!history) {
    history = [];
  }
  history.unshift({time: new Date().getTime(), code:code});
  Lockr.set("history", history);
  redrawHistory();
  toastLove("User Function Updated");
}

function redrawHistory() {
  // meh
}

/* Note: Since JS Number.MAX_SAFE_INTEGER == 9007199254740991 thats the total
number of samples this gizmo can handle before it will get wierd... so given a 44100 sample rate
you'll only be able to play for 2,363,945 days consecutively, you were warned!!.
*/
var sampleI = 0;
function startAudio() {
  (function(AudioContext) {
    var audioContext = new AudioContext();
    var bufferSize = 4096;
    var noiseMaker = audioContext.createScriptProcessor(bufferSize, 1, 1);
    noiseMaker.onaudioprocess = function(e) {
        var output = e.outputBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            output[i] = generate(sampleI / audioContext.sampleRate);
            sampleI += 1;
        }
    }
    noiseMaker.connect(audioContext.destination);
  })(window.AudioContext || window.webkitAudioContext);
}

var waveCanvas = document.getElementById("waveCanvas");
var waveCtx = waveCanvas.getContext("2d");
function drawWave() {
  var width = waveCanvas.width;
  var height = waveCanvas.height;

  waveCtx.fillStyle = "#000000";
  waveCtx.fillRect(0, 0, width, height);

  waveCtx.beginPath();
  waveCtx.strokeStyle = "#FFFFFF";

  var timeSpan = 4.0; // 4 seconds of audio
  var lastSample = height/2;
  for (var i = -5; i < width; i++) {
    var t = (i / width) * timeSpan;
    var sample = generate(t) * ((height - 10) / 2) + (height / 2);
    waveCtx.moveTo(i-1, lastSample);
    waveCtx.lineTo(i, sample);
    lastSample = sample;
  }
  waveCtx.stroke();
}

function initDisplays() {
  function onResize() {
    var wdH = $("#waveDisplay").outerHeight();
    var wdW = $("#waveDisplay").outerWidth();
    waveCanvas.width = wdW;
    waveCanvas.height = wdH;
    drawWave();
  }

  onResize();
  $(window).on("resize", onResize);
}

function init() {
  var editor = ace.edit("editor");
  editor.setOptions({
    //fontFamily: "tahoma",
    fontSize: "14pt"
  });
  editor.setTheme("ace/theme/monokai");
  editor.getSession().setMode("ace/mode/javascript");
  editor.commands.addCommand({
    name: "execute",
    bindKey: {win: "Ctrl-Enter", mac: "Command-Enter|Ctrl-Enter"},
    exec: function() {
      console.log("Attempting Update");
      updateGenerator(editor.getValue());
    }
  });
  editor.commands.addCommand({
    name: "mute",
    bindKey: {win: "Ctrl-Space", mac: "Command-Space|Ctrl-Space"},
    exec: function() {
      console.log("Muting");
      userFunction = null;
    }
  });
  editor.setValue(Lockr.get('current'));
  editor.on('change', function() {
    Lockr.set("current", editor.getValue());
  });

  startAudio();
  initDisplays();
  redrawHistory();
}

init();
