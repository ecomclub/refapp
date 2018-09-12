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
    var i, doIfDeep

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

            doIfDeep = function () {
              // create new deeper list for subresources
              var $ul = $('<ul>', {
                'class': 'list-unstyled'
              })
              $li.append($ul)
              // new block for category
              var $div = $('<div>', {
                'class': 'mb-5'
              })
              $body.append($div)
              // change body and list DOM elements
              $body = $div
              $list = $ul
            }
          }
          break

        case 'transition':
          // new card block to API request
          var $card = $('<div>', {
            'class': 'card-body',
            html: '<h5 class="card-title">' + elementMeta(refract, 'title') + '</h5>'
          })
          $body.append($('<a>', {
            href: '#',
            'class': 'mt-2 card',
            html: $card
          }))

          doIfDeep = function () {
            // change body DOM element
            $body = $card
          }
          break

        case 'httpRequest':
          // treat API Element attributes
          var attr = refract.attributes
          if (typeof attr === 'object' && attr !== null) {
            var method = attr.method
            var color
            switch (method) {
              case 'POST':
                color = 'success'
                break
              case 'PATCH':
                color = 'warning'
                break
              case 'PUT':
                color = 'secondary'
                break
              case 'DELETE':
                color = 'danger'
                break
              case 'GET':
                color = 'info'
                break
              default:
                color = 'light'
            }

            // styling action card
            $body.parent().addClass('text-white bg-' + color)
              // show request method
              .find('h3,h4,h5').append($('<small>', {
                'class': 'text-monospace ml-1 float-right',
                text: method
              }))
          }
          break

        case 'parseResult':
          if (Array.isArray(content)) {
            // fix root API Element
            return content[0]
          }
      }
    }

    // check each child element one by one
    if (Array.isArray(content) && content.length) {
      if (doIfDeep) {
        doIfDeep()
      }
      // create new deeper list for subresources
      for (i = 0; i < content.length; i++) {
        // recursion
        consume(content[i], options, $body, $list)
      }
    }

    // all done
    return null
  }

  // set globally
  window.consumeRefract = consume
  // window.apiElementMeta = elementMeta
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
  $.fn.refapp = function (refracts, Options) {
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

    // get each refract fragment
    if (Array.isArray(refracts)) {
      var processRefract = function (refract) {
        // reset DOM
        $ol.fadeOut(199, function () {
          $(this).html('')
        })
        $article.fadeOut(200, function () {
          $(this).html('')

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
            /*
            if (!options.apiTitle) {
              // try to set API title
              options.apiTitle = apiElementMeta(refract, 'title')
            }
            */
          }

          // show content again
          $article.fadeIn()
          $ol.fadeIn()
          // set links to new browser tab
          $article.find('a').filter(function () {
            return $(this).attr('href').charAt(0) !== '#'
          }).attr('target', '_blank')
        })
      }

      var requestFailed = function (jqxhr, textStatus, err) {
        // AJAX error
        alert('Cannot GET Refract JSON: ' + textStatus)
        console.error(err)
      }

      var getRefract = function (i) {
        // try to GET JSON file
        var url = refracts[i].src
        if (typeof url === 'string' && url !== '') {
          $.getJSON(url, processRefract)
            .fail(requestFailed)
        } else {
          console.error(new Error('Invalid or undefined src string on refract (' + i + '), ignored'))
        }
      }

      var started = false
      // list all fragments
      for (var i = 0; i < refracts.length; i++) {
        if (typeof refracts[i] === 'object' && refracts[i] !== null) {
          if (!started) {
            // start with the first refract fragment
            getRefract(i)
            started = true
          }
          var title = refracts[i].title
          if (title) {
            $aside.append($('<button>', {
              'class': 'btn btn-light btn-block btn-sm',
              text: title,
              click: (function (i) {
                // local i
                return function () {
                  getRefract(i)
                }
              }(i))
            }))
          }
        }
      }
    }

    // optional API title on sidebar
    if (options.apiTitle) {
      $aside.prepend($('<h5>', {
        'class': 'mb-4',
        text: options.apiTitle
      }))
    }

    var $Collapse = function ($menu, btnText, elId) {
      // create collapsable elements for navs
      return [
        $('<a>', {
          'class': 'btn btn-xl btn-outline-primary btn-block d-md-none',
          'data-toggle': 'collapse',
          'aria-expanded': 'false',
          'aria-control': elId,
          href: '#' + elId,
          role: 'button',
          html: '<i class="ti-angle-down mr-1"></i> ' + btnText
        }),
        $('<div>', {
          'class': 'collapse d-md-block pt-3 pt-md-0',
          id: elId,
          html: $menu
        })
      ]
    }

    // random base ID for elements
    var elId = Math.floor(Math.random() * (9999 - 1000)) + 1000

    // update DOM
    this.html([
      $('<div>', {
        'class': 'container',
        // compose Reference App layout
        html: $('<div>', {
          'class': 'row',
          html: [
            $('<div>', {
              'class': 'order-md-1 col-md-3 col-xl-2 pt-4 ref-sidebar',
              html: $Collapse($aside, 'API Resources', 'ref-sidebar-' + elId)
            }),
            $('<div>', {
              'class': 'order-md-3 col-md-2 pt-4 ref-anchors',
              html: $Collapse($ol, 'Content', 'ref-anchors-' + elId)
            }),
            $('<div>', {
              'class': 'order-md-2 col px-5 ref-body',
              html: $article
            })
          ]
        })
      })
    ])
  }
}(jQuery))
