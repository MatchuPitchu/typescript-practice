# Practice Part of TypeScript Course

- Practice exercise based on Object Oriented Programming (OOP) and TypeScript
- Content:
  - enter new projects with a description and number of people assigned in a form
  - creation of a movable list of active and finished projects

## Splitting Code Into Multiple Files

- Option 1 (recommanded): ES6 Imports and Exports

  - Use ES6 import/export syntax
    - write in index.html: `<script type="module" src="dist/app.js"></script>`
    - set in tsconfig.json: `"target": "es6", "module": "es2015"`
  - Per-file compilation but single `<script>` import
  - Bundling via third-party tools (e.g. Wenpack) is possible

    ```TypeScript
    // Example
    // project-input file
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
      // ...
    }

    // target file that imports
    import { ProjectInput } from './components/project-input.js';

    // if you have more than one import of one file
    import { Validatable, validate } from '../util/validation.js';
    // OR group imports
    import * as Validation from '../util/validation.js';
    // now I can use all imported things like props in an obj (-> e.g. Validation.Validatable)

    // assigning alias to rename an import
    import { Autobind as BindFn } from '../decorators/autobind.js';

    // default export
    // only 1 default (= main) export per file allowed
    export default class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
      // ...
    }

    // import with default export
    // choose name of your choice without curly brackets, BUT recommanded is original name
    import ProjectInput from './components/project-input.js';
    // OR
    import PrjInput from './components/project-input.js';

    ```

- Option 2 (cumbersome and more error-prone way): Namespaces & File Bundling

  - Use TS "namespace" code syntax to group code
  - Per-file or bundled compilation (-> files together into one file) is possible (less imports to manage)

    ```TypeScript
    // Example:
    // activate "outFile" and write destination file path like "./dist/bundle.js" in tsconfig.json to concatenate and emit output to single file; otherwise compiled TS files with namespace DON'T work in JS world;
    // set "module": "amd" in tsconfig.json to make bundling work;
    // Create new TS file in subfolder "models/drag-drop.ts" and wrap code into a namespace NAME {}
    namespace App {
      // only need export things that I need in the outside, NOT needed for things that are only used inside the curly brackets here
      export interface Draggable {
        dragStartHandler(e: DragEvent): void;
        dragEndHandler(e: DragEvent): void;
      }

      export interface DragTarget {
        dragOverHandler(e: DragEvent): void;
        dropHandler(e: DragEvent): void;
        dragLeaveHandler(e: DragEvent): void;
      }
    }

    // Create other new TS file in subfolder "models/project.ts" and wrap code with same namespace NAME {}
    namespace App {
      export enum ProjectStatus { Active, Finished }

      export class Project {
        constructor(
          public id: string,
          public title: string,
          public description: string,
          public people: number,
          public status: ProjectStatus,
        ) {}
      }
    }

    // ... create more TS files, export what you need outside and import in main file below ...

    // ------------------------------ //
    // In the file you want to import into write in first line starting with "///", then wrap all code in app.ts (or where you wanna import code) into namespace NAME {}
    /// <reference path="models/drag-drop.ts" />
    /// <reference path="models/project.ts" />
    namespace App {
      // ... my code with some references to outsourced code above
    }

    ```

  - Option 3 (NOT recommanded): writing multiple ts files that are compiled to multiple js files and inserted in HTML Code with `<script>` Tag

## How Does Code In Modules Execute?

- exported variables (e.g. `export const projectState = ProjectState.getInstance()`) runs only once when file is imported for the first time. NOT runs more than once, even though if file is imported in multiple files
