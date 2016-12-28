$(document).ready(function(){
	// jQuery Event Handlers
	$("#photo_select").change(function() {
		file = this.files[0];
		var reader = new FileReader();
		reader.onload = function(event){
			data_url = event.target.result;
			$('#photo_display').attr('src', data_url);
		}
    	reader.readAsDataURL(file);
	});
	
	$('#photo_display').mousedown(function(e) {
		//canvas_mousedown = true;
		//canvas_mousex = e.pageX;
		//canvas_mousey = e.pageY;
	});
	window.onerror = function(message) {
		$('#error').html(message);
	}
	// end jQuery Event Handlers
});