We are building on a obsidian plugin that can manage, organize, and interact with your contacts inside Obsidian. Import, export, and structure vCard (VCF) files seamlessly while keeping all contact details accessible in your knowledge base. Includes click-to-call, right-click copy, structured metadata, and more!

Our approach is shaped by ideas from A Philosophy of Software Design by John Ousterhout. A recommended read if you're into practical thinking about clarity, change, and modularity.

While the book doesn’t define a testing method, it strongly influences how we code. We care about what modules do. not how they do it. Using deep interfaces. This makes tests more stable and more useful during redesigns.

1) Separate ui tsx from core modules like parsing, adapters and utillities.
2) separate obsidian interfaces where we can so that testing becomes easier.
3) Avoid the use of fetch to interact with api's as this results in cors errors
4) Desktop in obsidion is built with Electron and the app is based on Capacitor

## Code Structure Suggestions

- **Move business logic out of UI components:**  
  Keep your `.tsx` files focused on rendering and user interaction. Avoid nested ifs and complex logic in UI code.

- **Centralize business rules and configuration:**  
  Place business logic, configuration, and state management in core modules or in `settings.ts`. This keeps logic reusable and easier to test.

- **Use clear module boundaries:**  
  Parsing, adapters, and utilities should be in their own files. UI should call into these modules, not contain their logic.

- **Benefits:**  
  - Easier to test business logic without UI dependencies  
  - Cleaner, more maintainable UI code  
  - Simpler redesigns and refactoring

- **Example:**  
  - Move validation, data transformation, and API interaction logic from UI components to `settings.ts` or a dedicated service module.
  - UI components should only call functions from these modules and display results.

