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
var stats = {
	"speed": 10,
	"bulletSpeed": 5,
	"score": 0,
	"hit": 0
};

var enemySpeed = 2;
var enemyColors = ["white"];

// var speed = 10;
// var bulletSpeed = 5;
// var score = 0;
// var hit = 0;

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
	scene.player = new Splat.Entity(canvas.width/4, canvas.height - 50, 50, 50);
	scene.player.color = "white";
	scene.player.stats = stats;
	scene.bullets = [];
	scene.impSpawn = new Splat.Entity(canvas.width - 10, 
									 canvas.height/3, 20, 20);
	scene.impSpawn.color = "orange";
	scene.impSpawn.spawn = function () {
		var enemy = new Splat.Entity(this.x, this.y, 20, 20);
		enemy.color = randomColor();
		scene.enemies.push(enemy);
	};
	scene.Spawns = [this.impSpawn];
	scene.enemies = [];

	this.timers.spawnEnemy = new Splat.Timer(undefined, 5000, function(){
		//enemy.color = "orange";
		scene.impSpawn.spawn();
		console.log("imp spawned");
		this.reset();
		this.start();
	});
	this.timers.spawnEnemy.start();
}, function() {
	// simulation
	if (game.keyboard.isPressed("left")) {
		this.player.x -= this.player.stats.speed;
	}
	if (game.keyboard.isPressed("right")) {
		this.player.x += this.player.stats.speed;
	}
	if (game.keyboard.isPressed("up")) {
		this.player.y -= this.player.stats.speed;
	}
	if (game.keyboard.isPressed("down")) {
		this.player.y += this.player.stats.speed;
	}
	if (game.keyboard.consumePressed("space")) {
		var bullet = new Splat.Entity(this.player.x+this.player.width, 
									  this.player.y+ this.player.height/2, 
									  10, 10);
		bullet.color = this.player.color;
		this.bullets.push(bullet);
	}

	//bullet management
	for (var x = 0; x < this.bullets.length; x++){
		this.bullets[x].x += this.player.stats.bulletSpeed;
		if(this.bullets[x].x > canvas.width){
			this.bullets.splice(x,1);
		}
	}
	//enemy bullet management
	for(x = 0; x < this.enemies.length; x++){
		this.enemies[x].x -= enemySpeed;
		for (var bulletCount = 0; bulletCount < this.bullets.length; bulletCount++)
		{
			if(this.enemies[x] && this.enemies[x].collides(this.bullets[bulletCount]) && 
				this.enemies[x].color === this.bullets[bulletCount].color){
				this.enemies.splice(x,1);
				this.bullets.splice(bulletCount,1);
				this.player.stats.score += 1;
				console.log("+1");
				break;
			}
		} // loop through player bullets
		if(this.enemies[x] && this.enemies[x].x < 0){
			this.enemies.splice(x,1);
		}
		if (this.enemies[x] && this.enemies[x].collides(this.player)){
				this.enemies.splice(x,1);
				this.player.stats.hit +=1;
				console.log("player hit");
				break;
		}
	}

}, function(context) {
	// draw
	context.fillStyle = "#092227";
	context.fillRect(0, 0, canvas.width, canvas.height);

	drawEntity(context, this.player);

	drawEntity(context, this.impSpawn);
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
	centerText(context, "score: "+this.player.stats.score, 0, canvas.height / 2 - 13);
	centerText(context, "player hit:"+this.player.stats.hit, 0, canvas.height / 3);
}));

game.scenes.switchTo("loading");
