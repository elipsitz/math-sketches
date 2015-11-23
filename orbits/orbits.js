var canvas;
var ctx;

var canvas_mousedown = false;
var canvas_mousex = 0;
var canvas_mousey = 0;
var canvas_mousedownx = 0;
var canvas_mousedowny = 0;

var graph_width = 800;
var graph_height = 600;
var time = 0;
var time_scale = 1;

var const_g = 1;//6.67e-11;
var camera_x = 0;
var camera_y = 0;
var camera_zoom = 1;
var objects = [];

// starter object
objects = [
	{x: 0, y: 0, mass: 100000, radius: 10, vx: 0, vy: 0, ax: 0, ay: 0},
	{x: 300, y: 0, mass: 100000, radius: 5, vx: 0, vy: -10, ax: 0, ay: 0}
];

function render() {
	var dt =  (1.0 / 60.0) * time_scale;
	time += dt;
	ctx.clearRect(0, 0, graph_width, graph_height);

	// simulate objects (TODO)
	for(var i = 0; i < objects.length; i++) {
		// first compute their acceleration vectors
		objects[i].ax = 0;
		objects[i].ay = 0;
		for(var j = 0; j < objects.length; j++) {
			if(i == j)
				continue;
			var rx = objects[i].x - objects[j].x;
			var ry = objects[i].y - objects[j].y;
			var r = -(const_g * objects[j].mass) / Math.pow(Math.sqrt(rx * rx + ry * ry), 3);

			objects[i].ax += r * rx;
			objects[i].ay += r * ry;
		}

		// now velocity
		objects[i].vx += objects[i].ax * dt;
		objects[i].vy += objects[i].ay * dt;

		// and position
		objects[i].x += objects[i].vx * dt;
		objects[i].y += objects[i].vy * dt;
	}

	// camera position
	if(objects.length > 0) {
		camera_x = objects[0].x - (graph_width * 0.5);
		camera_y = objects[0].y - (graph_height * 0.5);
	}

	// draw objects
	ctx.fillStyle = 'black';
	for(var i = 0; i < objects.length; i++) {
		var x = objects[i].x - camera_x;
		var y = objects[i].y - camera_y;
		ctx.beginPath();
		ctx.arc(x, y, objects[i].radius * camera_zoom, 0, Math.PI * 2);
		ctx.fill();

		line(x, y, x + objects[i].vx, y + objects[i].vy);
	}

	window.requestAnimFrame(render, canvas);
}

function line(x0, y0, x1, y1){
   x0 = x0 | 0;
   y0 = y0 | 0;
   x1 = x1 | 0;
   y1 = y1 | 0;
   var dx = Math.abs(x1-x0);
   var dy = Math.abs(y1-y0);
   var sx = (x0 < x1) ? 1 : -1;
   var sy = (y0 < y1) ? 1 : -1;
   var err = dx-dy;

   while(true){
     setPixel(x0,y0);  // Do what you need to for this

     if ((x0==x1) && (y0==y1)) break;
     var e2 = 2*err;
     if (e2 >-dy){ err -= dy; x0  += sx; }
     if (e2 < dx){ err += dx; y0  += sy; }
   }
}

function setPixel(x, y) {
	ctx.fillRect(x, y, 1, 1);
}

function lerp(x1, x2, t) {
	return x1 + (t * (x2 - x1));
}
function lerp_pt(pt1, pt2, t) {
	return {
		x: lerp(pt1.x, pt2.x, t),
		y: lerp(pt1.y, pt2.y, t)
	};
}

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
			return window.setTimeout(callback, 1000 / 60);
		};
})();

$(document).ready(function(){
	canvas = $('#canvas')[0];
    ctx = canvas.getContext('2d');
	
	// begin jQuery Event Handlers
	$('#slider_percent').on('input change', function(){
		t = $(this).val() / 100.0;
		time_scale = t * 10.0;
	});
	$('#button_clear').click(function() {
	});
	$('#button_go').click(function() {
	});
	
	$('#canvas').mousedown(function(e) {
		var pos = getMousePos(canvas, e);
		canvas_mousedown = true;
		canvas_mousedownx = pos.x;
		canvas_mousedowny = pos.y;
		canvas_mousex = pos.x;
		canvas_mousey = pos.y;
	});
	$(window).mouseup(function(e) {
		canvas_mousedown = false;
	});
	$(window).mousemove(function(e) {
		var pos = getMousePos(canvas, e);
		canvas_mousex = pos.x;
		canvas_mousey = pos.y;
	});
	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
	
	// Actual code to run on DOM Launch
	render();
});