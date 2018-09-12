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
          }

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
  window.apiElementMeta = elementMeta
}(jQuery))
