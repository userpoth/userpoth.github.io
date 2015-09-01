///////////////////////////////////////////
/* webaudio.js. Frank Poth. 09/01/2015. */
/////////////////////////////////////////

/* Testing out the web audio api. */

(
	function webAudio() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Handles user input through the audio button. */
		function clickToggleAudioButton(event_) {
			event_.preventDefault();

			if (audio_enabled) {
				audio_enabled = false;
				this.innerHTML = "Enable Audio";
				audio.stopSound(0, 0);
				audio.stopSound(1, 0);
			} else {
				audio_enabled = true;
				this.innerHTML = "Disable Audio";
				/* Play the sound at index 0 in the audio.buffers array. */
				audio.playSound(1, 0, true);
			}
		}

		function mouseDownBody(event_) {
			event_.preventDefault();

			if (audio_enabled) {
				audio.playSound(0, 0, false);
			}
		}

		function touchStartBody(event_) {
			event_.preventDefault();
			if (audio_enabled) {
				audio.playSound(0, 0, false);
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* This will basically handle everything to do with the Web Audio API and just own like a boss at managing sound. */
		var audio = {
			/* FUNCTIONS. */
			/* Loads the sound at the url into the buffers array at the specified index. */
			loadSound : function(url_, index_) {
				var request = new XMLHttpRequest();
				request.open("GET", url_, true);
				request.responseType = "arraybuffer";

				request.addEventListener("load", function(event_) {
					/* this.response is the audio_data. Then there's the function to access the decoded data, then there's an error handler. */
					audio.context.decodeAudioData(this.response, function(audio_buffer_) {
						audio.buffers[index_] = audio_buffer_;
					}, function() {
						alert("Error decoding audio data");
					});
				});

				request.send();
			},
			playSound : function(index_, time_, loop_) {
				var source = this.context.createBufferSource();
				source.buffer = this.buffers[index_];
				source.connect(this.context.destination);
				source.loop = loop_;
				source.start(time_);
				this.sources[index_] = source;
			},
			stopSound : function(index_, time_) {
				this.sources[index_].stop(time_);
			},
			/* VARIABLES. */

			/* Holds all the buffers. */
			buffers : [],
			/* The audio context. */
			context : new (window.AudioContext || window.webkitAudioContext)(),
			/* Holds all sources. */
			sources : []
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var audio_enabled = false;

		//////////////////
		/* INITIALIZE. */
		////////////////

		/* Make sure the browser supports the audio API. */
		if (!audio.context) {
			alert("Your browser doesn't support the Web Audio API.");
			return;
		}

		/* Set up the enable audio button to handle input. */
		document.getElementById("toggle_audio_button").addEventListener("click", clickToggleAudioButton);

		if ("touchstart" in document.documentElement) {
			document.body.addEventListener("touchstart", touchStartBody);
		} else {
			document.body.addEventListener("mousedown", mouseDownBody);
		}
		audio.loadSound("funk.mp3", 1);
		audio.loadSound("die.mp3", 0);
	})();
