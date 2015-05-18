# AxJsonFormControl

> A generic JSON-schema-based model editor, provided as an AngularJS directive

This directive can be used to create JSON documents that are based on a certain schema.
The schema is translated into corresponding HTML elements and each item of the JSON structure bound to it accordingly.


## Installation

To retrieve a copy of this control you can either clone it directly using git or alternatively install it via Bower.
For general information on installing, styling and optimizing controls, have a look at the [LaxarJS documentation](https://github.com/LaxarJS/laxar/blob/master/docs/manuals/installing_controls.md).

### Setup Using Bower

Install the control:

```sh
bower install laxarjs.ax-json-form-control
```

Reference the control from the `widget.json` of your widget:
 
```json
   "controls": [ "laxarjs.ax-json-form-control" ]
```


## Usage

### Input/Output

The document is attached via a regular AngularJS ngModelController as a JSON string.
Parsing and stringification are handled within the directive itself.
The schema based on which the form is generated and validated is bound using the `ax-schema` attribute on the directive.
It needs to be a valid [JSON schema V3](http://tools.ietf.org/html/draft-zyp-json-schema-03) object.
Optionally one can provide form rendering instructions using the `ax-json-form` directive itself.
They are interpreted as a map from JSON paths to configuration options.
A path must map to a corresponding definition within the directive's schema.

Valid configuration properties for the time being are:

* `sortIndex:` an integer providing the order of object properties. 
  A property with smaller index is listed before one of the same object with a larger index.
  Default sortIndex is 0. 
  Only applies to object types.

* `type:` configures the type of an input field. 
  Currently only `"textarea"` to support multiline input for strings is supported.

If entries of an array are to be configured, the `*` can be used as wildcard path fragment.
A configuration of pattern properties isn't possible for the time being.

Example:
```javascript
   {
      // should be sorted with sorting priority 4
      "someKey": { "sortIndex": 4 },
      // The description field of each entry in someArray should be rendered as textarea
      "someArray.*.description": { "type": "textarea" }
   }
```


### Validation

Validation is triggered automatically each time a value is changed.
In order to allow validation instantly or generally on demand one can `$broadcast` the `axJsonFormValidate` event.

To access the validation result one can listen to the `axJsonFormValidationResult` event.
It is triggered for each input directive that can validate, and it holds a unique ID of the directive and a possibly empty list of validation error messages.
A simpler way to simply know whether the form is valid or not is to bind a local scope property to the `ax-valid` attribute on the form directive.
As AngularJS events are handled synchronously, the binding should reflect the validity state of the form just after `axJsonFormValidate` was triggered.
