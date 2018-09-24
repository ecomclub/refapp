/**
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
    // main DOM element
    var $app = this
    // default options object
    var options = {
      // styles
      asideClasses: '',
      articleClasses: '',
      // base URL hash
      baseHash: '/',
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

    // random base ID for elements
    var elId = Math.floor(Math.random() * (9999 - 1000)) + 1000

    // create DOM elements
    // main app Components
    var $article = $('<article>', {
      'class': options.articleClasses
    })
    var $list = $('<div>', {
      'class': 'list-group my-3 mr-md-5 pr-lg-3 pr-xl-5 ref-resources'
    })
    var $resources = []
    var $ol = $('<ol>', {
      'class': 'ref-anchors'
    })
    var $aside = $('<aside>', {
      'class': options.asideClasses,
      html: [
        '<h5>Summary</h5>',
        $ol,
        '<h5>Reference</h5>',
        $list
      ]
    })

    // console.log(this)
    // console.log(refract)

    // current resource anchor
    var currentAnchor, waitingHash
    $(window).on('hashchange', function () {
      if (currentAnchor && !(new RegExp('^#' + currentAnchor).test(location.hash))) {
        // resource changed
        // try to route
        route()
      }
    })

    var route = function () {
      var hash = location.hash
      if (hash.slice(2).indexOf('/') === -1) {
        // should have at least one bar
        window.location.hash = hash + '/'
        return route()
      }

      // test refract fragment route
      for (var i = 0; i < $resources.length; i++) {
        var $link = $resources[i]
        if (new RegExp('^#' + $link.data('anchor')).test(hash)) {
          // found
          // save current hash for further update
          waitingHash = hash
          // start routing
          $link.click()
          return true
        }
      }

      // rewrite Apiary default hashes
      var parts = hash.match(/^#(reference|introduction)(\/.*)$/)
      if (parts) {
        window.location.hash = '#' + parts[2]
        // route again
        return route()
      }

      // not routed
      return false
    }

    // get each refract fragment
    if (Array.isArray(refracts)) {
      var processRefract = function (refract, anchor) {
        if (typeof options.refractCallback === 'function') {
          // send refract object
          options.refractCallback(refract)
        }

        // reset DOM
        $ol.slideUp(200, function () {
          $(this).html('')
          // fade article content
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
              refract = consumeRefract(refract, anchor, options, $article, $ol)
              /*
              if (!options.apiTitle) {
                // try to set API title
                options.apiTitle = apiElementMeta(refract, 'title')
              }
              */
            }

            // show content again
            $article.fadeIn()
            $ol.slideDown('slow', function () {
              if (waitingHash) {
                if (waitingHash !== location.hash) {
                  var $link = $(this).find('a[href="' + waitingHash + '"]')
                  if ($link.length) {
                    setTimeout(function () {
                      // need to call native DOM click()
                      // https://stackoverflow.com/questions/34174134
                      $link[0].click()
                    }, 100)
                  }
                }
                // reset
                waitingHash = null
              }
            })

            // set links to new browser tab
            $article.find('a').filter(function () {
              var attr = $(this).attr('href')
              return (attr.charAt(0) !== '#' && attr !== 'javascript:;')
            }).attr('target', '_blank')
          })
        })
      }

      var requestFailed = function (jqxhr, textStatus, err) {
        // AJAX error
        alert('Cannot GET Refract JSON: ' + textStatus)
        console.error(err)
      }

      var getRefract = function (i, anchor) {
        // try to GET JSON file
        var url = refracts[i].src
        if (typeof url === 'string' && url !== '') {
          $.getJSON(url, function (data) { processRefract(data, anchor) })
            .fail(requestFailed)
        } else {
          console.error(new Error('Invalid or undefined src string on refract (' + i + '), ignored'))
        }
      }

      // list all fragments
      for (var i = 0; i < refracts.length; i++) {
        if (typeof refracts[i] === 'object' && refracts[i] !== null) {
          var title = refracts[i].title
          if (title) {
            // generate anchor for this recfract fragment
            var anchor = options.baseHash + title.toLowerCase().replace(/\s/g, '-') + '/'

            $resources.push($('<a>', {
              'class': 'list-group-item list-group-item-action',
              href: 'javascript:;',
              text: title,
              'data-anchor': anchor,
              click: (function (i, anchor) {
                // local vars
                return function () {
                  // clear last active
                  $list.find('a.active').removeClass('active')
                  $(this).addClass('active')
                  // update content
                  getRefract(i, anchor)

                  // scroll to top
                  $('html, body').animate({
                    scrollTop: $app.offset().top
                  }, 'slow', 'swing', function () {
                    // update current anchor
                    currentAnchor = anchor
                    // update URL hash
                    window.location.hash = '#' + anchor
                  })
                }
              }(i, anchor))
            }))
          }

          // add resources to list DOM
          $list.append($resources)
        }
      }
    }

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
    $app.html($('<div>', {
      'class': 'container',
      // compose Reference App layout
      html: $('<div>', {
        'class': 'row',
        html: [
          $('<div>', {
            'class': 'col-md-5 col-xl-4 ref-sidebar',
            html: [
              $('<section>', {
                'class': 'py-4 sticky-top',
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

    // first route
    if (!route()) {
      // start with the first refract fragment
      $resources[0].click()
    }
  }
}(jQuery))
