/////////////////////////////////////////////
/* tutorial02.js. Frank Poth. 04/22/2015. */
///////////////////////////////////////////

/* Just presents a basic game loop using request animation frame. */

(
	function tutorial02() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Draws the buffer to the display. */
		function draw() {
			/* Clear the buffer of the old image. */
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			/* Draw that red square, baby! */
			red_square.draw();

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

		/* Updates the game logic. */
		function update() {
			/* Updates the red square's position. */
			red_square.update();
			/* Does collision detection and resolution between the "map" and the red square. */
			map.resolveCollision(red_square);
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var engine = {
			/* FUNCTIONS. */
			start : function() {
				/* Get a handle on this to maintain scope inside of the loop function. */
				var handle = this;
				/* The loop function sets up a call to itself through requestAnimationFrame, thereby perpetuating itself until this.stopped==true. */
				(function loop() {
					/* The early out. */
					if (handle.stopped) {
						return;
					}

					/* Requesting the next animation frame is like asking the window to call your function whenever it is ready to draw again. */
					/* What's efficient about this is you only draw when the browser is capable of drawing, not milliseconds ahead of or behind of that time. */
					/* When you use setInterval or setTimeout, you get precisely timed execution of your function, but the browser may not be able to draw when your function is called. */
					/* This may seem like a strange concept: waiting for your computer to be ready, but you do wait. Your computer is just so fast you don't notice it. */
					/* So why not only draw when you can instead of attempting to draw when you can't? It's a rhetorical question, of course you'll want to draw only when you can! */
					window.requestAnimationFrame(loop);
					update();
					draw();
				})();
			},
			/* Sets stopped to true, thus stopping the engine before it can update the game again. */
			stop : function() {
				this.stopped = true;
			},
			/* VARIABLES. */
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
					object_.position.x = -object_.width;
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
			draw : function() {
				buffer.drawImage(image, 0, 0, 16, 16, this.position.x, this.position.y, this.width, this.height);
			},
			/* Updates the position of the red square. */
			update : function() {
				this.position.x += this.velocity_x;
			},
			/* OBJECT LITERALS. */
			/* He's got a position. */
			position : {
				x : 0,
				y : 120
			},
			/* VARIABLES. */
			/* Dimensions. */
			height : 16,
			width : 16,
			/* He's got a movement speed on one axis. */
			velocity_x : 4
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

			/* Start your engine once the image is fully loaded and ready for drawing! */
			engine.start();
		});

	})();
