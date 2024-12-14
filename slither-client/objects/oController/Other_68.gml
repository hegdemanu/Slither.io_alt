/// @description Insert description here
// You can write your code in this editor

			
		switch(async_load[?"type"]){			
			case network_type_non_blocking_connect:
			//code that executes once we have confirmed a connection with the server
		
			
			
			//tell server to create us
			var Buffer = buffer_create(1, buffer_grow ,1);
			var data = ds_map_create();
			data[?"eventName"] = "create_me"	
			data[?"name"] = get_string("CONNECTED. Whats your name?","unnamed")

		
	
		
	
			buffer_write(Buffer , buffer_text  , json_encode(data));

			network_send_raw(socket , Buffer , buffer_tell(Buffer));
			ds_map_destroy(data);
			buffer_delete(Buffer)
			break;
	
	
			case network_type_data:
	
				//how we read data from the server
				var buffer_raw = async_load[? "buffer"];
				var buffer_processed = buffer_read(buffer_raw , buffer_text);
				var realData = json_decode(buffer_processed);
				var eventName = realData[?"eventName"];
		
				switch(eventName){
					case "created_you":
						//Save client id
						global.clientId = real(realData[?"clientId"])
						var realData2 = json_parse(buffer_processed)
						//show_message(typeof(realData2.bones))
						//show_message(realData2.bones)
						oSnake.bones = realData2.bones
					break;
					
					case "state_update":
						var realData2 = json_parse(buffer_processed)
						var thisClientId = realData2.clientId
						if(thisClientId == global.clientId){
							//this is our snake
							oSnake.bones = realData2.bones;
						}else {
							var found = false;
							with(oOtherSnake){
								if(real(clientId) == real(thisClientId)){
									bones = realData2.bones
									found = true;
								}		
							}
							if(!found){
									var newEnemy = instance_create_layer(-100,-100,"Instances",oOtherSnake)
									newEnemy.bones = realData2.bones;
									newEnemy.clientId = thisClientId
								}
						}
					break;
					

					case "show_clients":
						show_message(buffer_processed)
						show_message(typeof(buffer_processed))
						var realData2 = json_parse(buffer_processed)
						show_message(typeof(realData2))
						show_message(realData2.players)
					break;
					
					
					case "game_over":
						show_message("You died!")
					break;
					
					
					case "destroy_player":
						var realData2 = json_parse(buffer_processed)
						var thisClientId = realData2.clientId
						
						with(oOtherSnake){
							if(thisClientId == clientId){
								instance_destroy(id)
							}
						}
						
					break;
					
					
					case "food_update":
					
					var realData2 = json_parse(buffer_processed)
						var foods = realData2.foods
						oFoods.foods = foods
						
					break;
		
				}
		
				ds_map_destroy(realData);
				buffer_delete(buffer_raw)
			break;
		}
	
	
