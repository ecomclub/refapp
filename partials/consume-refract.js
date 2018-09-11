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
