# T4GSupport

This project was initialized by using [Tech4Good's Angular Schematics](https://github.com/tech4good-lab/angular-schematics) after a base project repository was generated with [Angular CLI](https://github.com/angular/angular-cli). You can check the early commits of package.json to determine the versions used to generate it.

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
