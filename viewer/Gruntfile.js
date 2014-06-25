module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        },

        coffee: {
            compile: {
                files: {
                    'OverlappingMarkerSpiderfier.js': 'bower_components/Leaflet.OverlappingMarkerSpiderfier/lib/oms.coffee'
                }
            }
        },

        clean: {
            coffee: [ 'OverlappingMarkerSpiderfier.js' ]
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.no-header.js': ['dist/angular-leaflet-directive.js']
                }
            }
        },

        jshint: {
            options: {
                node: true,
                browser: true,
                esnext: true,
                bitwise: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                newcap: true,
                noarg: true,
                regexp: true,
                undef: true,
                unused: true,
                trailing: true,
                smarttabs: true,
                globals: {
                    angular: false,
                    L: false,
                    moment: false,
                    OverlappingMarkerSpiderfier: false
                }
            },
            source: {
                src: [ 'adjust/*.js', 'animate/*.js', 'services/*.js' ]
            },
            grunt: {
                src: [ 'Gruntfile.js' ]
            }
        },

        bower: {
            install: {
              //  options: {
              //      targetDir: './bower_components',
              //      cleanup: true
              //  }
            }
        },

        less: {
            development: {
                files: {
                    "css/style.css": "css/style.less"
                }
            }
        },

        concat: {
            app: {
                src: [
                    'index.js',
                    'services/*.js'
                ],
                dest: 'ozma-geojson-viewer.js'
            },
            dependencies_js: {
                src: [
                    'bower_components/jquery/dist/jquery.js',
                    'bower_components/leaflet/dist/leaflet.js',
                    'bower_components/angular/angular.js',
                    'bower_components/bootstrap/dist/js/bootstrap.js',
                    'bower_components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
                    'bower_components/Leaflet.GeometryUtil/dist/leaflet.geometryutil.js',
                    'bower_components/Leaflet.PolylineDecorator/leaflet.polylineDecorator.js',
                    'bower_components/Leaflet.awesome-markers/dist/leaflet.awesome-markers.js',
                    'bower_components/Leaflet.draw/dist/leaflet.draw.js',
                    'bower_components/moment/moment.js',
                    'OverlappingMarkerSpiderfier.js',
                    'Leaflet.NumberedMarkerIcon.js'
                ],
                dest: 'ozma-depends.js'
            },
            dependencies_css: {
                src: [
                    'bower_components/Leaflet.draw/dist/leaflet.draw.css',
                    'bower_components/leaflet/dist/leaflet.css',
                    'bower_components/bootstrap/css/bootstrap.css'
                ],
                dest: 'ozma-depends.css'
            }
        },

        watch: {
            options : {
                livereload: 7777
            },
            build: {
                files: [ 'index.js', 'services/*.js', 'bower_components/*', 'Gruntfile.js' ],
                tasks: [
                    'jshint',
                    'coffee',
                    'concat:dependencies_js',
                    'concat:dependencies_css',
                    'concat:app',
                    'clean:coffee'
                ]
            },
            dev: {
                files: [
                    'services/*.js',
                    'adjust/*.js',
                    'animate/*.js',
                    'bower_components/',
                    'Gruntfile.js',
                    'css/style.less'
                ],
                tasks: [ 'coffee', 'less', 'jshint' ]
            }
        }
    });

    //installation-related
    grunt.registerTask('install', [ 'bower:install' ]);

    //defaults
    grunt.registerTask('default', 'watch:dev' );

    grunt.registerTask('build', [
        'jshint',
        'coffee',
        'concat:dependencies_js',
        'concat:dependencies_css',
        'concat:app',
        'clean:coffee'
    ]);

};
