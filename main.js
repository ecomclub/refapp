/**
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
    $article.append(textContent(refract))

    // list resource groups
    elementQuery = { element: 'category', meta: { classes: 'resourceGroup' } }
    resourceGroups = refractQuery(refract, elementQuery)
    if (resourceGroups.length) {
      // list and link resources
      var $list = []
      // create block elements for each resource
      var $cards = []

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

        // resource card block
        var $cardBody = $('<div>', {
          'class': 'card-body',
          // get resource level paragraphs
          html: textContent(resourceGroups[i])
        })
        $cards.push($('<div>', {
          'class': 'card mt-5',
          html: [
            $('<h5>', {
              'class': 'card-header',
              id: id,
              text: name
            }),
            $cardBody
          ]
        }))
      }

      // add list elements to right side ul
      $ol.append($list)
      // add collapse elements to article
      $article.append($cards)
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
            'class': 'col py-3 px-5 ref-body',
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
