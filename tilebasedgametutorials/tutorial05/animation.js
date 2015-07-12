/******************************************/
/* animation.js. Frank Poth. 07/12/2015. */
/****************************************/

/* This example draws a tilemap to the canvas with animated tiles. */
/* In the last tutorial I defined a tilesheet class, but I'm not going to use it. */
/* There's no need until I actually start using multiple tile sheets. */

(function animation() {
	///////////////
	/* CLASSES. */
	/////////////

	/* Here's an animation class to handle tile animations. */
	/* All it does is cycle through frames on each update. */
	/* values_ is an array of tile values to be used in the animation, a better name might be frames. */
	/* interval_ is the delay between switching frame values. */
	function Animation(values_, interval_) {
		/* The count increases with each update until it reaches the interval. */
		/* When that happens, the frame value changes and that's what we call animation. */
		this.count = 0;
		/* The index is like the playhead in an animation. */
		/* The values array holds the frames and the index runs over the frames. */
		/* Basically, it's the index of the frame value in the frame values array. */
		this.index = 0;
		this.interval = interval_;
		/* We start the value at the first frame value in the animation. */
		this.value = values_[0];
		this.values = values_;
	}


	Animation.prototype = {
		/* FUNCTIONS. */
		update : function() {
			this.count++;
			/* If the count reaches the interval... */
			if (this.count == this.interval) {
				/* Set count to 0. */
				this.count = 0;
				/* Move the "playhead" forward or set it to zero if it's at the end of the animation. */
				this.index = this.index < this.values.length-1 ? this.index + 1 : 0;
				/* Set the value of the current frame of animation. */
				this.value = this.values[this.index];
			}
		},
		/* VARIABLES. */
		constructor : Animation
	};

	/////////////////
	/* FUNCTIONS. */
	///////////////

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

	///////////////////////
	/* OBJECT LITERALS. */
	/////////////////////

	/* If you want stuff to move, you're going to need an engine. */
	/* I probably don't need such a complex engine for some simple animation, but it's what I'm gonna use! */
	/* It's the same engine I've been using, so if you want a better explaination, check out the game loop tutorial. */
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

					tile_sheet.update();
				}
			})();

			(function render(time_stamp_) {
				handle.animation_frame = window.requestAnimationFrame(render);

				if (accumulated_time < interval_) {
					buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);
					map.draw();
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

	/* This is the map object. */
	var map = {
		/* FUNCTIONS. */
		/* Draws the tile map to the buffer. */
		draw : function() {
			/* So, things are a little different this time around. */
			/* First, let's just loop over the map. */
			/* I'm going to use a 2d approach like in the scrolling example because it's just nicer to look at. */
			for (var column = 0; column < this.columns; column++) {
				for (var row = 0; row < this.rows; row++) {
					/* Okay, so we're looping through all the tiles in the map. */
					/* First letch check the current tile value of the tile space we want to blit. */
					var value = this.values[row * this.columns + column];

					/* Now we want to see if it's even a real tile or just an empty space. */
					/* If it's not == to 999, it's a real tile or an animated tile. */
					if (value != 999) {
						/* Now we just need to check if the value is an animated tile. */
						/* How I do it is like this: all animated tiles come after non-animated tiles. */
						/* This makes it a matter of a simple if statement. */
						/* If the value is greater than the number of non-animated tiles in the set, then it must be animated, so we go to a specially array that holds animations and get the value from there. */
						if (value - tile_sheet.length > -1) {
							/* If we have an animated tile, we just set it's current value to the new value. */
							value = tile_sheet.animations[value - tile_sheet.length].value;
						}
						
						/* Now all you have to do is blit! */
						
						buffer.drawImage(source_image,(value%tile_sheet.tile_width)*tile_sheet.tile_width,0,tile_sheet.tile_width,tile_sheet.tile_height,column*tile_sheet.tile_width,row*tile_sheet.tile_height,tile_sheet.tile_width,tile_sheet.tile_height);
					}
				}
			}
		},
		/* VARIABLES. */
		columns : 16,
		length : 256,
		rows : 16,
		/* Once again, 999 represents a tile we will never use, because I'm not going to make 999 different tiles. */
		/* 0 is dirt and 1 is the grass animation. */
		values : [0, 0, 0, 4, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 0, 0, 0, 4, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 999, 999, 0, 0, 0, 0, 4, 999, 999, 999, 999, 999, 999, 999, 999, 0, 999, 999, 999, 4, 0, 0, 0, 0, 4, 999, 999, 999, 999, 999, 999, 999, 4, 4, 4, 0, 0, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 0, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 0, 0, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 4, 0, 0, 0, 0, 4, 999, 4, 4, 4, 999, 999, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	};

	/* Alright, here's the tile sheet object back in action again. */
	/* Now we have an animation array to be used with the animation object for the grass. */
	var tile_sheet = {
		/* FUNCTIONS. */
		/* Now that we have animations in the tile sheet, we have to update the tilesheet as well. */
		update : function() {
			/* All it does is update the grass animation. */
			/* If you have more animations, just loop over them and do the same thing. */
			this.animations[0].update();
		},
		/* VARIABLES. */
		/* An array for all the tile animations. */
		animations : [new Animation([1, 2, 3, 2], 24)],
		/* The actual length of the tile sheet is 4. */
		/* There's one ground tile and 3 tiles for the grass animation. */
		/* Any tile values beyond the length of the tile sheet will be considered animated tiles by the draw function in the map. */
		length:4,
		tile_height:16,
		tile_width:16
	};

	/////////////////
	/* VARIABLES. */
	///////////////

	var buffer = document.createElement("canvas").getContext("2d");
	var display = document.getElementById("display").getContext("2d");

	var source_image = new Image();

	//////////////////
	/* INITIALIZE. */
	////////////////

	buffer.canvas.height = buffer.canvas.width = 256;
	buffer.fillStyle = "#c2ecf4";

	/* Kick things off after loading the graphics. */
	startLoadImage(source_image, "animation.png", function() {
		window.addEventListener("resize", resizeWindow);

		resizeWindow();

		engine.start(1000 / 60);
	});
})();
