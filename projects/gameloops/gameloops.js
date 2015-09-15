////////////////////////////////////////////
/* gameloops.js. Frank Poth. 09/07/2015. */
//////////////////////////////////////////

/* Testing the efficiency of different types of single thread game loops. */

(
	function gameLoops() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		function clickRenderButton(event_) {
			var rectangle = this.getBoundingClientRect();
			if (event_.clientX < rectangle.left + this.clientWidth * 0.5) {
				times_to_render = times_to_render > 20 ? times_to_render - 20 : 0;
			} else {
				times_to_render += 20;
			}
		}

		function clickToggleLoopButton(event_) {
			engine.stop();
			switch(engine) {
				case combination_engine:
					this.innerHTML = "raf loop";
					engine = raf_engine;
					break;
				case raf_engine:
					this.innerHTML = "timeout loop";
					engine = timeout_engine;
					break;
				case timeout_engine:
					this.innerHTML = "combination loop";
					engine = combination_engine;
					break;

			}
			engine.start(1000 / 60);
		}

		function clickUpdateButton(event_) {
			var rectangle = this.getBoundingClientRect();
			if (event_.clientX < rectangle.left + this.clientWidth * 0.5) {
				times_to_update = times_to_update > 250000 ? times_to_update - 250000 : 0;
			} else {
				times_to_update += 250000;
			}
		}

		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			var height_ratio = client_height / stage.height;
			var width_ratio = client_width / stage.width;

			if (height_ratio < width_ratio) {
				display.canvas.height = stage.height * height_ratio;
				display.canvas.width = stage.width * height_ratio;

				display.canvas.style.left = Math.floor((client_width - canvas.width) * 0.5) + "px";
				display.canvas.style.top = "0px";
			} else {
				display.canvas.height = stage.height * width_ratio;
				display.canvas.width = stage.width * width_ratio;

				display.canvas.style.left = "0px";
				display.canvas.style.top = Math.floor((client_height - canvas.height) * 0.5) + "px";
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var combination_engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = 0;
				var elapsed_time = 0;
				var handle = this;
				var last_time = window.performance.now();

				function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					elapsed_time = time_stamp_ - last_time;
					last_time = time_stamp_;
					accumulated_time += elapsed_time;

					for (var count = times_to_render; count > -1; count--) {
						/* Draw the background and the red square. */
						stage.render();
						red_square.render(accumulated_time / interval_);
					}

					/* Draw the buffer to the display. */
					display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);

					/* Handle fps counting and output. */
					fps_meter.increment(elapsed_time);
					output.innerHTML = "combination loop: " + times_to_render + " render(s) and " + times_to_update + " update(s) at " + fps_meter.getFPS() + " fps";
				}

				function update() {
					handle.timeout = window.setTimeout(update, interval_);

					if (accumulated_time > 2000) {
						accumulated_time = interval_;
					}

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;

						red_square.update();

						for (var count = times_to_update; count > -1; count--) {
							var logic = Math.sqrt(Math.PI);
						}
					}
				}


				this.animation_frame = window.requestAnimationFrame(render);
				this.update = window.setTimeout(update, interval_);
			},
			stop : function() {
				window.cancelAnimationFrame(this.animation_frame);
				window.clearTimeout(this.timeout);
				this.animation_frame = this.timeout = undefined;
			},
			/* VARIABLES. */
			animation_frame : undefined,
			timeout : undefined
		};

		var fps_meter = {
			/* FUNCTIONS. */
			getFPS : function() {
				var elapsed_time = 0;
				var length = this.samples.length;
				for (var i = length - 1; i > -1; i--) {
					elapsed_time += this.samples[i];
				}

				return Math.floor((1000 * length) / elapsed_time);
			},
			increment : function(elapsed_time_) {
				this.samples[this.index] = elapsed_time_;
				this.index++;

				if (this.index > 250) {
					this.index = 0;
				}
			},
			/* VARIABLES. */
			index : 0,
			samples : []
		};

		/* This is the requestAnimationFrame engine. It runs entirely on requestAnimationFrame. */
		var raf_engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = 0;
				var elapsed_time = undefined;
				var handle = this;
				var last_time = window.performance.now();

				function loop(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(loop);

					elapsed_time = time_stamp_ - last_time;
					last_time = time_stamp_;
					accumulated_time += elapsed_time;

					if (accumulated_time > 2000) {
						accumulated_time = interval_;
					}

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;

						red_square.update();

						for (var count = times_to_update; count > -1; count--) {
							var logic = Math.sqrt(Math.PI);
						}
					}

					for (var count = times_to_render; count > -1; count--) {
						/* Draw the background and the red square. */
						stage.render();
						red_square.render(accumulated_time / interval_);
					}

					/* Draw the buffer to the display. */
					display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);

					/* Handle fps counting and output. */
					fps_meter.increment(elapsed_time);
					output.innerHTML = "raf loop: " + times_to_render + " render(s) and " + times_to_update + " update(s) at " + fps_meter.getFPS() + " fps";
				};

				this.animation_frame = window.requestAnimationFrame(loop);
			},
			stop : function() {
				window.cancelAnimationFrame(this.animation_frame);
				this.animation_frame = undefined;
			},
			/* VARIABLES. */
			animation_frame : undefined
		};

		var red_square = {
			/* FUNCTIONS. */
			initialize : function() {
				this.height = 20;
				this.last_x = 0;
				this.width = 20;
				this.x = 0;
				this.y = stage.height * 0.5 - this.height * 0.5;
			},
			render : function(time_step_) {
				var interpolated_x = this.last_x + (this.x - this.last_x) * time_step_;

				buffer.fillStyle = "#f00000";
				buffer.fillRect(interpolated_x, this.y, this.width, this.height);

			},
			update : function() {
				this.last_x = this.x;
				this.x++;

				if (this.x > stage.width) {
					this.last_x = this.x = -red_square.width;
				}
			}
		};

		var stage = {
			/* FUNCTIONS. */
			render : function() {
				buffer.fillStyle = "#f0f0f0";
				buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);
			},
			/* VARIABLES. */
			height : 320,
			width : 320
		};

		/* This is the timeout engine that runs entirely on timeout. */
		var timeout_engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = 0;
				var current_time = undefined;
				var elapsed_time = undefined;
				var handle = this;
				var last_time = window.performance.now();

				function loop() {
					handle.timeout = window.setTimeout(loop, interval_);

					current_time = window.performance.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;
					accumulated_time += elapsed_time;

					if (accumulated_time > 2000) {
						accumulated_time = interval_;
					}

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;

						red_square.update();

						for (var count = times_to_update; count > -1; count--) {
							var logic = Math.sqrt(Math.PI);
						}
					}

					for (var count = times_to_render; count > -1; count--) {
						/* Draw the background and the red square. */
						stage.render();
						red_square.render(accumulated_time / interval_);
					}

					/* Draw the buffer to the display. */
					display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);

					/* Handle fps counting and output. */
					fps_meter.increment(elapsed_time);
					output.innerHTML = "timeout loop: " + times_to_render + " render(s) and " + times_to_update + " update(s) at " + fps_meter.getFPS() + " fps";
				}


				this.timeout = window.setTimeout(loop, interval_);
			},
			stop : function() {
				window.clearTimeout(this.timeout);
				this.timeout = undefined;
			},
			/* VARIABLES. */
			timeout : undefined
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = document.getElementById("canvas").getContext("2d");

		var engine = raf_engine;

		var output = document.getElementById("output");

		/* How many times should cpu intensive code run in each loop? These determine that. */
		var times_to_render = 0;
		var times_to_update = 0;

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = stage.height;
		buffer.canvas.width = stage.width;

		document.getElementById("render_button").addEventListener("click", clickRenderButton, false);
		document.getElementById("toggle_loop_button").addEventListener("click", clickToggleLoopButton, false);
		document.getElementById("update_button").addEventListener("click", clickUpdateButton, false);

		window.addEventListener("resize", resizeWindow);
		resizeWindow();

		red_square.initialize();

		engine.start(1000 / 60);
	})();
