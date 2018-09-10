/**
 * refapp
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require './partials/refract-query/src/browser-vanilla.js'

(function ($) {
  'use strict'

  // setup as jQuery plugin
  $.fn.refapp = function (refract, options) {
    // create DOM elements
    // compose Reference App layout
    var $sidebar = $('<div />', {
      'class': 'ref-sidebar col-md-4 col-lg-3 col-xl-2 bg-light'
    })
    var $article = $('<div />', {
      'class': 'ref-article col-md-4 col-lg-5 col-xl-6'
    })
    var $console = $('<div />', {
      'class': 'ref-console col-md-4 bg-dark'
    })

    this.append($('<div />', {
      'class': 'container',
      html: $('<div />', {
        'class': 'row',
        html: [ $sidebar, $article, $console ]
      })
    }))

    // console.log(this)
    // console.log(refract)

    // start treating Refract JSON (Drafter output)
    // API Elements format
    /* Reference
    https://github.com/apiaryio/drafter
    https://api-elements.readthedocs.io/en/latest/
    */
    var i
    if (typeof refract === 'object' && refract !== null && Array.isArray(refract.content)) {
      for (i = 0; i < refract.content.length; i++) {
        console.log(refract.content[i])
      }
    }
  }
}(jQuery))
