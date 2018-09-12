/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

 (function ($) {
   'use strict'

   var platform = function () {
     // returns DOM element
     return $('<div>', {
       'class': 'container-fluid d-none',
       html: $('<div>', {
         'class': 'row',
         html: [
           $('<header>', {
           })
         ]
       })
     })
   }

   // set globally
   window.apiConsole = platform
 }(jQuery))
