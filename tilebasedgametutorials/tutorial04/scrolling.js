////////////////////////////////////////////
/* scrolling.js. Frank Poth. 05/05/2015. */
//////////////////////////////////////////

/* OOOOOOOOOOOOOOOOOOOOOOOOOOOOKAY, then. Time to make a level so large it doesn't all fit on the screen. */
/* How will you traverse such a magnificent plane? By scrolling. */

/* What you'll want to check out is the new update function in the map object. */
/* Also the draw function in the map object. */

/* Also, I'm modifying the user control scheme. */
/* Instead of mouse and touch, I'm using keyboard for desktop, and buttons for mobile. The controller object will mostly stay the same, but there will be a few new basic listener functions for keyboard support. */

(
	function scrolling() {
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
				var source_x = this.frame * tile_sheet.tile_width;
				var source_y = 0;
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

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* This is for desktop control. */
		/* These two functions store key up or down values in the keys object, which can be found in the OBJECT LITERALS section. */
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

		/* Ah - ah! You know what it is! Resize when your window get's too biiig. */
		function resizeWindow(event_) {
			var client_height = document.documentElement.clientHeight;
			var client_width = html.display.parentElement.clientWidth;

			if (client_height < client_width) {
				html.display.height = html.display.width = client_height;
				html.display.style.left = Math.floor(client_width * 0.5 - client_height * 0.5) + "px";
			} else {
				html.display.height = html.display.width = client_width;
				html.display.style.left = "0px";
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

		var collider = {
			/* FUNCTIONS. */
			0 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height)) {
					return;
				}
				if (this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				};
				if (this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width)) {
					return;
				}
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* Collide with a flat topped tile with no other sides. */
			1 : function(object_, tile_x_, tile_y_) {
				this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height);
			},
			/* Flat right sided tile with no other sides. */
			2 : function(object_, tile_x_, tile_y_) {
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* Flat bottom sided tile with no other sides. */
			3 : function(object_, tile_x_, tile_y_) {
				this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height);
			},
			/* Flat left sided tile with no other sides. */
			4 : function(object_, tile_x_, tile_y_) {
				this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width);
			},
			/* A tile with a top and bottom boundary. */
			5 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height)) {
					return;
				}
				this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height);
			},
			/* A tile with a left and right boundary. */
			6 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width)) {
					return;
				}
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* A three sided tile with a left, top and right boundary. */
			7 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height)) {
					return;
				}
				if (this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width)) {
					return;
				}
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* A three sided tile with a top, right and bottom boundary. */
			8 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height)) {
					return;
				}
				if (this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* A three sided tile with a bottom, left and right boundary. */
			9 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				if (this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width)) {
					return;
				}
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* A three sided tile with a top, left and bottom. */
			10 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height)) {
					return;
				}
				if (this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width);
			},
			/* This phat puppy right here is a half height tile. */
			11 : function(object_, tile_x_, tile_y_) {
				if (this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height)) {
					return;
				}
				if (this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				if (this.collideSegmentLeft(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				this.collideSegmentRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height);
			},
			collideFlatBottom : function(object_, bottom_) {
				if (object_.position.y < bottom_ && object_.last_position.y >= bottom_) {
					object_.last_position.y = object_.position.y = bottom_;
					object_.velocity.y = 0;
					return true;
				}
				return false;
			},
			collideFlatLeft : function(object_, left_) {
				if (object_.getMaximumX() > left_ && object_.last_position.x + object_.width <= left_) {
					object_.last_position.x = object_.position.x = left_ - object_.width;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			},
			collideFlatRight : function(object_, right_) {
				if (object_.position.x < right_ && object_.last_position.x >= right_) {
					object_.last_position.x = object_.position.x = right_;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			},
			collideFlatTop : function(object_, top_) {
				if (object_.getMaximumY() > top_ && object_.last_position.y + object_.height <= top_) {
					object_.airborne = false;
					object_.last_position.y = object_.position.y = top_ - object_.height;
					object_.velocity.y = 0;
					return true;
				}
				return false;
			},
			/* These two firefighting army tanks are here just to help out that half height square tile. */
			/* Basically they just allow you to adjust the height range an object must be in in order for it to collide with the left or right side of a tile. */
			collideSegmentLeft : function(object_, left_, top_, bottom_) {
				if (object_.position.y < bottom_ && object_.getMaximumY() > top_ && object_.getMaximumX() > left_ && object_.last_position.x + object_.width <= left_) {
					object_.last_position.x = object_.position.x = left_ - object_.width;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			},
			collideSegmentRight : function(object_, right_, top_, bottom_) {
				if (object_.position.y < bottom_ && object_.getMaximumY() > top_ && object_.position.x < right_ && object_.last_position.x >= right_) {
					object_.last_position.x = object_.position.x = right_;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			}
		};

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

		/* For a fairly detailed commentary on the engine object, see the Game Loop tutorial and its source code. */
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
						/* Update the controller. */
						red_square.update();
						/* Gotta update the map's scroll position! */
						map.update();
						/* Always do collision after you update your object's position. */
						map.detectCollision(red_square);
						accumulated_time -= interval_;
					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						/* So, to show the boundaries of the canvas, I'm gonna switch to fillRect! */
						/* This will let you actually see the background of the canvas. */
						buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

						/* DRAW THAT MAP, SON!!! */
						map.draw();
						/* Then draw that square, sister. */
						red_square.draw(accumulated_time / interval_);

						/* That's right, we're drawing the controller now. */
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

		/* The html object just stores my element references. */
		var html = {
			display : document.getElementById("display"),
		};

		/* The map object. */
		var map = {
			/* FUNCTIONS. */
			/* Believe it or not, the most complicated part of scrolling takes place in the draw function. */
			/* But even this isn't so complex. */
			/* Basically, all you have to do is calculate the position of your first visible row and column and only draw tiles from there on. */
			/* Pretty simple stuff, I think. */
			/* Also, you get to use two for loops! How exciting! */
			draw : function() {
				/* This should be pretty self explanatory. */
				/* You only want to draw tiles within these boundaries. */
				/* How do you get the boundaries? Well, you just use the scroll offset as a reference point and calculate it's row and column position. */
				/* Notice that +8 in there? That's half the tile width (or height). I wanted to make it so you could see the tiles disappearing at the edges of the screen. */
				var first_column = Math.floor((-this.offset.x + 8) / tile_sheet.tile_width);
				/* If your first column is less than 0, then you have a problem, because there are no negative indices in an array. You must start at 0. */
				if (first_column < 0) {
					first_column = 0;
				}
				var last_column = first_column + this.visible_columns;
				/* You don't want to try blitting tiles in columns that aren't there at the end of the map either. */
				if (last_column > this.columns) {
					last_column = this.columns;
				}
				var first_row = Math.floor((-this.offset.y + 8) / tile_sheet.tile_height);
				if (first_row < 0) {
					first_row = 0;
				}
				var last_row = first_row + this.visible_rows;
				/* Finally! A reason to record the number of rows in the map! */
				if (last_row > this.rows) {
					last_row = this.rows;
				}

				/* Now we loop over all the visible tile spaces! */
				/* But we do it by row and column. Hot dawg! Neat 'o! ... Whoop. */
				for (var column = first_column; column < last_column; column++) {
					for (var row = first_row; row < last_row; row++) {
						/* The only major difference is how we get the tile value. */
						var value = this.tiles[row * this.columns + column];

						if (value != 999) {

							/* LOOK HOW AWESOME THINGS GET WHEN YOU LOOP USING ROW AND COLUMN! */
							/* Don't forget to notice the scroll offset... Or you might not notice it. It's there, though. */
							var destination_x = this.offset.x + column * tile_sheet.tile_width;
							var destination_y = this.offset.y + row * tile_sheet.tile_height;
							/* Once again, I'm using a source image with a single row of images. */
							/* Not a problem when you only have a couple of graphics. */
							var source_x = value * tile_sheet.tile_width;

							buffer.drawImage(source_image, source_x, 0, tile_sheet.tile_width, tile_sheet.tile_height, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
						}

					}
				}
			},
			detectCollision : function(object_) {
				var bottom = Math.floor(object_.getMaximumY() / tile_sheet.tile_height);
				var left = Math.floor(object_.position.x / tile_sheet.tile_width);

				var value = this.tiles[bottom * this.columns + left];
				if (value != 999) {
					collider[value](object_, left, bottom);
				}
				bottom = Math.floor(object_.getMaximumY() / tile_sheet.tile_height);
				/* Notice that I subtracted 0.1 from the object's right coordinate. This was to fix a small rounding error and makes the collision a little smoother. */
				/* Kind of hacky, I know, but maybe I'll figure it out in a future rendition. */
				var right = Math.floor((object_.getMaximumX()-0.1) / tile_sheet.tile_width);

				value = this.tiles[bottom * this.columns + right];
				if (value != 999) {
					collider[value](object_, right, bottom);
				}

				left = Math.floor(object_.position.x / tile_sheet.tile_width);
				var top = Math.floor(object_.position.y / tile_sheet.tile_height);

				value = this.tiles[top * this.columns + left];
				if (value != 999) {
					collider[value](object_, left, top);
				}

				right = Math.floor(object_.getMaximumX() / tile_sheet.tile_width);
				top = Math.floor(object_.position.y / tile_sheet.tile_height);

				value = this.tiles[top * this.columns + right];
				if (value != 999) {
					collider[value](object_, right, top);
				}
			},
			/* This is a new function! Now that the map scrolls, we have to change the offset position based on the red square's location on the screen. */
			/* This requires regular updates to keep things scrolling smoothly. */
			update : function() {
				this.offset.x += (128 - red_square.position.x - this.offset.x) * 0.1;
				this.offset.y += (128 - red_square.position.y - this.offset.y) * 0.1;
			},
			/* VARIABLES. */
			/* THERE ARE 32 COLUMNS!!!!! (in the map) */
			columns : 32,
			gravity : 1,
			length : 1024,
			/* The scroll offset, baby! */
			offset : new Point(0, 0),
			/* The number of rows in the map. */
			rows : 32,
			/* Notice how ridiculously large the map is now! So sweet! */
			tiles : [999, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 999, 2, 999, 999, 999, 999, 999, 999, 999, 6, 6, 6, 6, 9, 999, 999, 999, 999, 6, 6, 6, 9, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 999, 999, 6, 6, 6, 9, 999, 999, 999, 999, 999, 9, 6, 6, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 5, 5, 5, 1, 8, 999, 1, 999, 9, 6, 6, 999, 999, 999, 999, 999, 999, 999, 6, 9, 999, 999, 999, 999, 999, 10, 1, 8, 999, 1, 999, 4, 0, 0, 0, 6, 999, 999, 999, 999, 999, 6, 6, 999, 999, 999, 999, 999, 999, 999, 9, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 0, 999, 0, 6, 999, 999, 1, 999, 999, 6, 9, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 1, 999, 4, 0, 0, 0, 6, 999, 999, 999, 999, 999, 9, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 0, 999, 0, 6, 999, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 7, 999, 1, 1, 1, 999, 6, 999, 999, 1, 999, 4, 0, 0, 0, 6, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 10, 5, 2, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 0, 999, 0, 999, 8, 999, 1, 999, 10, 1, 8, 999, 1, 999, 10, 1, 5, 5, 5, 5, 2, 999, 1, 1, 1, 999, 6, 999, 999, 1, 999, 4, 0, 0, 0, 6, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 9, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 0, 999, 0, 6, 999, 999, 1, 999, 999, 6, 999, 999, 1, 999, 999, 6, 999, 999, 999, 999, 999, 999, 1, 1, 1, 999, 6, 999, 999, 1, 999, 4, 0, 0, 0, 6, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 0, 999, 0, 6, 11, 999, 1, 999, 11, 6, 999, 999, 1, 999, 999, 6, 999, 999, 1, 1, 1, 1, 1, 1, 1, 1, 6, 999, 999, 1, 999, 4, 0, 0, 0, 6, 0, 0, 11, 0, 0, 6, 999, 11, 0, 11, 999, 6, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 8, 999, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 11, 0, 10, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 999, 999, 4, 999, 2, 999, 999, 10, 5, 5, 5, 8, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 6, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 9, 999, 999, 999, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 1, 999, 4, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 7, 999, 999, 999, 999, 4, 999, 2, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 8, 6, 10, 5, 5, 5, 4],
			/* So, these two mad peeps store the number of columns and rows you should see on screen. */
			visible_columns : 16,
			visible_rows : 16
		};

		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				/* Add in the map's scroll position. */
				var interpolated_x = map.offset.x + this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = map.offset.y + this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

				buffer.drawImage(source_image, 192, 0, 16, 16, interpolated_x, interpolated_y, this.width, this.height);
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

				this.velocity.y += map.gravity;

				this.velocity.scale(0.9);

				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;
			},
			/* VARIABLES. */
			airborne : true,
			height : 14,
			last_position : new Point(16, 16),
			position : new Point(17, 17),
			velocity : new Vector(0, 0),
			width : 14
		};

		var tile_sheet = {
			columns : 13,
			tile_half_height : 8,
			tile_height : 16,
			tile_width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");

		/* I moved the offset and size ratio of the display canvas out of the controller object because they really don't belong in there. */
		var display_offset = new Point(0, 0);
		var display_size_ratio = 1;

		var source_image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;
		/* Since we're actually gonna have a color background, we're gonna have to define a fill style. */
		buffer.fillStyle = "#1b1f20";

		/* Load up the source image! */
		startLoadImage(source_image, "scrolling.png", function() {
			window.addEventListener("resize", resizeWindow);

			if ("ontouchstart" in document.documentElement) {
				/* Since you're going to need to see the controlls to use them, we're going to need to add buttons to the controller. */
				controller.addButton(new Button(8, 216, 32, 32, 13, 13, function() {
					controller.keys.left = true;
				}, function() {
					controller.keys.left = false;
				}));
				controller.addButton(new Button(216, 216, 32, 32, 14, 14, function() {
					controller.keys.up = true;
				}, function() {
					controller.keys.up = false;
				}));
				controller.addButton(new Button(48, 216, 32, 32, 15, 15, function() {
					controller.keys.right = true;
				}, function() {
					controller.keys.right = false;
				}));
				html.display.addEventListener("touchend", touchEndDisplay);
				html.display.addEventListener("touchmove", touchMoveDisplay);
				html.display.addEventListener("touchstart", touchStartDisplay);
			} else {
				window.addEventListener("keydown", keyDownWindow);
				window.addEventListener("keyup", keyUpWindow);
			}

			resizeWindow();

			engine.start(1000 / 60);
		});
	})();
