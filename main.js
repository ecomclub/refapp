/**
 * refapp
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  // require 'partials/consume-refract.js'
  /* global consumeRefract */
  /* global apiElementMeta */

  // setup as jQuery plugin
  $.fn.refapp = function (refract, Options) {
    // @TODO: refract to refracts (work with refract fragments)
    // default options object
    var options = {
      // styles
      asideClasses: '',
      articleClasses: '',
      olClasses: '',
      // parse Markdown to HTML
      mdParser: function (md) { return md }
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

    // consume refract tree
    while (refract) {
      // root API Element fixed
      refract = consumeRefract(refract, options, $article, $ol)
      if (!options.apiTitle) {
        // try to set API title
        options.apiTitle = apiElementMeta(refract, 'title')
      }
    }
    if (options.apiTitle !== '') {
      $aside.append('<h5>' + options.apiTitle + '</h5>')
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
