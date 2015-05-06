////////////////////////////////////////////
/* collision.js. Frank Poth. 05/01/2015. */
//////////////////////////////////////////

/* Alright, so this is pretty much exactly like the last example. The only difference is that I'm adding some slope collision functions to the mix. */
/* What's awesome about this type of collision engine is you can add or remove as many different functions as you want and everything else can remain the same. */
/* Each collision tile type is completely separate from the rest and adding new types is as easy as making a new function in the collider object. */

/* What you want to check out is the collider object, that's where the slope collision code is. */

(
	function collision() {
		///////////////
		/* CLASSES. */
		/////////////

		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* Also, Vector. And this time I'm actually going to give vector some extra functionality so he's not so similar to Point. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}


		Vector.prototype = {
			/* FUNCTIONS. */
			/* I'm gonna use this AWESOME function to apply "friction" (fake friction) to the red square's velocity vector. */
			scale : function(scalar_) {
				this.x *= scalar_;
				this.y *= scalar_;
			},
			/* VARIABLES. */
			/* You don't really need to reset constructor, but if you don't I believe it will point to Object. */
			constructor : Vector
		};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Handles mouse down events on the display. */
		function mouseDownDisplay(event_) {
			event_.preventDefault();
			controller.doAction();
		}

		/* Handles mouse move events on the display. */
		function mouseMoveDisplay(event_) {
			event_.preventDefault();
			controller.moveTo(event_.pageX, event_.pageY);
		}

		/* You have to handle resize events on the window. */
		/* If you don't your page/app won't be "responsive". Gotta be responsive. It's your responsibility to be responsive. */
		/* I've already explained this thing twice, though, so read the comments in the first two tutorials. */
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

			controller.size_ratio = buffer.canvas.width / html.display.width;

			var element = html.display;
			controller.offset.x = controller.offset.y = 0;

			while (element.parentElement) {
				controller.offset.x += element.offsetLeft;
				controller.offset.y += element.offsetTop;
				element = element.parentElement;
			}
		}

		/* You've gotta LOAD YOUR IMAGES!!! Load them with this thing. */
		/* I've explained this thing already in previous tutorials, but it's some pretty straight forward code. */
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

		/* Handles touch move events on the display canvas. */
		function touchMoveDisplay(event_) {
			event_.preventDefault();
			var touch = event_.targetTouches[0];
			controller.moveTo(touch.pageX, touch.pageY);
		}

		/* A touch start event is also included if the user is on a touch device because touchmove isn't as responsive as mouse move. */
		function touchStartDisplay(event_) {
			event_.preventDefault();
			var touch = event_.targetTouches[0];
			controller.moveTo(touch.pageX, touch.pageY);

			controller.touch_count++;
			if (controller.touch_count > 1) {
				controller.doAction();
				controller.touch_count = 0;
			}
			var timeout = window.setTimeout(function() {
				controller.touch_count = 0;
			}, 300);
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* Collider is the beast that holds all the collision methods. */
		/* He is the man. */
		var collider = {
			/* FUNCTIONS. */
			/* Collide with a four sided tile. */
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
			/* HERE'S SOME NEW CODE!!! */
			/* I took out the half height platform and added some slope functions!. */
			/* Half height half negative slope. */
			5 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height, -0.5);
			},
			/* This is a half height half negative slope in the top part of the tile space. */
			/* It's a lot easier to just look at the tiles in the tile sheet and compare them to these functions. They go in order. */
			/* Anyway, see how easy it is to get new tile objects with this approach? It does something different, but we're using the same base collision function. */
			/* Each slope tile uses the same base function, just a little differently. */
			/* The only downside is a cluttered collider object, but you can't expect things to work without code, so it's necessary clutter! */
			6 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height, -0.5);
			},
			7 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height, -1);
			},
			8 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height, 1);
			},
			9 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height, 0.5);
			},
			10 : function(object_, tile_x_, tile_y_) {
				this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height, 0.5);
			},
			/* OKAY!!! This is the exciting one! It's a solid, stand alone slope tile. */
			/* That's right, flat collision on the right and bottom, sloped collision on the top and right. */
			/* Let's do this to this. */
			11 : function(object_, tile_x_, tile_y_) {
				/* So, notice that I subtracted the object's width from the right side of the tile. */
				/* This is because I wanted my slope to only support the red square when his mid point is over the tile. */
				/* We have to move the right wall back in order to accomodate this and still have some collision with the right side. */
				/* Also notice that this is doing x first collision checking. */
				/* Because most of the time you will be moving into a slope from the side, it's best to do x checks first. */
				/* Most slope scenario's don't require that the tile have collision on all four sides. */
				if (this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width - object_.width * 0.5)) {
					return;
				}
				if (this.collideSlopeTop(object_, tile_x_ * tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height, -1)) {
					return;
				}
				if (this.collideSegmentBottom(object_, tile_x_ * tile_sheet.tile_width, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height)) {
					return;
				}
				/* I didn't put any code for left collision in here, but basically you'd just want to cover the case when the object has a y velocity of 0 and an x velocity of > 0. */
				/* Otherwise the player won't be able to climb the slope. */
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
			/* Some extra code for the bottom of a stand alone slope tile. */
			/* Basically says that you can only collide when the object's mid x point is between left and right. */
			collideSegmentBottom : function(object_, left_, right_, bottom_) {
				if (object_.getMeanX() >= left_ && object_.getMeanX() <= right_ && object_.position.y < bottom_ && object_.last_position.y >= bottom_) {
					object_.last_position.y = object_.position.y = bottom_;
					object_.velocity.y = 0;
					return true;
				}
				return false;

			},
			/* Since all of our slopes in this example are facing up, we only need one new collision function! */
			/* Start x and start y are simply where the slope starts from. So if your slope starts in the bottom left corner of the tile space, those are the locations you want to give this function. */
			/* slope_ is literally the slope of the tile. Remember that JavaScript uses an inverted y axis, so a slope like this: / will have a negative slope. Just remember that y = mx+b. Algebra. Bam. */
			collideSlopeTop : function(object_, start_x_, start_y_, slope_) {
				/* Remember y = mx + b? Well, b = y - mx. */
				var y_intercept = start_y_ - slope_ * start_x_;
				/* Guess what this is! It's y = mx + b! */
				var top = slope_ * object_.getMeanX() + y_intercept;
				if (object_.velocity.y >= 0 && object_.getMeanX() >= start_x_ && object_.getMeanX() <= start_x_ + tile_sheet.tile_width && object_.getMaximumY() > top) {
					object_.airborne = false;
					object_.last_position.y = object_.position.y = top - object_.height;
					object_.velocity.y = 0;
					return true;
				}
				return false;
			},
		};

		var controller = {
			/* FUNCTIONS. */
			doAction : function() {
				this.action = true;
			},
			moveTo : function(x_, y_) {
				this.position.x = (x_ - this.offset.x) * this.size_ratio;
				this.position.y = (y_ - this.offset.y) * this.size_ratio;
			},
			/* VARIABLES. */
			/* Whether or not the user is clicking/tapping the screen. */
			action : false,
			offset : new Point(0, 0),
			position : new Point(0, 0),
			selected_tile : 0,
			size_ratio : 1,
			/* Used for double tap to jump. */
			touch_count : 0
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
						red_square.update();
						/* Always do collision after you update your object's position. */
						map.detectCollision(red_square);
						accumulated_time -= interval_;
					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						buffer.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);

						/* DRAW THAT MAP, SON!!! */
						map.draw();
						/* Then draw that square, sister. */
						red_square.draw(accumulated_time / interval_);

						display.clearRect(0, 0, display.canvas.width, display.canvas.height);
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
			draw : function() {
				for (var index = this.length - 1; index > -1; index--) {
					var value = this.tiles[index];

					if (value != 999) {
						var destination_x = (index % this.columns) * tile_sheet.tile_width;
						var destination_y = Math.floor(index / this.columns) * tile_sheet.tile_height;
						var source_x = value * tile_sheet.tile_width;

						buffer.drawImage(source_image, source_x, 0, tile_sheet.tile_width, tile_sheet.tile_height, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
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
				var right = Math.floor(object_.getMaximumX() / tile_sheet.tile_width);

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
			/* VARIABLES. */
			columns : 16,
			gravity : 1,
			length : 256,
			tiles : [999, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 999, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 1, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 11, 999, 999, 11, 999, 999, 11, 999, 999, 4, 2, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 1, 1, 1, 1, 1, 1, 1, 1, 1, 999, 4, 2, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 1, 999, 4, 2, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 1, 999, 4, 2, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 1, 999, 4, 2, 999, 1, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 6, 9, 10, 999, 5, 10, 999, 7, 8, 999, 1, 7, 999, 999, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 999, 999]
		};

		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				var interpolated_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

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
				var difference_x = (controller.position.x - this.position.x - this.width * 0.5) * 0.01;
				this.velocity.x += difference_x;

				if (controller.action && this.airborne == false) {
					controller.action = false;
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
			columns : 7,
			tile_half_height : 8,
			tile_height : 16,
			tile_width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");

		var source_image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;

		/* Load up the source image! */
		startLoadImage(source_image, "slopes.png", function() {
			window.addEventListener("resize", resizeWindow);

			if ("ontouchstart" in document.documentElement) {
				html.display.addEventListener("touchmove", touchMoveDisplay);
				html.display.addEventListener("touchstart", touchStartDisplay);
			} else {
				html.display.addEventListener("mousedown", mouseDownDisplay);
				html.display.addEventListener("mousemove", mouseMoveDisplay);
			}

			resizeWindow();

			engine.start(1000 / 60);
		});
	})();
