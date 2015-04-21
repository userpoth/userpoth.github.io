/////////////////////////////////////////////
/* tutorial01.js. Frank Poth. 04/17/2015. */
///////////////////////////////////////////

/* This is building off of tutorial00. */
/* All it does in addition is blit different tile graphics to the screen instead of just the one gray square. */
/* Also, it'll output some tile positions on touch or mouse over. */

(
	function tutorial01() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* Draws the buffer to the display. */
		function draw() {
			/* Here we have to set the fill style every time draw is called because the selected tile's draw function changes it to another color. */
			buffer.fillStyle = "#ffffff";
			buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

			map.draw();
			
			/* This function changes the buffer's fill style. */
			selected_tile.draw();

			display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
		}

		/* These functions handle mouse input if on a pc. */
		function mouseDownDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.clientX, event_.clientY);
			update();
		}

		function mouseMoveDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.clientX, event_.clientY);
			update();
		}

		/* Resizes the display canvas when a resize event is fired. */
		/* I added some stuff to get the controller object working as well. */
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

			/* You have to be able to adjust the controller position to the scale of the display canvas, so get the scale. */
			controller.display_scale = buffer.canvas.width / html.display.width;

			/* This will get the page offset of the display canvas by visiting each of its parent elements and getting their relative offsets. */
			/* Start with the display canvas. */
			var element = html.display;
			/* Reset the offsets. */
			controller.offset.x = controller.offset.y = 0;

			/* Loop through parent elements. */
			while (element) {
				controller.offset.x += (element.offsetLeft + element.clientLeft);
				controller.offset.y += (element.offsetTop + element.clientTop);
				element = element.offsetParent;
			}

			/* Put the output in the upper left corner of the display canvas. */
			html.output.style.left = controller.offset.x + "px";
			html.output.style.top = controller.offset.y + "px";

			/* Call draw to keep the display canvas from going blank after resize. */
			draw();
		}

		/* Loads the specified image url and executes the callback function when loading is finished. */
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

		/* These functions handle touch events if on a touch device. */
		function touchMoveDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.targetTouches[0].clientX, event_.targetTouches[0].clientY);
			update();
		}

		function touchStartDisplay(event_) {
			event_.preventDefault();
			controller.move(event_.targetTouches[0].clientX, event_.targetTouches[0].clientY);
			update();
		}

		/* Updates the output element's content and calls draw. */
		function update() {
			selected_tile.column = Math.floor(controller.position.x / tile_sheet.tile_width);
			selected_tile.row = Math.floor(controller.position.y / tile_sheet.tile_height);

			draw();

			var index = selected_tile.row * map.columns + selected_tile.column;
			html.output.innerHTML = "index: " + index + "<br>column: " + selected_tile.column + "<br>row: " + selected_tile.row + "<br>value: " + map.values[index];
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* A "controller" object to handle user input. */
		var controller = {
			/* FUNCTIONS. */
			move : function(x_, y_) {
				this.position.x = (x_ - this.offset.x + document.body.scrollLeft) * this.display_scale;
				this.position.y = (y_ - this.offset.y + document.body.scrollTop) * this.display_scale;
			},
			/* OBJECT LITERALS. */
			/* The physical page offset of the display canvas element. */
			offset : {
				x : 0,
				y : 0
			},
			/* The mouse or touch event position on the client window. */
			position : {
				x : 0,
				y : 0
			},
			/* VARIABLES. */
			/* The scale between the buffer, which is in 1:1 scale, and the display, which has variable scale determined by viewport size. */
			display_scale : 1
		};

		/* Holds a reference to the display canvas. */
		/* And also the output p element. */
		var html = {
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		/* Holds information about the map. */
		var map = {
			/* FUNCTIONS. */
			/* Draws the map. */
			draw : function() {
				for (var index = this.length - 1; index > -1; index--) {
					var value = this.values[index];

					/* Only draw tiles that aren't 999. */
					if (value != 999) {
						var destination_column = index % this.columns;
						var destination_row = Math.floor(index / this.columns);
						var destination_x = destination_column * tile_sheet.tile_width;
						var destination_y = destination_row * tile_sheet.tile_height;

						/* Notice that the only difference here is replacing "index" with value. */
						var source_column = value % tile_sheet.columns;
						var source_row = Math.floor(value / tile_sheet.columns);
						var source_x = source_column * tile_sheet.tile_width;
						var source_y = source_row * tile_sheet.tile_height;

						buffer.drawImage(image, source_x, source_y, tile_sheet.tile_width, tile_sheet.tile_height, destination_x, destination_y, tile_sheet.tile_width, tile_sheet.tile_height);
					}
				}
			},
			/* VARIABLES. */
			columns : 16,
			length : 256,
			/* Things are a little different now since we have more than one option for tile graphics. */
			/* Since the tile sheet is completely full of unique tiles, and space 0 is also a tile graphic, we'll have to use a different number to represent "no tile". */
			/* So instead of using 0, I'll use 999. */
			/* You can use whatever you want, really, but I figured I'm never going to have 1000 tile graphics, so I'd stop right before I hit quadrupal digits. */
			/* You can use -1 as well, which is fine, I guess. Just use any number that doesn't represent a tile. */
			values : [0, 32, 0, 0, 32, 0, 0, 32, 0, 39, 999, 17, 3, 3, 21, 999, 31, 0, 11, 1, 15, 0, 25, 0, 25, 0, 32, 0, 33, 37, 0, 6, 0, 7, 999, 999, 999, 8, 0, 25, 0, 25, 0, 25, 0, 999, 0, 0, 14, 999, 999, 999, 999, 999, 12, 0, 25, 0, 27, 0, 36, 999, 37, 0, 4, 999, 999, 999, 999, 999, 2, 0, 0, 36, 37, 0, 999, 999, 999, 0, 4, 999, 999, 999, 999, 999, 2, 999, 999, 999, 999, 999, 999, 999, 38, 0, 0, 6, 999, 999, 999, 24, 0, 999, 999, 999, 999, 999, 999, 999, 0, 7, 8, 0, 999, 999, 999, 20, 7, 999, 999, 999, 999, 999, 999, 3, 0, 999, 999, 0, 0, 13, 21, 999, 999, 999, 999, 999, 999, 999, 999, 0, 36, 999, 5, 0, 1, 1, 0, 13, 21, 999, 999, 999, 999, 38, 3, 0, 6, 999, 0, 7, 999, 999, 37, 1, 19, 999, 999, 999, 17, 0, 1, 36, 8, 6, 4, 999, 999, 999, 999, 999, 999, 999, 999, 999, 23, 19, 999, 999, 38, 0, 4, 999, 999, 999, 999, 999, 999, 999, 3, 21, 999, 999, 999, 999, 37, 0, 4, 999, 999, 999, 999, 999, 999, 999, 2, 0, 18, 999, 999, 999, 5, 0, 4, 999, 999, 17, 9, 0, 3, 39, 16, 0, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
		};

		/* The selected tile location. */
		/* This will allow the user to see which tile is being selected. */
		var selected_tile = {
			/* Draws the selected tile. */
			draw : function() {
				buffer.fillStyle = "rgba(0,128,255,0.5)";
				buffer.fillRect(this.column * tile_sheet.tile_width, this.row * tile_sheet.tile_height, tile_sheet.tile_width, tile_sheet.tile_height);
			},
			/* VARIABLES. */
			column : 0,
			row : 0
		};

		/* The tile sheet object holds information about the tile sheet graphic. */
		var tile_sheet = {
			/* VARIABLES. */
			/* The image has 5 columns. */
			columns : 5,
			/* Information about tile dimensions. */
			tile_height : 16,
			tile_width : 16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");

		var display = html.display.getContext("2d");

		var image = new Image();

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;

		window.addEventListener("resize", resizeWindow);

		/* Add touch listeners or mouse listeners for user input. */
		if ("ontouchstart" in document.documentElement) {
			html.display.addEventListener("touchstart", touchStartDisplay);
			html.display.addEventListener("touchmove", touchMoveDisplay);
		} else {
			html.display.addEventListener("mousedown", mouseDownDisplay);
			html.display.addEventListener("mousemove", mouseMoveDisplay);
		}

		/* Notice that we're loading in a new image. This one has multiple tile graphics. */
		startLoadImage(image, "tutorial01.png", function() {
			resizeWindow();
		});
	})();
