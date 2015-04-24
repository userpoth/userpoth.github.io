/////////////////////////////////////////////
/* tutorial04.js. Frank Poth. 04/23/2015. */
///////////////////////////////////////////

/* In this example we're going to do some collision detection and response between a square player and the tile map. */

(
	function tutorial04() {
		///////////////
		/* CLASSES. */
		/////////////

		/* A 2d point for storing position. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* A 2d vector for storing velocity. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function draw(time_step_) {
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			map.draw();
			red_square.draw(time_step_);

			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		/* These functions handle mouse input if on a pc. */
		function mouseDownDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.pageX, event_.pageY);
			controller.action();
		}

		function mouseMoveDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.pageX, event_.pageY);
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

			controller.display_scale = buffer.canvas.width / html.display.width;

			var element = html.display;
			controller.offset.x = controller.offset.y = 0;

			while (element) {
				controller.offset.x += (element.offsetLeft + element.clientLeft);
				controller.offset.y += (element.offsetTop + element.clientTop);
				element = element.offsetParent;
			}

			draw();
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

		/* These functions handle touch events if on a touch device. */
		function touchMoveDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.targetTouches[0].pageX, event_.targetTouches[0].pageY);
		}

		function touchStartDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.targetTouches[0].pageX, event_.targetTouches[0].pageY);
			controller.touch_count++;
			if (controller.touch_count > 1) {
				controller.action();
				controller.touch_count=0;
			}
			var timeout = window.setTimeout(function() {
				window.clearTimeout(timeout);
				controller.touch_count = 0;
			}, 300);
		}

		function update() {
			red_square.update();

			/* This is where the collision detection and response occur. */
			map.resolveCollision(red_square);
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var controller = {
			/* FUNCTIONS. */
			action : function() {
				red_square.jump();
			},
			move : function(x_, y_) {
				this.position.x = (x_ - this.offset.x) * this.display_scale;
				this.position.y = (y_ - this.offset.y) * this.display_scale;
			},
			/* VARIABLES. */
			display_scale : 1,
			offset : new Point(0, 0),
			position : new Point(0, 0),
			/* Tracks the number of touches if the user is on a touch device. */
			/* This is used for double tap to jump. */
			touch_count : 0
		};

		var engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var accumulated_time = 0;
				var current_time = Date.now();
				var elapsed_time = 0;
				var last_time = Date.now();
				var handle = this;

				this.stopped = false;

				(function loop() {
					if (handle.stopped) {
						return;
					}

					/* Request another animation frame. */
					window.requestAnimationFrame(loop);

					/* Update all the time values. */
					current_time = Date.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;

					accumulated_time += elapsed_time;

					while (accumulated_time >= interval_) {
						accumulated_time -= interval_;
						update();
					}

					draw(accumulated_time / interval_);
				})();
			},
			stop : function() {
				this.stopped = true;
			},
			/* VARIABLES. */
			stopped : true
		};

		var html = {
			display : document.getElementById("display"),
		};

		/* Since this is basic collision detection, we'll only be using one square tile graphic. */
		var map = {
			/* FUNCTIONS. */
			/* The map doesn't need to be interpolated. It's not moving and has no animations yet. */
			draw : function() {
				for (var index = this.length - 1; index > -1; index--) {
					var value = this.values[index];
					if (value == 0) {
						var destination_x = (index % this.columns) * tile_sheet.tile_width;
						var destination_y = Math.floor(index / this.columns) * tile_sheet.tile_height;

						/* The only tile image is located at 0,0,16,16 in the image. */
						buffer.drawImage(image, 0, 0, 16, 16, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
					}
				}
			},
			/* Does the tile collision. */
			/* You can only collide with tiles you are moving towards if your start position isn't inside of a tile already. */
			/* So first you check the movement direction of the object. */
			/* Then you check the tile values under the edges of the object that would be closest to a tile in the given direction (example: moving up, check top side of player). */
			/* You keep y and x collision checks separate. By doing the y check first, you ensure that your player will land "on" a tile, rather that sliding down the side of it when he jumps on top of the tile. */
			resolveCollision : function(object_) {
				var bottom = Math.floor(object_.getMaximumY() / tile_sheet.tile_height);
				/* Notice that I'm altering the two x positions. */
				/* This will ensure that the object doesn't get "caught" on the vertical edge of a tile as he's moving over the top or bottom. */
				var left = Math.floor((object_.position.x - object_.velocity.x + 1) / tile_sheet.tile_width);
				var right = Math.floor((object_.getMaximumX() - object_.velocity.x - 1) / tile_sheet.tile_width);
				var top = Math.floor(object_.position.y / tile_sheet.tile_height);

				/* Y collision. */
				/* If object is moving down and the bottom left tile is solid or the bottom right tile is solid, then: */
				if (object_.velocity.y > 0 && (this.values[bottom * this.columns + left] == 0 || this.values[bottom * this.columns + right] == 0)) {
					/* The object is on the ground. */
					object_.airborne = false;
					object_.velocity.y = 0;
					/* Set object to be sitting on top of its bottom tile. */
					/* Make sure to set the last position as well or interpolation may draw the player slightly before the collision rather than right up against the tile. */
					/* Even if it's not always accurate, users want to see their player collide with something. */
					object_.last_position.y = object_.position.y = bottom * tile_sheet.tile_height - object_.height;
				}
				/* If object is moving up and the top left tile is solid or the top right tile is solid, then: */
				else if (object_.velocity.y < 0 && (this.values[top * this.columns + left] == 0 || this.values[top * this.columns + right] == 0)) {
					object_.velocity.y = 0;
					object_.last_position.y = object_.position.y = top * tile_sheet.tile_height + tile_sheet.tile_height;
				}

				/* You need to make the same slight adjustment for x check as well, only this time you offset the y tile positions by 1. */
				/* It's weird how this works. If you want to see the results without the offset, just edit it out and see for yourself. The player will get caught on the adjacent axis's edges. */
				bottom = Math.floor((object_.getMaximumY() - object_.velocity.y - 1) / tile_sheet.tile_height);
				left = Math.floor(object_.position.x / tile_sheet.tile_width);
				right = Math.floor(object_.getMaximumX() / tile_sheet.tile_width);
				top = Math.floor((object_.position.y - object_.velocity.y + 1) / tile_sheet.tile_height);
				/*  If object is moving right and the top right tile is solid or the bottom right tile is solid, then: */
				if (object_.velocity.x > 0 && (this.values[top * this.columns + right] == 0 || this.values[bottom * this.columns + right] == 0)) {
					object_.last_position.x = object_.position.x = right * tile_sheet.tile_width - object_.width;
					object_.velocity.x = 0;

				}
				/* If object is moving left and the top left tile is solid or the bottom left tile is solid, then: */
				else if (object_.velocity.x < 0 && (this.values[top * this.columns + left] == 0 || this.values[bottom * this.columns + left] == 0)) {
					object_.last_position.x = object_.position.x = left * tile_sheet.tile_width + tile_sheet.tile_width;
					object_.velocity.x = 0;
				}
			},
			/* VARIABLES. */
			columns : 16,
			/* The gravity of the map. */
			gravity : 1,
			length : 256,
			values : [0, 0, 0, 0, 0, 0, 999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 999, 999, 0, 999, 0, 999, 0, 999, 0, 999, 0, 999, 0, 999, 0, 0, 999, 999, 999, 999, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 999, 999, 999, 0, 999, 0, 999, 999, 999, 999, 999, 999, 999, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 0, 0, 999, 999, 999, 999, 999, 999, 0, 0, 999, 999, 999, 999, 999, 0, 0, 999, 999, 0, 999, 0, 0, 0, 0, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 0, 0, 999, 0, 0, 999, 0, 999, 0, 0, 999, 999, 999, 999, 999, 0, 0, 999, 999, 999, 0, 0, 0, 999, 999, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 999, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 999, 999, 0, 0, 999, 999, 999, 999, 0, 0, 0, 999, 999, 999, 0, 0, 0, 999, 0, 0, 999, 0, 999, 999, 0, 999, 0, 999, 999, 0, 0, 999, 0, 999, 0, 0, 0, 0, 0, 0, 0, 999, 0, 0, 0, 0, 0, 999, 0, 0, 0]
		};

		/* The player object. */
		var red_square = {
			/* FUNCTIONS. */
			/* Draws the player between it's last and current position depending on the time_step_. */
			draw : function(time_step_) {
				var destination_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var destination_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;
				buffer.drawImage(image, 16, 0, 16, 16, destination_x, destination_y, this.width, this.height);
			},
			/* Returns the right side of the square. */
			getMaximumX : function() {
				return this.position.x + this.width;
			},
			/* Returns the bottom side of the square. */
			getMaximumY : function() {
				return this.position.y + this.height;
			},
			/* Makes the red square "jump". */
			jump : function() {
				if (this.airborne == false) {
					this.airborne = true;
					this.velocity.y = -12;
				}
			},
			/* Update the red square's position. */
			update : function() {
				/* Set last position to the current position before you update the current position. */
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;

				/* Add control. */
				var difference_x = (controller.position.x - this.position.x - this.width * 0.5) * 0.01;
				this.velocity.x += difference_x;

				/* Add gravity. */
				this.velocity.y += map.gravity;

				/* Add friction. */
				this.velocity.x *= 0.9;
				this.velocity.y *= 0.9;

				if (this.velocity.x > 8) {
					this.velocity.x = 8;
				} else if (this.velocity.x < -8) {
					this.velocity.x = -8;
				}

				/* Move the square by its velocity on each axis. */
				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;
			},
			/* VARIABLES. */
			/* Whether or not the red square is in the air. */
			airborne : true,
			height : 14,
			last_position : new Point(16, 16),
			position : new Point(16, 16),
			velocity : new Vector(0, 0),
			width : 14
		};

		/* Tile sheet data. */
		var tile_sheet = {
			tile_height : 16,
			tile_width : 16
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

		/* Set up the buffer. */
		buffer.canvas.height = buffer.canvas.width = 256;
		buffer.fillStyle = "#ffffff";

		/* Add the resize listener. */
		window.addEventListener("resize", resizeWindow);

		/* Add touch listeners or mouse listeners for user input. */
		if ("ontouchstart" in document.documentElement) {
			html.display.addEventListener("touchstart", touchStartDisplay);
			html.display.addEventListener("touchmove", touchMoveDisplay);
		} else {
			html.display.addEventListener("mousedown", mouseDownDisplay);
			html.display.addEventListener("mousemove", mouseMoveDisplay);
		}

		/* Load your image and start the game on callback. */
		startLoadImage(image, "tutorial04.png", function() {
			resizeWindow();
			engine.start(20);
		});
	})();
