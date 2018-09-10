// Simple version for browser compatibility with vanilla JS
// Original (with Lodash 3): ./index.js

(function () {
  'use strict'

  /**
   * Queries the whole Refract tree and finds a respective
   * element(s) which matches the query.
   */
  var query = function (element, elementQuery) {
    if (typeof element !== 'object' || element === null || !Array.isArray(element.content)) {
      return []
    }

    var results = []
    // find elements
    for (var i = 0; i < element.content.length; i++) {
      var el = element.content[i]
      // go deep
      var nested = query(el, elementQuery)
      for (var ii = 0; ii < nested.length; ii++) {
        results.push(nested[ii])
      }

      var skip = false
      for (var prop in elementQuery) {
        if (elementQuery.hasOwnProperty(prop) && el[prop] !== elementQuery[prop]) {
          skip = true
          break
        }
      }
      if (!skip) {
        // matched
        results.push(el)
      }
    }

    return results
  }

  if (typeof module !== 'undefined' && module.exports) {
    // NodeJS
    module.exports = query
  } else {
    // declare globally
    window.refractQuery = query
  }
}())
;/**
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
