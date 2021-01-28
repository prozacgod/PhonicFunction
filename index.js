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

  sound.play(cc);

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
    var sample = sound.generate(t) * ((height - 10) / 2) + (height / 2);
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
      toastLove("Pausing Audio")
      sound.pause();
    }
  });
  if (Lockr.get('current')) {
    editor.setValue(Lockr.get('current'));
  }
  editor.on('change', function() {
    Lockr.set("current", editor.getValue());
  });

  initDisplays();
  redrawHistory();
}

init();
