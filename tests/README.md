<blockquote>
<sub>Document maintainer: Nikola Glumac, Marcus Hurney<br/>Document status: Active</sub>
</blockquote>

# Klarity Acceptance Tests Overview

### File types and Cucumber syntax

- Cucumber looks for files with a `.feature` file extension as the starting point for executing `scenarios` defined within a given `.feature` file. Each `scenario` contains one or more `steps`. `scenarios` describe the broader context or purpose of a given set of steps while the `steps` themselves describe the intended functionality of the Javascript test executables. Together, the collective `scenarios`  within a `.feature` file comprise test coverage of at least one feature within the Klarity UI.

### JavaScript Executables

- Each `step` in a `.feature` file will match a JavaScript `string` passed as the first parameter to a `step-definition` function within a separate `.js` file. A `step-definition` also contains the executable JavaScript function(s) that run the test logic itself. The `step`'s name written as text within a `.feature` file must exactly match the associated JavaScript `string` within a `step-definition` in order for the executable to run.

### File Structure

- All the files comprising the Klarity acceptance tests are divided into directories by domain. A test belongs to a domain depending on the category of functionality it's meant to test. Within Klarity the domains `wallets`, `paper-wallets`, `addresses`, `transactions`, `navigation`, `nodes`, `settings`, and `common`. These domains also constitute the top level directories of the Klarity acceptance tests.

# Running Klarity Acceptance Tests

### Install Klarity

1. Make sure you have node and yarn installed on your machine
2. Clone Klarity repository to your machine (`git clone git@github.com:The-Blockchain-Company/klarity.git`)
3. Install dependencies from within Klarity directory:

```bash
$ yarn install
```

### Run unit tests

Make sure Klarity is properly installed (see above).

```bash
$ yarn test:unit
```

### Unbound unit tests

Unbound tests run as long as you keep them running
(never end except if an error occurs).

Example:
`yarn test:unit:unbound --tags @mnemonics`
generates and validates mnemonics as long as you keep it
running (the number of executions is updated in the terminal)

### Run end-to-end tests with Bcc "Selfnode"

1. Make sure Klarity is properly installed (see above).
2. Make sure your state directory is clean (`rm -rf ~/Library/Application\ Support/Klarity\ Selfnode/`)
3. Run Klarity frontend tests:

```bash
$ cd klarity/
$ yarn nix:selfnode
$ yarn build
$ yarn test:e2e
```

#### Re-running in case of failing test cases

If one test case fails, it + all remaining test cases are immediately skipped and saved into `tests/@rerun.txt`.
This list can then be re-run with `yarn test:unit:rerun` or `yarn test:e2e:rerun` depending on what kind of test
failed. This way you don't have to re-run all the passing tests again just to see if the one that failed is
still broken.

### Running tests for development
1. Mark the test or scenario you are working with @watch annotation
2. Make sure you are in the nix console (`yarn nix:dev`)
3. Make sure your state is clean (`rm -rf ~/Library/Application\ Support/Klarity\ Selfnode/`)
4. Run tests with `yarn test:e2e:watch:once`

### Run all tests

```bash
$ yarn test
```

### Running Cole specific tests
1. Make sure you are in the nix console (`yarn nix:dev`)
2. Make sure your state is clean (`rm -rf ~/Library/Application\ Support/Klarity\ Selfnode/`)
3. Run tests with `yarn test:e2e:cole`

Once tests are complete you will get a summary of passed/failed tests in the Terminal window.

### Run all tests

```bash
$ yarn test
```

### Keeping Klarity alive after end-to-end tests

While working on the tests it's often useful to keep Klarity alive after the tests have run
(e.g: to inspect the app state). You can pass a special environment var to tell the test script
not to close the app:

````bash
$ KEEP_APP_AFTER_TESTS=true yarn test:e2e
````
