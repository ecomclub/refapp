const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const pump = require('pump')
const gulpSequence = require('gulp-sequence')
const rename = require('gulp-rename')

// watch JS and html files
gulp.task('serve', function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: './'
    },
    middleware: function (req, res, next) {
      // redirect home to sample folder
      if (req.url === '/') {
        res.writeHead(301, { Location: '/sample/' })
        res.end()
      } else {
        return next()
      }
    }
  })
  gulp.watch([ './sample/*.html', './main.js' ]).on('change', reload)
})

gulp.task('concat', function () {
  // concat main and partials
  return gulp.src([
    './partials/refract-query/src/browser-vanilla.js',
    './main.js'
  ])
  .pipe(concat('refapp.js'))
  .pipe(gulp.dest('./dist/'))
})

gulp.task('compress', function (cb) {
  // compress file
  pump([
    gulp.src('./dist/refapp.js'),
    uglify(),
    rename({ suffix: '.min' }),
    gulp.dest('./dist/')
  ], cb)
})

gulp.task('dist', gulpSequence('concat', 'compress'))
