/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

 (function ($) {
   'use strict'

   var platform = function () {
     // create main DOM element
     var $inputUrl = $('<input>', {
       'class': 'form-control',
       type: 'search',
       placeholder: 'Enter request URL'
     })

     // returns DOM element
     return $('<section>', {
       html: [
         // API endpoint bar
         $('<header>', {
           'class': 'navbar navbar-light bg-light fixed-top',
           html: $('<form>', {
             'class': 'container py-1 px-0',
             action: 'javascript:;',
             html: $('<div>', {
               'class': 'input-group',
               html: [
                 $inputUrl,
                 $('<div>', {
                   'class': 'input-group-append',
                   html: [
                     $('<button>', {
                       'class': 'btn btn-outline-secondary',
                       type: 'button',
                       text: 'Params'
                     }),
                     $('<select>', {
                       'class': 'rounded-0 border-left-0 border-right-0 custom-select',
                       html: [
                         $('<option>', {
                           value: 'GET',
                           text: 'GET',
                           selected: true
                         })
                       ]
                     }),
                     $('<button>', {
                       'class': 'btn btn-primary',
                       type: 'submit',
                       text: 'Send'
                     })
                   ]
                 })
               ]
             })
           })
         }),

         // App body
         $('<div>', {
           'class': 'container',
           html: $('<div>', {
             'class': 'row',
             html: []
           })
         })
       ]
     })
   }

   // set globally
   window.apiConsole = platform
 }(jQuery))
;/**
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
              var $ul = $('<ul>')
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
  // require 'partials/api-console.js'
  /* global apiConsole */

  // setup as jQuery plugin
  $.fn.refapp = function (refracts, Options) {
    // default options object
    var options = {
      // styles
      asideClasses: '',
      articleClasses: '',
      // parse Markdown to HTML
      mdParser: function (md) { return md }
    }
    if (Options) {
      Object.assign(options, Options)
    }

    // create DOM elements
    // main app Components
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $ol = $('<ol>', {
      'class': 'ref-anchors'
    })
    var $aside = $('<aside>', {
      'class': options.asideClasses,
      html: [
        '<h2>Resources</h2>',
        $ol
      ]
    })

    // console.log(this)
    // console.log(refract)

    // get each refract fragment
    if (Array.isArray(refracts)) {
      var processRefract = function (refract, $ol) {
        // reset DOM
        $ol.slideUp(199, function () {
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
          $ol.slideDown('slow')
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

      var getRefract = function (i, $ol) {
        // try to GET JSON file
        var url = refracts[i].src
        if (typeof url === 'string' && url !== '') {
          $.getJSON(url, function (data) { processRefract(data, $ol) })
            .fail(requestFailed)
        } else {
          console.error(new Error('Invalid or undefined src string on refract (' + i + '), ignored'))
        }
      }

      var started = false
      // list all fragments
      for (var i = 0; i < refracts.length; i++) {
        if (typeof refracts[i] === 'object' && refracts[i] !== null) {
          var title = refracts[i].title
          if (title) {
            // new children list
            var $ul = $('<ul>')
            var $resource = $('<a>', {
              href: 'javascript:;',
              text: title,
              click: (function (i, $ul) {
                // local i and $ul
                return function () {
                  // clear last active li
                  $ol.find('a.active').removeClass('active').next('ul').slideUp()
                  $(this).addClass('active')
                  getRefract(i, $ul)
                }
              }(i, $ul))
            })

            // add resource to list DOM
            $ol.append($('<li>', {
              html: [
                $resource,
                $ul
              ]
            }))
            if (!started) {
              // start with the first refract fragment
              $resource.click()
              started = true
            }
          }
        }
      }
    }

    // random base ID for elements
    var elId = Math.floor(Math.random() * (9999 - 1000)) + 1000
    // init API platform app
    var $console = apiConsole()
    $console.hide()

    // create collapsable elements for navs
    var divId = 'ref-anchors-' + elId
    var $sidebar = [
      $('<a>', {
        'class': 'btn btn-xl btn-outline-primary btn-block d-md-none',
        'data-toggle': 'collapse',
        'aria-expanded': 'false',
        'aria-control': divId,
        href: '#' + divId,
        role: 'button',
        html: '<i class="ti-angle-down mr-1"></i> Content'
      }),
      $('<div>', {
        'class': 'collapse d-md-block pt-3 pt-md-0',
        id: divId,
        html: $aside
      })
    ]
    // add API console to DOM
    $sidebar.push($console)

    // Reference App body HTML
    var body = []
    // optional API title
    if (options.apiTitle) {
      body.push($('<h1>', {
        'class': 'mt-3 mb-4 text-muted',
        text: options.apiTitle
      }))
    }
    body.push($article)

    // update DOM
    this.html($('<div>', {
      'class': 'container',
      // compose Reference App layout
      html: $('<div>', {
        'class': 'row',
        html: [
          $('<div>', {
            'class': 'col-md-5 col-xl-4 pt-3 ref-sidebar',
            html: $sidebar
          }),
          $('<div>', {
            'class': 'col-md-7 col-xl-8 px-md-5 ref-body',
            html: body
          })
        ]
      })
    }))
  }
}(jQuery))
