/////////////////////////////////////////////
/* mobilepong.js. Frank Poth. 08/26/2015. */
///////////////////////////////////////////

/* Okay, so, this right here is the code I'm going to use on each page to hide and show the example canvases. */
/* When the user clicks a link to the example, this code will run and blow up the example canvas. */

(
	function mobilePong() {
		/////////////////
		/* FUNCTIONS. */
		///////////////

		function clickCloseButton(event_) {
			event_.preventDefault();
			display.style.display = "none";
			this.style.display = "none";
		}

		function clickLaunchButton(event_) {
			event_.preventDefault();
			if (document.documentElement.clientHeight > document.documentElement.clientWidth) {
				alert("Please tilt your device to play!");
			} else {
				close_button.style.display = "block";
				close_button.style.left = display.style.left;
				close_button.style.top = display.style.top;
				display.style.display = "block";
			}
		}

		function resizeWindow(event_) {
			if (document.documentElement.clientHeight > document.documentElement.clientWidth) {
				display.style.display = "none";
				close_button.style.display = "none";
				close_button.style.left = display.style.left;
				close_button.style.top = display.style.top;
			}
		}

		/////////////////
		/* VARIABLES. */
		///////////////

		var close_button = document.getElementById("close_button");
		var display = document.getElementById("display");

		//////////////////
		/* INITIALIZE. */
		////////////////
		close_button.addEventListener("click", clickCloseButton);
		document.getElementById("launch_button").addEventListener("click", clickLaunchButton);
		window.addEventListener("resize", resizeWindow);
	})();
