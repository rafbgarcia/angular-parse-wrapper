module.exports = function(grunt) {
  grunt.initConfig({
    karma: {
      options: {
        configFile: 'karma.conf.js',
      },
      unit: {},
      travis: {
        singleRun: true,
        browsers: ['Firefox']
      },
    }
  });

  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['karma:unit']);

  grunt.registerTask('default', ['test']);
};