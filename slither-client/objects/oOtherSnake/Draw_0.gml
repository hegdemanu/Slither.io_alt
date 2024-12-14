/// @description Insert description here
// You can write your code in this editor
// Assuming you are in the Draw Event of an object

for (var i = 0; i < array_length(bones); i++) {
    var bone = bones[i];
	
	if(i==0){
		x = bone.x;
		y = bone.y;
	}
    draw_sprite(sBone, 0, bone.x, bone.y); 
}
