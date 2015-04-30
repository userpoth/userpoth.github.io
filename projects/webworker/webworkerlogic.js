/////////////////////////////////////////////////
/* webworkerlogic.js. Frank Poth. 04/26/2015. */
///////////////////////////////////////////////

/* So, this is the code that will be run in a separate thread with no access to the document. */
/* It's scary stuff being so far from shore. All I can see around me is empty space... */
/* I'll post a message in a bottle. Yes, an SOS to the DOM. I'll send an SOS to the DOM. */
/* I hope that someone gets my, I hope that someone gets my, I hope that someone gets my reference to that song. */
/* Anyway, weird impulse typing aside, here's the webworkerlogic function: */

(
	function webWorkerLogic() {

		///////////////
		/* CLASSES. */
		/////////////

		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		function Square(x_, y_, width_, height_) {
			this.height = height_;
			this.width = width_;
			this.last_position = new Point(x_, y_);
			this.position = new Point(x_, y_);
			this.velocity = new Vector(Math.round(Math.random() * 10) - 5);
		}


		Square.prototype = {
			update : function() {
				this.last_position.x = this.position.x;
				this.last_position.y = this.position.y;

				this.position.x += this.velocity.x;

				if (this.position.x > 256) {
					this.last_position.x = this.position.x = -this.width;
				} else if (this.position.x + this.width < 0) {
					this.last_position.x = this.position.x = 256;
				}
			}
		};

		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* The UI sends a timestamp off of which interpolation is determined. */
		function messageSelf(event_) {
			var time_step = engine.accumulated_time / engine.interval;
			var blit_data = [];
			for (var index = squares.length - 1; index > -1; index--) {
				var square = squares[index];
				var interpolated_x = square.last_position.x + (square.position.x - square.last_position.x) * time_step;
				var interpolated_y = square.last_position.y + (square.position.y - square.last_position.y) * time_step;
				blit_data[index] = {
					"x" : interpolated_x,
					"y" : interpolated_y
				};
			}

			self.postMessage(blit_data);
		}

		/* Updates game objects. */
		function update() {
			for (var index = squares.length - 1; index > -1; index--) {
				var square = squares[index];
				square.update();
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				var current_time = undefined;
				var elapsed_time = undefined;
				var handle = this;
				var last_time = Date.now();
				
				this.interval=interval_;

				(function loop() {
					handle.timeout = self.setTimeout(loop, interval_);

					current_time = Date.now();
					elapsed_time = current_time - last_time;
					last_time = current_time;

					handle.accumulated_time += elapsed_time;

					while (handle.accumulated_time >= interval_) {
						update();
						handle.accumulated_time -= interval_;
					}
				})();
			},
			stop : function() {
				self.clearTimeout(this.timeout);
				this.timeout = undefined;
			},
			/* VARIABLES. */
			accumulated_time : 0,
			interval:30,
			timeout : undefined
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var squares = [];

		//////////////////
		/* INITIALIZE. */
		////////////////

		for (var count = 0; count < 1000; count++) {
			squares.push(new Square(Math.round(Math.random() * 256), Math.round(Math.random() * 256), 16, 16));
		}

		self.addEventListener("message", messageSelf);

		engine.start(30);
	})();
