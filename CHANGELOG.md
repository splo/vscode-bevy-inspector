# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-05-14

### 0.3.0 Changes

- Add a schema registry view.
- Add entity reparenting.
- Allow to insert a component to an entity.
- Add a Spawn Entity command.
- Add buttons for polling components and resources.
- Allow to manage multiple servers and support Bevy 0.15.x.
- Display and update Bevy resources.
- Allow to update component values.
- Allow to edit components value.
- Display components in selection panel.

## [0.2.0] - 2025-03-21

### 0.2.0 Changes

- Add Go to Defintion to components.
- Copy a component's full name.
- Support different Bevy versions.

## [0.1.1] - 2025-01-03

### 0.1.1 Fixes

- Infer entity name when using Bevy serialize feature.

## [0.1.0] - 2025-01-03

### 0.1.0 Changes

- Add an example server.
- Show primitive values immediately without expanding dropdown by @jakobhellermann.
- Move entity id and component typename from description to tooltip by @jakobhellermann.
- Sort erroneous components to bottom by @jakobhellermann.
- Infer entity name based on common components by @jakobhellermann.
- Change extension icon.

### 0.1.0 Fixes

- Correctly shorten entity names with generics.

[0.3.0]: https://github.com/splo/vscode-bevy-inspector/compare/v0.2.0..v0.3.0
[0.2.0]: https://github.com/splo/vscode-bevy-inspector/compare/v0.1.1..v0.2.0
[0.1.1]: https://github.com/splo/vscode-bevy-inspector/compare/v0.1.0..v0.1.1
[0.1.0]: https://github.com/splo/vscode-bevy-inspector/compare/v0.0.1..v0.1.0
