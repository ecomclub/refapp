const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

// watch JS and html files
gulp.task('serve', function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: './',
      index: './sample/index.html'
    }
  })
  gulp.watch('*.html').on('change', reload)
  gulp.watch('./main.js').on('change', reload)
})
