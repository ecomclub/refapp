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
