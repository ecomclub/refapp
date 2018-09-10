/**
 * refapp
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

(function ($) {
  'use strict'

  // setup as jQuery plugin
  $.fn.refapp = function (refract) {
    // create DOM elements
    // compose Reference App layout
    var $sidebar = $('<div />', { 'class': 'col-4 ref-sidebar' })
    var $article = $('<div />', { 'class': 'col-4 ref-article' })
    var $console = $('<div />', { 'class': 'col-4 ref-console' })

    this.append($('<div />', {
      'class': 'container',
      html: $('<div />', {
        'class': 'row',
        html: [ $sidebar, $article, $console ]
      })
    }))

    console.log(this)
    console.log(refract)
  }
}(jQuery))
