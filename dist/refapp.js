/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  var consume = function (refract, options, $body, $list) {
    // check refract object
    if (typeof refract !== 'object' || refract === null) {
      return
    }

    // treat API Element object
    // Ref.: https://api-elements.readthedocs.io/en/latest/element-definitions.html
    var type = refract.element
    var content = refract.content
    switch (type) {
      case 'copy':
        if (typeof content === 'string') {
          // Markdown string
          // append to parent body element
          $body.append('<div class="mt-3">' + options.mdParser(content) + '</div>')
        }
        break

      case 'category':
        if (!Array.isArray(content)) {
          content = [ content ]
        }
        // check each content one by one
        for (var i = 0; i < content.length; i++) {
          // recursion
          consume(content[i], options, $body, $list)
        }
        break
    }
  }

  // set globally
  window.consumeRefract = consume
}(jQuery))
;/**
 * refapp
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  // require 'partials/consume-refract.js'
  /* global consumeRefract */

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

    // set root API Element
    if (refract.element === 'parseResult') {
      refract = refract.content[0]
    }
    if (!options.apiTitle) {
      // set API title
      options.apiTitle = refract.meta.title
    }
    if (options.apiTitle !== '') {
      $aside.append('<h5>' + options.apiTitle + '</h5>')
    }
    // consume refract tree
    consumeRefract(refract, options, $article, $ol)

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
