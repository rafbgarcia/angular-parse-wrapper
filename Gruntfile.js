module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    uglify: {
      options: {
        mangle: false,
        compress: true,
        beautify: false
      },
      js: {
        options: {
          separator: '\n;'
        },
        files: {
          'dist/angular-parse-wrapper.min.js': [
            'src/parse-wrapper.js'
          ]
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('test_unit', ['karma']);
};