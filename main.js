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
    var i
    if (!options) {
      // default empty options object
      options = {}
    }

    // create DOM elements
    // main app Components
    var $aside = $('<aside>', {
      'class': ''
    })
    var $article = $('<article>', {
      'class': ''
    })
    var $ul = $('<ul>', {
      'class': ''
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

    // get API title
    elementQuery = { element: 'category', meta: { classes: 'api' } }
    elements = refractQuery(refract, elementQuery)
    if (elements.length) {
      // set root API Element
      refract = elements[0]
      $aside.append($('<h4>', {
        text: refract.meta.title
      }))
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

    this.append($('<div>', {
      'class': 'container',
      html: $('<div>', {
        'class': 'row',
        // compose Reference App layout
        html: [
          $('<div>', {
            'class': 'col-md-3 col-xl-2 ref-sidebar',
            html: $aside
          }),
          $('<div>', {
            'class': 'col-md-4 col-xl-5 ref-body',
            html: $article
          }),
          $('<div>', {
            'class': 'col-md-4 col-xl-3 ref-anchors',
            html: $ul
          })
        ]
      })
    }))
  }
}(jQuery))
