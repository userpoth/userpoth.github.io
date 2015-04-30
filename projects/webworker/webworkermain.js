////////////////////////////////////////////////
/* webworkermain.js. Frank Poth. 04/26/2015. */
//////////////////////////////////////////////

/* Okay, so here's where things start getting real. */
/* From what I understand, web workers cannot access the document. */
/* This means everything having to do with the document must go here. */

/* Well, this didn't perform nearly as well as I'd hoped. I wanted to put image buffering in a web worker, which is apparently pretty difficult and ultimately not worth the overhead. */
/* As far as web workers for logic, I doubt I'll ever have such computationally heavy jobs to do. */
/* Still, they are very cool and I can see the benefits of using them given a particularly large computation. */

(
	function webWorkerMain() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		/* This will receive data from the logic worker. Pretty much all it will receive is some image data. */
		function messageWorker(event_) {
			blit_data = event_.data;
		}

		/* You want to keep your canvas as large as it can be without skewing its contents. */
		/* So stretch it to fit the smallest dimenstion of the client window and center it. */
		function resizeWindow(event_) {
			var client_height = document.documentElement.clientHeight;
			var client_width = document.documentElement.clientWidth;

			if (client_height < client_width) {
				html.display.height = html.display.width = client_height;
				html.display.style.left = html.output.style.left = Math.floor(client_width * 0.5 - client_height * 0.5) + "px";
				html.display.style.top = html.output.style.top = "0px";
			} else {
				html.display.height = html.display.width = client_width;
				html.display.style.left = html.output.style.left = "0px";
				html.display.style.top = html.output.style.top = Math.floor(client_height * 0.5 - client_width * 0.5) + "px";
			}
		}

		///////////////////////
		/* OBJECT LITERALS. */
		/////////////////////

		/* The engine on the main side will handle requestAnimationFrame looping. */
		var engine = {
			/* FUNCTIONS. */
			start : function() {
				var handle = this;

				(function loop(time_stamp_) {
					handle.animation_frame = window.requestAnimationFrame(loop);

					worker.postMessage(Date.now());

					buffer.fillStyle = "#f0f0f0";
					buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);

					buffer.fillStyle = "#f00000";
					buffer.beginPath();
					for (var index = blit_data.length - 1; index > -1; index--) {
						var location = blit_data[index];

						buffer.rect(location.x, location.y, 16, 16);
					}
					buffer.fill();
				
					display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
				})();
			},
			stop : function() {
				window.cancelAnimationFrame(this.animation_frame);
				this.animation_frame = undefined;
			},
			/* VARIABLES. */
			animation_frame : undefined
		};

		var html = {
			display : document.getElementById("display"),
			output : document.getElementById("output")
		};

		/////////////////
		/* VARIABLES. */
		///////////////

		var blit_data = [];

		var buffer = document.createElement("canvas").getContext("2d");
		var display = html.display.getContext("2d");

		/* Will be the logic worker. */
		/* I really think "worker" is a stupid name for multithreading. Why couldn't they call it a thread? */
		/* Update: Later I discovered that "workers" aren't quite the same as normal threads. They suck more. Still useful, though. */
		var worker = new Worker("webworkerlogic.js");

		//////////////////
		/* INITIALIZE. */
		////////////////

		buffer.canvas.height = buffer.canvas.width = 256;

		window.addEventListener("resize", resizeWindow);

		/* Start listening for updates from the worker! */
		worker.addEventListener("message", messageWorker);

		resizeWindow();

		engine.start();
	})();
