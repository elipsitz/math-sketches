var img_data_url;
var img_dom;
var display_canvas;
var display_ctx;

function setupCanvas(w, h) {
	display_canvas = $('#photo_display');
	display_canvas.attr('width', w);
	display_canvas.attr('height', h);
	display_ctx = display_canvas[0].getContext('2d');
}

$(document).ready(function(){
	// jQuery Event Handlers
	$("#photo_select").change(function() {
		file = this.files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			img_data_url = event.target.result;
			img_dom = new Image();

			img_dom.onload = function() {
				setupCanvas(img_dom.width, img_dom.height);
				display_ctx.drawImage(img_dom, 0, 0);
			};
			img_dom.src = img_data_url;
		}
    	reader.readAsDataURL(file);
	});
	
	$('#photo_display').mousedown(function(e) {
		// ...
	});

	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
});