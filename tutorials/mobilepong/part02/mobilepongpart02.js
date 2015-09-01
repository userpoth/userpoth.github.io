///////////////////////////////////////////////////
/* mobilepongpart01.js. Frank Poth. 08/26/2015. */
/////////////////////////////////////////////////

/* So, in this example I plan on adding paddles and a score, so basically the game will be playable when I'm through. */
/* It's all really simple stuff. */

(
	function mobilePongPart2() {
		///////////////
		/* CLASSES. */
		/////////////

		function Ball(position_x_, position_y_) {
			this.current_position = new Point(position_x_, position_y_);
			/* I made the mistake of putting this in the prototype in the last example. */
			/* That's no good, because then every instance of ball would have the same direction... */
			this.direction = Math.random() * Math.PI * 0.5 - Math.PI * 0.25;
			this.last_position = new Point(position_x_, position_y_);
			this.velocity = 2;
		}


		Ball.prototype = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				var interpolated_x = this.last_position.x + (this.current_position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.current_position.y - this.last_position.y) * time_step_;

				buffer.fillStyle = this.fill_style;
				buffer.fillRect(interpolated_x, interpolated_y, this.width, this.height);
			},
			reset : function(additional_rotation_) {
				this.current_position.x = this.last_position.x = game.width * 0.5 - this.width * 0.5;
				this.current_position.y = this.last_position.y = game.height * 0.5 - this.height * 0.5;
				this.direction = Math.random() * Math.PI * 0.5 - Math.PI * 0.25 + additional_rotation_;
				this.velocity = 2;
			},
			update : function() {
				this.last_position.x = this.current_position.x;
				this.last_position.y = this.current_position.y;

				this.current_position.x += Math.cos(this.direction) * this.velocity;
				this.current_position.y += Math.sin(this.direction) * this.velocity;
			},
			/* VARIABLES. */
			constructor : Ball,
			fill_style : "#c0c0c0",
			height : 8,
			width : 8
		};

		/* This is the paddle class! */
		/* Guess what it is! It's a paddle. */
		function Paddle(x_, y_) {
			this.current_position = new Point(x_, y_);
			this.last_position = new Point(x_, y_);
			this.target_y = 0;
		}


		Paddle.prototype = {
			/* FUNCTIONS. */
			/* This is pretty much the same as the ball's draw function. */
			draw : function(time_step_) {
				var interpolated_x = this.last_position.x + (this.current_position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.current_position.y - this.last_position.y) * time_step_;

				buffer.fillStyle = this.fill_style;
				buffer.fillRect(interpolated_x, interpolated_y, this.width, this.height);
			},
			/* Updates the paddle. */
			update : function() {
				this.last_position.y = this.current_position.y;

				var difference_y = this.target_y - this.height * 0.5 - this.current_position.y;

				this.current_position.y += difference_y * 0.1;
			},
			/* VARIABLES. */
			constructor : Paddle,
			fill_style : "#c0c0c0",
			height : 32,
			width : 8
		};

		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}


		Vector.prototype = {
			/* FUNCTIONS. */
			clone : function() {
				return new Vector(this.x, this.y);
			},
			getDotProduct : function(vector_) {
				return this.x * vector_.x + this.y * vector_.y;
			},
			getMagnitude : function() {
				return Math.sqrt(this.getDotProduct(this));
			},
			normalize : function() {
				var magnitude = this.getMagnitude();
				if (magnitude == 0) {
					return;
				}
				this.x = this.x / magnitude;
				this.y = this.y / magnitude;
			}
		};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* These two functions link the game to the tutorial page. */
		/* But basically they're just like pause and start buttons. */
		function clickCloseButton(event_) {
			event_.preventDefault();
			stop();
		}

		function clickLaunchButton(event_) {
			event_.preventDefault();
			start();
		}

		/* I know this is supposed to be for mobile, but it's stupid not to let it run on desktop... */
		function mouseMoveDisplay(event_) {
			event_.preventDefault();
			game.paddle_right.target_y = event_.clientY / game.height_ratio;
		}

		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			if (client_height > client_width) {
				stop();
				return;
			}

			/* I'm adding height ratio to the game object to be used with touch input! */
			game.height_ratio = client_height / game.height;
			var width_ratio = client_width / game.width;

			if (game.height_ratio < width_ratio) {
				display.canvas.height = game.height * game.height_ratio;
				display.canvas.width = game.width * game.height_ratio;
				display.canvas.style.left = Math.floor((client_width - display.canvas.width) * 0.5) + "px";
			} else {
				display.canvas.height = game.height * width_ratio;
				display.canvas.width = game.width * width_ratio;
				display.canvas.style.top = Math.floor((client_height - display.canvas.height) * 0.5) + "px";
			}
		}

		function start() {
			engine.stop();
			engine.start(1000 / 60);
			if ("ontouchstart" in document.documentElement) {
				display.canvas.addEventListener("touchmove", touchMoveDisplay);
				display.canvas.addEventListener("touchstart", touchStartDisplay);
			} else {
				display.canvas.addEventListener("mousemove", mouseMoveDisplay);
			}
			window.addEventListener("resize", resizeWindow);
			resizeWindow();
		}

		function stop() {
			engine.stop();
			if ("ontouchstart" in document.documentElement) {
				display.canvas.removeEventListener("touchmove", touchMoveDisplay);
				display.canvas.removeEventListener("touchstart", touchStartDisplay);
			} else {
				display.canvas.removeEventListener("mousemove", mouseMoveDisplay);
			}
			window.removeEventListener("resize", resizeWindow);
		}

		/* Also, we're going to need a touch move listener as well. */
		function touchMoveDisplay(event_) {
			/* This does the same thing as the touchstart listener. */
			event_.preventDefault();
			game.paddle_right.target_y = event_.targetTouches[0].clientY / game.height_ratio;
		}

		/* Now we actually need to use this listener to get some user input for the right paddle. */
		function touchStartDisplay(event_) {
			event_.preventDefault();
			game.paddle_right.target_y = event_.targetTouches[0].clientY / game.height_ratio;
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
						game.update();
					}
				})();

				(function render(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(render);

					if (accumulated_time < interval_) {
						game.draw(accumulated_time / interval_);

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

		var game = {
			/* FUNCTIONS. */
			/* This will replace some of the repeated collision code. */
			collidePaddle : function(ball_, x_) {
				var paddle_unit_normal = new Vector(1, 0);
				var ball_vector = new Vector(Math.cos(ball_.direction) * ball_.velocity, Math.sin(ball_.direction) * ball_.velocity);

				var reflection_x = ball_vector.x - 2 * (ball_vector.getDotProduct(paddle_unit_normal)) * paddle_unit_normal.x;
				var reflection_y = ball_vector.y - 2 * (ball_vector.getDotProduct(paddle_unit_normal)) * paddle_unit_normal.y;

				ball_.direction = Math.atan2(reflection_y, reflection_x);
				ball_.current_position.x = ball_.last_position.x = x_;
				ball_.velocity += 0.1;
			},
			/* I put the collide wall code into a handy function. It saves space and I made some revisions to the code to prevent a nasty glitch. */
			collideWall : function(ball_, y_) {
				var wall_unit_normal = new Vector(0, 1);
				/* Notice that I changed the way to get the ball vector measurements. */
				/* I did this because using current and last position is a cheap way out and actually can cause some glitches... */
				/* This way is much more stable, though slightly more costly due to the computationally intensive manner in which it is derrived... */
				var ball_vector = new Vector(Math.cos(ball_.direction) * ball_.velocity, Math.sin(ball_.direction) * ball_.velocity);

				var reflection_x = ball_vector.x - 2 * (ball_vector.getDotProduct(wall_unit_normal)) * wall_unit_normal.x;
				var reflection_y = ball_vector.y - 2 * (ball_vector.getDotProduct(wall_unit_normal)) * wall_unit_normal.y;

				ball_.direction = Math.atan2(reflection_y, reflection_x);
				ball_.current_position.y = ball_.last_position.y = y_;
				ball_.velocity += 0.1;
			},
			draw : function(time_step_) {
				buffer.fillStyle = this.fill_style;
				buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

				buffer.fillStyle = "#f0f0f0";
				buffer.fillText(this.score_left + " : " + this.score_right, this.width * 0.5, 20);

				for (var index = this.balls.length - 1; index > -1; index--) {
					this.balls[index].draw(time_step_);
				}

				this.paddle_left.draw(time_step_);
				this.paddle_right.draw(time_step_);
			},
			start : function() {
				/* Add some paddles. */
				this.paddle_left = new Paddle(8, this.height * 0.5 - Paddle.prototype.height * 0.5);
				this.paddle_right = new Paddle(this.width - 8 - Paddle.prototype.width, this.height * 0.5 - Paddle.prototype.height * 0.5);
				this.balls[0] = new Ball(this.width * 0.5 - Ball.prototype.width * 0.5, this.height * 0.5 - Ball.prototype.height * 0.5, 2);
			},
			update : function() {
				/* Super simple AI for the left paddle. */
				this.paddle_left.target_y = this.balls[0].current_position.y + this.balls[0].height * 0.5;

				/* Update the paddle positions. */
				this.paddle_left.update();
				this.paddle_right.update();

				for (var index = this.balls.length - 1; index > -1; index--) {
					var ball = this.balls[index];

					ball.update();

					/* This is the paddle collision code. */
					/* This is kind of a mess, but you can follow it. */
					/* Basically if the ball is to the left of the left paddle you pass this first if statement. */
					if (ball.current_position.x < this.paddle_left.current_position.x + this.paddle_left.width && ball.last_position.x >= this.paddle_left.current_position.x + this.paddle_left.width) {
						/* Then we test to see if the ball in within y range of the paddle. */
						if (ball.current_position.y < this.paddle_left.current_position.y + this.paddle_left.height && ball.current_position.y + ball.height > this.paddle_left.current_position.y) {
							/* If it is, we collide with the paddle! */
							this.collidePaddle(ball, this.paddle_left.current_position.x + this.paddle_left.width);
						}
					}

					if (ball.current_position.x + ball.width > this.paddle_right.current_position.x && ball.last_position.x + ball.width <= this.paddle_right.current_position.x) {
						if (ball.current_position.y < this.paddle_right.current_position.y + this.paddle_right.height && ball.current_position.y + ball.height > this.paddle_right.current_position.y) {
							this.collidePaddle(ball, this.paddle_right.current_position.x - ball.width);
						}
					}

					if (ball.current_position.x + ball.width < 0) {
						this.score_right++;
						ball.reset(0);
					} else if (ball.current_position.x > this.width) {
						this.score_left++;
						ball.reset(Math.PI);
					}

					/* Look how much nicer this little chunk of code is! Saved a few lines for sure. */
					if (ball.current_position.y < 0) {
						this.collideWall(ball, 0);
					} else if (ball.current_position.y + ball.height > this.height) {
						this.collideWall(ball, this.height - ball.height);
					}
				}
			},
			/* VARIABLES. */
			balls : new Array(),
			/* For a cool effect, I'm going to use this alpha fill for the background. */
			fill_style : "rgba(64,64,64,0.5)",
			height : 240,
			/* Height ratio is needed for touch input. */
			height_ratio : undefined,
			/* Declare some paddles! You only need two. */
			paddle_left : undefined,
			paddle_right : undefined,
			/* Keep track of scores. */
			score_left : 0,
			score_right : 0,
			width : 480
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var buffer = document.createElement("canvas").getContext("2d");

		var client_height = document.documentElement.clientHeight;
		var client_width = document.documentElement.clientWidth;

		var display = document.getElementById("display").getContext("2d");

		//////////////////
		/* INITIALIZE. */
		////////////////

		document.getElementById("launch_button").addEventListener("click", clickLaunchButton);
		document.getElementById("close_button").addEventListener("click", clickCloseButton);

		buffer.canvas.height = game.height;
		buffer.canvas.width = game.width;
		buffer.font = "20px Arial";
		buffer.textAlign = "center";

		game.start();
	})();
