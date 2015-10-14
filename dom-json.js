/*
  DOM-JSON, a simple tool used to parse, store, and recreate DOMElements encoded as JSON.
  
  It has two utlity functions:
  
  $DJ.JSON(el, withData) - Create a JSON object from a DOMElement
  
  $DJ.DOM(json) - Create a DOMElement from a JSON object
  
  Copyright ©2015 Eric L. Turitte
  Released under MIT License
*/

(function () {
    if (window.$DJ) {
        return;
    }
    
    window.$DJ = {
        
        /*
          JSON - function to record an element and it's children as JSON
          
          Parameters:
          	el - the root element to be recorded as JSON
            withData - boolean to specify whether data attached to the element
            	should be recorded or not - ToDo feature
          
          Output:
          	JSON string
        */
        
        JSON: function (el, withData) {
            if (!el) {
                return null;
            }
            
            var _json = {
                name: el.nodeName,
                type: el.nodeType
            }, i;

            // If the current element is just a text node, return the string
            if (el.nodeType === document.TEXT_NODE) {
                return el.textContent.trim() ? el.textContent : null;
            }

            // We have children that need to be recursively encoded
            if (el.childNodes && el.childNodes.length) {
                _json.children = [];
                
                for (i = 0; i < el.childNodes.length; i++) {
                    _json.children.push(this.JSON(el.childNodes[i]));
                }
                _json.children = _json.children.filter(function (_el) {
                    return !!_el;
                });
                
                if (_json.children.length === 1 && typeof _json.children[0] === 'string') {
                    _json.text = _json.children.shift();
                }
                
                if (_json.children.length === 0) {
                    delete _json.children;
                }
            }

            // Copy all attributes
            if (el.attributes && el.attributes.length) {
                _json.attributes = {};
                for (i = 0; i < el.attributes.length; i++) {
                    _json.attributes[el.attributes[i].name] = el.attributes[i].value.trim();
                }
            }

            // ToDo: record all the data on the element if we pass that parameter
            if (withData) {

            }

            // Done
            return _json;
        },
        
        /*
          DOM - function to create an element and it's children from JSON
          
          Parameters:
          	json - a JSON object containing valid JSON for the elements to be rendered
          
          Output:
          	DOMElement
        */
        
        DOM: function (json) {
            var obj, i, t = typeof json;

            if (t === 'string' || t === 'number') {
                // we have just constant values to desplay
                return document.createTextNode(json);
                
            } else if (t === 'object' && json.hasOwnProperty('name')
                       && json.hasOwnProperty('type')
                       && json.type === document.ELEMENT_NODE) {
                
                // Generic object values to put into place
                obj = document.createElement(json.name);

                if (json.text) {
                    obj.appendChild(document.createTextNode(json.text));
                    
                } else if (json.children && json.children.length) {
                    // Recursively step through children to create elements
                    for (i = 0; i < json.children.length; i++) {
                        obj.appendChild(this.DOM(json.children[i]));
                    }
                }

                // Copy over attributes
                for (i in json.attributes) {
                    if (!json.attributes.hasOwnProperty(i) || json.attributes[i] === false || json.attributes[i] === null) {
                        continue;
                    }

                    obj.setAttribute(i, json.attributes[i]);
                }
                
            } else {
                // We have a bad node encoded.  Let's just ignore it for now
                return null;
            }

            // Done - DOMElement is ready for appending
            return obj;
        }
    };
})();


/*
  A couple of tests to see if it works
*/

var json = $DJ.JSON(document.getElementById('src')),
    domObj = $DJ.DOM(json);

console.log(JSON.stringify(json));
console.log(json);
console.log(domObj);

document.getElementById('dest').appendChild(domObj);
