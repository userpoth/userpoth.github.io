//////////////////////////////////////////
/* tilemap.js. Frank Poth. 04/30/2015. */
////////////////////////////////////////

/* Here we are at the first tutorial. Technically I wrote this one after the game loop tutorial, but it's still first in the line up. */
/* All this mean puppy does is draw some tile graphics from a source image onto the display canvas for you to marvel at. */
/* It will also output a little bit of info on each tile space on touch or mouse over, so interact with the example. */

(
	function tileMap() {
		///////////////
		/* CLASSES. */
		/////////////
		/* Some classes to keep things classy. */

		/* Just a simple point object to be used with the controller. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Draws the buffer to the display. */
		function draw() {
			buffer.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			map.draw();

			/* This draws a semi-transparent square over the selected tile index. */
			/* Notice the same formula is used to calculate where to place the square as is used in the draw function of the map object. */
			buffer.fillStyle = "rgba(0,128,255,0.5)";
			buffer.beginPath();
			buffer.rect((controller.selected_tile % map.columns) * tile_sheet.tile_width, Math.floor(controller.selected_tile / map.columns) * tile_sheet.tile_height, tile_sheet.tile_width, tile_sheet.tile_height);
			buffer.fill();

			display.clearRect(0, 0, display.canvas.width, display.canvas.height);
			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		/* Handles mouse move events on the display. */
		function mouseMoveDisplay(event_) {
			event_.preventDefault();
			controller.moveTo(event_.pageX, event_.pageY);
		}

		/* This event handler takes care of resize events. */
		/* That means orientation change, scrolling (in some cases), and basic resizes. */
		/* Basically, this will ensure that the display canvas stays centered horizontally and fills up as much of the screen as possible. */
		/* It also keeps the output p element at the top left corner of the display canvas and makes sure the controller's offset and size_ratio values are accurate. */
		function resizeWindow(event_) {
			/* Client height is just the height of the documentElement, because there will be no elements constricting the canvas height wise. */
			/* Client width on the other hand is restricted by the content div, which is the parent element of the display canvas. */
			var client_height = document.documentElement.clientHeight;
			var client_width = html.display.parentElement.clientWidth;

			/* This basically says if the client height is less than the client width, resize the canvas to client height and center the canvas horizontally. */
			if (client_height < client_width) {
				html.display.height = html.display.width = client_height;
				html.display.style.left = Math.floor(client_width * 0.5 - client_height * 0.5) + "px";
			}
			/* If the client width is greater, then the canvas will take up the entire client width. */
			else {
				html.display.height = html.display.width = client_width;
				html.display.style.left = "0px";
			}

			/* Now that the display canvas is resized, let's get the scale compared to the buffer and store it in controller where it will be used to get tile positions. */
			controller.size_ratio = buffer.canvas.width / html.display.width;

			/* Now we have to get the offset position of the canvas in the client window. */
			/* I'm going to simultaneously update the controller's offset position, because it's the same as the offset position of the canvas. */
			var element = html.display;
			controller.offset.x = controller.offset.y = 0;

			while (element.parentElement) {
				controller.offset.x += element.offsetLeft;
				controller.offset.y += element.offsetTop;
				element = element.parentElement;
			}

			/* And now position the output p element at the top left corner of the canvas. */
			html.output.style.left = controller.offset.x + "px";
			html.output.style.top = controller.offset.y + "px";

			/* Draw the source image if you can. */
			if (source_image.width) {
				draw();
			}
		}

		/* This hot tomale right here loads an image file into an Image object and calls the callback when finished. */
		/* You can't start drawing without without an image, so this is pretty necessary. */
		function startLoadImage(image_, url_, callback_) {
			/* Add those listeners. */
			image_.addEventListener("error", errorImage);
			image_.addEventListener("load", loadImage);
			/* Setting the src of an image is what actually starts the loading process. */
			image_.src = url_;

			/* Handles errors. */
			function errorImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				/* Let the user know what's going on. */
				html.output.innerHTML = "There was an error loading the one graphic this example uses and the programmer was too lazy to implement a fallback operation. Try visualizing some awesome graphics right here.";
			}

			/* Handle loading. */
			function loadImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				/* Call the callback. */
				/* But first check if it exists (because in this case it doesn't exist)!!! */
				if (callback_) {
					callback_();
				}
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
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* The controller is just an object that keeps track of the user's mouse position or touch position. */
		/* It will be used to let the user interact with the tile map. */
		var controller = {
			/* FUNCTIONS. */
			moveTo : function(x_, y_) {
				/* This gives an accurate mouse or touch location relative to the display canvas accounting for offset position and scale of the display canvas. */
				this.position.x = (x_ - this.offset.x) * this.size_ratio;
				this.position.y = (y_ - this.offset.y) * this.size_ratio;

				/* This shows the user the relationship between row, column and index. */
				var column = Math.floor(this.position.x / tile_sheet.tile_width);
				var row = Math.floor(this.position.y / tile_sheet.tile_height);
				var index = row * map.columns + column;

				/* Only draw when you need to draw, which is whenever the user selects a new tile. */
				if (index != this.selected_tile) {
					var value = map.tiles[index];
					html.output.innerHTML = "column: " + column + "<br>row: " + row + "<br>index: " + index + "<br>value: " + value;
					this.selected_tile = index;
					draw();
				}
			},
			/* VARIABLES. *
			 /* The offset location of the display canvas used to calculated a relative position. */
			offset : new Point(0, 0),
			/* The calculated position. */
			position : new Point(0, 0),
			selected_tile : 0,
			/* The size ratio of the buffer to the display canvas. */
			/* This is needed because the display canvas changes size depending on the user's viewport and orientation. */
			size_ratio : 1
		};

		/* html is where I'm going to put all of my references to actual elements. */
		/* I guess it's sort of overkill to put them in an object, but it helps me to differentiate between actual html elements and the rest of the objects. */
		var html = {
			/* VARIABLES. */
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		/* The map object holds information about the tile map. For instance, it literally holds the tile map. */
		var map = {
			/* FUNCTIONS. */
			/* This is where the magic happens, baby! */
			/* Drawing tile graphics to the canvas using the tile map as a reference for which tiles to draw where. */
			draw : function() {
				for (var index = this.length - 1; index > -1; index--) {
					/* This gets the tile value out of the tile map. */
					var value = this.tiles[index];

					/* Only draw if the tile value isn't 999, which is the empty space indicator. */
					if (value != 999) {
						/* These variables get the row and column on the map in which to draw the tile. */
						var destination_column = index % this.columns;
						var destination_row = Math.floor(index / this.columns);
						/* Then row and column are multiplied by the actual tile dimensions in pixels to get the exact location. */
						var destination_x = destination_column * tile_sheet.tile_width;
						var destination_y = destination_row * tile_sheet.tile_height;
						/* These variables do the same exact thing only they determine where in the source image to get the tile graphic from. */
						var source_column = value % tile_sheet.columns;
						var source_row = Math.floor(value / tile_sheet.columns);
						var source_x = source_column * tile_sheet.tile_width;
						var source_y = source_row * tile_sheet.tile_height;

						/* After all that, draw to the buffer. */
						buffer.drawImage(source_image, source_x, source_y, tile_sheet.tile_width, tile_sheet.tile_height, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
					}
				}
			},
			/* VARIABLES. */
			/* The map has 16 columns and 16 rows, but we don't actually need the rows variable to draw the map. */
			columns : 16,
			/* Like I wrote earlier, 16 columns and 16 rows. This adds up to 256 individual tile spaces. */
			length : 256,
			/* Each value in the tile map corresponds to the index of a tile graphic in the source image. */
			/* 999 is used to indicate no tile. */
			tiles : [0, 0, 7, 999, 999, 999, 999, 999, 20, 0, 0, 0, 0, 22, 999, 999, 0, 22, 999, 999, 999, 999, 999, 999, 999, 999, 12, 14, 999, 999, 999, 999, 19, 999, 999, 999, 999, 999, 999, 999, 999, 999, 2, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 2, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 17, 3, 0, 0, 3, 21, 999, 999, 21, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 999, 999, 0, 6, 999, 999, 999, 999, 999, 999, 4, 4, 22, 20, 2, 2, 999, 999, 0, 0, 13, 21, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 1, 19, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 19, 999, 999, 999, 999, 999, 999, 2, 2, 16, 10, 4, 4, 999, 999, 0, 39, 999, 999, 999, 999, 999, 999, 16, 0, 0, 0, 0, 10, 999, 999, 0, 0, 10, 999, 999, 999, 999, 999, 23, 1, 0, 0, 1, 19, 999, 999, 0, 0, 7, 999, 999, 999, 999, 999, 999, 999, 2, 4, 999, 999, 999, 999, 0, 7, 999, 5, 0, 11, 999, 999, 999, 999, 2, 4, 999, 999, 999, 3, 0, 39, 5, 0, 0, 39, 999, 17, 21, 999, 16, 10, 999, 3, 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		};

		/* The tile sheet object stores information about the tile sheet. */
		/* This particular tile sheet has 5 columns and 8 rows and tile width and height are 16. */
		var tile_sheet = {
			/* Just like the map, we really don't need to know about rows. Just columns. */
			columns : 5,
			tile_height : 16,
			tile_width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		/* So here we define the buffer and display contexts. */
		/* Something you should know about display contexts is that you don't need to have variables for the actual canvas and the context because the context has access to the canvas. */
		/* So you can access the canvas of a context at any time like this: my_context.canvas. It's that simple. */
		/* So how this will work is first all the tiles are drawn to the buffer and then the buffer is drawn to the display. This prevents flickering. You don't want flickering animations. */
		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");

		/* The source image is where the tilemap.png will reside once he's loaded in. */
		var source_image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////
		/* All the functions and variables above do nothing unless you put them into action. That happens here. */

		/* Make sure the buffer is sized propperly. */
		buffer.canvas.height = buffer.canvas.width = 256;

		/* You can't start the party without something to draw, so we're going to have to load in the source image. */
		/* Once it's done loading the callback function is called and things start moving (not literally, though, this is a static level map)!. */
		startLoadImage(source_image, "tilemap.png", function() {
			if ("ontouchstart" in document.documentElement) {
				/* If the user is using a touch device, two listeners will be needed, because touch move events aren't as responsive as mousemove events. */
				html.display.addEventListener("touchmove", touchMoveDisplay);
				html.display.addEventListener("touchstart", touchStartDisplay);
			} else {
				html.display.addEventListener("mousemove", mouseMoveDisplay);
			}

			window.addEventListener("resize", resizeWindow);

			/* If you don't call resize window right away, the output p element and the canvas will not be in the right location on screen unless for some reason a resize event fires on its own. */
			resizeWindow();
		});
	})();
