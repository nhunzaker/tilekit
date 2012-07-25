// Entity
//
//= require libs/klass
//
// -------------------------------------------------- //

(function(TK) {

    "use strict";

    TK.Entity = window.klass({

        attributes: {},
        layers: {},

        initialize: function(options, layers) {
            this.attributes = TK.extend({}, this.attributes, options);
            this.layers     = TK.extend({}, this.layers, layers);
            this.canvas     = document.createElement("canvas");
            this.ctx        = this.canvas.getContext('2d');
        },

        // Getters and Setters
        // -------------------------------------------------- //

        get: function(key) {
            return this.attributes[key];
        },

        set: function(key, value) {

            if (typeof key === 'object') {

                for (var k in key) {

                    if (key.hasOwnProperty(k)) {
                        this.set(k, key[k]);
                    }

                }

            }
            
            var previous = this.attributes[key];

            this.attributes[key] = value;

            this.emit("change", value, previous);
            this.emit("change:" + key, value, previous);

            return this.attributes[key];
        },

        is: function(key, condition) {
            return this.get(key) === (condition || true);
        },

        // Layers
        // -------------------------------------------------- //

        addLayer: function(namespace, layer, scope, duration) {

            var self = this;

            if (typeof namespace === 'function') {
                layer = arguments[0];
                scope = arguments[1];
                duration = arguments[2];
                namespace = TK.generateGUID();

            } else if (typeof namespace === 'object') {

                for (var n in namespace) {

                    if (namespace.hasOwnProperty(n)) {
                        this.addLayer(n, namespace[n], scope);
                    }

                }

                return this;

            }
            
            var bound = layer.bind(scope || this);
            
            bound.created_at = Date.now();
            bound.expires_at = duration || false;
            bound.callback = function() {};
            
            this.layers[namespace] = bound;

            return {

                then: function(cb) {
                    bound.callback = cb;
                }

            };

        },

        removeLayer: function(name) {
            if (this.layers[name]) {
                delete this.layers[name];
            }
        },

        renderLayers: function(ctx) {

            var layers = this.layers,
                layer,
                date = new Date();

            for (var l in layers) {

                if (layers.hasOwnProperty(l) && typeof layers[l] === 'function') {

                    layer = layers[l];
                    layer(ctx || this.ctx, date, layer.created_at);

                    if (layer.expires_at !== false && date.getTime() - layer.created_at > layer.expires_at) {
                        this.layers[l].callback.apply(this, date);
                        delete this.layers[l];
                    }
                    
                }

            }

        }

    });
    
    TK.extend(TK.Entity.prototype, window.EventEmitter2.prototype);

}(window.Tilekit));