
/*
 nate.addLayer("arc", function(ctx) {

 var pos = nate.get("position"),
 size = scene.grid.get("size"),
 vision = nate.get("vision"),
 dist = Geo.findDistance(pos, tile),
 end, control,
 tile = this.get("mouse").position

 end = {
 x: tile.x + size / 2,
 y: tile.y + size / 2
 };
 
 if (tile.x === pos.x) {
 control = pos.x;
 } else {
 control = tile.x > pos.x ? tile.x - (dist / 2) : tile.x + (dist / 2);
 }

 ctx.lineWidth = 3;
 ctx.lineCap = "round";
 ctx.moveTo(pos.x + 16, pos.y + 16);
 ctx.shadowBlur = 20;

 if ( dist > nate.get("vision") * 2) {
 ctx.strokeStyle = "rgba(255,50,50,0.4)";
 ctx.shadowColor = "rgba(255,200,50,0.4)";
 } else {
 ctx.strokeStyle = "rgb(50,50,50)";
 ctx.shadowColor = "rgba(50,50,50,0.2)";
 }
 
 ctx.beginPath();
 ctx.moveTo(pos.x + (size / 2), pos.y + (size / 2));

 ctx.quadraticCurveTo(control, tile.y / 1.25, end.x, end.y);

 ctx.stroke();
 ctx.closePath();
 
 // Reset
 ctx.shadowColor = ctx.shadowBlur = ctx.lineCap = false;

 });
 */
