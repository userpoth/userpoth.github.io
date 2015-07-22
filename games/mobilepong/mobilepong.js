/////////////////////////////////////////////
/* mobilepong.js. Frank Poth. 07/12/2015. */
///////////////////////////////////////////

/* This is the code that runs mobilepong, a pong clone that runs on your phone. */

(
	function mobilePong() {
		///////////////
		/* CLASSES. */
		/////////////

		function Ball() {

		}


		Ball.prototype = {};

		function Graphic(source_x_, source_y_, source_width_, source_height_, x_, y_, width_, height_) {
			/* OBJECT LITERALS. */
			this.source = {
				height : source_height_,
				width : source_width_,
				x : source_x_,
				y : source_y_
			};
			/* VARIABLES. */
			this.height = height_;
			this.width = width_;
			this.x = x_;
			this.y = y_;
		}


		Graphic.prototype = {
			/* FUNCTIONS. */
			blit : function(image_, context_) {
				context_.drawImage(image, this.source.x, this.source.y, this.source.width, this.source.height, this.x, this.y, this.width, this.height);
			},
			/* VARIABLES. */
			constructor : Graphic
		};

		function Paddle() {

		}


		Paddle.prototype = {};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function startLoadImage(image_, url_, callback_) {
			image_.addEventListener("error", errorImage);
			image_.addEventListener("load", loadImage);

			image_.src = url_;

			function errorImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				console.log("Error loading graphics!");
				alert("Looks like there was a problem loading graphics! Sorry, for the inconvenience!");
			}

			function loadImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				callback_();
			}

		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = interval_;
				var current_time = undefined;
				var elapsed_time = undefined;
				var handle = this;
				var last_time = Date.now();

				(function logic() {
					handle.timeout = window.setTimeout(logic, interval_);

					current_time = Date.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;

					accumulated_time += elapsed_time;

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;

					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);
						display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
					}
				})();
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

		/* This mean lima bean is going to hold custom graphics objects. */
		/* All the graphics in this game come from one sassy set, but they're all over the place. */
		/* I'm going to need a lot of custom blit locations. */
		var graphics = {};

		var intro = {
			/* FUNCTIONS. */
			draw : function() {

			},

			update : function() {

			},
			/* VARIABLES. */
		};

		////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = document.getElementById("display").getContext("2d");

		/* Here's something new. A game state place holder. */
		/* Game states will just be objects with prototype functions like update and draw, start and stop. */
		/* This thing will be used to run all of them. */
		var game_state = intro;
		
		/* The graphics set. */
		var source_image=new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////
		
		startLoadImage(source_image,"mobilepong.png",function(){
			engine.start(1000/60);
		});
	})();
