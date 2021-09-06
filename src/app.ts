// Practice TS with an Object Oriented Approach -> OOP

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
// define type Listener to encode a function type with one word; use "void" because listener fn don't need to return anything;
// use Generic Type to set a typ dynamically from outside
type Listener<T> = (items: T[]) => void;

// State base class to practice inheritance
class State<T> {
  // tell TS which Generic Type (here: <T>) the Listeners use for this state object I create;
  // use "protected" that it can be accessed in inherited classes
  protected listeners: Listener<T>[] = []; // list of listener function references

  // possibility to store event listener functions in an array
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

// this class is managing projects, so Generic Type which is set is <Project> class
class ProjectState extends State<Project>{
  private projects: Project[] = [];
  private static instance: ProjectState;

  // set to private because class should be instantiated only once
  private constructor() {
    super();
  } 

  static getInstance() {
    if(this.instance) return this.instance;
    this.instance = new ProjectState();
    return this.instance;
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
      // a) use slice() to pass a new copy of the listeners arr, NOT only a reference to this listeners arr with this.projects;
      // it's better to avoid possible strange bugs
      // listenerFn(this.projects.slice())
      // b) use better ES6 way
      listenerFn([...this.projects])
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

// Component Base Class
// responsible for basic settings to render something on the screen;
// it's an abstract class, so you cannot instantiate it directly, it's only for inheritance purposes;
// using Generics to set dynamically a) the place where I want to render something (-> T) and b) the element that I do render (-> U)
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T; // HTMLDivElement
  renderedEl: U; // HTMLElement or HTMLFormElement

  constructor(
    templateId: string,
    hostElId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    // use Type Casting to specify which exact HTML type I'll save here in variable
    this.templateEl = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElId)! as T;

    // when creating new inherited class instance of this class, then save all HTML content (with deep clone, 
    // so all deeper levels -> that's why I set "true") in const what's inside HTML template element;
    // and then the first child (-> form element) in the renderedEl property of class
    const importedNode = document.importNode(this.templateEl.content, true);
    this.renderedEl = importedNode.firstElementChild as U;
    // add id with stylings in app.css
    if (newElementId) this.renderedEl.id = newElementId;

    this.attach(insertAtStart);
  }

  // add project list at the end of hostEl
  private attach(insertAtBeginning: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtBeginning ? 'afterbegin' : 'beforeend',
      this.renderedEl
    );
  }

  // use abstract to force every class inheriting from Component to have these functions
  abstract configure(): void;
  abstract renderContent(): void;
}

// ProjectItem Class
// responsible for rendering a single project item
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  // create prop to store a project into it
  private project: Project;

  // it's a convention to define getters and setters above the constructor;
  // getters are made to transform data like in this case here
  get persons() {
    if(this.project.people === 1) return '1 person';
      else return `${this.project.people} persons` 
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, false, project.id);
    // store the in constructor passed argument in project prop of class
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {}
  renderContent() {
    this.renderedEl.querySelector('h2')!.textContent = this.project.title;
    // use getter for right naming of output; Note: getters are accessed like normal properties (without parantheses)
    this.renderedEl.querySelector('h3')!.textContent = this.persons + ' assigned';
    this.renderedEl.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList Class
// specify in <HTMLDivElement, HTMLElement> which types are meant now in Component class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  // I use shorthand in parantheses of constructor to create equally named props in class;
  // 1 parameter with essential information: active OR finished projects
  constructor(private type: 'active' | 'finished') {
    // pass Arguments to constructor of Component base class
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  // Note: it's a convention of order to have first public methods and then private methods

  // projects list and filtering
  configure() {
    // register a listener function: when projects state changed then update assignedProjects list
    projectState.addListener((projects: Project[]) => {
      // filter projects in 'active' and 'finished' before storing in assignedProjects arr
      const relevantProjects = projects.filter(prj => {
        if(this.type === 'active') return prj.status === ProjectStatus.Active;
          else return prj.status === ProjectStatus.Finished;
      })
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  // fill blank content in HTML template;
  // cannot be private because it's a defined as abstract in Component base class
  renderContent() {
    const listId = `${this.type}-projects-list`;
    // select first ul element
    this.renderedEl.querySelector('ul')!.id = listId;
    this.renderedEl.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  // render projects
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    // Problem: Duplicates - new projects + all existing projects are appended to list that contains already all existing projects;
    // since it's a small web project here, don't need performance intensive comparison which list elements are already listed;
    // simple solution: before every rendering, set listEl to empty string
    listEl.innerHTML = '';

    // loop through all project items in order to render all the project object items (look at "const newProject")
    for(const prjItem of this.assignedProjects) {
      // create new instance of ProjectItem class in ul element in which I render a new li project item
      new ProjectItem(this.renderedEl.querySelector('ul')!.id, prjItem)
    }
  }
}

// ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input')

    // get access to input form elements; 
    // I could move it into the configure function, makes no difference, BUT then TS would complain
    // that titleInputEl etc. aren't initialized in the constructor although they would also be indirectly
    this.titleInputEl = this.renderedEl.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputEl = this.renderedEl.querySelector('#description')! as HTMLInputElement;
    this.peopleInputEl = this.renderedEl.querySelector('#people')! as HTMLInputElement;
    
    this.configure();
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

  // cannot be private because it's a defined as abstract in Component base class
  configure() {
    // "this" without .bind(this) points in submitHandler on the event target, not on the prop in my class; 
    // so value would be undefined; arg of bind() is here "this" (means class obj) to indicate that "this" inside of 
    // submitHandler will always refer to the same context than "this" in configure() (-> that means to class obj, NOT to event target)
    // this.renderedEl.addEventListener('submit', this.submitHandler)

    // this line works only with autobind decorator, otherwise look above
    this.renderedEl.addEventListener('submit', this.submitHandler)
  }

  // this is technically not required, BUT to satisfy the Component base class, add it here with empty content
  renderContent() {}

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
}

// instantiate project input
const prjInput = new ProjectInput();
// instantiate project list
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');
