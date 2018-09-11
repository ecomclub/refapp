// Simple version for browser compatibility with vanilla JS

/*
Original (with Lodash 3):
https://github.com/apiaryio/refract-query/blob/master/src/index.js
*/

/*
Supported element query samples:
elementQuery = { element: 'category' }
elementQuery = { element: 'category', 'meta': { 'classes': 'api' } }
*/

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

      // test query at the current level
      var skip = !find(el, elementQuery)
      if (!skip) {
        // matched
        results.push(el)
      }
    }

    return results
  }

  // set find function for recursion
  var find = function (el, elementQuery) {
    for (var prop in elementQuery) {
      if (elementQuery.hasOwnProperty(prop)) {
        var match = false
        var val = elementQuery[prop]
        var obj = el[prop]

        // check type first
        if (typeof val === 'object' && val !== null) {
          if (typeof obj === 'object' && obj !== null) {
            // try recursion
            match = find(obj, val)
          } else {
            // element has not current property
            return false
          }
        } else {
          // support checking string or number within array
          if (!Array.isArray(obj)) {
            obj = [ obj ]
          }
          for (var i = 0; i < obj.length; i++) {
            if (obj[i] === val) {
              match = true
              break
            }
          }
        }

        if (!match) {
          // not matched
          // does not need to continue
          return false
        }
      }
    }

    // goes here if matched
    return true
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
/* global refractQuery */

(function ($) {
  'use strict'

  // setup as jQuery plugin
  $.fn.refapp = function (refract, Options) {
    var i
    // default options object
    var options = {
      // styles
      asideClasses: '',
      articleClasses: '',
      ulClasses: ''
    }
    if (Options) {
      Object.assign(options, Options)
    }

    // create DOM elements
    // main app Components
    var $aside = $('<aside>', {
      'class': options.asideClasses
    })
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $ul = $('<ul>', {
      'class': options.ulClasses
    })

    // console.log(this)
    // console.log(refract)

    // start treating Refract JSON (Drafter output)
    // API Elements format
    /* Reference
    https://github.com/apiaryio/drafter
    https://api-elements.readthedocs.io/en/latest/
    */
    var elements, elementQuery

    // set root API Element
    elementQuery = { element: 'category', meta: { classes: 'api' } }
    elements = refractQuery(refract, elementQuery)
    if (elements.length) {
      refract = elements[0]
      if (!options.apiTitle) {
        // set API title
        options.apiTitle = refract.meta.title
      }
    }

    // list resource groups
    elementQuery = { element: 'category', meta: { classes: 'resourceGroup' } }
    elements = refractQuery(refract, elementQuery)
    if (elements.length) {
      var $list = []
      for (i = 0; i < elements.length; i++) {
        $list.push($('<li>', {
          html: $('<a>', {
            href: '#',
            text: elements[i].meta.title
          })
        }))
      }
      // add list element to sidebar
      $aside.append($('<ul>', {
        'class': 'list-unstyled',
        html: $list
      }))
    }

    // App body DOM element HTML
    var html = []
    if (options.apiTitle) {
      html.push($('<h2>', {
        text: options.apiTitle
      }), '<hr />')
    }
    html.push($article)

    // update DOM
    this.html($('<div>', {
      'class': 'container',
      // compose Reference App layout
      html: $('<div>', {
        'class': 'row',
        html: [
          $('<div>', {
            'class': 'col-md-3 col-xl-2 border-right pt-3 ref-sidebar',
            html: $aside
          }),
          $('<div>', {
            'class': 'col py-3 px-5 ref-body',
            html: html
          }),
          $('<div>', {
            'class': 'col-md-2 d-none d-md-flex border-left pt-3 ref-anchors',
            html: $ul
          })
        ]
      })
    }))
  }
}(jQuery))
