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

        addLayer: function(namespace, layer, scope) {

            if (!namespace) {
                throw new Error("Entity#addLayer - Layer requires a namespace");
            }

            if (typeof namespace === 'object') {

                for (var n in namespace) {

                    if (namespace.hasOwnProperty(n)) {
                        this.addLayer(n, namespace[n], scope);
                    }

                }

                return this;

            }

            this.layers[namespace] = layer.bind(scope || this);

            return layer;
        },

        removeLayer: function(name) {
            if (this.layers[name]) {
                delete this.layers[name];
            }
        },

        renderLayers: function(ctx) {

            var layers = this.layers;

            for (var layer in layers) {

                if (layers.hasOwnProperty(layer) && typeof layers[layer] === 'function') {
                    layers[layer].apply(this, [ctx || this.ctx, Date(), this]);
                }

            }

        }

    });

    TK.extend(TK.Entity.prototype, window.EventEmitter2.prototype);

}(window.Tilekit));