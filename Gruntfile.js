module.exports = function(grunt) {
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.initConfig({
		jshint: {
			options: {
				'smarttabs': true
			},
			all: ['Gruntfile.js', 'package.json', 'data/geoJSON/WhereWeWalk_*']
		}	
	});
	grunt.registerTask('default', 'jshint');	
};