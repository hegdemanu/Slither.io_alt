for (var i = 0; i < array_length(foods); i++) {
    var food = foods[i];

    // Use the coordinates to generate a seed for the random function
    var seed = round(food.x) * 1000 + round(food.y); // a simple hash
    random_set_seed(seed);

    // Generate color components using our seeded random
    var r = random(255);
    var g = random(255);
    var b = random(255);

    // Set the blend color
    var color = make_color_rgb(r, g, b);

    // Calculate the size based on our seeded random in range [0.7, 1.3]
    var size = 0.7 + (random(0.6));

    // Draw the sprite with the determined color and size
    draw_sprite_ext(sFood, 0, food.x, food.y, size, size, 0, color, 1);
    
    // Reset random seed to default (optional, but can be useful if you're using random elsewhere)
    randomize();
}
