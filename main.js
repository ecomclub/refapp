/**
 * refapp
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

// require './partials/refract-query/src/browser-vanilla.js'
/* global refractQuery */

(function ($) {
  'use strict'

  // setup as jQuery plugin
  $.fn.refapp = function (refract, options) {
    // create DOM elements
    // main app Components
    var $aside = $('<aside />', {
      'class': ''
    })

    // compose Reference App layout
    var $sidebar = $('<div />', {
      'class': 'ref-sidebar col-md-4 col-lg-3 col-xl-2 bg-light',
      html: $aside
    })
    var $article = $('<div />', {
      'class': 'ref-article col-md-4 col-lg-5 col-xl-6'
    })
    var $console = $('<div />', {
      'class': 'ref-console col-md-4 bg-dark'
    })

    // console.log(this)
    // console.log(refract)

    // start treating Refract JSON (Drafter output)
    // API Elements format
    /* Reference
    https://github.com/apiaryio/drafter
    https://api-elements.readthedocs.io/en/latest/
    */
    var element, elementQuery
    // API title
    elementQuery = { element: 'category', meta: { classes: 'api' } }
    element = refractQuery(refract, elementQuery)[0]
    $aside.append($('<h2 />', {
      text: element.meta.title
    }))

    this.append($('<div />', {
      'class': 'container',
      html: $('<div />', {
        'class': 'row',
        html: [ $sidebar, $article, $console ]
      })
    }))
  }
}(jQuery))
