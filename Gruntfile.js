'use strict';

module.exports = function(grunt){

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // configurable applicaton paths
  var config = {
        src: 'src'
      };

  grunt.initConfig({
    // App configuraiotn
    yeoman: config,

    // Local development server
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function(connect){
            return [
              connect().use('/libs', connect.static(config.src + '/../libs')),
              connect.static(config.src)
            ];
          }
        }
      }
    },

    // Watches for changes in defined files and execute tasks on change
    watch: {
      js: {
        files: ['<%= yeoman.src %>/**/*'],
        tasks: [],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      }
    }
  });

  // Launch local development server
  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });
};
