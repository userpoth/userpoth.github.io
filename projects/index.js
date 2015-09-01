////////////////////////////////////////
/* index.js. Frank Poth. 09/01/2015. */
//////////////////////////////////////

/* All this does is style the link divs. */

(
	function index() {
		var link_boxes = document.getElementsByClassName("LinkBox");

		for (var index = link_boxes.length - 1; index > -1; index--) {
			var blue = Math.floor(Math.random() * 128);
			var element = link_boxes[index];
			var green = Math.floor(Math.random() * 128);
			var red = Math.floor(Math.random() * 128);

			element.style.backgroundColor = "rgb(" + red + "," + green + "," + blue + ")";
			element.getElementsByClassName("Date")[0].style.color = "rgb(" + (64 + red) + "," + (64 + green) + "," + (64 + blue) + ")";
			element.getElementsByTagName("p")[0].style.color = "rgb(" + (128 + red) + "," + (128 + green) + "," + (128 + blue) + ")";
		}
	})();
