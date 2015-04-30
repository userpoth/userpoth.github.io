/////////////////////////////////////////////
/* tutorial02.js. Frank Poth. 04/24/2015. */
///////////////////////////////////////////

(
	function() {
		///////////////
		/* CLASSES. */
		/////////////

		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function draw(time_step_) {
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			red_square.draw(time_step_);

			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		function resizeWindow(event_) {
			var client_height = document.documentElement.clientHeight;
			var client_width = html.display.parentElement.clientWidth;
			if (client_width < client_height) {
				html.display.height = html.display.width = client_width;
				html.display.style.left = "0px";
			} else {
				html.display.height = html.display.width = client_height;
				html.display.style.left = Math.floor((client_width - client_height) * 0.5) + "px";
			}

			var element = html.display;
			var offset_x = offset_y = 0;

			while (element) {
				offset_x += (element.offsetLeft + element.clientLeft);
				offset_y += (element.offsetTop + element.clientTop);
				element = element.offsetParent;
			}

			html.output.style.left = offset_x + "px";
			html.output.style.top = offset_y + "px";
		}

		function startLoadImage(image_, url_, callback_) {
			image_.addEventListener("load", loadImage);
			image_.src = url_;

			function errorImage(event_) {
				this.removeEventListener("error", errorImage);
				this.removeEventListener("load", loadImage);
				alert("An error occurred while loading an image file.");
			}

			function loadImage(event_) {
				this.removeEventListener("error", errorImage);
				this.removeEventListener("load", loadImage);
				callback_();
			}

		}

		function update() {
			red_square.update();
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = 0;
				var current_time = 0;
				var elapsed_time = 0;
				var handle = this;
				var last_time = performance.now();

				/*(function update_loop() {
				 handle.timeout = window.setTimeout(update_loop, interval_);

				 current_time = Date.now();
				 elapsed_time = current_time - last_time;
				 last_time = current_time;

				 accumulated_time += elapsed_time;

				 if (accumulated_time > 1000) {
				 accumulated_time = 0;
				 }

				 while (accumulated_time >= interval_) {
				 accumulated_time -= interval_;
				 //update();
				 }
				 })();*/

				(function draw_loop(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(draw_loop);

					current_time = performance.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;

					accumulated_time += elapsed_time;

					if (accumulated_time > 1000) {
						accumulated_time = 0;
					}

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;
						update();
					}

					draw(accumulated_time / interval_);
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

		var html = {
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				var interpolated_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

				buffer.drawImage(image, 0, 0, 16, 16, interpolated_x, interpolated_y, this.width, this.height);
			},
			update : function() {
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;

				this.position.x += this.velocity.x;

				if (this.position.x > buffer.canvas.width) {
					this.last_position.x = this.position.x = -this.width;
					this.number_of_warps++;
					html.output.innerHTML = "Number of warps: " + this.number_of_warps;
				}
			},
			/* VARIABLES. */
			height : 16,
			last_position : new Point(0, 120),
			number_of_warps : 0,
			position : new Point(0, 120),
			velocity : new Vector(1, 0),
			width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");

		var image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;
		buffer.fillStyle = "#ffffff";

		window.addEventListener("resize", resizeWindow);

		startLoadImage(image, "tutorial02.png", function() {
			resizeWindow();
			engine.start(17);
		});

	})();
