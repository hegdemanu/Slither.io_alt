/// @description Insert description here
// You can write your code in this editor
/// @description Insert description here
// You can write your code in this editor
/// @description Clicks logic

if(mouse_check_button_pressed(mb_left)){
	

	/*
	
		var Buffer = buffer_create(1, buffer_grow ,1);
		var data = ds_map_create();
		data[?"eventName"] = "send_message"	
		data[?"clientId"] = global.clientId
		data[?"message"] = get_string("Enter a message to share" ,"HII" )
		
	
		
	
		buffer_write(Buffer , buffer_text  , json_encode(data));
		network_send_raw(socket , Buffer , buffer_tell(Buffer));
		ds_map_destroy(data);
		buffer_delete(Buffer)
		*/
}


if(mouse_check_button_pressed(mb_right)){
	/*
	
		var Buffer = buffer_create(1, buffer_grow ,1);
		var data = ds_map_create();
		data[?"eventName"] = "show_clients"	
		data[?"clientId"] = global.clientId

		
	
		
	
		buffer_write(Buffer , buffer_text  , json_encode(data));
		network_send_raw(socket , Buffer , buffer_tell(Buffer));
		ds_map_destroy(data);
		buffer_delete(Buffer)
		*/
}


//send the angle update
if(global.clientId != -1){
	var Buffer = buffer_create(1, buffer_grow ,1);
	var data = ds_map_create();
	data[?"eventName"] = "angle_update"	
	data[?"A"] = point_direction(oSnake.x,oSnake.y , mouse_x,mouse_y)
	data[?"clientId"] = global.clientId
	
	buffer_write(Buffer , buffer_text  , json_encode(data));
	network_send_raw(socket , Buffer , buffer_tell(Buffer));
	ds_map_destroy(data);
	buffer_delete(Buffer)
}

