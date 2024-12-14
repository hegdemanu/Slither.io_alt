/// @description Insert description here
// You can write your code in this editor
socket = network_create_socket(network_socket_ws)
connect = network_connect_raw_async(socket, "localhost", 3000)
global.clientId = -1