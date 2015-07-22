////////////////////////////////////////
/* index.js. Frank Poth. 07/19/2015. */
//////////////////////////////////////

/* Okay, so what I'm going for here is a site that's heavy on graphics and a very video game feel. */
/* There's gonna be a little guy who guides you around the site with a word bubble and touch/click options. */
/* He'll be fully animated and help you navigate from area to area, which will work like a big scrolling world. */
/* Basically, it will be a little guy, a text bubble, and some nice background stuff. Maybe a few more little animations. */

(
	function index() {
		///////////////
		/* CLASSES. */
		/////////////

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function resizeWindow(event_) {
			/* Okay, so first you want to get the actual screen size. */
			var client_height = document.documentElement.clientHeight;
			var client_width = document.documentElement.clientWidth;

			var map_height = map.rows * tile_sheet.tile_height;
			var map_height_ratio = client_height / map_height;
			var scaled_tile_width = map_height_ratio * tile_sheet.tile_width;

			map.visible_columns = Math.floor(client_width / scaled_tile_width);

			/* The full height of the map will be applied to the buffer. */
			background_buffer.canvas.height = map_height;
			background_buffer.canvas.width = map.visible_columns * tile_sheet.tile_width;
			/* The full height of the screen will be applied to the display. */
			background_display.canvas.height = client_height;
			background_display.canvas.width = client_width;

			current_screen.drawBackground();
		}

		function startLoadImage(image_, url_, callback_) {
			image_.addEventListener("error", errorImage);
			image_.addEventListener("load", loadImage);

			image_.src = url_;

			function errorImage(event_) {
				image_.removeEventListener("error", errorImage);
				image_.removeEventListener("load", loadImage);

				alert("Unfortunately there was an error loading the super sweet graphics for this page!");
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
						/* The reason the scrolling looks jittery is because of this engine. */
						map.update();

						current_screen.update();
					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						current_screen.drawForeground();

						map.draw();

						background_display.drawImage(background_buffer.canvas, 0, 0, background_buffer.canvas.width, background_buffer.canvas.height, 0, 0, background_display.canvas.width, background_display.canvas.height);
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

		var home_screen = {
			/* FUNCTIONS. */
			drawBackground : function() {
				map.draw();
			},
			drawForeground : function() {

			},
			start : function() {
				this.drawBackground();
			},
			update : function() {

			}
			/* VARIABLES. */

		};

		/* Little dude is the little dude who guides you around the page! */
		var little_dude = {};

		/* The map for the background. */
		var map = {
			/* FUNCTIONS. */
			draw : function() {
				var scroll_offset = this.offset % tile_sheet.tile_width;
				var start_column = Math.floor(this.offset / tile_sheet.tile_width);
				for (var column = 0; column < this.visible_columns; column++) {
					for (var row = 0; row < this.rows; row++) {

						var value = this.values[row * this.columns + ((column + start_column) % this.columns)];
						background_buffer.drawImage(source_image, (value % tile_sheet.columns) * tile_sheet.tile_width, Math.floor(value/tile_sheet.columns)*tile_sheet.tile_height, tile_sheet.tile_width, tile_sheet.tile_height, column * tile_sheet.tile_width - scroll_offset, row * tile_sheet.tile_height, tile_sheet.tile_width, tile_sheet.tile_height);
					}
				}
			},
			update : function() {
				this.offset -= 1;
				/* Okay, so, you'll be scrolling left and right and the map is just going to repeat/loop around. */
				/* This means that when you go left, offset will be negative. This can't happen, so when it's less than 0, all you need to do is add the length of the map to it. */
				if (this.offset < 0) {
					this.offset += this.columns * tile_sheet.tile_width;
				}
			},
			/* VARIABLES. */
			columns : 32,
			/* The horizontal scroll offset. */
			offset : 0,
			rows : 32,
			values : [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 3, 2, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 2, 2, 2, 3, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 2, 2, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 3, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 21, 21, 21, 21, 21, 21, 20, 20, 21, 21, 21, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 22, 22, 22, 22, 22, 22, 21, 21, 21, 40, 41, 41, 41, 41, 40, 40, 40, 40, 41, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 42, 42, 43, 43, 43, 43, 42, 41, 41, 21, 22, 21, 21, 21, 21, 20, 20, 21, 21, 23, 22, 23, 22, 21, 22, 20, 21, 22, 23, 22, 21, 20, 21, 21, 22, 23, 22, 20, 21, 20, 22, 22, 23, 22, 22, 22, 20, 20, 21, 23, 23, 23, 22, 21, 20, 21, 21, 20, 20, 21, 22, 20, 21, 20, 20, 20, 20, 21, 21, 20, 20, 20, 20],
			/* The number of columns that fit on the screen. */
			visible_columns : 0
		};

		var tile_sheet = {
			/* VARIABLES. */
			columns : 20,
			tile_height : 16,
			tile_width : 16
		};

		/* This is the screen transition. I want to scroll the background image from one screen to the next and have the little dude run to catch up. */
		var transition = {
			/* FUNCTIONS. */
			draw : function() {

			},
			update : function() {

			}
			/* VARIABLES. */
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		/* This is the first time I'll be using two canvases for display. */
		/* I want to cut back on unecessary blitting to speed up the site and since I plan on using static backgrounds, there's no need to do all that extra work. */

		/* Background canvas buffers. */
		var background_buffer = document.createElement("canvas").getContext("2d");
		var background_display = document.getElementById("background_canvas").getContext("2d");

		/* The current screen keeps track of which screen the user is viewing and which logic to run. */
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		/* You should set this using cookies so you return to the screen you were previously on instead of always going home. */
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		var current_screen = home_screen;

		/* Foreground canvas buffers. */
		var foreground_buffer = document.createElement("canvas").getContext("2d");
		var foreground_display = document.getElementById("foreground_canvas").getContext("2d");

		/* This is the height to width ratio. I want to develop for mobile, and that usually means tall and skinny. */
		var screen_size_ratio = 2;

		/* The source image. */
		var source_image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		window.addEventListener("resize", resizeWindow);

		startLoadImage(source_image, "index.png", function() {
			resizeWindow();

			current_screen.start();

			engine.start(1000 / 30);
		});
	})();
