/*global module:false */
module.exports = function(grunt) {
	'use strict';

	var pkg = grunt.file.readJSON( 'package.json' );
	// Project configuration.
	grunt.initConfig({
		pkg: pkg,

		clean: {
			dist: {
				src: ['dist/*']
			}
		},

		copy: {
			dist: {
				files : [{
					expand: true,
					dot: true,
					flatten: true,
					src: [ 'css/anythingzoomer.css', 'js/jquery.anythingzoomer.js' ],
					dest: 'dist/'
				}]
			}
		},

		jshint: {
			core: {
				options: {
					"jquery": true,
					"browser": true
				},
				src: [ 'js/jquery.*.js' ]
			}
		},

		cssmin: {
			target: {
				files: [{
					expand: true,
					flatten: true,
					src: ['css/*.css'],
					dest: 'dist/',
					ext: '.min.css'
				}]
			}
		},

		uglify: {
			options: {
				preserveComments: function( node, comment ) {
					return /^!/.test( comment.value );
				},
				report: 'gzip'
			},
			dist: {
				files: [{
					expand: true,
					cwd: '',
					src: [ 'js/*.js' ],
					dest: 'dist/',
					ext: '.min.js',
					extDot: 'last',
					flatten: true
				}]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Default task.
	grunt.registerTask('default', [
		'clean',
		'jshint',
		'copy',
		'cssmin',
		'uglify',
		'updateManifest'
	]);

	// update files version in other json files to match the package.json version
	grunt.registerTask( 'updateManifest', function() {
		var i, project,
			projectFile = [ 'anythingzoomer.jquery.json' ],
			len = projectFile.length;
		for ( i = 0; i < len; i++ ) {
			if ( !grunt.file.exists( projectFile[ i ] ) ) {
				grunt.log.error( 'file ' + projectFile[ i ] + ' not found' );
				return true; // return false to abort the execution
			}
			project = grunt.file.readJSON( projectFile[ i ] ); // get file as json object
			project.version = pkg.version;
			grunt.file.write( projectFile[i], JSON.stringify( project, null, 2 ) ); // serialize it back to file
		}
	});

};
