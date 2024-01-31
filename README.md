# T4GSupport

This project was initialized by using [Tech4Good's Angular Schematics](https://github.com/tech4good-lab/angular-schematics) after a base project repository was generated with [Angular CLI](https://github.com/angular/angular-cli). You can check the early commits of package.json to determine the versions used to generate it.

## Contributing
1. Create a new branch with the `<type>/<description>` format, where `<type>` is one of the following:
   * `component` for new components
   * `container` for new containers
   * `entity` for new entities
   * `module` for new modules
   * `feature` for new features
   * `refactor` for code refactoring
   * `docs` for documentation changes
   * `style` for changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
2. Make your changes
3. Run `ng lint` and `ng test` to ensure your changes pass the tests
4. Commit your changes
5. Push your changes to the remote repository

Don't create PRs unless they are important. This repo is strictly meant to show members how to do things in Angular
using the Tech4Good's Angular Schematics and a clean architecture.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Run `ng serve --configuration production` to run a prod server locally. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate container|module|entity`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Version number

We use the syntax `ANGULAR_MAJOR.MAJOR.MINOR-PATCH` for versioning, where
* `ANGULAR_MAJOR` corresponds to angular's major version,
* `MAJOR` contains significant new features, with some developer assistance needed, e.g. to write scripts that update the database for existing users.
* `MINOR` contains new smaller features. Minor releases are fully backward-compatible in that we can immediately deploy to production without needing to make any updates to the database for existing users,
* `PATCH` contains low risk bug fixes that do not require any updates to the database.
