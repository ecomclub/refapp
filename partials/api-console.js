/**
 * @author E-Com Club <ti@e-com.club>
 * @license MIT
 */

 (function ($) {
   'use strict'

   var platform = function () {
     // create main DOM element
     var $inputUrl = $('<input>', {
       'class': 'form-control',
       type: 'search',
       placeholder: 'Enter request URL'
     })

     // returns DOM element
     return $('<section>', {
       html: [
         // API endpoint bar
         $('<header>', {
           'class': 'navbar navbar-light bg-light fixed-top',
           html: $('<form>', {
             'class': 'container py-1 px-0',
             action: 'javascript:;',
             html: $('<div>', {
               'class': 'input-group',
               html: [
                 $inputUrl,
                 $('<div>', {
                   'class': 'input-group-append',
                   html: [
                     $('<button>', {
                       'class': 'btn btn-outline-secondary',
                       type: 'button',
                       text: 'Params'
                     }),
                     $('<select>', {
                       'class': 'rounded-0 border-left-0 border-right-0 custom-select',
                       html: [
                         $('<option>', {
                           value: 'GET',
                           text: 'GET',
                           selected: true
                         })
                       ]
                     }),
                     $('<button>', {
                       'class': 'btn btn-primary',
                       type: 'submit',
                       text: 'Send'
                     })
                   ]
                 })
               ]
             })
           })
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
