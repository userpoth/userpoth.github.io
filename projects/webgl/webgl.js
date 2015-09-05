///////////////////////////////////////
/* webgl.js Frank Poth. 09/02/2015. */
/////////////////////////////////////

/* Compare the plain old canvas to the mighty webgl powered canvas. */
(
	function webGL() {
		///////////////
		/* CLASSES. */
		/////////////

		/* Since the square is going to have to fit both the canvas method and the web gl method, it's going to have a bunch of seemingly redundant variables. */
		function Square() {
			/* Get some random colors. */
			this.red = Math.floor(Math.random() * 256);
			this.green = Math.floor(Math.random() * 256);
			this.blue = Math.floor(Math.random() * 256);

			/* Set the rgb color for the canvas method. */
			this.fill_style = "rgb(" + this.red + "," + this.green + "," + this.blue + ")";

			/* Scale down the colors for the web gl method. */
			this.red /= 255;
			this.green /= 255;
			this.blue /= 255;

			this.height = Math.random() * 20 + 5;
			this.velocity_x = Math.random() * 2 - 1;
			this.velocity_y = Math.random() * 2 - 1;
			this.width = Math.random() * 20 + 5;
			this.x = Math.random() * (stage.width - this.width);
			this.y = Math.random() * (stage.height - this.height);
		}


		Square.prototype = {
			/* FUNCTIONS. */
			update : function() {
				this.x += this.velocity_x;
				this.y += this.velocity_y;

				if (this.x < 0) {
					this.velocity_x *= -1;
					this.x = 0;
				} else if (this.x + this.width > stage.width) {
					this.velocity_x *= -1;
					this.x = stage.width - this.width;
				}

				if (this.y < 0) {
					this.velocity_y *= -1;
					this.y = 0;
				} else if (this.y + this.height > stage.height) {
					this.velocity_y *= -1;
					this.y = stage.height - this.height;
				}
			}
		};

		/////////////////
		/* FUNCTIONS. */
		///////////////

		function clickAddButton(event_) {
			for (var count = 0; count < stage.number_to_change; count++) {
				stage.squares.push(new Square());
			}

			this.innerHTML = "Add " + stage.number_to_change;
			subtract_button.innerHTML = "Subtract " + stage.number_to_change;
		}

		function clickSubtractButton(event_) {
			if (stage.number_to_change < stage.squares.length) {
				for (var count = 0; count < stage.number_to_change; count++) {
					stage.squares.pop();
				}
			} else {
				stage.squares = new Array();
			}

			if (stage.squares.length == 0) {
				this.innerHTML = "Do Nothing";
			}
		}

		function clickToggleMethodButton(event_) {
			method.stop();
			if (method == canvas_method) {

				method = web_gl_method;
			} else {
				method = canvas_method;
			}
			method.start();
		}

		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			var height_ratio = client_height / stage.height;
			var width_ratio = client_width / stage.width;

			if (height_ratio < width_ratio) {
				canvas.height = gl_canvas.height = stage.height * height_ratio;
				canvas.width = gl_canvas.width = stage.width * height_ratio;

				canvas.style.left = gl_canvas.style.left = Math.floor((client_width - canvas.width) * 0.5) + "px";
				canvas.style.top = gl_canvas.style.top = "0px";
			} else {
				canvas.height = gl_canvas.height = stage.height * width_ratio;
				canvas.width = gl_canvas.width = stage.width * width_ratio;

				canvas.style.left = gl_canvas.style.left = "0px";
				canvas.style.top = gl_canvas.style.top = Math.floor((client_height - canvas.height) * 0.5) + "px";
			}

			if (web_gl_method.gl) {
				/* Resize the web gl viewport. */
				web_gl_method.gl.viewport(0, 0, gl_canvas.width, gl_canvas.height);
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		var canvas_method = {
			/* FUNCTIONS. */
			draw : function() {
				this.buffer.fillStyle = "#f0f0f0";
				this.buffer.fillRect(0, 0, this.buffer.canvas.width, this.buffer.canvas.height);

				for (var index = stage.squares.length - 1; index > -1; index--) {
					var square = stage.squares[index];
					this.buffer.fillStyle = square.fill_style;
					this.buffer.fillRect(square.x, square.y, square.width, square.height);
				}

				this.display.drawImage(this.buffer.canvas, 0, 0, this.buffer.canvas.width, this.buffer.canvas.height, 0, 0, this.display.canvas.width, this.display.canvas.height);
			},
			start : function() {
				this.buffer.canvas.height = stage.height;
				this.buffer.canvas.width = stage.width;
				this.display = canvas.getContext("2d");
				toggle_method_button.innerHTML = "Canvas";
				canvas.style.display = "block";
			},
			stop : function() {
				canvas.style.display = "none";
			},
			/* VARIABLES. */
			buffer : document.createElement("canvas").getContext("2d"),
			display : undefined
		};

		/* This is a super basic engine. */
		var engine = {
			/* FUNCTIONS. */
			start : function() {
				var animation_frame = undefined;
				var last_time = Date.now();

				(function render(time_stamp_) {
					animation_frame = window.requestAnimationFrame(render);

					var time = Date.now();
					fps_meter.increment(time - last_time);
					last_time = time;

					stage.update();

					method.draw();

					output.innerHTML = stage.squares.length + " squares at " + fps_meter.getFPS() + " fps";
				})();
			}
		};

		/* Well, this is exciting. I've never made a fps counter before. */
		var fps_meter = {
			/* FUNCTIONS. */
			/* So, here's how this works. As the engine runs, increment will get samples of elapsed time on every engine cycle. */
			/* Those samples will be stored in the samples array every time increment is called. */
			/* getFPS then adds all those samples up and gets an average fps over the course of however many samples you want. */
			getFPS : function() {
				var elapsed_time = 0;
				var length = this.samples.length;
				for (var index = length - 1; index > -1; index--) {
					elapsed_time += this.samples[index];
				}

				return Math.floor((1000 * length) / elapsed_time);
			},
			increment : function(elapsed_time_) {
				this.samples[this.index] = elapsed_time_;
				this.index++;
				/* 100 is the number of samples to take. */
				if (this.index > 100) {
					this.index = 0;
				}

			},
			/* VARIABLES. */
			/* The sample index that increases on each call to increment. */
			index : 0,
			/* The number of frames to sample. */
			samples : []
		};

		/* The metaphorical stage that things occur on. */
		/* Defines the real space dimension of the app in pixels. */
		var stage = {
			/* FUNCTIONS. */
			update : function() {
				for (var index = this.squares.length - 1; index > -1; index--) {
					this.squares[index].update();
				}
			},
			/* VARIABLES. */
			height : 320,
			/* The number to add or subtract from squares array. */
			number_to_change : 100,
			squares : new Array(),
			width : 320,
		};

		var web_gl_method = {
			/* FUNCTIONS. */
			draw : function() {
				/* The background fill in the canvas is #f0f0f0. */
				/* f0 is 240. 240/255 is 0.94117647058. */
				this.gl.uniform4f(this.color_location, 0.94117647058, 0.94117647058, 0.94117647058, 1);
				this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 0, stage.width, 0, stage.width, stage.height, stage.width, stage.height, 0, stage.height, 0, 0]), this.gl.STATIC_DRAW);
				this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

				for (var index = stage.squares.length - 1; index > -1; index--) {
					var square = stage.squares[index];

					this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([square.x, square.y, square.x + square.width, square.y, square.x + square.width, square.y + square.height, square.x + square.width, square.y + square.height, square.x, square.y + square.height, square.x, square.y]), this.gl.STATIC_DRAW);

					this.gl.uniform4f(this.color_location, square.red, square.green, square.blue, 1);
					this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
				}
			},
			start : function() {

				/* Get the webgl context. */
				try {
					this.gl = gl_canvas.getContext("webgl") || gl_canvas.getContext("experimental-webgl");
				} catch (error_) {
					alert("An error occurred while trying to initialize Web GL.");
					return;
				}

				/* All is lost. */
				if (!this.gl) {
					alert("Browser does not support Web GL.");
					return;
				}

				/* Create a program object. */
				this.program = this.gl.createProgram();

				/* Create a fragment shader. */
				var fragment_shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
				/* Set the source code of the shader. */
				this.gl.shaderSource(fragment_shader, document.getElementById("fragment_shader").text);
				/* Compile the shader. */
				this.gl.compileShader(fragment_shader);

				/* Create a vertex shader. */
				var vertex_shader = this.gl.createShader(this.gl.VERTEX_SHADER);
				/* Set the source code of the shader. */
				this.gl.shaderSource(vertex_shader, document.getElementById("vertex_shader").text);
				/* Compile the shader. */
				this.gl.compileShader(vertex_shader);

				/* Add the shaders to the program object. */
				this.gl.attachShader(this.program, fragment_shader);
				this.gl.attachShader(this.program, vertex_shader);

				/* Link the program to the gl. */
				this.gl.linkProgram(this.program);
				/* Use the program. */
				this.gl.useProgram(this.program);

				this.resolution_location = this.gl.getUniformLocation(this.program, "u_resolution");
				this.gl.uniform2f(this.resolution_location, stage.width, stage.height);

				this.position_location = this.gl.getAttribLocation(this.program, "a_position");

				this.color_location = this.gl.getUniformLocation(this.program, "u_color");

				this.buffer = this.gl.createBuffer();
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
				this.gl.enableVertexAttribArray(this.position_location);
				this.gl.vertexAttribPointer(this.position_location, 2, this.gl.FLOAT, false, 0, 0);

				/* Some html/css stuff. */
				toggle_method_button.innerHTML = "Web GL";
				gl_canvas.style.display = "block";
			},
			stop : function() {
				gl_canvas.style.display = "none";
			},
			/* VARIABLES. */
			buffer : undefined,
			color_location : undefined,
			gl : undefined,
			position_location : undefined,
			program : undefined,
			resolution_location : undefined
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var canvas = document.getElementById("canvas");
		var gl_canvas = document.getElementById("gl_canvas");
		var method = canvas_method;
		var output = document.getElementById("output");

		var add_button = document.getElementById("add_button");
		var subtract_button = document.getElementById("subtract_button");
		var toggle_method_button = document.getElementById("toggle_method_button");

		//////////////////
		/* INITIALIZE. */
		////////////////

		add_button.addEventListener("click", clickAddButton);
		subtract_button.addEventListener("click", clickSubtractButton);
		toggle_method_button.addEventListener("click", clickToggleMethodButton);

		window.addEventListener("resize", resizeWindow);

		resizeWindow();

		method.start();
		engine.start();
	})();
