module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      dist: {
        src: ['dist/main.js'],
      },
      options: {
        branch: 'default',
        email: process.env.SCREEPS_EMAIL,
        password: process.env.SCREEPS_PASSWORD,
        ptr: false,
      },
    },
  });
};
