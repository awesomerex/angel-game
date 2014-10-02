"use strict";

var Splat = require("splatjs");
var canvas = document.getElementById("canvas");

var manifest = {
	"images": {
	},
	"sounds": {
	},
	"fonts": {
	},
	"animations": {
	}
};

var game = new Splat.Game(canvas, manifest);
var speed = 10;
var bulletSpeed = 5;
var enemySpeed = 2;
var enemyColors = ["red", "yellow", "blue"];
var score = 0;
function centerText(context, text, offsetX, offsetY) {
	var w = context.measureText(text).width;
	var x = offsetX + (canvas.width / 2) - (w / 2) | 0;
	var y = offsetY | 0;
	context.fillText(text, x, y);
}

function drawEntity(context, drawable){
	context.fillStyle = drawable.color;
	context.fillRect(drawable.x, drawable.y, drawable.width, drawable.height);
}

function drawBullet(context, drawable, color){
	context.fillStyle = color;
	context.fillRect(drawable.x, drawable.y, drawable.width, drawable.height);
}

function randomColor(){
 	var color = enemyColors[Math.floor((Math.random() * enemyColors.length))];
 	return color;
}


game.scenes.add("title", new Splat.Scene(canvas, function() {
	// initialization
	var scene = this;
	scene.player = new Splat.Entity(canvas.width/2, canvas.height/4, 50, 50);
	scene.player.color = "white";
	scene.fireFont = new Splat.Entity(canvas.width/4 - 50, 100, 100, 100);
	scene.fireFont.color = "red";
	scene.lifeFont = new Splat.Entity(canvas.width/4 *2 - 50, 100, 100, 100);
	scene.lifeFont.color = "yellow";
	scene.waterFont = new Splat.Entity(canvas.width/4 *3 - 50, 100, 100, 100);
	scene.waterFont.color = "blue";
	scene.Fonts = [this.fireFont, this.lifeFont, this.waterFont];
	scene.bullets = [];
	scene.enemySpawn = new Splat.Entity(canvas.width - 10, canvas.height/2, 20, 20);
	scene.enemySpawn.color = "orange";
	scene.enemySpawn.spawn = function () {
		var enemy = new Splat.Entity(this.x, this.y, 20, 20);
		enemy.color = randomColor();
		scene.enemies.push(enemy);
	};
	scene.Spawns = [this.enemySpawn];
	scene.enemies = [];

	this.timers.spawnEnemy = new Splat.Timer(undefined, 5000, function(){
		//enemy.color = "orange";
		scene.enemySpawn.spawn();
		console.log("enemy spawned");
		this.reset();
		this.start();
	});
	this.timers.spawnEnemy.start();
}, function() {
	// simulation
	if (game.keyboard.isPressed("left")) {
		this.player.x -= speed;
	}
	if (game.keyboard.isPressed("right")) {
		this.player.x += speed;
	}
	if (game.keyboard.isPressed("up")) {
		this.player.y -= speed;
	}
	if (game.keyboard.isPressed("down")) {
		this.player.y += speed;
	}
	if (game.keyboard.isPressed("space")) {
		var bullet = new Splat.Entity(this.player.x, this.player.y, 10, 10);
		bullet.color = this.player.color;
		this.bullets.push(bullet);
	}

	//color changers
	for (var x = 0; x < this.Fonts.length; x++){
		if (this.player.collides(this.Fonts[x]) && this.player.color !== this.Fonts[x]){
			this.player.color = this.Fonts[x].color;
		}
	}
	//bullet management
	for (x = 0; x < this.bullets.length; x++){
		this.bullets[x].y += bulletSpeed;
		if(this.bullets[x].y > canvas.height){
			this.bullets.splice(x,1);
		}
	}
	//enemy management
	for(x = 0; x < this.enemies.length; x++){
		this.enemies[x].x -= enemySpeed;
		for (var bulletCount = 0; bulletCount < this.bullets.length; bulletCount++)
		{
			if(this.enemies[x] && this.enemies[x].collides(this.bullets[bulletCount]) && this.enemies[x].color === this.bullets[bulletCount].color){
				this.enemies.splice(x,1);
				this.bullets.splice(bulletCount,1);
				score += 1;
				console.log("+1");
				break;
			}
		}
		if(this.enemies[x] && this.enemies[x].x < 0){
			this.enemies.splice(x,1);
		}
	}

}, function(context) {
	// draw
	context.fillStyle = "#092227";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// context.fillStyle ="red";
	// context.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
	drawEntity(context, this.player);
	drawEntity(context, this.fireFont);
	drawEntity(context, this.lifeFont);
	drawEntity(context, this.waterFont);
	drawEntity(context, this.enemySpawn);
	if (this.bullets.length > 0){
		for(var x = 0; x<this.bullets.length; x++){
			drawBullet(context, this.bullets[x], this.bullets[x].color);
		}
	}

	if (this.enemies.length > 0){
		for(var i = 0; i<this.enemies.length; i++){
			drawBullet(context, this.enemies[i], this.enemies[i].color);
		}
	}


	context.fillStyle = "#fff";
	context.font = "25px helvetica";
	centerText(context, "score: "+score, 0, canvas.height / 2 - 13);
}));

game.scenes.switchTo("loading");
