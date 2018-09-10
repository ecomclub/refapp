const gulp = require('gulp')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload

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
