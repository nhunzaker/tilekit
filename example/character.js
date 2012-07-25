(function(Tilekit) {
    
    var isWithinCone = window.Geo.isWithinCone;
    
    var Character = Tilekit.Character = Tilekit.Unit.extend({
        
        arrows: 0,
        potions: 0,

        senses: {
            
            see: function(start, end, distance) {
                
                var vision = this.get("vision") || 0,
                    cone   = this.get("visionCone") || 0,
                    angle  = this.get("face");

                return isWithinCone(end, start, vision, angle, cone);
            },

            hear: function(start, end, distance) {
                return this.get("hearing") > distance;
            }
            
        },

        actions: {
            
            jump: {
                animation: "jump",
                halt: false,
                frames: 7,
                duration: 400,
                slot: 52,
                iterations: 1,

                behavior: function(pan) {
                    this.move({ pan: pan, amount: 2 });
                }
            },

            attack: {
                animation: "melee",
                frames: 11,
                duration: 350,
                slot: 13,
                iterations: 1,
                
                onKeyframe: function(self) {
                    Tilekit.emit("damage", self.getPositionFront(), self);
                }

            },

            shoot: {
                animation: "range",
                duration: 500,
                frames: 8,
                iterations: 1,
                keyframe: 7,
                slot: 26,

                before: function() {
                    var arrows = this.get("arrows"),
                        pos    = this.get("position"),
                        size   = this.grid.get("size");
                    
                    if (arrows < 1) {

                        this.addLayer(function(ctx) {

                            Tilekit.Text(ctx, " 	✖ ", pos.x - 3, pos.y, {
                                color: "red"
                            });

                        }, this, 300);

                    }
                    
                    return arrows > 0;
                },
                
                onKeyframe: function() {

                    var arrows = this.get("arrows");
                    
                    if (arrows) {
                    
                        Tilekit.Projectile({
                            source: this,
                            from: this.get("position"),
                            distance: this.get("vision") * 7,
                            angle: this.get("face"),
                            scene: this.scene
                        });

                        this.set("arrows", arrows - 1);
                    } 

                }

            },
            
            cast: {
                animation: "cast",
                duration: 400,
                frames: 10,
                iterations: 1,
                keyframe: 6,
                slot: 39,
                
                onKeyframe: function(name, target) {
                    
                    var spells = this.get("spells");
                    
                    if (!spells[name]) {
                        return;
                    }

                    spells[name].apply(this, target, Date.now());
                    
                    this.emit("spell", name, target, this.get("position"));
                    this.emit("spell" + ":name", name, target, this.get("position"));

                }

            },

            potion: {

                animation: "cast",
                duration: 400,
                frames: 10,
                iterations: 1,
                keyframe: 6,
                slot: 39,

                before: function() {

                    var pots = this.get("health-potions"),
                        pos  = this.get("position"),
                        size = this.grid.get("size");
                    
                    if (pots < 1) {

                        this.addLayer(function(ctx) {

                            Tilekit.Text(ctx, " 	✖ ", pos.x - 3, pos.y, {
                                color: "red"
                            });

                        }, this, 300);
                        
                    }
                    
                    return pots > 0;
                },
                
                onKeyframe: function(name, target) {

                    var pots = this.get("health-potions");

                    this.emit("consume", name, target, this.get("position"));
                    this.emit("consume" + ":name", name, target, this.get("position"));
                    
                    this.set("health", this.get("health") + 40);
                    
                    this.set("health-potions", pots - 1);
                }

            }

        }

    });

}(window.Tilekit));