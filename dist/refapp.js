/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  // save request samples
  var req = {}
  var res = {}

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

  var handleHeaders = function (headers, obj) {
    // request or response HTTP headers
    // parse to array of nested objects
    // { key: value }
    if (typeof headers === 'object') {
      headers = headers.content
      if (Array.isArray(headers)) {
        // reset
        obj.headers = {}
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i]
          try {
            obj.headers[header.content.key.content] = header.content.value.content
          } catch (e) {
            console.error('Malformed HTTP header object', header, e)
          }
        }
      }
    }
  }

  var consume = function (refract, options, $body, $list, parent) {
    var i, doIfDeep, className

    // check refract object
    if (typeof refract === 'object' && refract !== null) {
      // treat API Element object
      // Ref.: https://api-elements.readthedocs.io/en/latest/element-definitions.html
      var type = refract.element
      var content = refract.content
      // API Element attributes
      var attr = refract.attributes

      if (type !== 'httpResponse') {
        // treat attributes first
        if (typeof attr === 'object' && attr !== null) {
          if (typeof attr.method === 'string') {
            req.method = attr.method
          }
          if (typeof attr.href === 'string') {
            // endpoint pattern
            req.href = attr.href
          }
          if (attr.headers) {
            // request HTTP headers
            handleHeaders(attr.headers, req)
          }

          if (attr.hrefVariables) {
            // URL params
            // parse to array of nested objects
            // { key, type, value, description, required }
            var params = attr.hrefVariables
            if (typeof params === 'object') {
              params = params.content
              if (Array.isArray(params)) {
                // reset
                req.params = []
                for (i = 0; i < params.length; i++) {
                  var param = params[i]
                  try {
                    var paramObject = {
                      key: param.content.key.content,
                      // boolean required
                      required: !(param.attributes.typeAttributes[0] === 'optional')
                    }
                    if (param.content.value) {
                      paramObject.value = param.content.value.content
                    } else {
                      paramObject.value = ''
                    }
                    // optional param type and description
                    if (param.meta) {
                      paramObject.type = param.meta.title || ''
                      paramObject.description = param.meta.description || ''
                    } else {
                      paramObject.type = paramObject.description = ''
                    }

                    // add to request params
                    req.params.push(paramObject)
                  } catch (e) {
                    console.error('Malformed URL param object', param, e)
                  }
                }
              }
            }
          }
        }

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
            className = elementMeta(refract, 'classes')
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
              href: 'javascript:;',
              'class': 'mt-2 card',
              html: $card,
              // send request and response objects
              click: (function (req, res) {
                return function () { options.actionCallback(req, res) }
              }(req, res))
            }))

            doIfDeep = function () {
              // change body DOM element
              $body = $card
            }
            break

          case 'httpRequest':
            if (req.method) {
              var color
              switch (req.method) {
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
                  text: req.method
                }))
            }
            break

          case 'asset':
            if (typeof content === 'string') {
              // body content
              var obj
              switch (parent) {
                case 'httpRequest':
                  // request body string
                  obj = req
                  break
                case 'httpResponse':
                  // response body
                  obj = res
                  break
              }
              if (obj) {
                className = elementMeta(refract, 'classes')
                if (className === 'messageBodySchema') {
                  // JSON Schema
                  obj.schema = content
                } else {
                  obj.body = content
                }
              }
            }
            break

          case 'parseResult':
            if (Array.isArray(content)) {
              // fix root API Element
              return content[0]
            }
        }
      } else {
        // sample response
        if (attr.headers) {
          // response HTTP headers
          handleHeaders(attr.headers, res)
        } else {
          // no headers
          res.headers = []
        }

        // HTTP status
        if (attr.statusCode) {
          res.status = parseInt(attr.statusCode, 10)
        } else {
          res.status = 200
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
          consume(content[i], options, $body, $list, type)
        }
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
      // parse Markdown to HTML
      mdParser: function (md) { return md },
      // optional callback function for loaded refracts
      refractCallback: null,
      // callback function for endoint actions
      actionCallback: function (req, res) { console.log(req, res) }
    }
    if (Options) {
      Object.assign(options, Options)
    }

    // create DOM elements
    // main app Components
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $list = $('<div>', {
      'class': 'list-group my-3 ref-resources'
    })
    var $ol = $('<ol>', {
      'class': 'my-3 ref-anchors'
    })
    var $aside = $('<aside>', {
      'class': options.asideClasses,
      html: [
        '<h5>Reference</h5>',
        $list,
        '<h5>Summary</h5>',
        $ol
      ]
    })

    // console.log(this)
    // console.log(refract)

    // get each refract fragment
    if (Array.isArray(refracts)) {
      var processRefract = function (refract) {
        if (typeof options.refractCallback === 'function') {
          // send refract object
          options.refractCallback(refract)
        }

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
            var attr = $(this).attr('href')
            return (attr.charAt(0) !== '#' && attr !== 'javascript:;')
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
          $.getJSON(url, function (data) { processRefract(data) })
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
            var $resource = $('<a>', {
              'class': 'list-group-item list-group-item-action',
              href: 'javascript:;',
              text: title,
              click: (function (i) {
                // local i
                return function () {
                  // clear last active
                  $list.find('a.active').removeClass('active')
                  $(this).addClass('active')
                  getRefract(i)
                }
              }(i))
            })

            // add resource to list DOM
            $list.append($resource)
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
    // create collapsable elements for navs
    var divId = 'ref-anchors-' + elId
    $aside.addClass('collapse d-md-block').attr('id', divId)
    var $sidebar = [
      $('<a>', {
        'class': 'btn btn-xl btn-outline-primary btn-block d-md-none mb-3',
        'data-toggle': 'collapse',
        'aria-expanded': 'false',
        'aria-control': divId,
        href: '#' + divId,
        role: 'button',
        html: '<i class="ti-angle-down mr-1"></i> Content'
      }),
      $aside
    ]

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
            'class': 'col-md-5 col-xl-4 ref-sidebar',
            html: [
              $('<section>', {
                'class': 'mr-md-3 mr-ml-4 mr-lg-5 px-4 px-lg-5 py-4 sticky-top',
                html: $sidebar
              })
            ]
          }),
          $('<div>', {
            'class': 'col-md-7 col-xl-8 ref-body',
            html: body
          })
        ]
      })
    }))
  }
}(jQuery))
