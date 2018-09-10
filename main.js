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

    // compose Reference App layout
    var $sidebar = $('<div>', {
      'class': 'ref-sidebar col-md-3 col-xl-2 bg-light p-3',
      html: $aside
    })
    var $article = $('<div>', {
      'class': 'ref-article col-md-4 col-xl-5 bg-white py-3 px-5'
    })
    var $console = $('<div>', {
      'class': 'ref-console col-md-5 bg-dark py-3 px-5'
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
      var $li = []
      for (i = 0; i < elements.length; i++) {
        $li.push($('<li>', {
          html: $('<a>', {
            href: '#',
            text: elements[i].meta.title
          })
        }))
      }
      // add list element to sidebar
      $sidebar.append($('<ul>', {
        'class': 'list-unstyled',
        html: $li
      }))
    }

    this.append($('<div>', {
      'class': 'container-fluid',
      html: $('<div>', {
        'class': 'row',
        html: [ $sidebar, $article, $console ]
      })
    }))
  }
}(jQuery))
