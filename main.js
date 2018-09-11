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
  $.fn.refapp = function (refract, Options) {
    // @TODO: refract to refracts (work with refract fragments)
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
      html.push('<h2>' + options.apiTitle + '</h2><hr>')
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
