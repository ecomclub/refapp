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

    // App DOM element HTML
    var html = []
    if (options.apiTitle) {
      html.push('<h2>' + options.apiTitle + '</h2>')
    }
    // compose Reference App layout
    html.push($('<div>', {
      'class': 'row pt-3',
      html: [
        $('<div>', {
          'class': 'col-md-3 col-xl-2 border-right pt-2 ref-sidebar',
          html: $aside
        }),
        $('<div>', {
          'class': 'col pt-2 ref-body',
          html: $article
        }),
        $('<div>', {
          'class': 'col-md-2 d-none d-md-flex border-left pt-2 ref-anchors',
          html: $ul
        })
      ]
    }))

    // update DOM
    this.html($('<div>', {
      'class': 'container',
      html: html
    }))
  }
}(jQuery))
