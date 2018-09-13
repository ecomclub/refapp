/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

 (function ($) {
   'use strict'

   var platform = function () {
     // returns DOM element
     return $('<article>', {
       'class': 'bg-light w-100 d-none px-4 py-3',
       css: {
         height: '100vh',
         position: 'absolute',
         top: 0,
         'z-index': 2000
       },
       html: [
         // API endpoint bar
         $('<header>', {
           'class': 'text-monospace small',
           html: '<h5><span class="badge badge-info mb-1">GET</span></h5>' +
                 'https://apx-search.e-com.plus/api/v1<b>/items.json?q=field:value</b>'
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
