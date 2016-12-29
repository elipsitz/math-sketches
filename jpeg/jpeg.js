var img_data_url;
var img_dom;
var display_canvas;
var display_ctx;
var block_data;
var block_size = 8;

// TODO load these
var block_rgb_canvas;
var block_rgb_context;
var block_y_canvas;
var block_y_context;
var block_cb_canvas;
var block_cb_context;
var block_cr_canvas;
var block_cr_context;

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

		image_data: null
	};
	pos.x = Math.floor(pos.x / block_size) * block_size;
	pos.y = Math.floor(pos.y / block_size) * block_size;

	blocks.image_data = display_ctx.getImageData(pos.x, pos.y, block_size, block_size);
	var data = blocks.image_data.data;
	for (var i = 0; i < block_size * block_size; i++) {
		var r = data[i * 4 + 0];
		var g = data[i * 4 + 1];
		var b = data[i * 4 + 2];
		blocks.y[i] = 0 + (0.299 * r) + (0.587 * g) + (0.114 * b);
		blocks.cb[i] = 128 - (0.168736 * r) - (0.331264 * g) + (0.5 * b);
		blocks.cr[i] = 128 + (0.5 * r) - (0.418688 * g) - (0.081312 * b);
	}

	return blocks;
}

function ycbcrToRgb(p) {
	// {y: , cb:, cr: }
	return {
		r: p.y + 1.402 * (p.cr - 128),
		g: p.y - 0.344136 * (p.cb - 128) - 0.714136 * (p.cr - 128),
		b: p.y + 1.772 * (p.cb - 128)
	};
}

function renderBlocks() {
	function renderBlock(context, data, conv) {
		var image_data = context.getImageData(0, 0, block_size, block_size);
		for (var i = 0; i < block_size * block_size; i++) {
			var pixel = conv(data[i]);
			image_data.data[(i * 4) + 0] = pixel.r;
			image_data.data[(i * 4) + 1] = pixel.g;
			image_data.data[(i * 4) + 2] = pixel.b;
			image_data.data[(i * 4) + 3] = 255;
		}
		context.putImageData(image_data, 0, 0);
	}

	block_rgb_context.putImageData(block_data.image_data, 0, 0);
	renderBlock(block_y_context, block_data.y, function(i) {
		return {r: i, g: i, b: i};
	});
	renderBlock(block_cb_context, block_data.cb, function(i) {
		return ycbcrToRgb({y: 128, cb: i, cr: 128});
	});
	renderBlock(block_cr_context, block_data.cr, function(i) {
		return ycbcrToRgb({y: 128, cb: 128, cr: i});
	});
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
		renderBlocks();
	});

	window.onerror = function(message) {
		$('#error').html(message);
	}

	block_rgb_canvas = $('#block_rgb');
	block_y_canvas = $('#block_y');
	block_cb_canvas = $('#block_cb');
	block_cr_canvas = $('#block_cr');
	block_rgb_context = block_rgb_canvas[0].getContext('2d');
	block_y_context = block_y_canvas[0].getContext('2d');
	block_cb_context = block_cb_canvas[0].getContext('2d');
	block_cr_context = block_cr_canvas[0].getContext('2d');
	// end jQuery Event Handlers
});