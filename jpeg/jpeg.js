var img_data_url;
var img_dom;
var display_canvas;
var display_ctx;
var block_data;
var block_size = 8;

function setupCanvas(w, h) {
	display_canvas = $('#photo_display');
	display_canvas.attr('width', w);
	display_canvas.attr('height', h);
	display_ctx = display_canvas[0].getContext('2d');
}

function getMousePos(canvas, evt) {
    var rect = canvas[0].getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

function extractBlock(pos) {
	blocks = {
		y: Array(block_size * block_size),
		cb: Array(block_size * block_size),
		cr: Array(block_size * block_size),

		r: Array(block_size * block_size),
		g: Array(block_size * block_size),
		b: Array(block_size * block_size)
	};
	pos.x = Math.floor(pos.x / block_size) * block_size;
	pos.y = Math.floor(pos.y / block_size) * block_size;

	var data = display_ctx.getImageData(pos.x, pos.y, block_size, block_size).data;
	for (var i = 0; i < block_size * block_size; i++) {
		var r = blocks.r[i] = data[i * 4 + 0];
		var g = blocks.g[i] = data[i * 4 + 1];
		var b = blocks.b[i] = data[i * 4 + 2];
		blocks.y[i] = 0 + (0.299 * r) + (0.587 * g) + (0.114 * b);
		blocks.cb[i] = 128 - (0.168736 * r) - (0.331264 * g) + (0.5 * b);
		blocks.cr[i] = 128 + (0.5 * r) - (0.418688 * g) - (0.081312 * b);
	}

	return blocks;
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
		var pos = getMousePos(display_canvas, e);
		block_data = extractBlock(pos);
	});

	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
});