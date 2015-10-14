var canvas;
var ctx;
var math = mathjs();

var points = new Array();
var conic_e = 0.5;
var conic_a = 1;

var graph_width = 800;
var graph_height = 600;
var graph_center = {x: (graph_width / 2), y: (graph_height / 2)};
var graph_scale = 50.0;
var graph_precision = 256;
var graph_eval_start = -Math.PI;
var graph_eval_end = Math.PI;
var graph_grid_x = 1.0;
var graph_grid_y = 1.0;

var canvas_mousedown = false;
var canvas_mousex = 0;
var canvas_mousey = 0;

function redraw() {
	ctx.clearRect(0, 0, graph_width, graph_height);
	
	// BEGIN gridlines (polar and cartesian)
	ctx.strokeStyle = '#CCC';
	ctx.lineWidth = 1;
	ctx.beginPath();
	var gridlinesY = Math.ceil(Math.max(graph_height - graph_center.y, graph_center.y) / graph_scale) * 2;
	for(var gridY = -gridlinesY; gridY <= gridlinesY; gridY++) {
		ctx.moveTo(0.5, 0.5 + graph_center.y + (graph_grid_y * graph_scale * gridY));
		ctx.lineTo(0.5 + graph_width, 0.5 + graph_center.y + (graph_grid_y * graph_scale * gridY));
	}	
	var gridlinesX = Math.ceil(Math.max(graph_width - graph_center.x, graph_center.x) / graph_scale) * 2;
	for(var gridX = -gridlinesX; gridX <= gridlinesX; gridX++) {
		ctx.moveTo(0.5 + graph_center.x + (graph_grid_x * graph_scale * gridX), 0.5);
		ctx.lineTo(0.5 + graph_center.x + (graph_grid_x * graph_scale * gridX), 0.5 + graph_height);
	}			
	ctx.stroke();
	// and of course, the bolder x and y axes
	ctx.strokeStyle = '#AAA';
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.moveTo(0, graph_center.y);
	ctx.lineTo(graph_width, graph_center.y);
	ctx.moveTo(graph_center.x, 0);
	ctx.lineTo(graph_center.x, graph_height);
	ctx.stroke();
	// end gridlines
	
	// drawing the function (polar and cartesian, same code)
	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 1;
	if(points.length > 0) {
		ctx.beginPath();
		for(var i = 0; i < points.length; i++) {
			var canvasPoint = graphToCanvas(points[i]);
			if(i != 0)
				ctx.lineTo(canvasPoint.x, canvasPoint.y);
			else
				ctx.moveTo(canvasPoint.x, canvasPoint.y);
		}
		ctx.stroke();
	}
}
function calculate() {
	var graph_step = (2 * Math.PI) / graph_precision;

	// calculate points
	points = new Array();
	for(var x = 0; x <= (2 * Math.PI) + (graph_step / 2.0); x += graph_step) {
		var radius = (conic_a * conic_e + 1) / (1 + (conic_e * Math.cos(x)));
		points.push(polarToCartesian(radius, x, {x: 0, y: 0}));
	}
}
function graphToCanvas(coords) {
	return {
		x: (coords.x * graph_scale) + graph_center.x,
		y: (-coords.y * graph_scale) + graph_center.y, // y coord is flipped
	};
}
function polarToCartesian(radius, theta, center) {
	return {
		x: (radius * Math.cos(theta)) + center.x,
		y: (-radius * Math.sin(theta)) + center.y, // y coord is flipped
	};
}

$(document).ready(function(){
	canvas = $('#canvas');
    ctx = canvas[0].getContext('2d');
	
	// begin jQuery Event Handlers
	$('#slider_ecc').on('input change', function(){
		conic_e = $(this).val();
		conic_e = Math.pow(((2 * conic_e) - 1), 3) + 1;
		$('#text_ecc').val(conic_e);
		calculate();
		redraw();
	});
	$('#text_ecc').on('input change', function(){
		conic_e = $(this).val();
		calculate();
		redraw();
	});
	$('#slider_a').on('input change', function(){
		conic_a = $(this).val() / 100.0;
		calculate();
		redraw();
	});
	$('#slider_zoom').on('input change', function(){
		graph_scale = $(this).val();
		redraw();
	});
	
	$('#canvas').mousedown(function(e) {
		canvas_mousedown = true;
		canvas_mousex = e.pageX;
		canvas_mousey = e.pageY;
	});
	$(window).mouseup(function(e) {
		canvas_mousedown = false;
	});
	$(window).mousemove(function(e) {
		if(canvas_mousedown) {
			graph_center.x += (e.pageX - canvas_mousex);
			graph_center.y += (e.pageY - canvas_mousey);
			redraw();
		}
		canvas_mousex = e.pageX;
		canvas_mousey = e.pageY;
	});
	// end jQuery Event Handlers
	
	// Actual code to run on DOM Launch
	calculate();
	redraw(); 
});

function loadFunction(eq, x_min, x_max) {
	$('#xbound_min').val(x_min);
	$('#xbound_max').val(x_max);
	$('#equation').val(eq);
		
	calculate();
	redraw();
}