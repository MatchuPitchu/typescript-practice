// Project Type Class
enum ProjectStatus { Active, Finished }

class Project {
  // using shorthand prop creation
  constructor(
    public id: string, 
    public title: string, 
    public description: string, 
    public people: number,
    public status: ProjectStatus, // using defined enum 
  ) {}
}

// Project State Management Class with Singleton (-> only one instance is allowed to exist)
// define type Listener to encode a function type with one word; use "void" because listener fn don't need to return anything
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = []; // list of listener function references
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {} // set to private because class should be instantiated only once

  static getInstance() {
    if(this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
  }

  // possibility to store event listener functions in an array
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    // create new project and push it to projects list
    const newProject = new Project(
      Math.random().toString(), // for random purposes: Math.random() is not unique, it's unlikely to have the same, but NOT excluded
      title,
      description,
      numOfPeople,
      ProjectStatus.Active, // using enum to set every created project first to status active
    );
    this.projects.push(newProject);
    // loop through all stored listener functions and call them
    for(const listenerFn of this.listeners) {
      // use slice() to pass a new copy of the listeners arr, NOT only a reference to this listeners arr;
      // it's better to avoid possible strange bugs
      listenerFn(this.projects.slice())
    }
  }
}
// create global instance of ProjectState class with static method of class;
// now after I can use f.e. addProject method globally
const projectState = ProjectState.getInstance();

// Validation Form Input
interface Validatable {
  value: string | number;
  // these values are optional when using the inferface
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validatableInput: Validatable) => {
  // if return in the end is true, then validation ok, otherwise at least one validation is invalid, then return is false
  let isValid = true;
  if(validatableInput.required) {
    // if thing after && is false, then new value of isValid would be false
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  // check minLength only for input length NOT null and undefined + for type string
  if(validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  // check minLength only for input length NOT null and undefined + for type string
  if(validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  // check min limit
  if(validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  // check max limit
  if(validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

// Autobind Decorator
// instead of using _ and _2, set "noUnusedParameters": false in tsconfig.json
const Autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
  // store method that I find originally in descriptor
  const originalMethod = descriptor.value;
  // create adjusted descriptor
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    // getter method
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  }
  // return changed descriptor which binds now always the "this" of the context where decorator is called
  return adjDescriptor;
}

// Using an Object Oriented Approach -> OOP
// ProjectList Class
class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  sectionEl: HTMLElement; // because there is no more specialized type for section tags
  assignedProjects: Project[];

  // I use shorthand in parantheses of constructor to create equally named props in class;
  // 1 parameter with essential information: active OR finished projects
  constructor(private type: 'active' | 'finished') {
    this.templateEl = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(this.templateEl.content, true);
    this.sectionEl = importedNode.firstElementChild as HTMLElement;
    // add id with stylings i n app.css
    this.sectionEl.id = `${this.type}-projects`;

    // register a listener function: when projects state changed then update assignedProjects list
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  // render projects
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    // loop through all project items in order to render all the project object items (look at "const newProject")
    for(const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem)
    }
  }

  // fill blank content in HTML template
  private renderContent() {
    const listId = `${this.type}-projects-list`;
    // select first ul element
    this.sectionEl.querySelector('ul')!.id = listId;
    this.sectionEl.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  // add project list at the end of hostEl
  private attach() {
    this.hostEl.insertAdjacentElement('beforeend', this.sectionEl);
  }
}


// ProjectInput Class
class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  formEl: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    // use Type Casting to specify which exact HTML type I'll save here in variable
    this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostEl = document.getElementById('app')! as HTMLDivElement;

    // when creating new instance of this class, then rendering a form that belongs to this instance;
    // save all the HTML content (with deep clone, so all deeper levels -> that's why I set "true") in const
    // and then the first child (-> form element) in property of class
    const importedNode = document.importNode(this.templateEl.content, true);
    this.formEl = importedNode.firstElementChild as HTMLFormElement;
    // add id with stylings i n app.css
    this.formEl.id = 'user-input';

    // get access to input form elements
    this.titleInputEl = this.formEl.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputEl = this.formEl.querySelector('#description')! as HTMLInputElement;
    this.peopleInputEl = this.formEl.querySelector('#people')! as HTMLInputElement;

    // invoke event methods + invoke attach method that adds element to hostEl
    this.configure();
    this.attach();
  }

  // methods are private because I never access these from outside the class
  // method which gathers all user input in a 3 items Tuple; 
  // use Union Type: return could also be "void", means that function has at least a branch which doesn't return any value
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputEl.value;
    const enteredDescription = this.descriptionInputEl.value;
    const enteredPeople = this.peopleInputEl.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    }
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5
    }
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    }

    // simple input validation
    // if(
    //   enteredTitle.trim().length === 0 || 
    //   enteredDescription.trim().length === 0 || 
    //   enteredPeople.trim().length === 0
    // ) {
    // reusable validation functionality; if at least one check is false then display alert
    if(
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert('Invalid input, please try again');
      return
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  // reset inputs after submit form
  private clearInputs() {
    this.titleInputEl.value = '';
    this.descriptionInputEl.value = '';
    this.peopleInputEl.value = '';
  }

  // add event listeners to form button
  @Autobind // decorator to automatically bind "this" to class obj context
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    // check if return of gatherUserInput is arr
    if(Array.isArray(userInput)) {
      // use destructuring
      const [title, desc, people] = userInput;
      // create project with global available projectState obj and his public method addProject
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private configure() {
    // "this" without .bind(this) points in submitHandler on the event target, not on the prop in my class; 
    // so value would be undefined; arg of bind() is here "this" (means class obj) to indicate that "this" inside of 
    // submitHandler will always refer to the same context than "this" in configure() (-> that means to class obj, NOT to event target)
    // this.formEl.addEventListener('submit', this.submitHandler)

    // this works only with autobind decorator
    this.formEl.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostEl.insertAdjacentElement('afterbegin', this.formEl);
  }
}

// instantiate project input
const prjInput = new ProjectInput();
// instantiate project list
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
