/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

 (function ($) {
   'use strict'

   var platform = function () {
     // returns DOM element
     return $('<section>', {
       'class': 'bg-light',
       css: {
         height: '100vh',
         position: 'absolute',
         top: 0,
         display: 'none',
         width: '100%'
       },
       html: [
         // API endpoint bar
         $('<header>', {
           'class': 'fixed-top'
         }),

         // App body
         $('<div>', {
           'class': 'container',
           html: $('<div>', {
             'class': 'row',
             html: []
           })
         })
       ]
     })
   }

   // set globally
   window.apiConsole = platform
 }(jQuery))
