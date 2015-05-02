////////////////////////////////////////////
/* collision.js. Frank Poth. 05/01/2015. */
//////////////////////////////////////////

/* Glean from this source code the methods by which to perform collision detection and response with tile maps!!! */
/* All this example does is draw a tile map, give the user control of a red square, and stop that square from going into walls. */
/* Hot dog. Sounds like a hoot, eh? */

/* Anyway, the approach I use is a little bit different to accomodate the addition of slope tiles and other custom shaped tiles. */
/* I use a lookup table of collision functions that take a tile value input; basically an input table. */
/* With this approach I can have many unique collision functions for each tile that are comprised of a few base functions and I can actually have more collision shapes than a regular tile game with less code volume. */
/* Also, lookup tables are pretty snappy and keep lookups in pretty much constant time (as opposed to if else blocks and switch statements). */

/* It might seem like overkill in this example, but it will be worth it when you want to easily add more collision shapes to your game. */
/* And those other tutorials that tell you you can't have certain arrangements of tiles? Well, they are not very ambitious. If you can think it, you can code it, and this approach accommodates that viewpoint. */

/* STUFF TO LOOK AT: the collider object, which handles collision response, and the detectCollision function in the map object, which detects collision. Huh, who would've guessed? */
(
	function collision() {
		///////////////
		/* CLASSES. */
		/////////////

		/* Kicking things up a notch with some of the same exact CUSTOM JAVASCRIPT CLASSES I used in the last example. */
		/* Like good ol' Point, here. I never get tired of using Points. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* Also, Vector. And this time I'm actually going to give vector some extra functionality so he's not so similar to Point. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* By defining things on the object prototype you only end up with one set of definitions. */
		/* If you define stuff in the actual constructor, each instance of the class will have its own unique property or function. */
		/* You wouldn't want to define scale in the constructor because it would create a new scale function for every new Vector object even though it would do the exact same thing for all of them. */
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

				html.output.innerHTML = "There was an error loading the one graphic this example uses and the programmer was too lazy to implement a fallback operation. Try visualizing some awesome graphics right here.";
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
			/* Okay, so here we have all the unique collision methods. */
			/* Every function with a plain number name represents the collision methods used for colliding with a unique tile. */
			/* Each number represents the value of the collision tile in the collison tile map. */

			/* Collide with a four sided tile. */
			0 : function(object_, tile_y_, tile_x_) {
				/* This is an interesting case because the full square tile is the only one in this example with multiple sides. */
				/* I'm going to call it a composite tile because it is composed of four different tests. */
				/* This is how you can achieve multi sided shapes and many variations of collision types for a more interesting level. */
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
			1 : function(object_, tile_y_, tile_x_) {
				this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height);
			},
			/* Flat right sided tile with no other sides. */
			2 : function(object_, tile_y_, tile_x_) {
				this.collideFlatRight(object_, tile_x_ * tile_sheet.tile_width + tile_sheet.tile_width);
			},
			/* Flat bottom sided tile with no other sides. */
			3 : function(object_, tile_y_, tile_x_) {
				this.collideFlatBottom(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_height);
			},
			/* Flat left sided tile with no other sides. */
			4 : function(object_, tile_y_, tile_x_) {
				this.collideFlatLeft(object_, tile_x_ * tile_sheet.tile_width);
			},
			/* Flat top sided platform, notice the half height. */
			5 : function(object_, tile_y_, tile_x_) {
				this.collideFlatTop(object_, tile_y_ * tile_sheet.tile_height + tile_sheet.tile_half_height);
			},

			/* These functions with actual names are used inside of the tile specific functions. */
			/* For instance, if you want to collide an object with a regular square tile with four sides, you could have one lengthy and very unique function, or you could use four functions: one for each side. */
			/* In my opinion, it's better to have one function for each "type" of collison because you might have a couple different tiles that use the collideFlatTop method. */
			/* While it's not so evident in this example, it will make much more sense when slope tiles enter the picture. */
			/* Also note that these are platforms. */
			/* Collide with the bottom side of a tile. */
			collideFlatBottom : function(object_, bottom_) {
				if (object_.position.y < bottom_ && object_.last_position.y >= bottom_) {
					object_.last_position.y = object_.position.y = bottom_;
					object_.velocity.y = 0;
					return true;
				}
				return false;
			},
			/* Collide with the left side of a tile. */
			collideFlatLeft : function(object_, left_) {
				if (object_.getMaximumX() > left_ && object_.last_position.x + object_.width <= left_) {
					object_.last_position.x = object_.position.x = left_ - object_.width;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			},
			/* Collide with the right side of a tile. */
			collideFlatRight : function(object_, right_) {
				if (object_.position.x < right_ && object_.last_position.x >= right_) {
					object_.last_position.x = object_.position.x = right_;
					object_.velocity.x = 0;
					return true;
				}
				return false;
			},
			/* Collide with the top side of a tile. */
			collideFlatTop : function(object_, top_) {
				/* You can only collide with the top of the tile while you are moving down into it and your bottom is below its top. */
				if (object_.getMaximumY() > top_ && object_.last_position.y + object_.height <= top_) {
					object_.airborne = false;
					object_.last_position.y = object_.position.y = top_ - object_.height;
					object_.velocity.y = 0;
					return true;
				}
				return false;
			}
		};

		/* The controller object helps to control the red square on mobile and desktop devices. */
		/* Like most of the object literals in this code, I've already explained what they do in the tile map tutorial. */
		/* I'm leaving out repeat comments because it's clutter, and this stuff isn't really the focus of the tutorial anyway. */
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
		/* Now, normally, collision maps and graphics maps are kept in two separate arrays when using complex collision tiles, but for the sake of visualizing the collision objects, I made the graphics match the shape of the collision object. */
		/* Basically, instead of the graphics looking like pretty graphics, they look like what I think is a good representation of the type of collision they do. */
		/* As a result, instead of two maps, I just have one map. */
		/* But remember: multiple layers. There's a graphics layer, a collision layer, a background graphics layer, a foreground graphics layer. Just a lot of layers depending on your game. For this example: just one layer. */
		var map = {
			/* FUNCTIONS. */
			/* I condensed the draw function a little bit. If you want to see the expanded version, look at the tile map tutorial. */
			draw : function() {
				for (var index = this.length - 1; index > -1; index--) {
					var value = this.tiles[index];

					if (value != 999) {
						var destination_x = (index % this.columns) * tile_sheet.tile_width;
						var destination_y = Math.floor(index / this.columns) * tile_sheet.tile_height;
						/* For this particular example, my tile sheet only has one row. This means I can tweak the way I get the source image for the tile I'm drawing a little bit. */
						var source_x = value * tile_sheet.tile_width;
						/* See how simple that is? But I don't recommend having tile sheets that just have one really long row. I guess it still works. Eh, actually, I guess there's no reason not to. I guess it's a matter of preference, really. */
						/* Since there's only one row, the source_y value is always 0. */

						buffer.drawImage(source_image, source_x, 0, tile_sheet.tile_width, tile_sheet.tile_height, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
					}
				}
			},
			/* This super fly chicken is responsible for detecting which tiles the red square is colliding with and calling collision functions from the collider object. */
			detectCollision : function(object_) {
				/* This is part one of the collision process: detecting which tiles an object is overlapping. */
				/* It's pretty simple. All you do is check each corner of the object's bounding rectangle (or the hit box). */
				/* Since red square is, well, a square, this is particularly easy to do. */
				/* Here's how to get the sides. After all, it takes two sides to make a corner. */

				var bottom = Math.floor(object_.getMaximumY() / tile_sheet.tile_height);
				var left = Math.floor(object_.position.x / tile_sheet.tile_width);

				/* All those values are are row and column positions in the map. If you read the tile map tutorial, or maybe you just already know this, you know that you can use rows and columns to get values at specific indices in the tile map. */
				/* Now that we have the row and column positions occupied by the object, we can get the tile values to collide with and handle collision using the collider object. */
				/* The red square has 4 corners, so we check each one of them. */
				/* OH, YEAH, one thing to be cautious of is making your object larger than 2 tile sizes. If he's too big, this detection method will have to be expanded to get all the tiles he overlaps, not just the ones under his corners. */

				/* Value is the tile value under the object_'s corner. */
				/* It's easy to figure out: this is checking the tile value under the bottom row and left column of the object in tile space. */
				var value = this.tiles[bottom * this.columns + left];
				if (value != 999) {
					/* The collider object is just a lookup table. */
					/* It's full of functions you can reference with just a number value, so we can pass in the value of our tile to access the corresponding collision function. */
					/* We also pass in the physical coordinates of the tile space the object is colliding with as the last two parameters. */
					collider[value](object_, bottom, left);
				}
				/* Then we repeat the process for the other three corners. */
				/* The only thing to worry about is if the previous collision detection was handled by the collider. */
				/* If it was, the object will have been moved which means that the side values we're using are no longer accurate. */
				/* We'll have to redefine them to gain accuracy. */

				//bottom = Math.floor(object_.getMaximumY() / tile_sheet.tile_height);
				var right = Math.floor(object_.getMaximumX() / tile_sheet.tile_width);
				/* Check the bottom right tile. */
				value = this.tiles[bottom * this.columns + right];
				if (value != 999) {
					collider[value](object_, bottom, right);
				}

				//left = Math.floor(object_.position.x / tile_sheet.tile_width);
				var top = Math.floor(object_.position.y / tile_sheet.tile_height);

				/* Check the top left tile. */
				value = this.tiles[top * this.columns + left];
				if (value != 999) {
					collider[value](object_, top, left);
				}

				//right = Math.floor(object_.getMaximumX() / tile_sheet.tile_width);
				//top = Math.floor(object_.position.y / tile_sheet.tile_height);

				/* Check the top right tile. */
				value = this.tiles[top * this.columns + right];
				if (value != 999) {
					collider[value](object_, top, right);
				}
			},
			/* VARIABLES. */
			columns : 16,
			/* Here's a new variable for you! It's gravity. It's what I'm gonna use to make the red square fall. */
			gravity : 1,
			length : 256,
			tiles : [0, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 2, 999, 999, 999, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 4, 2, 5, 5, 999, 999, 4, 6, 2, 999, 999, 0, 999, 999, 999, 999, 4, 2, 999, 999, 999, 999, 4, 6, 2, 999, 999, 999, 999, 0, 999, 999, 4, 2, 999, 5, 999, 999, 4, 6, 2, 999, 5, 5, 5, 5, 5, 999, 4, 2, 999, 999, 999, 999, 4, 6, 2, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 999, 999, 4, 6, 2, 999, 5, 999, 999, 999, 1, 999, 4, 2, 999, 999, 999, 999, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 999, 999, 0, 0, 999, 999, 5, 999, 999, 999, 1, 999, 4, 2, 999, 999, 999, 999, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 999, 999, 0, 999, 999, 999, 5, 999, 999, 999, 1, 999, 4, 2, 999, 999, 999, 999, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 999, 999, 0, 999, 5, 0, 0, 0, 5, 999, 1, 999, 4, 2, 999, 999, 999, 999, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 2, 999, 5, 999, 999, 999, 999, 5, 999, 999, 999, 5, 999, 0, 999, 4, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
		};

		/* Once again we meet red_square. He's the butt kickin', soul eating, baby kissing protagonist of this tutorial series (at least until we get animated). */
		/* Also, the game loop tutorial explains interpolation to some extent. */
		var red_square = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				var interpolated_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

				buffer.drawImage(source_image, 96, 0, 16, 16, interpolated_x, interpolated_y, this.width, this.height);
			},
			/* These functions are for getting the farthest x and y coordinate on the player. */
			/* YOU CAN SEE THEM IN THE COLLISION CODE BECAUSE THAT'S WHAT THEY'RE USED FOR!!!!!!!!!!! */
			/* Don't be afraid of how complicated they are... */
			getMaximumX : function() {
				return this.position.x + this.width;
			},
			getMaximumY : function() {
				return this.position.y + this.height;
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

				/* Making use of that new Vector function to apply some friction. */
				this.velocity.scale(0.9);

				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;
			},
			/* VARIABLES. */
			/* Whether or not the red square is in the air. */
			airborne : true,
			height : 14,
			last_position : new Point(16, 16),
			position : new Point(17, 17),
			velocity : new Vector(0, 0),
			width : 14
		};

		/* The tile sheet object just defines dimensions of the source image for this example. */
		/* See the tile map tutorial for more info. */
		var tile_sheet = {
			columns : 7,
			/* This is used for the platform. It's only half as high as a normal tile top. */
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
		startLoadImage(source_image, "collision.png", function() {
			window.addEventListener("resize", resizeWindow);

			if ("ontouchstart" in document.documentElement) {
				/* If the user is using a touch device, two listeners will be needed, because touch move events aren't as responsive as mousemove events. */
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
