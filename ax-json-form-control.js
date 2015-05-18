/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'require',
   'angular',
   'laxar',
   'laxar_patterns',
   './form_types/helpers',
   './form_types/form_any',
   './form_types/form_array',
   './form_types/form_boolean',
   './form_types/form_number',
   './form_types/form_object',
   './form_types/form_string',
   'json!./messages.json'
], function( require,
             angular,
             ax,
             patterns,
             helpers,
             formAny,
             formArray,
             formBoolean,
             formNumber,
             formObject,
             formString,
             i18nMessages ) {
   'use strict';

   var directiveName = 'axJsonForm';

   var directive = [ '$compile', 'JsonFormTypeSwitch',

      function( $compile, jsonFormTypeSwitch ) {

         return {
            scope: true,
            template: '<form novalidate>' +
               '<span><i class="fa ax-icon-warn"></i> Das Formular wird auf Grund eines fehlerhaften JSON-Strings nicht aktualisiert.</span>' +
               '</form>',
            require: 'ngModel',
            replace: true,
            link: function( scope, element, attrs, ngModel ) {

               var invalidChildren = [];

               var lastReceivedData;
               ngModel.$render = function() {
                  try {
                     lastReceivedData = ax.object.deepClone( ngModel.$viewValue );
                     scope.data = ax.object.deepClone( ngModel.$viewValue );

                     showWarningMessage( false );
                  }
                  catch( e ) {
                     showWarningMessage( true );
                  }
               };

               ///////////////////////////////////////////////////////////////////////////////////////////////

               scope.$watch( 'data', function( newValue ) {
                  showWarningMessage( false );

                  if( angular.equals( newValue, lastReceivedData ) ) {
                     return;
                  }

                  if( !invalidChildren.length ) {
                     ngModel.$setViewValue( ax.object.deepClone( newValue, null, 3 ) );
                  }
               }, true );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               // non-i18n-application:
               scope.messages = i18nMessages.en;
               scope.$watch( 'i18n', function( newI18n ) {
                  var locale = newI18n.locale;
                  var tag = newI18n.tags[ locale ];
                  scope.messages = ax.i18n.localizeRelaxed( tag, i18nMessages );
               }, true );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               scope.$watch( attrs[ directiveName ], function( newValue, oldValue ) {
                  scope.formConfiguration = {};
                  if( newValue ) {
                     patterns.patches.apply( scope.formConfiguration, newValue );
                  }
               }, true );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               scope.$watch( attrs.axSchema, function( newValue, oldValue ) {
                  if( !newValue ) { return; }

                  showWarningMessage( false );
                  element.children( 'div:last' ).remove();

                  scope.schema = scope.$eval( attrs.axSchema );

                  if( scope.schema  != null ) {
                     element.append( $compile( jsonFormTypeSwitch( 'schema', 'data', 'formConfiguration' ) )( scope ) );
                     if( !scope.data ) {
                        scope.data = helpers.emptyDefaultByType( scope.schema.type );
                     }
                  }
               }, true );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               scope.$on( 'axJsonFormValidationResult', function( event, result ) {

                  if( result.errors.length ) {
                     if( invalidChildren.indexOf( result.id ) === -1 ) {
                        invalidChildren.push( result.id );
                     }
                  }
                  else {
                     var index = invalidChildren.indexOf( result.id );
                     if( index !== -1 ) {
                        invalidChildren.splice( index, 1 );
                     }
                  }

                  if( attrs.axValid ) {
                     scope.$eval( attrs.axValid + ' = ' + !invalidChildren.length );
                  }
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               function showWarningMessage( visible ) {
                  element.children( 'span:first' )[ visible ? 'show' : 'hide' ]();
               }

            }
         };
      }
   ];

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var jsonFormTypeSwitchFactoryName = 'JsonFormTypeSwitch';
   var jsonFormTypeSwitchFactory = function() {
      return function( schemaBinding, dataBinding, formConfigurationBinding ) {
         var common =
            'data-ax-schema="' + schemaBinding +'" ' +
            'data-ax-data="' + dataBinding + '" ' +
            'data-ax-messages="messages" ' +
            'data-ax-form-configuration="' + formConfigurationBinding + '" ';

         return '<div data-ng-switch="' + schemaBinding + '.type">' +
            '<div data-ng-switch-when="any" data-ax-json-form-any ' + common + '></div>' +
            '<div data-ng-switch-when="array" data-ax-json-form-array ' + common + '></div>' +
            '<div data-ng-switch-when="boolean" data-ax-json-form-boolean ' + common + '></div>' +
            '<div data-ng-switch-when="number" data-ax-json-form-number ' + common + '></div>' +
            '<div data-ng-switch-when="integer" data-ax-json-form-number ' + common + '></div>' +
            '<div data-ng-switch-when="object" data-ax-json-form-object ' + common + '></div>' +
            '<div data-ng-switch-when="string" data-ax-json-form-string ' + common + '></div>' +
            '<div data-ng-switch-default data-ax-json-form-any ' + common + '></div>' +
            '</div>';
      };
   };


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var module = ng.module().factory( jsonFormTypeSwitchFactoryName, jsonFormTypeSwitchFactory );
   helpers.registerDirectives( module );
   formAny.register( module );
   formArray.register( module );
   formBoolean.register( module );
   formNumber.register( module );
   formObject.register( module );
   formString.register( module );

   return module.directive( directiveName, directive );

} );
