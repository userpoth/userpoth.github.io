//////////////////////////////////////////
/* control.js. Frank Poth. 05/18/2015. */
////////////////////////////////////////

/* Alright, so, as it turns out, making a game with support for control on desktop and mobile is quite a feat. */
/* It's a lot of added functions and stuff that might be confusing in the wrong context, so I'm going to write this code specifically to demonstrate the two control types. */
/* Mobile will have buttons and desktop will use the keyboard. */

(
	function control() {
		///////////////
		/* CLASSES. */
		/////////////
		
		/* This is the ultra fine new button class. */
		function Button(x_, y_, width_, height_, frame_down_, frame_up_, handleDown_, handleUp_) {
			this.height = height_;
			this.handleDown = handleDown_;
			this.handleUp = handleUp_;
			this.frame = frame_up_;
			this.frame_down = frame_down_;
			this.frame_up = frame_up_;
			this.pressed = false;
			this.width = width_;
			this.x = x_;
			this.y = y_;
		}


		Button.prototype = {
			/* FUNCTIONS. */
			/* Tests to see if the specified coordinates are inside the rectangle or not. */
			containsCoordinates : function(x_, y_) {
				/* Pretty simple stuff. Return false if the parameter coordinates are anywhere outside of the rectangle. */
				if (x_ < this.x || y_ < this.y || x_ > this.getMaximumX() || y_ > this.getMaximumY()) {
					return false;
				}
				/* If the parameter coordinates aren't outside of the rectangle, they must be inside. */
				return true;
			},
			/* Draws the button to the buffer. */
			draw : function() {
				var source_x = tile_sheet.getTileXFromIndex(this.frame);
				var source_y = tile_sheet.getTileYFromIndex(this.frame);
				buffer.drawImage(source_image, source_x, source_y, tile_sheet.tile_width, tile_sheet.tile_height, this.x, this.y, this.width, this.height);
			},
			/* Returns the left boundary of the rectangle. */
			getMaximumX : function() {
				return this.x + this.width;
			},
			/* Returns the bottom boundary of the rectangle. */
			getMaximumY : function() {
				return this.y + this.height;
			},
			/* So, this should be self explanatory. */
			press : function() {
				/* You cannot press what is already pressed. If you could, it'd be impressive, however. */
				if (this.pressed == false) {
					this.frame = this.frame_down;
					this.pressed = true;
					this.handleDown();
				}
			},
			/* Unpress the button. */
			unpress : function() {
				if (this.pressed == true) {
					this.frame = this.frame_up;
					this.pressed = false;
					this.handleUp();
				}
			},
		};

		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* You remember vector. He's back to help out the red square. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}


		Vector.prototype = {
			/* FUNCTIONS. */
			scale : function(scalar_) {
				this.x *= scalar_;
				this.y *= scalar_;
			},
			/* VARIABLES. */
			constructor : Vector
		};

		/* I decided to make a tile sheet class. */
		function TileSheet(tile_width_, tile_height_, columns_, rows_) {
			this.columns = columns_;
			this.rows = rows_;
			this.tile_height = tile_height_;
			this.tile_width = tile_width_;
		}


		TileSheet.prototype = {
			/* FUNCTIONS. */
			getColumnFromIndex : function(index_) {
				return index_ % this.columns;
			},
			getRowFromIndex : function(index_) {
				return Math.floor(index_ / this.columns);
			},
			getTileXFromIndex : function(index_) {
				return (index_ % this.columns) * this.tile_width;
			},
			getTileYFromIndex : function(index_) {
				return Math.floor(index_ / this.columns) * this.tile_height;
			},
			/* VARIABLES. */
			constructor : TileSheet
		};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* These next two functions handle key events on the window. */
		/* This is pretty straight forward stuff. It's used for keyboard input when the user is playing with a keyboard. */
		function keyDownWindow(event_) {
			event_.preventDefault();

			switch(event_.keyCode) {
				case 37:
					controller.keys.left = true;
					break;
				case 38:
					controller.keys.up = true;
					break;
				case 39:
					controller.keys.right = true;
			}
		}

		function keyUpWindow(event_) {
			event_.preventDefault();

			switch(event_.keyCode) {
				case 37:
					controller.keys.left = false;
					break;
				case 38:
					controller.keys.up = false;
					break;
				case 39:
					controller.keys.right = false;
			}
		}

		/* Had to rework some stuff because I stopped using the html object to store my display canvas. */
		function resizeWindow(event_) {
			var client_height = document.documentElement.clientHeight;
			var client_width = display.canvas.parentElement.clientWidth;

			if (client_height < client_width) {
				display.canvas.height = display.canvas.width = client_height;
				display.canvas.style.left = Math.floor(client_width * 0.5 - client_height * 0.5) + "px";
			} else {
				display.canvas.height = display.canvas.width = client_width;
				display.canvas.style.left = "0px";
			}

			display_size_ratio = buffer.canvas.width / display.canvas.width;

			var element = display.canvas;
			display_offset.x = display_offset.y = 0;

			while (element.parentElement) {
				display_offset.x += element.offsetLeft;
				display_offset.y += element.offsetTop;
				element = element.parentElement;
			}
		}

		function startLoadImage(image_, url_, callback_) {
			image_.addEventListener("error", errorImage);
			image_.addEventListener("load", loadImage);

			image_.src = url_;

			function errorImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				alert("There was an error loading the one graphic this example uses and the programmer was too lazy to implement a fallback operation. Try visualizing some awesome graphics right here.");
			}

			function loadImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				callback_();
			}

		}

		/* So, for touch end events, you have to get the button under the changed touch or touches and see if it's no longer under a touch point. */
		/* If it's not, then unpress it. */
		function touchEndDisplay(event_) {
			event_.preventDefault();

			/* The changed touches are the ones we're interested in. */
			/* For a touchend event, these will be the ones that have just severed contact with the screen. Generally, there's only one, but sometimes two or more, I guess. */
			/* So, loop through the changed touches. */
			for (var index0 = event_.changedTouches.length - 1; index0 > -1; index0--) {
				var touch = event_.changedTouches[index0];
				/* Get the world position of the touch. */
				var position_x = (touch.pageX - display_offset.x) * display_size_ratio;
				var position_y = (touch.pageY - display_offset.y) * display_size_ratio;

				/* Now we need to test the changed touch against the buttons to see if it's leaving the screen after being over a button. */
				/* So, we have to loop over all the buttons... So tedious. */
				for (var index1 = controller.buttons.length - 1; index1 > -1; index1--) {
					var button = controller.buttons[index1];
					/* Anyway, we get a button and we test to see if the position of the changed touch is over it. */
					/* If it is, then guess what, you probably don't have to test anymore buttons, because who would stack buttons on top of each other? It's just not okay, so break when you find a button under the point. */
					if (button.containsCoordinates(position_x, position_y)) {
						/* Well, you found a button, but we're not done, oh, no. Not done at all. */
						/* What if there's still another touch point over the button? Rare, but not impossible. */
						/* So, we have to loop over all the still existing touches to see if one is still over the button. */
						for (var index2 = event_.touches.length - 1; index2 > -1; index2--) {
							/* I'm just recycling the touch variable, I don't care if it overwrites the old touch instance because I'm done with it. */
							touch = event_.touches[index2];
							/* The position on the other hand, is something we don't want to change, so I just defined the x and y positions for the current touch in the call to containsCoordinates. */

							/* Now we test to see if any of these touches are over the button, and if they are, we return because it's still being pressed. */
							if (button.containsCoordinates((touch.pageX - display_offset.x) * display_size_ratio, (touch.pageY - display_offset.y) * display_size_ratio)) {
								return;
							}
						}
						/* Finally, if the changed touch was inside the button and no other touches were over the button, we can unpress the button. */
						button.unpress();
						break;
					}
				}
			}
		}

		/* Alright, here's another complicated touch listener. */
		/* We have to test all of the buttons to see if they have a touch over them whenever this event occurs. */
		function touchMoveDisplay(event_) {
			event_.preventDefault();

			/* So, first we loop through all the buttons. */
			for (var index0 = controller.buttons.length - 1; index0 > -1; index0--) {
				/* Get the button. */
				var button = controller.buttons[index0];
				/* Now, the thing about moving touches is that we don't know if they were over the button on the last update. */
				/* This means that the button could be pressed, but has nothing over it, so it needs to be unpressed. */
				/* How we determine which ones need to be unpressed is we simply check to see if any touches are currently still over the button. */
				/* If a touch is over the button, this pressed variable will be set to true. */
				/* If it's still false after all the touches are checked, then we unpress the button. */
				var pressed = false;

				/* Loop through all the touches. */
				for (var index1 = event_.touches.length - 1; index1 > -1; index1--) {
					/* Get the touch. */
					var touch = event_.touches[index1];
					/* Get the position. */
					var position_x = (touch.pageX - display_offset.x) * display_size_ratio;
					var position_y = (touch.pageY - display_offset.y) * display_size_ratio;
					/* If the current touch is over the button, press it! */
					if (button.containsCoordinates(position_x, position_y)) {
						button.press();
						pressed = true;
						/* If it's pressed, it's pressed, no more need to check, break. */
						break;
					}
				}

				/* If you check all the touches and none of them are over the button, unpress that sucker. */
				if (!pressed) {
					button.unpress();
				}
			}
		}

		/* Touch start is the simplest of the touch listeners. */
		/* All you have to do is get the new changedTouches and see if they are over a button. */
		function touchStartDisplay(event_) {
			event_.preventDefault();

			/* First we loop through our buttons. */
			for (var index0 = controller.buttons.length - 1; index0 > -1; index0--) {
				var button = controller.buttons[index0];
				/* Then we loop through the changed touches. */
				for (var index1 = event_.changedTouches.length - 1; index1 > -1; index1--) {
					var touch = event_.changedTouches[index1];
					/* Get the position of the touch. */
					var position_x = (touch.pageX - display_offset.x) * display_size_ratio;
					var position_y = (touch.pageY - display_offset.y) * display_size_ratio;

					if (button.containsCoordinates(position_x, position_y)) {
						/* Press the button if the touch coordinates are over it. */
						button.press();
						break;
					}
				}
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* Okay, here it is, the grand tomatoe that handles controls. */
		var controller = {
			/* FUNCTIONS. */
			/* Adds a button to the buttons array. */
			addButton : function(button_) {
				this.buttons.push(button_);
			},
			/* Draws those sexy buttons. */
			draw : function() {
				for (var index = this.buttons.length - 1; index > -1; index--) {
					this.buttons[index].draw();
				}
			},
			/* OBJECT LITERALS. */
			/* We've gotta keep track of the "keys" being pressed. */
			keys : {
				down : false,
				left : false,
				right : false,
				up : false
			},
			/* VARIABLES. */
			/* Check it out! Now there's a buttons array! */
			buttons : new Array(),
		};

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

						red_square.update();
					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

						/* Draw that square, son! */
						red_square.draw(accumulated_time / interval_);
						/* Hey, now! We're drawing the controller!. */
						controller.draw();

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

		/* I just copied and pasted this guy in. */
		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				/* Add in the map's scroll position. */
				var interpolated_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;
				buffer.drawImage(source_image, 96, 0, 16, 16, interpolated_x, interpolated_y, this.width, this.height);
			},
			getMaximumX : function() {
				return this.position.x + this.width;
			},
			getMaximumY : function() {
				return this.position.y + this.height;
			},
			/* Some new functionality for the red square! */
			/* Get the middle point on each axis! */
			getMeanX : function() {
				return this.position.x + this.width * 0.5;
			},
			getMeanY : function() {
				return this.position.y + this.height * 0.5;
			},
			update : function() {
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;

				/* ADD SOME CONTROL. */

				if (controller.keys.left) {
					this.velocity.x -= 0.25;
				} else if (controller.keys.right) {
					this.velocity.x += 0.25;
				}

				if (controller.keys.up && this.airborne == false) {
					controller.keys.up = false;
					this.airborne = true;
					this.velocity.y -= 12;
				}

				/* I changed this one line because I'm not using a map. */
				this.velocity.y += 1;

				this.velocity.scale(0.9);

				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;

				/* Also, I added in some nifty collision stuff, because I'm not making a world for this jazz. */
				if (this.position.y > 120) {
					this.airborne = false;
					this.position.y = this.last_position.y = 120;
					this.velocity.y = 0;
				}

				if (this.position.x + this.width < 0) {
					this.position.x = this.last_position.x = 256;
				} else if (this.position.x > 256) {
					this.position.x = this.last_position.x = -this.width;
				}
			},
			/* VARIABLES. */
			airborne : true,
			height : 14,
			last_position : new Point(16, 16),
			position : new Point(17, 17),
			velocity : new Vector(0, 0),
			width : 14
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		/* So, I'm going a different way here with the display variable. */
		/* Instead of storing references to elements in the html object, I'm just going to access them directly like I do here with the display variable. */
		/* Unless I start using a butt load of elements, I don't really see why I need to keep them separate. */
		/* If I were to make an interface using html elements, however, I'd probably store those in a separate object. */
		var display = document.getElementById("display").getContext("2d");

		/* I moved the offset and size ratio of the display canvas out of the controller object because they really don't belong in there. */
		var display_offset = new Point(0, 0);
		var display_size_ratio = 1;

		var source_image = new Image();

		/* Check out the sleek new tile sheet class. I figured I might want more than one tile sheet once things start getting more graphical. */
		var tile_sheet = new TileSheet(16, 16, 7, 1);

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;
		buffer.fillStyle = "#101a2a";

		/* So, check out the callback function here. */
		startLoadImage(source_image, "control.png", function() {
			window.addEventListener("resize", resizeWindow);

			/* I'm not entirely sure if this is a silver bullet that will work magic in every browser, but it seems to work alright on the major ones. */
			/* Basically, if you have touch options in the browser, go ahead and use them. */
			/* Otherwise, you're going to default to keyboard. */
			if ("ontouchstart" in document.documentElement) {
				/* Since we're on a browser that utilizes "ontouchstart", we're probably on a touch device. */
				/* So, add the touch listeners. */
				display.canvas.addEventListener("touchend", touchEndDisplay);
				display.canvas.addEventListener("touchmove", touchMoveDisplay);
				display.canvas.addEventListener("touchstart", touchStartDisplay);

				/* We've gotta add some buttons to the controller. */
				controller.addButton(new Button(8, 216, 32, 32, 1, 0, function() {
					controller.keys.left = true;
				}, function() {
					controller.keys.left = false;
				}));
				controller.addButton(new Button(216, 216, 32, 32, 3, 2, function() {
					controller.keys.up = true;
				}, function() {
					controller.keys.up = false;
				}));
				controller.addButton(new Button(48, 216, 32, 32, 5, 4, function() {
					controller.keys.right = true;
				}, function() {
					controller.keys.right = false;
				}));
			} else {
				/* If ontouchstart wasn't detected in the documentElement, then revert to keyboard. */
				window.addEventListener("keydown", keyDownWindow);
				window.addEventListener("keyup", keyUpWindow);
			}

			resizeWindow();

			engine.start(1000 / 60);
		});
	})();
