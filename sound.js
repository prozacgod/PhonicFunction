/* Note: Since JS Number.MAX_SAFE_INTEGER == 9007199254740991 thats the total
number of samples this gizmo can handle before it will get wierd... so given a 44100 sample rate
you'll only be able to play for 2,363,945 days consecutively, you were warned!!.
*/
var sound = {
  userFunction: null,
  sample_index: 0,
  paused: true,
  started: false,

  generate:function(t) {
    if (sound.userFunction) {
      return sound.userFunction(t);
    } else {
      return 0;
    }
  },

  play: function(userFunction) {
    if (!sound.started) {
      sound.start();
    }

    if (userFunction) {
      sound.setUserFunction(userFunction);
    }
    sound.paused = false;
  },

  pause: function() {
    sound.paused = true;
  },

  stop: function() {
    sound.sample_index = 0;
    sound.paused = true;
  },

  setUserFunction: function(userFunction) {
    sound.userFunction = userFunction;
    sound.sample_index = 0;
  },

  start: function() {
    sound.started = true;
    console.log("Starting audio");
    const audioContext = new AudioContext();
    const bufferSize = 4096;
    const noiseMaker = audioContext.createScriptProcessor(bufferSize, 1, 1);
    noiseMaker.connect(audioContext.destination);
    noiseMaker.onaudioprocess = function(e) {
      var output = e.outputBuffer.getChannelData(0);
      if (!sound.paused) {
        for (var i = 0; i < bufferSize; i++) {
            output[i] = sound.generate(sound.sample_index / audioContext.sampleRate);
            sound.sample_index += 1;
        }
      } else {
        for (var i = 0; i < bufferSize; i++) {
          output[i] = 0;
        }
      }
    };      
  }
};
