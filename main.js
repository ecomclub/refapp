/**
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
        'class': 'mb-3',
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
    // init API platform app
    var $console = apiConsole()
    $console.attr('id', 'api-console-' + elId)

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
      }),
      // API console app
      $console
    ])
  }
}(jQuery))
