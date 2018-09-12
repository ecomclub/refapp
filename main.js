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
  $.fn.refapp = function (refracts, Options) {
    var $app = this
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
      var processRefract = function (data) {
        var refract = data

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
      }

      // count ended requests
      var todo = refracts.length
      var done = 0
      var ajaxCb = function () {
        done++
        if (done === todo) {
          // update DOM
          $app.html($('<div>', {
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
      }

      var invalidSource = function (jqxhr, textStatus, err) {
        // AJAX error
        alert('Cannot GET Refract JSON: ' + textStatus)
        console.error(err)
      }

      for (var i = 0; i < refracts.length; i++) {
        if (typeof refracts[i] === 'object' && refracts[i] !== null) {
          // try to GET JSON file
          var url = refracts[i].src
          if (typeof url === 'string' && url !== '') {
            $.getJSON(url, processRefract)
              .fail(invalidSource)
              .always(ajaxCb)
            // next fragment
            continue
          }
        }
        // something is wrong
        ajaxCb()
        console.error(new Error('Invalid object on refracts array (' + i + '), ignored'))
      }
    }
  }
}(jQuery))
