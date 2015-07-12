//////////////////////////////////////////////////
/* animationeditor.js. Frank Poth. 06/07/2015. */
////////////////////////////////////////////////

/* Cut images from a sprite sheet. */
/* Arrange them in animation order. */
/* Set an animation delay time. */
/* See the animation in action! */

(
	function animationeditor() {
		///////////////
		/* CLASSES. */
		/////////////

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function changeFileInput(event_) {
			var file = event_.target.files[0];
			var reader = new FileReader();
			var handle = this;

			//file_input_label.innerHTML = file.name;

			reader.addEventListener("load", function(event_) {
				startLoadImage(source_image, event_.target.result, function() {
					resizeWindow();
					//tile_sheet=new TileSheet();
					engine.start();
				});
			});

			reader.readAsDataURL(file);
		}
		
		function changeTileHeight(event_){
			alert(this.value);
			this.value=tile_sheet.tile_height=this.value<1?1:Number(this.value);
		}
		
		function changeTileWidth(event_){
			this.value=tile_sheet.tile_width=this.value<1?1:Number(this.value);
		}

		function resizeWindow(event_) {
			var height = document.documentElement.clientHeight;
			var width = document.documentElement.clientWidth;
			buffer.canvas.height=display.canvas.height = height;
			buffer.canvas.width=display.canvas.width = width;

			selection_panel.resize(width, height);
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

		var engine = {
			/* FUNCTIONS. */
			start : function() {
				var handle = this;

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					selection_panel.draw();

					display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
				})();
			},
			/* VARIABLES. */
			animation_frame : undefined
		};

		var html = {
			file_input : document.getElementById("file_input")
		};

		/* The selector panel has a few components to it. Duh. */
		/* It has a slider and displays several sprites from the sprite sheet in a single row. */
		/* That mean it will have to have a start and end index at which to start and stop blitting tiles from the sheet. */
		var selection_panel = {
			/* FUNCTIONS. */
			/* This mad dog right here will draw not only the slider, but also the appropriate sprite tiles to the screen. */
			draw : function() {
				buffer.fillStyle = "#333333";
				buffer.fillRect(this.x, this.y, this.width, this.height);
			},
			/* This resizes the selection panel based on the width and height of the screen. */
			resize : function(width_, height_) {
				this.height = Math.ceil(height_ * 0.33);
				this.width = width_;
				this.x = 0;
				/* This is the bottom panel and should take up the bottom third of the screen. */
				this.y = Math.floor(height_ * 0.66);
			},
			/* VARIABLES. */
			end_index : 0,
			height : 0,
			slider_x : 0,
			start_index : 0,
			width : 0,
			x : 0,
			y : 0
		};
		
		var tile_sheet={
			/* FUNCTIONS. */
			/* VARIABLES. */
			tile_height:16,
			tile_width:16
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");
		var display = document.getElementById("display").getContext("2d");

		var source_image = new Image();
		var tile_sheet = undefined;

		//////////////////
		/* INITIALIZE. */
		////////////////

		document.getElementById("file_input").addEventListener("change", changeFileInput);
		document.getElementById("tile_height").addEventListener("change",changeTileHeight);
		document.getElementById("tile_width").addEventListener("change",changeTileWidth);
		window.addEventListener("resize", resizeWindow);
	})();
