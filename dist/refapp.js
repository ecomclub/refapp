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
  var query = function (element, elementQuery, noDeep) {
    if (typeof element !== 'object' || element === null || !Array.isArray(element.content)) {
      return []
    }

    var results = []
    // find elements
    for (var i = 0; i < element.content.length; i++) {
      var el = element.content[i]
      // test query at the current level
      var skip = !find(el, elementQuery)
      if (!skip) {
        // matched
        results.push(el)
      }

      if (!noDeep) {
        // go deep
        var nested = query(el, elementQuery)
        for (var ii = 0; ii < nested.length; ii++) {
          results.push(nested[ii])
        }
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

  // function to parse Markdown to HTML
  var mdParser

  var textContent = function (element) {
    // returns paragraphs from API Element
    // current level only, noDeep = true
    var elements = refractQuery(element, { element: 'copy' }, true)
    var md = ''
    // concat Markdown strings
    for (var i = 0; i < elements.length; i++) {
      md += elements[i].content
    }
    if (typeof mdParser === 'function') {
      // parse to HTML
      return mdParser(md)
    } else {
      return md
    }
  }

  // setup as jQuery plugin
  $.fn.refapp = function (refract, Options) {
    // @TODO: refract to refracts (work with refract fragments)
    var i
    // default options object
    var options = {
      // styles
      asideClasses: '',
      articleClasses: '',
      olClasses: ''
    }
    if (Options) {
      Object.assign(options, Options)
      if (options.mdParser) {
        // set parser
        mdParser = options.mdParser
      }
    }

    // create DOM elements
    // main app Components
    var $aside = $('<aside>', {
      'class': options.asideClasses
    })
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $ol = $('<ol>', {
      'class': options.olClasses
    })

    // console.log(this)
    // console.log(refract)

    // start treating Refract JSON (Drafter output)
    // API Elements format
    /* Reference
    https://github.com/apiaryio/drafter
    https://api-elements.readthedocs.io/en/latest/
    */
    var elements, elementQuery, resourceGroups

    // set root API Element
    elementQuery = { element: 'category', meta: { classes: 'api' } }
    elements = refractQuery(refract, elementQuery)
    if (elements.length) {
      refract = elements[0]
      if (!options.apiTitle && refract.meta.title !== '') {
        // set API title
        options.apiTitle = refract.meta.title
      }
      $aside.append('<h5>' + options.apiTitle + '</h5>')
    }

    // get main level paragraphs
    var html = textContent(refract)
    if (html !== '') {
      $article.append('<div class="mt-3">' + html + '</div>')
    }

    // list resource groups
    elementQuery = { element: 'category', meta: { classes: 'resourceGroup' } }
    resourceGroups = refractQuery(refract, elementQuery)
    if (resourceGroups.length) {
      // list and link resources
      var $list = []
      // create block elements for each resource
      var $divs = []

      for (i = 0; i < resourceGroups.length; i++) {
        var name = resourceGroups[i].meta.title
        var id = name
        // list element
        $list.push($('<li>', {
          html: $('<a>', {
            href: '#' + id,
            text: name
          })
        }))

        // resource block
        $divs.push($('<div>', {
          'class': 'mt-3',
          html: [
            $('<h2>', {
              id: id,
              text: name
            }),
            '<hr>',
            // get resource level paragraphs
            textContent(resourceGroups[i])
          ]
        }))
      }

      // add list elements to right side ul
      $ol.append($list)
      // add collapse elements to article
      $article.append($divs)
    }

    // update DOM
    this.html($('<div>', {
      'class': 'container',
      // compose Reference App layout
      html: $('<div>', {
        'class': 'row',
        html: [
          $('<div>', {
            'class': 'col-md-3 col-xl-2 pt-3 ref-sidebar',
            html: $aside
          }),
          $('<div>', {
            'class': 'col pb-3 px-5 ref-body',
            html: $article
          }),
          $('<div>', {
            'class': 'col-md-2 d-none d-md-flex pt-3 ref-anchors',
            html: $ol
          })
        ]
      })
    }))
  }
}(jQuery))
