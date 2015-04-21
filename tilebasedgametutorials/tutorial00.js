/////////////////////////////////////////////
/* tutorial00.js. Frank Poth. 04/16/2015. */
///////////////////////////////////////////

/* This is the first tutorial in the series as you can see by the "00". */
/* All you need to gather from this example is how to "blit" tiles to the screen, and, more importantly, calculate where to blit them. */

/* I like to put all my code for one application inside one big function that goes by the same name, so here's that: */
(
	function tutorial00() {
		/* You'll notice that I group things in alphabetical order whenever possible. This is just to keep track of things, it also satisfies my OCD. */
		/* Big groups will be labeled with a large comment block like so: */

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Draws the buffer to the display. */
		function draw() {
			/* Clear the buffer canvas. */
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			/* Draw the map to the buffer. */
			map.draw();

			/* Draw the buffer to the display canvas. */
			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		/* Having a resize event handler is always important when designing stuff for mobile devices because your browser window will most likely resize often. */
		/* In each tutorial we're going to be making use of a canvas element to display stuff. */
		/* On mobile devices, space is limited, you want to go as full screen as possible in most cases, especially for an actual game. */
		/* For the purposes of this tutorial, I'm just going to stretch the canvas so that it's width and height are equal to the shortest dimension of the window and then center it along the longest dimension of the window. */
		function resizeWindow(event_) {
			var client_height = document.documentElement.clientHeight;
			/* The display canvas is inside the content div. The width of the content div is never greater than the width of the documentElement. */
			var client_width = html.display.parentElement.clientWidth;
			if (client_width < client_height) {
				html.display.height = html.display.width = client_width;
				html.display.style.left = "0px";
			} else {
				html.display.height = html.display.width = client_height;
				/* Remember, CSS doesn't like floating point values, so round down. */
				html.display.style.left = Math.floor((client_width - client_height) * 0.5) + "px";
			}

			/* Call draw to draw the map to the display canvas. */
			draw();
		}

		/* This loads images and performs a callback function when finished. */
		/* image_ is the image to set the src url_ on and callback_ is the function to execute once loading is finished. */
		function startLoadImage(image_, url_, callback_) {
			image_.addEventListener("load", loadImage);
			image_.src = url_;
			/* Handles an error should one occur. */
			function errorImage(event_) {
				/* This refers to the image being loaded or the target of the event_. */
				this.removeEventListener("error", errorImage);
				this.removeEventListener("load", loadImage);
				alert("An error occurred while loading an image file.");
				/* How's that for awesome error handling? Show stoppingly poor. */
			}

			/* Handles image loading. */
			function loadImage(event_) {
				this.removeEventListener("error", errorImage);
				this.removeEventListener("load", loadImage);
				callback_();
			}

		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////
		/* I like keeping these separate from my functions and variables. */

		/* The html object holds references to actual html elements defined in the html document. */
		var html = {
			/* Gets the canvas element from the html. */
			display : document.getElementById("display"),
		};

		/* The map object holds information about the map. */
		var map = {
			/* FUNCTIONS. */
			/* Draws the map to the buffer. */
			/* This is what you should look at if you don't get tile based games. */
			/* Calculating the x and y destinations of each blit is really the only thing you need to understand. */
			draw : function() {
				/* If you loop backwards, you only have to calculate this.length-1 once instead of 256 times. */
				for (var index = this.length - 1; index > -1; index--) {
					/* Get the value (1 or 0) at the current index in the values array. */
					var value = this.values[index];

					/* You only want to draw if your value is == 1. */
					/* If you want to draw to every tile space on the map (like in a top down scroller), just forget about this if statement. */
					if (value == 1) {
						/* These are really simple calculations. */
						/* Derive the row and column of the tile to draw from the index in the map array. */
						var column = index % this.columns;
						var row = Math.floor(index / this.columns);
						/* Multiply by 16 to get its physical location on screen. */
						var destination_x = column * 16;
						var destination_y = row * 16;

						/* The source image is 16x16px. */
						/* You blit from the source image at 0x, 0y, 16width, 16height, and then to the destination, which is the buffer. */
						buffer.drawImage(image, 0, 0, 16, 16, destination_x, destination_y, 16, 16);
					}
				}
			},
			/* VARIABLES. */
			/* There are 16 columns in the map. */
			/* We don't need a rows value yet, but there are also 16 rows. */
			/* 16x16=256 tile spaces in the map. */
			columns : 16,
			/* The length is the product of the number of columns and rows in the map. */
			length : 256,
			/* The values array is the "map". */
			/* A 1 indicates a tile and a 0 indicates no tile. */
			values : [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		/* It's good to have a buffer for drawing. */
		/* On each screen update, you draw several things to the buffer and then draw the buffer once to the display. */
		/* If you were to skip drawing to the buffer, you might see some flicker on the display canvas because the different drawing operations do not all happen at once, but rather one at a time. */
		/* The buffer ensures that everything you see on screen is drawn at once, thus eliminating the chance of flicker. */
		/* Also, I scale the buffer to fit the display canvas as the size of the display canvas may change. */
		/* It's much better to scale one buffer than 256 individual tiles (drawImage is painfully slow, moreso in the call than the actual blitting of small images). */
		var buffer = document.createElement("canvas").getContext("2d");

		/* The drawing context of the display canvas element. */
		var display = html.display.getContext("2d");

		/* The tile image. The source image file still needs to be loaded in, though. */
		var image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		/* Set the dimensions of the buffer to match your map. */
		/* You have 16 rows by 16 columns at 16px width and height, so 256px by 256px. */
		buffer.canvas.height = buffer.canvas.width = 256;
		/* Set the fill style for redrawing. */
		buffer.fillStyle="#ffffff";

		/* Listen for resize events. */
		window.addEventListener("resize", resizeWindow);

		/* Here's where we load the image. */
		/* The callback function will execute once the image is done loading. */
		/* It's important not to call resizeWindow before the image has loaded, because it also does the initial drawing of the tile map. */
		/* If you call it before the image loads, you won't see anything until the screen is resized again after the image finishes loading. */
		startLoadImage(image, "tutorial00.png", function() {
			/* Make sure the display canvas is sized properly. */
			/* I've noticed that some browsers initialize with invalid window dimensions, and some fire the resize event at different times than others when starting up, so it's best to add the event listener and call the function just to be safe. */
			resizeWindow();
		});
	})();

/* And that's it! If you take out all the comments, you have a pretty small bit of code that draws a tilemap to the screen. */