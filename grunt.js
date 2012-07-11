/*global module:false*/
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        meta: {
            version: '0.1.0',
            banner: ['/*',
                     ' Tilekit',               
                     '',
                     ' Nate Hunzaker <nate.hunzaker@gmail.com>',
                     ' http://natehunzaker.com',
                     '',
                     '/'].join("\n *") + "\n"

        },

        lint: {
            files: [
                'src/namespace.js',
                'src/helpers.js',
                'src/geo.js',
                'src/primitives.js',
                'src/textbox.js',
                'src/timer.js',
                'src/sprite.js',
                'src/entity.js',
                'src/tile.js',
                'src/grid.js',
                'src/unit.js',
                'src/character.js',
                'src/scene.js',
                'src/**/*.js'
            ]
        },

        concat: {

            dist: {
                src: [
                    '<banner:meta.banner>', 
                    'src/libs/**/*.js',
                    '<config:lint.files>'],
                dest: 'tilekit.js'
            }

        },

        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'tilekit.min.js'
            }
        },

        watch: {
            files: ['./grunt.js', '<config:lint.files>'],
            tasks: 'lint concat min'
        },

        jshint: {

            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true,
                node: true
            },

            globals: {
                jQuery: true,
                $: true,
                console: true
            }
        }

    });

    // Default task.
    grunt.registerTask('default', 'lint concat min');

};
