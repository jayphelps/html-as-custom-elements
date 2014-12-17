import * as privateMethods from './elements/private-methods.js';

const callbacks = ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];

export default function registerElement(tagName, Constructor) {

  // The WebIDL bindings generated this, thinking that they were in an ES6 world where the constructor they created
  // would be the same as the one registered with the system. So delete it and replace it with the one generated by
  // `document.registerElement`.
  delete window[Constructor.name];
  const GeneratedConstructor = window[Constructor.name] = document.registerElement(tagName, Constructor);

  // Delete any custom element callbacks since native elements don't have them and we don't want that kind of
  // observable difference. Their presence only matters at registration time anyway.
  for (const callback of callbacks) {
    delete GeneratedConstructor.prototype[callback];
  }

  // Register the appropriate private methods under the generated constructor name, since when they are looked up at
  // runtime it will be with that name. This is a band-aid until https://w3c.github.io/webcomponents/spec/custom/#es6
  // lands.
  const privateMethodsForConstructor = privateMethods.getAll(Constructor.name);
  if (privateMethodsForConstructor) {
    const registerElementGeneratedName = GeneratedConstructor.name;
    privateMethods.setAll(registerElementGeneratedName, privateMethodsForConstructor);
  }
}
