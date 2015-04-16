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

		function draw() {
			/* Clear the display canvas. */
			display.fillRect(0, 0, display.canvas.width, display.canvas.height);

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
			
			/* The display canvas and its context have their values reset when it is resized, so you have to reset fillStyle whenever this happens. */
			/* Drawing operations are super expensive in HTML5, especially with drawImage, so you want to use these things as sparingly as possible. */
			display.fillStyle="#ffffff";
			/* Call draw to draw the map to the display canvas. */
			draw();
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* The html object holds references to actual html elements. */
		var html = {
			/* Gets the canvas element from the html. */
			display : document.getElementById("display"),
			/* Gets the img element from the html. */
			image : document.getElementById("image")
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
					/* If you want to draw to every tile space on the map, just forget about this if statement. */
					if (value == 1) {
						/* These are really simple calculations. */
						var destination_x = (index % this.columns) * 16;
						var destination_y = Math.floor(index / this.columns) * 16;

						/* The source image is 16x16px. */
						/* You blit from the source image at 0x, 0y, 16width, 16height, and then to the destination, which is the buffer. */
						buffer.drawImage(html.image, 0, 0, 16, 16, destination_x, destination_y, 16, 16);
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
		var buffer = document.createElement("canvas").getContext("2d");
		/* The drawing context of the display canvas element. */
		var display = html.display.getContext("2d");

		//////////////////
		/* INITIALIZE. */
		////////////////
		/* I guess tutorial00() is really the initialize function, but this is where the program is launched into action. */

		/* Set the dimensions of the buffer to match your map. */
		/* You have 16 rows by 16 columns at 16px width and height, so 256px by 256 px. */
		buffer.canvas.height = buffer.canvas.width = 256;

		/* Listen for resize events. */
		window.addEventListener("resize", resizeWindow);

		/* Make sure the display canvas is sized properly. */
		/* I've noticed that some browsers initialize with invalid window dimensions, and some even fire the resize event when starting up, so it's best to add the event listener and call the function just to be safe. */
		resizeWindow();
	})();
