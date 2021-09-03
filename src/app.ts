// Using an Object Oriented Approach -> OOP
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;

  constructor() {
    // use Type Casting to specify which type I'll save here in variable
    this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;

    // when creating new instance of this class, then rendering a form that belongs to this instance
    // save all the HTML content (with deep clone, so all deeper levels -> that's why set "true") in const
    // and then the first child (-> form element) in property of class
    const importedNode = document.importNode(this.templateEl.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    // invoke attach method that adds element to hostEl
    this.attach();
  }

  private attach() {
    this.hostEl.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();