module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-screeps');

  grunt.initConfig({
    screeps: {
      dist: {
        src: ['dist/main.js'],
      },
      options: {
        branch: process.env.SCREEPS_BRANCH,
        email: process.env.SCREEPS_EMAIL,
        password: process.env.SCREEPS_PASSWORD,
        ptr: false,
      },
    },
  });
};
