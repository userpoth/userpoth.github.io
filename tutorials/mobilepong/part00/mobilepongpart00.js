///////////////////////////////////////////////////
/* mobilepongpart00.js. Frank Poth. 08/26/2015. */
/////////////////////////////////////////////////

/* Alright, here we go, another tutorial! Pong this time. But I'm going to put it together slowly. */
/* This tutorial will focus on simply setting up a stage for playing the game on: the display canvas. */
/* In the html file I put a canvas with an id of "display". That's what we're going to be drawing to. */

/* First off, let's make a wrapper function. */
/* This will be called automatically when the script tag at the bottom of the html file loads. */

/* By wrapping the function in parenthesis and putting two parenthesis after it, you call the function you are defining. */
/* This means this function will be called as soon as it is loaded. */
/* Also, putting everything in a function keeps everything contained in its own scope. */
(
	function mobilePongPart00() {
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

		/* This is a super important function to have when designing mobile games. */
		/* The user's screen size can change in the browser when the device orientation changes or when the user hides the address bar. */
		/* Screen size can change when zooming or when reopening a window that was tabbed. */
		/* It's important to make sure the game is scaled propperly after every screen resize. */
		function resizeWindow(event_) {
			client_height = document.documentElement.clientHeight;
			client_width = document.documentElement.clientWidth;

			/* Pong is meant to be played in wide screen. */
			/* If the user's device goes narrow screen, stop the game. */
			/* In mobilepong.js, the display canvas will be hidden if the user's screen goes narrow. */
			if (client_height > client_width) {
				stop();
				return;
			}

			/* So, we just tested to see if the user's screen was narrow. If it's not, then we run this code. */
			/* The height ratio is the height of the user's client window divided by the height you want your game to be. */
			/* The width ratio is basically the same thing only with width. */
			var height_ratio = client_height / game_height;
			var width_ratio = client_width / game_width;

			/* So, what is happening here is the display canvas is being scaled to fit inside the client window while also maintaining the shape of the game width and height. */
			/* How we do this is we compare both ratios and choose the smaller of the two. */
			/* By choosing the smaller ratio, we ensure that all of our game screen will be seen by the player and will be scalled propperly. */
			/* There may be a little bit of empty space on screen, but that's okay. If you want, you can fill that in with background color or something. */

			if (height_ratio < width_ratio) {
				display.canvas.height = game_height * height_ratio;
				display.canvas.width = game_width * height_ratio;

				/* If the height ratio is the smaller of the two, then your game will be full height. */
				/* This means that the width of the display canvas will not take up the whole client width of the window, but the height of it will. */
				/* To make this look a little nicer, one thing you can do is center the display canvas on the axis that doesn't fill the client window all the way. */
				display.canvas.style.left = Math.floor((client_width - display.canvas.width) * 0.5) + "px";
			} else {
				display.canvas.height = game_height * width_ratio;
				display.canvas.width = game_width * width_ratio;

				/* If the width ratio is the smaller of the two, then your game will be full width. */
				/* This means that the height of the display canvas will not take up the whole client height of the window, but the width of it will. */
				/* To make this look a little nicer, one thing you can do is center the display canvas on the axis that doesn't fill the client window all the way. */
				display.canvas.style.top = Math.floor((client_height - display.canvas.height) * 0.5) + "px";
			}

			/* Fill the canvas with the color defined in start. */
			display.fillStyle = "#303030";
			display.fillRect(0, 0, display.canvas.width, display.canvas.height);
			display.fillStyle = "#f0f0f0";
			display.font = "30px Arial";
			display.fillText("This will be the pong game board!", 10, display.canvas.height * 0.5);
		}

		/* This will initialize the game. */
		function start() {
			/* Whenever you start up, you want to add all of your listeners. */
			display.canvas.addEventListener("touchstart", touchStartDisplay);
			window.addEventListener("resize", resizeWindow);
			resizeWindow();
		}

		/* This will stop the game. */
		function stop() {
			/* When you're not playing, remove those listeners, they're always listening and it's a performance drain. */
			display.canvas.removeEventListener("touchstart", touchStartDisplay);
			window.removeEventListener("resize", resizeWindow);
		}

		/* Listens for touchstart events. */
		/* Right now this function doesn't really do anything, but eventually it will be responsible for getting user input and moving the paddle! */
		function touchStartDisplay(event_) {
			/* Remember to use event_.preventDefault to keep your elements from accidentally responding to native browser events like scroll and zoom. */
			event_.preventDefault();
		}

		/////////////////
		/* VARIABLES. */
		///////////////

		/* These variables will hold the actual dimensions of the client window once the resizeWindow function determines what they are. */
		var client_height = document.documentElement.clientHeight;
		var client_width = document.documentElement.clientWidth;

		/* A very important aspect of any mobile game is scalability. */
		/* We're not developing for a GBA with a standard screen size. We have to be prepared for any screen size that comes our way. */
		/* This means we need to decide just how big our screen should be and then scale appropriately when we encounter conflicts. */
		var game_width = 480;
		var game_height = 240;

		/* Get the display canvas' context for drawing to the screen. */
		var display = document.getElementById("display").getContext("2d");

		//////////////////
		/* INITIALIZE. */
		////////////////

		/* So, since the game is being played in the context of a tutorial, clicking the launch and close buttons will start and stop the game. */
		/* For a normal game you might replace this with a start/pause button system. */
		/* If you look at mobilepong.js, you will see that these buttons hide/display the display canvas. */
		document.getElementById("launch_button").addEventListener("click", clickLaunchButton);
		document.getElementById("close_button").addEventListener("click", clickCloseButton);
	})();
