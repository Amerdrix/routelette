var gulp = require('gulp')
var ts = require('gulp-typescript')
var pump = require('pump');
var tsProject = ts.createProject('tsconfig.json')

gulp.task('default', function(cb) {
    pump([
         gulp.src('./src/*.ts'),
        tsProject(),
        gulp.dest('dist'),
    ],cb)
})
