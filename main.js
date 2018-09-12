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
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $ol = $('<ol>', {
      'class': 'ref-anchors'
    })
    var $aside = $('<aside>', {
      'class': options.asideClasses,
      html: $ol
    })

    // console.log(this)
    // console.log(refract)

    // get each refract fragment
    if (Array.isArray(refracts)) {
      var processRefract = function (refract) {
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

    var $Collapse = function ($menu, btnText, divClass) {
      // create collapsable elements for navs
      var divId = divClass + '-' + elId
      return [
        $('<a>', {
          'class': 'btn btn-xl btn-outline-primary btn-block d-md-none',
          'data-toggle': 'collapse',
          'aria-expanded': 'false',
          'aria-control': divId,
          href: '#' + divId,
          role: 'button',
          html: '<i class="ti-angle-down mr-1"></i> ' + btnText
        }),
        $('<div>', {
          'class': 'collapse d-md-block pt-3 pt-md-0 ' + divClass,
          id: divId,
          html: $menu
        })
      ]
    }

    // random base ID for elements
    var elId = Math.floor(Math.random() * (9999 - 1000)) + 1000
    // init API platform app
    var $console = apiConsole()
    $console.hide()

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
            'class': 'col-md-3 col-xl-2 pt-4',
            html: $Collapse($aside, 'Content', 'ref-sidebar')
          }),
          $('<div>', {
            'class': 'col-md-9 col-lg-5 col-xl-6 px-md-5 ref-body',
            html: body
          }),
          $('<div>', {
            'class': 'col col-lg-4 ref-console top-fixed bg-dark',
            // API console app
            html: $console
          })
        ]
      })
    }))
  }
}(jQuery))
