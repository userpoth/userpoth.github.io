///////////////////////////////////////////
/* gameloop.js. Frank Poth. 04/29/2015. */
/////////////////////////////////////////

/* Alrighty, then. Here's the actual code you should be looking at. */
/* Here I'm going to create a super fly game loop that uses requestAnimationFrame to handle updates to the display canvas. */
/* Updates to logic will be handled asynchronously by a timeout loop (asynchronously just means not in parallel). */
/* If you've researched RAF (requestAnimationFrame), you've probably seen it used to handle EVERYTHING. */
/* Well, this is wrong and can actually hurt the performance of RAF. */
/* You want to keep as much logic out of the drawing process as possible, because logic may need to happen more often than drawing. */
/* Drawing is what RAF likes to do because it's optimized to do it well in the browser. */
/* Leave logic to the cold calculations of timeout, which will try to update at a set interval regardless of what your browser is ready for. */
/* To make up for the variable speed of RAF, I'm also going to implement some interpolation, which just moves animations a little bit to smooth things out when your draw loop doesn't line up with your logic updates exactly (which will be all the time). */
/* Anyway, that's a lot of poorly formatted comments; time for some actual code. */

/* But first more comments. */
/* This is a self calling function. That's why it's wrapped in parenthesis. */
/* When the script tag is created in HTML with a src attribute pointing to this js file, this script will automatically execute. */
/* By wrapping the script in a function, you keep objects out of the global scope. You don't want to clutter the global scope, and you don't want the global scope cluttering you. */
/* Variables in JavaScript are searched for within their scope every time one is accessed. The more orderly the scope, the easier it is to find variables. */
(
	function gameLoop() {
		///////////////
		/* CLASSES. */
		/////////////

		/* A 2d point for storing locations. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* A 2d vector for storing vectors. */
		/* Right now it's the same as Point, and therefore kind of stupid to have as a separate class. */
		/* But Points and Vectors aren't the same thing, and I might want to put some functions on Vector later that point won't have. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* In a mobile friendly application you have to be ready for the user to do all kinds of horrible things to your viewport. */
		/* He'll topple it on its side, zoom it, bring down those stupid peekaboo address bars, scroll to God knows where, and then he'll complain if you don't handle it well. */
		/* The only thing we can do is make sure we handle it well, so deal with it. */
		/* Our display canvas should take up as much of the screen as possible, because on small devices, it's hard to see. */
		/* We want to scale it as large as our smallest veiwport dimension. */
		function resizeWindow(event_) {
			/* Client height is just the height of the documentElement, because there will be no elements constricting the canvas height wise. */
			/* Client width on the other hand is restricted by the content div, which is the parent element of the display canvas. */
			var client_height = document.documentElement.clientHeight;
			var client_width = html.display.parentElement.clientWidth;

			if (client_height < client_width) {
				html.display.height = html.display.width = client_height;
				html.display.style.left = Math.floor(client_width * 0.5 - client_height * 0.5) + "px";
			} else {
				html.display.height = html.display.width = client_width;
				html.display.style.left = "0px";
			}

			/* Now, unfortunately, we have to get the physical location of the display canvas in order to position the output element over top of it. */
			/* You start at the element you want to get the location of and loop your way to the top of the chain, adding offset values as you go. */
			/* What's left is the offset position of your element relative to the client window. */
			var element = html.display;
			var offset_x = 0;
			var offset_y = 0;

			/* Loop through the parent elements. */
			while (element.parentElement) {
				offset_x += element.offsetLeft;
				offset_y += element.offsetTop;
				element = element.parentElement;
			}

			/* And finally we can set the position of the output element. */
			html.output.style.left = offset_x + "px";
			html.output.style.top = offset_y + "px";
		}

		/* Here we have a BEASTLY necessity. */
		/* This function loads an image and performs a callback when finished. */
		/* The callback is where the game will start, because you can't start a game without graphics to draw. */
		/* You may have heard about asset managers, well, that's what this is. If you have a ton of data, you can even use a more complex version of this to display a preloader. */
		/* For one image, though, no preloader required. */
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
				html.output.innerHTML = "There was an error loading the one graphic this example uses and the programmer was too lazy to implement a fallback operation. This example has failed.";
			}

			/* Handle loading. */
			function loadImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				/* Call the callback. */
				callback_();
			}

		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* This is the engine object. */
		/* It is responsible for the game loop. */
		/* One loop will handle logic, and the other loop will handle drawing! */
		var engine = {
			/* FUNCTIONS. */
			/* Starts the engine. */
			/* interval_ is the number of milliseconds to wait between updating the logic. */
			start : function(interval_) {
				/* The accumulated_time is how much time has passed between the last logic update and the most recent call to render. */
				var accumulated_time = interval_;
				/* The current time is the current time of the most recent call to render. */
				var current_time = undefined;
				/* The amount of time between the second most recent call to render and the most recent call to render. */
				var elapsed_time = undefined;
				/* You need a reference to this in order to keep track of timeout and requestAnimationFrame ids inside the loop. */
				var handle = this;
				/* The last time render was called, as in the time that the second most recent call to render was made. */
				var last_time = Date.now();

				/* Here are the functions to be looped. */
				/* They loop by setting up callbacks to themselves inside their own execution, thus creating a string of endless callbacks unless intentionally stopped. */
				/* Each function is defined and called immediately using those fancy parenthesis. This keeps the functions totally private. Any scope above them won't know they exist! */
				/* You want to call the logic function first so the drawing function will have something to work with. */
				(function logic() {
					/* Set up the next callback to logic to perpetuate the loop! */
					handle.timeout = window.setTimeout(logic, interval_);
					
					/* This is all pretty much just used to add onto the accumulated time since the last update. */
					current_time = Date.now();
					/* Really, I don't even need an elapsed time variable. I could just add the computation right onto accumulated time and save some allocation. */
					elapsed_time = current_time - last_time;
					last_time = current_time;

					accumulated_time += elapsed_time;
					
					/* Now you want to update once for every time interval_ can fit into accumulated_time. */
					while (accumulated_time >= interval_) {
						/* Update the logic!!!!!!!!!!!!!!!! */
						red_square.update();

						accumulated_time -= interval_;
					}
				})();

				/* The reason for keeping the logic and drawing loops separate even though they're executing in the same thread asynchronously is because of the nature of timer based updates in an asynchronously updating environment. */
				/* You don't want to waste any time when it comes to updating; any "naps" taken by the processor should be at the very end of a cycle after everything has already been processed. */
				/* So, say your logic is wrapped in your RAF loop: it's only going to run whenever RAF says it's ready to draw. */
				/* If you want your logic to run as consistently as possible on a set interval, it's best to keep it separate, because even if it has to wait for the RAF or input events to be processed, it still might naturally happen before or after those events, and we don't want to force it to occur at an earlier or later time if we don't have to. */
				/* Ultimately, keeping these separate will allow them to execute in a more efficient manner rather than waiting when they don't have to. */
				/* And since logic is way faster to update than drawing, drawing won't have to wait that long for updates to finish, should they happen before RAF. */

				/* time_stamp_ is an argument accepted by the callback function of RAF. It records a high resolution time stamp of when the function was first executed. */
				(function render(time_stamp_) {
					/* Set up the next callback to RAF to perpetuate the loop! */
					handle.animation_frame = window.requestAnimationFrame(render);

					/* You don't want to render if your accumulated time is greater than interval_. */
					/* This is dropping a frame when your refresh rate is faster than your logic can update. */
					/* But it's dropped for a good reason. If interval > accumulated_time, then no new updates have occurred recently, so you'd just be redrawing the same old scene, anyway. */
					if (accumulated_time < interval_) {
						buffer.clearRect(0, 0, buffer.canvas.width, buffer.canvas.height);

						/* accumulated_time/interval_ is the time step. */
						/* It should always be less than 1. */
						red_square.draw(accumulated_time / interval_);

						html.output.innerHTML = "Number of warps: " + red_square.number_of_warps;

						/* Always do this last. */
						/* This updates the actual display canvas. */
						display.clearRect(0, 0, display.canvas.width, display.canvas.height);
						display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
					}
				})();
			},
			/* Stops the engine by killing the timeout and the RAF. */
			stop : function() {
				window.cancelAnimationFrame(this.animation_frame);
				window.clearTimeout(this.timeout);
				this.animation_frame = this.timeout = undefined;
			},
			/* VARIABLES. */
			animation_frame : undefined,
			timeout : undefined
		};

		/* I'm going to put references to my html elements inside an html object. */
		/* This is probably unneccesary, but I like to keep things separated and this clearly shows what is and is not an html element. */
		/* Plus making calls to document is apparently quite slow, so I try to avoid it as much as possible. */
		var html = {
			/* VARIABLES. */
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		/* The red square is the most bad ass dude in town. He might even be the most bad ass dude around. */
		/* He's red and square and he moves across the screen on the x axis. Oh, yeah. */
		var red_square = {
			/* FUNCTIONS. */
			/* Draws the red square at it's interpolated location! */
			/* time_step_ is a value between 0 and < 1 that represents the ratio of extra time passed between the last logic update and the present rendering of graphics to the display. */
			draw : function(time_step_) {
				/* As you can see, this is super simple. You just multiply the change in position between the last two updates and multiply it by the time step and then add it all to the last position. */
				var interpolated_x = this.last_position.x + (this.position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.position.y - this.last_position.y) * time_step_;

				/* You might notice that this means the user never actually sees the player in his most up to date position (unless a collision occurs, but that's not in this example). */
				/* This is because interpolation works best between two known locations. If we interpolate between two positions we already know, there's no chance that we might end up in a wall, because collision will have already been resolved (again, not in this example). */
				/* If you try to calculate the next position without actually updating the logic, you might place the red square over a wall or an enemy, and that'd just look bad. */
				/* So instead, we only draw between the last update and the current one. The user never knows the difference and probably wouldn't care if he did. */

				/* Now we draw the red square to the buffer. */
				/* We know the source location of the square in the image file: 0,0,16,16. */
				buffer.drawImage(source_image, 0, 0, 16, 16, interpolated_x, interpolated_y, this.width, this.height);
			},
			/* Updates the red square. This is the logic side of things. */
			update : function() {
				/* Set the last position to the current position (which will soon be old). */
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;

				/* Update the current position (so it's new!). */
				this.position.x += this.velocity.x;

				/* Now do some HARD CORE, CPU CRUSHING PHYSICS!!!! */
				/* Not really, though. Just move the red square if he goes beyond the boundaries of the buffer. */
				if (this.position.x > buffer.canvas.width) {
					/* It's important to set the last position as well when working with collision or any sort of repositioning so that drawing doesn't interpolate between the last position and the new, seemingly out of place adjusted position. */
					this.last_position.x = this.position.x = -this.width;

					/* I'm going to call this massive jump back to the other side of the screen: warping. */
					this.number_of_warps++;
				}
			},
			/* VARIABLES. */
			height : 16,
			/* It's necessary to record both the last position and current position of an object in order to do interpolation between frames. */
			last_position : new Point(120, 120),
			/* The number of SWEET WARPS that have occured since the red square started moving. */
			/* I'm using this to keep track of how consistent the game loop is across devices. */
			/* If it's inconsistent, well, then the red square on one device will warp more often on one device than another, but my goal is utter consistency. */
			number_of_warps : 0,
			position : new Point(120, 120),
			/* Why did I make a two dimensional Vector class for this example when it's clearly the same as Point and then I don't even use both properties? Well, I don't know either. */
			velocity : new Vector(2, 0),
			width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////
		/* Here's where I keep all of my easy to read one liners! I like to keep things alphabetized, but it's horrible to keep these mixed in with object literals in alphabetical order. Impossible to read. */

		/* It's important to buffer your images before you do the final rendering to the display canvas. */
		/* If you don't you could easily end up with "flickering" on the screen, and flickering graphics look pretty terrible. */
		var buffer = document.createElement("canvas").getContext("2d");
		/* This is a reference to the drawing context of the display canvas. */
		var display = html.display.getContext("2d");

		/* The source image is where the super awesome red square graphic lives. */
		/* Well, he will live there once he's loaded into the image. Right now he's still in the source file. */
		var source_image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////
		/* This section of code is responsible for booting off the game loop and setting up some important things, so it's sort of like an initialize section. */

		/* Set up your buffer canvas. */
		buffer.canvas.height = buffer.canvas.width = 256;

		/* Add the resize event to the window. */
		window.addEventListener("resize", resizeWindow);

		/* Calling this will reformat the display canvas and the output p element regardless of whether or not the window really resized. */
		resizeWindow();

		/* Since things can't start until we load our image, we should probably do that. */
		/* The code in the callback will execute once the image file has loaded. */
		startLoadImage(source_image, "gameloop.png", function() {
			/* Start the engine with a logic update interval of 30fps to be safe. */
			/* The drawing update interval will be determined by requestAnimationFrame. */
			engine.start(1000 / 30);
		});
	})();
