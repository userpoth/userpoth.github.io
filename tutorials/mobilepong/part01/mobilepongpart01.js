///////////////////////////////////////////////////
/* mobilepongpart01.js. Frank Poth. 08/26/2015. */
/////////////////////////////////////////////////

/* This second part will set up the user interface and add a ball and paddle to the screen. */
/* We're going to use the drawing functions to do all of this without external graphics, because I don't want to make graphics for pong... */
/* This is a very important part because in adition to that stuff a game engine will be introduced. */

(
	function mobilePongPart1() {
		///////////////
		/* CLASSES. */
		/////////////
		/* You want to have reuseable classes for things like the ball and the paddle. */
		/* Basically anything you want to have more than one of you should make a class. */
		/* There's only one engine, so I made that an object literal. */

		/* Anyway, check out the ball class. It's what's up. */
		function Ball(position_x_, position_y_) {
			/* Now, to properly interpolate an animation, you need to keep track of its current and last position. */
			/* the interesting thing about interpolation is that to do it propperly, you never actually render the most recent update. */
			/* You render the last update or the interpolated position of an object between its last position and current position. */
			/* You can't predict the future, so you draw between the last position you know and current position you are at. */
			/* The user is none the wiser and the interpolation makes up for the fixed time step game loop's sometimes choppy appearance. */
			this.current_position = new Point(position_x_, position_y_);
			this.last_position = new Point(position_x_, position_y_);
			this.velocity = 2;
		}


		Ball.prototype = {
			/* FUNCTIONS. */
			/* This is the draw function. */
			/* It draws the ball to the buffer and uses the specified time step to interpolate it's position depending on the engine's accumulated time variable. */
			draw : function(time_step_) {
				/* So, check it out, interpolation is simple. Super simple. */
				/* Basically, all you're doing is moving the ball from where it was to partially along the line to where it is based on a ratio called time_step_. */
				/* time_step_ is just a number between 0 and less than one. */
				/* time_step_ correlates directly to how much time is left over in accumulated time after the logic loop updates the game. */
				var interpolated_x = this.last_position.x + (this.current_position.x - this.last_position.x) * time_step_;
				var interpolated_y = this.last_position.y + (this.current_position.y - this.last_position.y) * time_step_;

				/* Now we just draw the ball on the buffer at it's interpolated location. */
				/* And I'm calling it a ball, but in pong, this ball is a square. */
				buffer.fillStyle = this.fill_style;
				buffer.fillRect(interpolated_x, interpolated_y, this.width, this.height);
			},
			/* Resets the ball in the center of the screen. */
			reset : function(additional_rotation_) {
				this.current_position.x = this.last_position.x = game.width * 0.5 - this.width * 0.5;
				this.current_position.y = this.last_position.y = game.height * 0.5 - this.height * 0.5;
				this.direction=Math.random()*Math.PI*0.5-Math.PI*0.25+additional_rotation_;
				this.velocity=2;
			},
			/* This updates the ball's position. */
			update : function() {
				/* So, to keep the ball rolling (pun) as far as interpolation goes, you want to keep track of last position on each update. */
				this.last_position.x = this.current_position.x;
				this.last_position.y = this.current_position.y;

				/* Now this is probably not what you're expecting, but if you want your ball to move at a constant rate in any direction, you're going to have to use rotation and velocity. */
				/* This is different from a platformer where the velocities for the x and y axes are kept separately. */
				this.current_position.x += Math.cos(this.direction) * this.velocity;
				this.current_position.y += Math.sin(this.direction) * this.velocity;
			},
			/* VARIABLES. */
			/* These are just some basic, self explainatory variables. */
			constructor : Ball,
			/* The angle of movement in radians. */
			direction : Math.random()*Math.PI*0.5-Math.PI*0.25,
			fill_style : "#c0c0c0",
			height : 16,
			velocity : 0,
			width : 16
		};

		/* Like I said earlier, if you're going to use something more than once, make it a class. */
		/* I could load up a bunch of ball objects and paddle objects with individual x/y variables, but why not let a handy class replace those two variables with one? */
		/* In addition to that, I can add functions to the Point class that will make life easier down the road should I decide to do something fancy like rotation or what have you, but for now, nothing like that will be implemented. */
		function Point(x_, y_) {
			this.x = x_;
			this.y = y_;
		}

		/* Well, things are actually a little more complex than I expected when I first undertook Pong... */
		/* As it happens, we're going to need to do some vector math in order to do propper collision with the ball and the walls. */
		/* The reson for this is the ball must have a constant velocity, and that means it cannot split velocity between the x/y axes like in a platforming game. */
		/* This is going the extra mile for sure, but the result will be a ball that behaves more realistically. */
		/* Anyway, to do the operations, we're going to use a vector class. */
		function Vector(x_, y_) {
			this.x = x_;
			this.y = y_;
		}


		Vector.prototype = {
			/* FUNCTIONS. */
			/* Returns a clone of this vector. */
			/* This is useful if you want to manipulate a vector, but you want to do it to a copy, or if you just want two or more of the same vector... Duh. */
			clone : function() {
				return new Vector(this.x, this.y);
			},
			/* This gets the dot product between two vectors. */
			/* If two vectors go the same general direction, dot product will be positive. */
			/* It's a good way to determine whether things are going the same direction. */
			/* Look it up, son! This isn't math class! */
			getDotProduct : function(vector_) {
				return this.x * vector_.x + this.y * vector_.y;
			},
			/* Returns the magnitude or length of the vector. */
			getMagnitude : function() {
				return Math.sqrt(this.getDotProduct(this));
			},
			/* Reduces the vector to unit size!!! This is more useful than you think. */
			/* Basically, this will take a long vector and make it's values fit those on a unit circle. */
			/* If you don't know what a unit circle is, look it up. This isn't math class, son. */
			normalize : function() {
				var magnitude = this.getMagnitude();
				/* Prevents divide by zero error. */
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

		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			if (client_height > client_width) {
				stop();
				return;
			}

			var height_ratio = client_height / game.height;
			var width_ratio = client_width / game.width;

			if (height_ratio < width_ratio) {
				display.canvas.height = game.height * height_ratio;
				display.canvas.width = game.width * height_ratio;
				display.canvas.style.left = Math.floor((client_width - display.canvas.width) * 0.5) + "px";
			} else {
				display.canvas.height = game.height * width_ratio;
				display.canvas.width = game.width * width_ratio;
				display.canvas.style.top = Math.floor((client_height - display.canvas.height) * 0.5) + "px";
			}
		}

		/* This will initialize the game. */
		function start() {
			/* Stop the engine just in case it's already running. This function is called every time the Launch Button is hit. */
			engine.stop();
			/* Start the engine at 60fps. Why not? This is a simple game, run it at FULL SPEED, CAPTAIN!!! */
			engine.start(1000 / 60);
			display.canvas.addEventListener("touchstart", touchStartDisplay);
			window.addEventListener("resize", resizeWindow);
			resizeWindow();
		}

		/* This will stop the game. */
		function stop() {
			/* Stop the engine. */
			engine.stop();
			display.canvas.removeEventListener("touchstart", touchStartDisplay);
			window.removeEventListener("resize", resizeWindow);
		}

		function touchStartDisplay(event_) {
			event_.preventDefault();
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* This hot momma right here is the beast that will run the pong game loop. */
		/* It is the engine and it is basically THE MAN. */
		/* Anyway, what it really is is a fixed step game loop that uses requestAnimationFrame to handle drawing and a timeout loop to handle logic. */
		/* This combination ensures that the game will be drawn at an optimized framerate and update at a constant framerate. */
		/* A downside of this type of loop is that it will occasionally seem to skip frames on slower machines. */
		/* To fix this, we use something called interpolation. */
		/* Interpolation is just moving the graphics a portion of a full step depending on how much time is left until the next update. */
		var engine = {
			/* FUNCTIONS. */
			start : function(interval_) {
				/* Alright, so the accumulated time variable just keeps on collecting time. */
				/* Think of accumulated time as a ball rolling along at a constant rate picking up chunks of time. */
				/* The logic loop uses a fixed number of time determined by interval_. */
				/* Every time accumulated time picks up enough time to cover one interval, the logic loop executes and subtracts the fixed time value from the accumulated time. */
				/* Sometimes the accumulated time can even be greater than one interval! So the logic loop can update the game more than one time. */
				var accumulated_time = interval_;
				/* The current time is just that. It uses Date.now() to get the actual current time. */
				var current_time = undefined;
				/* Elapsed time is the difference between the current update and the last update. */
				var elapsed_time = undefined;
				/* Handle simply stores a reference to the engine object so it can be accessed inside the scope of the logic and render loops. */
				var handle = this;
				/* Last time keeps track of the last time the logic loop executed. If it is executing in the present, the last time variable will be set to the previous current time. */
				var last_time = Date.now();

				/* Now we initialize the logic loop and get the party started!!! */
				(function logic() {
					/* First we set up the next call to the logic function, thus creating a loop. */
					handle.timeout = window.setTimeout(logic, interval_);

					/* Here's where we keep track of time. It's all about time with fixed step loops. Duh. */
					/* So we get the current time by using Date.now(). */
					current_time = Date.now();
					/* We already know what last time is, because it was set in initialization or whenever the last logic cycle ran. */
					/* We get the elapsed time by getting the difference between this current execution of the logic function and the last one. */
					elapsed_time = current_time - last_time;
					/* Now we are done with the important stuff, so we finish up by setting last time to this current execution of the logic function's time. */
					last_time = current_time;
					/* But don't forget about the accumulated time! It keeps on rolling along, picking up chunks of elapsed time. */
					/* Add the elapsed time that occured between the current and last logic update. */
					accumulated_time += elapsed_time;

					/* Okay, the time stuff is over with so now we actually get to execute some code to progress the game! */
					/* But this is a fixed step time loop. Updates occur differently depending on how much time has passed since the last update. */
					/* We're prepared to handle any amount of time, however, because we know exactly how much we have to deal with, because it's stored in accumulated time. */
					/* So we subtract the fixed step or interval from the accumulated time and update the game in a while loop until accumulated time is less than one full time step/interval. */
					while (accumulated_time >= interval_) {
						/* Every time you update the game, you use one chunk of time! Subtract it from the accumulated time. */
						accumulated_time -= interval_;
						/* Update the game. */
						game.update();
					}

					/* You might notice that there's usually going to be some time left over in accumulated time. */
					/* It would be awesome if the cpu ran at exactly the speed you wanted, but it doesn't. */
					/* Almost all the time there will be some left over chunk of time that will make your game seem jumpy because updates don't line up with rendering. */
					/* Never fear, that's where interpolation comes in! But I'll explain that in the render loop. */
				})();

				/* The render loop is used for drawing. */
				/* The awesome thing about this is requestAnimationFrame. */
				/* RAF is optimized to the users device to deliver smooth framerates at variable speeds. */
				/* It won't overburden your slow machine, and it won't hold back on your fast machine. */
				/* It waits to draw until your machine is ready, which is great, because why try to draw more often or less often than you can? */
				/* You want to draw as often as you can for smooth animation. */
				/* So, here we go, this initializes the render loop. */
				/* Oh, and time_stamp_ is a parameter accepted by functions being called by requestAnimationFrame. */
				(function render(time_stamp_) {
					/* This works a lot like set timeout, only there's no set interval. RAF sets it based on your machine's capabilities. */
					handle.animation_frame = window.requestAnimationFrame(render);

					/* You only want to update when accumulated time is less than one interval. */
					/* Why? Because if it's greater than or equal to one interval the logic loop hasn't updated anything yet and you'd basically be drawing the same scene over again. */
					/* It's a dropped frame, basically, but you still don't want to draw, just cut your losses and do nothing. */
					if (accumulated_time < interval_) {
						/* Anyway, now we need to draw some stuff. */
						/* accumulated_time/interval_ is the time step. */
						game.draw(accumulated_time / interval_);

						/* Draw the buffer to the display canvas!. */
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

		/* This fat tomale right here is the game logic object. */
		/* It handles updates to the game, the physics, all that jazz. */
		var game = {
			/* FUNCTIONS. */
			draw : function(time_step_) {
				/* Fill the background with the game object's fill color. */
				buffer.fillStyle = this.fill_style;
				buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

				/* Loop through all the balls and draw them. */
				for (var index = this.balls.length - 1; index > -1; index--) {
					this.balls[index].draw(time_step_);
				}
			},
			/* Starts the game. */
			start : function() {
				this.balls[0] = new Ball(this.width * 0.5 - Ball.prototype.width * 0.5, this.height * 0.5 - Ball.prototype.height * 0.5, 2);
			},
			/* Updates the game, which is really just updating the balls. */
			update : function() {
				for (var index = this.balls.length - 1; index > -1; index--) {
					var ball = this.balls[index];
					ball.update();

					/* We're going to have to come up with a way to tell the ball how to react when it gets near a wall. */
					/* For the left and right walls, this is simple: if the ball goes out of one, then give some points to the opposite player and reset the ball. */
					/* For the top and bottom walls, things aren't so simple. Anyway, here's the left and right walls. */
					if (ball.current_position.x + ball.width < 0) {
						/* Give points to right player. */
						ball.reset(0);
					} else if (ball.current_position.x > this.width) {
						/* Give points to left player. */
						ball.reset(Math.PI);
					}

					/* Okay, so, this is how we collide with walls. */
					/* If the ball goes beyond the wall boundary, we know we are colliding. */
					/* We will start with the top. */
					if (ball.current_position.y < 0) {
						/* This is the top wall and we want to represent it as a rightward facing vector, which is (1,0). */
						/* Keep in mind that the vector (1,0) is a unit sized vector, so we won't need to normalize it. */
						/* Now, what we actually need for this formula is the normal of that vector, which is the perpendicular vector to (1,0), which is (0,1), which is also normalized. */
						/* This is how we're going to calculate the "reflection" vector of the ball's angle of incidence across the unit sized normal of the wall. */
						/* If you really want to see how it works check out this formula: reflection_vector=ball_vector - 2*(ball_vector.getDotProduct(unit_normal_of_wall_vector))*unit_normal_of_wall_vector; */
						var wall_normal = new Vector(0, 1);
						var ball_vector = new Vector(ball.current_position.x - ball.last_position.x, ball.current_position.y - ball.last_position.y);
						/* So, we have the unit sized normal wall vector and the vector of the ball's movement. */
						/* Now we plug it into the formula and get the reflection vector. */
						var reflection_x = ball_vector.x - 2 * (ball_vector.getDotProduct(wall_normal)) * wall_normal.x;
						var reflection_y = ball_vector.y - 2 * (ball_vector.getDotProduct(wall_normal)) * wall_normal.y;
						/* Use Math.atan2 to convert the reflection vector into a radial angle and set it as the new ball direction. */
						ball.direction = Math.atan2(reflection_y, reflection_x);
						/* This is some super basic collision to move the ball out of the wall. We know the wall is straight up and down, so it's a simple matter of 1 dimensional collision response. */
						/* Remember to set both the current and last position to the fixed collision position, it will make things look nicer for drawing. */
						ball.current_position.y = ball.last_position.y = 0;
						/* To mix things up, add some speed to the ball's velocity every time it hits a wall. */
						ball.velocity+=0.1;
					} else if (ball.current_position.y + ball.height > this.height) {
						/* This is the bottom wall, so the vector would be (-1,0). That means the normal is (0,-1). */
						var wall_normal = new Vector(0, -1);
						var ball_vector = new Vector(ball.current_position.x - ball.last_position.x, ball.current_position.y - ball.last_position.y);

						var reflection_x = ball_vector.x - 2 * (ball_vector.getDotProduct(wall_normal)) * wall_normal.x;
						var reflection_y = ball_vector.y - 2 * (ball_vector.getDotProduct(wall_normal)) * wall_normal.y;

						ball.direction = Math.atan2(reflection_y, reflection_x);
						ball.current_position.y = ball.last_position.y = this.height - ball.height;
						ball.velocity+=0.1;
					}
				}
			},
			/* VARIABLES. */
			balls : new Array(),
			fill_style : "#303030",
			/* Alright, so, something interesting about these dimensions, here! */
			/* These will also be the dimensions of the buffer. */
			/* On the virtual side of things, the game world and the buffer are all the real size you want them to be. */
			/* It isn't until you blit the final image to the display canvas that things get scaled. */
			/* Also, these used to be the game_height and game_width variables from the last part of this tutorial. */
			height : 240,
			width : 480
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		/* So, one new thing I'm introducing in this part is the buffer context. */
		/* The buffer is used to prevent flickering when drawing to the screen. */
		/* If you draw every individual graphic to the buffer behind the scenes and then draw the whole buffer once to the display canvas, it prevents some things from being rendered late and the flickering effect that creates. */
		var buffer = document.createElement("canvas").getContext("2d");

		var client_height = document.documentElement.clientHeight;
		var client_width = document.documentElement.clientWidth;

		var display = document.getElementById("display").getContext("2d");

		/* Just a heads up if you're following along, I made the game_height and game_width variables part of the game object. */

		//////////////////
		/* INITIALIZE. */
		////////////////

		document.getElementById("launch_button").addEventListener("click", clickLaunchButton);
		document.getElementById("close_button").addEventListener("click", clickCloseButton);

		/* You need to resize the buffer! The default size is like 150x100 or something like that. Not what you're looking for. */
		buffer.canvas.height = game.height;
		buffer.canvas.width = game.width;

		/* You can start the game, but it won't run until the engine starts. */
		game.start();
	})();
