/////////////////////////////////////////////
/* tutorial03.js. Frank Poth. 04/22/2015. */
///////////////////////////////////////////

/* A more complex game loop that runs on requestAnimation frame and implements time restraints. */
/* For example, if you want to cycle every 20ms instead of whenever your browser is ready, you can do that now. */
/* You still only want to draw when requestAnimationFrame determines you can, but you may want to update more often or less often than that. */
/* This game loop does that. */

/* In addition to this constant time updating, we're going to do some interpolation using a time step to get smoother movement animations. */
/* Say your player moves 10px per every 20ms, but your draw function executed at 30ms. Your player has to move half of one full update so the rendered image looks right.*/
/* If you don't use interpolation you might see some jumps in animation. */

(
	function tutorial03() {
		///////////////
		/* CLASSES. */
		/////////////

		/* A 2d point for storing position. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* A 2d vector for storing velocity. */
		/* Literally the same as Point, but as things get more complex, vector and point serve different purposes. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Draws the buffer to the display. */
		/* Now we use a time step (a number between 0 and 1), to adjust our animations between their last position and current position. */
		function draw(time_step_) {
			/* Clear the buffer of the old image. */
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			/* Draw that red square, baby! */
			/* The time step will move him slightly to draw him where he would be at the current time step between the last and current updates. */
			red_square.draw(time_step_);

			/* Draw the buffer to the display. */
			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		/* Adjusts the size and position of the display canvas as well as the position of the output p element. */
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

			/* Get the first element to start the loop with (the display canvas). */
			var element = html.display;

			/* These are for getting the page offset position of the display canvas so you can move the output p element to the upper left corner of the display canvas. */
			var offset_x = offset_y = 0;

			/* Loop through parent elements. */
			while (element) {
				offset_x += (element.offsetLeft + element.clientLeft);
				offset_y += (element.offsetTop + element.clientTop);
				element = element.offsetParent;
			}

			/* Put the output in the upper left corner of the display canvas. */
			html.output.style.left = offset_x + "px";
			html.output.style.top = offset_y + "px";

			/* Call draw to keep the display canvas from going blank after resize. */
			draw(0);
		}

		/* Loads the image data stored at the url_ into the image_ and performs the callback_ function. */
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

		/* Updates the game logic. */
		function update() {
			/* Updates the red square's current position. */
			red_square.update();
			/* Does collision detection and resolution between the "map" and the red square. */
			map.resolveCollision(red_square);
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* Governs the game loop. */
		var engine = {
			/* FUNCTIONS. */
			/* Starts the engine and tells it to "update" every interval_ number of milliseconds. */
			start : function(interval_) {
				/* The amount of time accumulated beyond the specified interval_. */
				/* The idea is to adjust animation to look right when draw is called even if draw isn't happening exactly at the specified interval_. */
				/* It might go 5ms over the specified interval, so you want to draw your player where he would be in an additional 5ms. */
				var accumulated_time = 0;
				/* The current time that loop is executing. */
				var current_time = Date.now();
				/* The amount of time passed since the last execution of loop. */
				var elapsed_time = 0;
				/* The last time that loop executed. */
				var last_time = Date.now();
				/* Get a handle on this to maintain scope inside of the loop function. */
				var handle = this;

				this.stopped = false;
				/* The loop function sets up a call to itself through requestAnimationFrame, thereby perpetuating itself until this.stopped==true. */
				(function loop() {
					/* The early out. */
					if (handle.stopped) {
						return;
					}

					/* Request another animation frame. */
					window.requestAnimationFrame(loop);

					/* Update all the time values. */
					current_time = Date.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;

					/* Add to accumulated time. */
					accumulated_time += elapsed_time;

					/* Whittle down the accumulated time and call update for every time interval_ fits into accumulated_time. */
					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;
						update();
					}

					/* Draw the scene as it is adjusted by the remaining accumulated time. */
					/* The parameter is a number between 0 and < 1. */
					draw(accumulated_time / interval_);
				})();
			},
			/* Sets stopped to true, thus stopping the engine before it can update the game again. */
			stop : function() {
				this.stopped = true;
			},
			/* VARIABLES. */
			stopped : true
		};

		var html = {
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		/* There's really no "map" in this example, but you could consider the map to just be the visible image or the canvas itself. */
		var map = {
			/* FUNCTIONS. */
			/* Resolves collision between an object and the map boundaries. */
			resolveCollision : function(object_) {
				/* Is the object offscreen to the right? */
				if (object_.position.x > buffer.canvas.width) {
					/* Move the object to the other side of the map (warp (not a technical term)). */
					/* As you can see, the problem with interpolation is overhead. */
					/* Now instead of updating one property, you're updating two. */
					object_.position.x = object_.last_position.x = -object_.width;
					/* Add to the number of warps. */
					number_of_warps++;
					/* Update the output. */
					html.output.innerHTML = "Number of warps: " + number_of_warps;
				}
			}
		};

		/* Red square is our player object. */
		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				/* You want to draw starting at your last position or from the last update. */
				/* The reason for this is because you never want to go beyond your current position. */
				/* You don't know if there's an enemy or a wall right in front of you that you might hit and you never want to draw a frame where your player is moving slightly through a wall or over an enemy. */
				/* So, instead of predicting the future, we draw one frame behind the present and predict only up to the present when neccessary. The user never knows the difference. */
				var destination_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var destination_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

				buffer.drawImage(image, 0, 0, 16, 16, destination_x, destination_y, this.width, this.height);
			},
			/* Updates the position of the red square. */
			update : function() {
				/* Set the last position equal to the current position. */
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;
				/* Update the current position. */
				this.position.x += this.velocity.x;
			},

			/* VARIABLES. */
			/* Set up the player properties. */
			height : 16,
			last_position : new Point(0, 120),
			position : new Point(0, 120),
			velocity : new Vector(4, 0),
			width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");
		var image = new Image();

		/* Counts the number of times the red square has moved entirely across the screen. */
		var number_of_warps = 0;

		//////////////////
		/* INITIALIZE. */
		////////////////

		/* Set up your buffer. */
		buffer.canvas.height = buffer.canvas.width = 256;
		/* Remember that if you resize a canvas, the image data resets and you lose information like fillStyle. */
		buffer.fillStyle = "#ffffff";

		/* Add the resize listener to the window. */
		window.addEventListener("resize", resizeWindow);

		/* Load your image. */
		startLoadImage(image, "tutorial02.png", function() {
			/* Call resizeWindow to make everything pretty. */
			resizeWindow();

			/* Tell the engine to update every 20 ms. */
			/* It will still draw at the speed set by your machine. */
			engine.start(20);
		});

	})();
