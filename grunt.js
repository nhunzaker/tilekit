/*global module:false*/

module.exports = function(grunt) {

    var config = require("./package.json"),
        growl = require('growl');

    ['warn', 'fatal', 'error'].forEach(function(level) {
        
        grunt.utils.hooker.hook(grunt.fail, level, function(opt) {
            growl(opt.name, { title: opt.message, image: 'Console' });
        });

    });

    grunt.initConfig({

        meta: {
            version: config.version,
            banner: ['/*',
                     ' ' + config.name,
                     '',
                     ' ' + config.author,
                     ' ' + config.website,
                     '',
                     '/'].join("\n *") + "\n"

        },

        lint: {
            files: [
                'src/main.js',
                'src/helpers.js',
                'src/geo.js',
                'src/textbox.js',
                'src/primitives.js',
                'src/timer.js',
                'src/sprite.js',
                'src/entity.js',
                'src/tile.js',
                'src/grid.js',
                'src/unit.js',
                'src/character.js',
                'src/projectile.js',
                'src/scene.js',
                'src/battle.js'
            ]
        },

        concat: {

            dist: {
                src: [
                    '<banner:meta.banner>', 
                    './libs/**/*.js',
                    '<config:lint.files>'],
                dest: './tilekit.js'
            }

        },

        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: './tilekit.min.js'
            }
        },

        mocha: {
            all: "test/index.html"
        },

        watch: {

            source: {
                files: ['./grunt.js', '<config:lint.files>'],
                tasks: 'lint concat min'
            }

        },

        jshint: config.jshint

    });

    // Default task.
    grunt.registerTask('default', 'lint concat min');
    grunt.loadNpmTasks('grunt-mocha');

};
