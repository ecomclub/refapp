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
            $body.append('<div class="mb-5">' + options.mdParser(content) + '</div>')
          }
          break

        case 'category':
          var className = elementMeta(refract, 'classes')
          var title = elementMeta(refract, 'title')
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
            $body.append([
              $('<h' + head + '>', {
                text: title,
                id: title
              }),
              '<hr>'
            ])
          }

          // check each child element one by one
          if (!Array.isArray(content)) {
            content = [ content ]
          }
          for (var i = 0; i < content.length; i++) {
            // recursion
            consume(content[i], options, $body, $list)
          }
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
