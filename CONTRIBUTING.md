# Contributing to vscode-bevy-inspector

Thank you for your interest in contributing!

## Reporting Issues

- Search [existing issues](https://github.com/splo/vscode-bevy-inspector/issues) before opening a new one.
- Use the [issue templates](https://github.com/splo/vscode-bevy-inspector/issues/new) to guide you when opening issues.
- Issues must be formatted as **problems**: describe what is wrong, even for feature requests.
- For bugs, describe how to reproduce, expected and actual behavior, and your environment.

## Pull Requests

- [Open a new pull request](https://github.com/splo/vscode-bevy-inspector/compare).
- Pull requests must be formatted as **solutions**: clearly state what problem is being solved and how.
- Link to an issue when there is one describing the problem this pull requests solves.
- [Fork the repository](https://github.com/splo/vscode-bevy-inspector/fork) and create a new branch for your changes.
- Ensure your code passes all lints and checks.
- Write clear, concise commit messages. This project uses a relaxed form of [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: Add <new feature>` for new/improved features.
  - `fix: <bug>` for bug fixes.
  - All other kinds of commit `type` is ignore and considered `chore`.

## Code Style

- Follow the existing code style and formatting.
- Use the provided scripts and tasks to format and lint your code.

## Development Tasks

### Setup

- Run `npm install` to install all dependencies.
- `npm run postinstall` will be invoked to build the [`@designbyadrian/react-interactive-input`](https://github.com/designbyadrian/react-interactive-input/) dependency after it is retrieved by NPM `install`. This step is needed until a new release is [published](https://www.npmjs.com/package/@designbyadrian/react-interactive-input?activeTab=versions).

### Building and Running

- Use the VS Code built-in tasks (see `.vscode/tasks.json`) for common workflows:
  - `build`: Build all source files (`npm run build`).
  - `watch`: Watch and rebuild on changes for development (`npm run watch`).
- Press `F5` in VS Code to run the extension in a new Extension Development Host window (this launches the `watch` task automatically).
- Extension packaging is done in [GitHub Actions](./.github/workflows/publish.yaml). It uses `vsce` and `ovsx`.
- `npm run vscode:prepublish` is automatically called when packaging/publishing the extension.

### Running Bevy Example Servers

- Example servers are in the `examples/` directory and can be started via VS Code tasks:
  - `run-server-0.15-example`: Starts the [Bevy 0.15 server](./examples/server-0.15/) (port `15715`).
  - `run-server-0.16-example`: Starts the [Bevy 0.16 server](./examples/server-0.16/) (port `15702`, Bevy's default).
  - `run-server-dev-example`: Starts the [Bevy main branch server](./examples/server-dev/) (port `15717`).
- These servers expose the JSON-RPC BRP protocol at `http://127.0.0.1:<port>` and are useful for testing the extension.
- Ports can be changed by manually running the `cargo` examples with an argument: `cargo run --manifest-path ./examples/server-0.16/Cargo.toml -- 15999`.

### Code Style, Linting, and Formatting

- Use the following scripts for code quality:
  - `npm run format`: Format code with Prettier.
  - `npm run lint`: Check code with ESLint.
  - `npm run check-types`: Type check the code with TypeScript.
  - `npm run clean`: Clean build artifacts.
- VS Code should automatically display linting errors if you installed the [recommended extensions](./.vscode/extensions.json).

### Storybook

- Storybook is available for previewing and testing UI components in isolation.
- Run `npm run storybook` (or the `run-storybook` VS Code task) to start Storybook and open the local URL in your browser.

## Project Structure

### Main VS Code Extension Entry Point

Code in `src/extension/`.

Handles extension activation, commands, and communication with webviews. Depends on most other subdirectories.

Most of data come from communication with the [Bevy Remote Procotol](https://docs.rs/bevy/latest/bevy/remote/index.html) (BRP), except servers that are stored in VS Code's global state.

### React-Based Webviews

Code in `src/components-view/` and `src/resources-view/`.

Used for displaying and editing Bevy components and resources. Loaded by the extension through the built `dist/{components,resources}-view/index.html`. Depend on `messenger/`, `inspector-data/`, and `schema-components/`.

### Shared Libraries

- `brp/`: TypeScript interfaces and protocol logic for BRP communication. Used by the extension and its data repositories.
- `inspector-data/`: shared types, messages, and schemas for communication between the extension and webviews.
- `messenger/`: utilities for message passing between webviews and the extension.
- `schema-components/`: React components for rendering and editing values based on Bevy schemas. Used by both webviews.

## Questions

If you have questions, [open a discussion](https://github.com/splo/vscode-bevy-inspector/discussions).

Thank you for helping improve this project!
