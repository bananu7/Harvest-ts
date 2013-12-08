'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-typescript');

    var harvestConfig = {
        app: 'Harvest-ts',
        dist: 'dist'
    };

    grunt.initConfig({
        harvest: harvestConfig,
        pkg: grunt.file.readJSON('package.json'),
        typescript: {
            base: {
                src: ['<%= harvest.app %>/**/*.ts'],
                dest: '',
                target: 'es5'
            },
            dist: {
                src: ['<%= harvest.app %>/**/*.ts'],
                dest: 'dist',
                target: 'es5'
            }
        },
        connect: {
            options: {
                port: 9001,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, harvestConfig.app)
                        ];
                    }
                }
            }
        },
        watch: {
            typescript: {
                files: ['<%= harvest.app %>/{,*/}*.ts'],
                tasks: ['typescript:base']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= harvest.app %>/{,*/}*.js',
                    '<%= harvest.app %>/{,*/}*.html',
                    '<%= harvest.app %>/{,*/}*.css'
                ]
            }
        }
    });


    // Default task(s).
    grunt.registerTask('server', ['typescript:base', 'connect:livereload', 'watch']);
    grunt.registerTask('build', []); // @TODO
    grunt.registerTask('default', ['server']);
};