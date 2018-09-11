/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  var elementMeta = function (element, prop) {
    // metadata from API Element object
    if (typeof element === 'object' && element !== null) {
      var meta = element.meta
      if (typeof meta === 'object' && meta !== null) {
        // valid meta object
        if (!prop) {
          return meta
        } else if (meta[prop]) {
          if (Array.isArray(meta[prop])) {
            // returns first array element
            return meta[prop][0]
          } else {
            return meta[prop]
          }
        }
      }
    }

    // not found
    if (prop) {
      return ''
    } else {
      // empty object
      return {}
    }
  }

  var consume = function (refract, options, $body, $list) {
    // check refract object
    if (typeof refract === 'object' && refract !== null) {
      // treat API Element object
      // Ref.: https://api-elements.readthedocs.io/en/latest/element-definitions.html
      var type = refract.element
      var content = refract.content
      switch (type) {
        case 'copy':
          if (typeof content === 'string') {
            // Markdown string
            // append to parent body element
            $body.append('<div class="pb-2">' + options.mdParser(content) + '</div>')
          }
          break

        case 'category':
        case 'resource':
          var className = elementMeta(refract, 'classes')
          var title = elementMeta(refract, 'title')
          var id = title.toLowerCase().replace(/\s/g, '-')
          var $li
          if (title !== '') {
            // show category title
            var head
            switch (className) {
              case 'api':
                head = 1
                break
              case 'resourceGroup':
                head = 2
                break
              default:
                head = 3
            }

            // add title to body DOM
            $body.append($('<h' + head + '>', {
              'class': 'my-3',
              html: $('<a>', {
                'class': 'anchor-link text-body',
                href: '#' + id,
                text: title
              }),
              id: id
            }))
            if (head <= 2) {
              $body.append('<hr>')
            }

            $li = $('<li>', {
              html: $('<a>', {
                href: '#' + id,
                text: title
              })
            })
            // add to anchors list
            $list.append($li)
          }

          // check each child element one by one
          if (Array.isArray(content) && content.length) {
            // create new deeper list for subresources
            var $ul = $('<ul>')
            $li.append($ul)
            // new block for category
            var $div = $('<div>', {
              'class': 'mb-5'
            })
            $body.append($div)
            for (var i = 0; i < content.length; i++) {
              // recursion
              consume(content[i], options, $div, $ul)
            }
          }

          // treat API Element attributes
          var attr = refract.attributes
          if (attr) {
            // console.log(attr)
          }
          break

        case 'transition':
          // button to API request
          var $btn = $('<button>', {
            'class': 'mt-2 btn btn-lg btn-block btn-primary',
            text: elementMeta(refract, 'title')
          })
          $body.append($btn)
          break

        case 'parseResult':
          if (Array.isArray(content)) {
            // fix root API Element
            return content[0]
          }
      }
    }

    // all done
    return null
  }

  // set globally
  window.consumeRefract = consume
  window.apiElementMeta = elementMeta
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
            'class': 'col-md-3 col-xl-2 pt-4 ref-sidebar',
            html: $aside
          }),
          $('<div>', {
            'class': 'col px-5 ref-body',
            html: $article
          }),
          $('<div>', {
            'class': 'col-md-2 d-none d-md-flex pt-4 ref-anchors',
            html: $ol
          })
        ]
      })
    }))
  }
}(jQuery))
