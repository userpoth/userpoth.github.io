////////////////////////////////////////
/* index.js. Frank Poth. 07/19/2015. */
//////////////////////////////////////

(
	function index() {
		///////////////
		/* CLASSES. */
		/////////////

		function DataBox(id_, offset_) {
			this.displayed = false;
			this.element = document.getElementById(id_);
			this.offset = offset_;
			this.left_neighbor = undefined;
			this.right_neighbor = undefined;
		}


		DataBox.prototype = {
			/* FUNCTIONS. */
			alignElement : function() {
				var box_width = client_width * 0.9;
				var box_height = client_height * 0.8;
				this.element.style.height = box_height + "px";
				this.element.style.left = (client_width - box_width) * 0.5 + "px";
				this.element.style.top = (client_height - box_height) * 0.5 + "px";
				this.element.style.width = box_width + "px";
			},
			getScrollOffset : function() {
				return Math.floor(this.offset - background.visible_width * 0.5);
			},
			hideElement : function() {
				this.displayed = false;
				this.element.style.display = "none";
			},
			setNeighbors : function(left_neighbor_, right_neighbor_) {
				this.left_neighbor = left_neighbor_;
				this.right_neighbor = right_neighbor_;
			},
			showElement : function() {
				this.displayed = true;
				this.element.style.display = "block";
			},
			toggleElement : function() {
				if (this.displayed) {
					this.displayed = false;
					this.element.style.display = "none";
					return;
				}
				this.displayed = true;
				this.element.style.display = "block";
			},
			/* VARIABLES. */
		};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function clickDataButton(event_) {
			event_.preventDefault();

			var last_box = current_box;

			switch(this.id) {
				case "home_button":
					current_box = home_box;
					break;
				case "tutorials_button":
					current_box = tutorials_box;
					break;
				case "games_button":
					current_box = games_box;
					break;
				case "tools_button":
					current_box = tools_box;
					break;
				case "miscellaneous_button":
					current_box = miscellaneous_box;
					break;
				case "art_button":
					current_box = art_box;
					break;
			}

			current_box.alignElement();

			if (current_box != last_box) {
				last_box.hideElement();
				if (Math.abs(current_box.getScrollOffset() - last_box.getScrollOffset()) < background_image.width * 0.5) {
					/* True is short jump false is wrap jump. */
				}
				background.startScroll(current_box.getScrollOffset());
			} else {
				current_box.toggleElement();
			}
		}

		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			/* 64 is the height of the background image in pixels. */
			background.height_ratio = client_height / 64;

			background.visible_width = Math.floor(client_width / background.height_ratio);

			buffer.canvas.height = 64;
			buffer.canvas.width = background.visible_width;
			/* The full height of the screen will be applied to the display. */
			display.canvas.height = client_height;
			display.canvas.width = client_width;

			current_box.alignElement();
			background.startScroll(current_box.getScrollOffset());

			background.draw();
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

		var background = {
			/* FUNCTIONS. */
			draw : function() {
				/* Look at all this crap. HTML5!!! WHY? */
				display.mozImageSmoothingEnabled = false;
				display.webkitImageSmoothingEnabled = false;
				display.msImageSmoothingEnabled = false;
				display.imageSmoothingEnabled = false;

				if (this.offset < 0) {
					/* The background needs to wrap around the left side. */
					buffer.drawImage(background_image, background_image.width + this.offset, 0, -this.offset, 64, 0, 0, -this.offset, 64);
				} else if (this.offset > background_image.width - this.visible_width) {
					/* The background needs to wrap around the right side. */
					var width = this.visible_width - background_image.width + this.offset;
					buffer.drawImage(background_image, 0, 0, width, 64, this.visible_width - width, 0, width, 64);
				}

				buffer.drawImage(background_image, this.offset, 0, this.visible_width, 64, 0, 0, buffer.canvas.width, buffer.canvas.height);
				display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
			},
			startScroll : function(x_) {
				var handle = this;
				window.cancelAnimationFrame(this.animation_frame);
				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);
					if (handle.offset > x_) {
						handle.offset--;
						handle.draw();
					} else if (handle.offset < x_) {
						handle.offset++;
						handle.draw();
					} else {
						/* Show the box only after you're done scrolling. It's just classier that way. =) */
						current_box.showElement();
						window.cancelAnimationFrame(handle.animation_frame);
					}
				})();
			},
			/* VARIABLES. */
			animation_frame : undefined,
			height_ratio : undefined,
			offset : 0,
			visible_width : undefined
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var home_box = new DataBox("home_box", 32);
		var tutorials_box = new DataBox("tutorials_box", 96);
		var games_box = new DataBox("games_box", 160);
		var tools_box = new DataBox("tools_box", 224);
		var miscellaneous_box = new DataBox("miscellaneous_box", 288);
		var art_box = new DataBox("art_box", 352);

		var background_image = new Image();

		var buffer = document.createElement("canvas").getContext("2d");
		var current_box = undefined;
		var client_height;
		var client_width;
		var display = document.getElementById("display").getContext("2d");

		//////////////////
		/* INITIALIZE. */
		////////////////

		document.getElementById("art_button").addEventListener("click", clickDataButton);
		document.getElementById("games_button").addEventListener("click", clickDataButton);
		document.getElementById("home_button").addEventListener("click", clickDataButton);
		document.getElementById("miscellaneous_button").addEventListener("click", clickDataButton);
		document.getElementById("tools_button").addEventListener("click", clickDataButton);
		document.getElementById("tutorials_button").addEventListener("click", clickDataButton);

		startLoadImage(background_image, "mainbackground.png", function() {
			window.addEventListener("resize", resizeWindow);
			current_box = home_box;
			current_box.showElement();
			resizeWindow();
		});

	})();
