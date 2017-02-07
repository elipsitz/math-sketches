var canvas;
var ctx;
var math = mathjs();

var compiled_functions = new Array();
var points = new Array();
var wrap_amount = 0.0;

var graph_width = 800;
var graph_height = 600;
var graph_center = {x: (graph_width / 2), y: (graph_height / 2)};
var graph_scale = 50.0;
var graph_precision = 256;
var graph_eval_start = -Math.PI;
var graph_eval_end = Math.PI;
var graph_grid_x = Math.PI / 4;
var graph_grid_y = 1.0;
var graph_colors = ["#0000FE", "#FF0507", "#000000", "#FE00FF", "#00D500", "#FF9933", "#993400"];

var canvas_mousedown = false;
var canvas_mousex = 0;
var canvas_mousey = 0;

function redraw() {
	ctx.clearRect(0, 0, graph_width, graph_height);
	
	// BEGIN gridlines (polar and cartesian)
	ctx.strokeStyle = '#CCC';
	ctx.lineWidth = 1;
	if(wrap_amount > 0.0) { // avoid division by zero
		var circle_radius = graph_scale * ((1 / wrap_amount) - 1);
		var circle_center = {x: graph_center.x, y: graph_center.y + circle_radius};
		// grid raylines
		ctx.beginPath();
		var gridlinesX = Math.ceil(Math.max(graph_width - graph_center.x, graph_center.x) / graph_scale) * 2;
		var gridlinesXtheta = Math.floor((Math.PI) / (wrap_amount * graph_grid_x));
		for(var gridX = -(Math.PI / graph_grid_x); gridX <= (Math.PI / graph_grid_x); gridX++) {
			var angle = wrap_amount * graph_grid_x * gridX;
			//if(Math.abs(angle) > Math.PI) // TODO efficiencyize this
			//	continue;
			ctx.arc(circle_center.x, circle_center.y, circle_radius + graph_width * 2, (3/2 * Math.PI) + angle, (3/2 * Math.PI) + angle);
			ctx.lineTo(circle_center.x, circle_center.y);
		}
		// circle lines
		for(var rad = Math.ceil(graph_center.y  / graph_scale) * 2 - 1; rad >= 0; rad--) {
			ctx.moveTo(circle_center.x + circle_radius + (rad * graph_scale), circle_center.y);
			ctx.arc(circle_center.x, circle_center.y, circle_radius + (rad * graph_scale), 0, 2 * Math.PI);
		}
		ctx.stroke();
		//heavier lines
		ctx.strokeStyle = '#AAA';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(circle_center.x, circle_center.y, circle_radius, 0, 2 * Math.PI);
		ctx.moveTo(circle_center.x, circle_center.y);
		ctx.lineTo(circle_center.x, 0);
		ctx.stroke();
		
	} else {
		//regular gridlines
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
	}
	// end gridlines
	
	// drawing the function (polar and cartesian, same code)
	ctx.lineWidth = 1;
	if(points.length > 0) {
		for(var j = 0; j < points.length; j++) {
			if(points[j].length == 0)
				continue;
			ctx.strokeStyle = graph_colors[j % (graph_colors.length)];
			ctx.beginPath();
			for(var i = 0; i < points[j].length; i++) {
				var canvasPoint = graphToCanvas(points[j][i], wrap_amount);
				if(i != 0)
					ctx.lineTo(canvasPoint.x, canvasPoint.y);
				else
					ctx.moveTo(canvasPoint.x, canvasPoint.y);
			}
			ctx.stroke();
		}
	}
}
function calculate() {
	$('#error').html('');
	
	// read input
	graph_eval_start = math.eval($('#xbound_min').val());
	graph_eval_end = math.eval($('#xbound_max').val());
	var graph_step = (graph_eval_end - graph_eval_start) / graph_precision;

	functions_text = $('#equations').val().split("\n");
	compiled_functions = new Array();
	for(var i = 0; i < functions_text.length; i++)
		compiled_functions[i] = math.parse(functions_text[i]).compile(math);

	// calculate points
	points = new Array();
	for(var i = 0; i < compiled_functions.length; i++) {
		points[i] = new Array();
		for(var x = graph_eval_start; x <= graph_eval_end + (graph_step / 2.0); x += graph_step) {
			points[i].push({x: x, y: compiled_functions[i].eval({x: x})});
		}
	}
}
function graphToCanvas(coords, wrap) {
	if(wrap == 0.0) {
		return {
			x: (coords.x * graph_scale) + graph_center.x,
			y: (-coords.y * graph_scale) + graph_center.y, // y coord is flipped
		};
	} else {
		var circle_radius = graph_scale * ((1 / wrap_amount) - 1);
		var circle_center = {x: graph_center.x, y: graph_center.y + circle_radius};
		var circle_arclength = (Math.PI * wrap_amount);
		
		return polarToCartesian(
			(coords.y * graph_scale) + circle_radius,
			(-coords.x * wrap_amount) + (Math.PI / 2),
			circle_center);
	}
}
function polarToCartesian(radius, theta, center) {
	return {
		x: (radius * Math.cos(theta)) + center.x,
		y: (-radius * Math.sin(theta)) + center.y, // y coord is flipped
	};
}

$(document).ready(function(){
	canvas = $('#canvasGraph');
    ctx = canvas[0].getContext('2d');
    ctx.scale(2, 2);
	
	// begin jQuery Event Handlers
	$('#slider_wrap').on('input change', function(){
		wrap_amount = $(this).val() / 100.0;
		redraw();
	});
	$('#slider_zoom').on('input change', function(){
		graph_scale = $(this).val();
		redraw();
	});
	$('#equation_enter').click(function() {
		calculate();
		redraw();
	});
	
	$('#canvasGraph').mousedown(function(e) {
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
	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
	
	// Actual code to run on DOM Launch
	calculate();
	redraw(); 
});

function loadFunction(eq, x_min, x_max) {
	$('#xbound_min').val(x_min);
	$('#xbound_max').val(x_max);
	$('#equations').val(eq);
		
	calculate();
	redraw();
}