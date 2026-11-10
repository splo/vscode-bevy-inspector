# Supporting a New Bevy Version

## Terms and Paths

- **Target release**: the stable Bevy release being added, for example Bevy `0.20`.
- **Baseline release**: the latest stable Bevy release already supported by the extension, for example Bevy `0.19` when adding `0.20`.
- **Version**: a release's `major.minor` version, written as `<version>` in paths and task names, for example `0.20`.
- **Version ID**: the version with an underscore instead of the dot, written as `<version_id>`, for example `0_20`.
- **Protocol definition**: `src/brp/brp-<version>.ts`, for example `src/brp/brp-0.20.ts`.
- **HTTP service**: `src/brp/http/v<version_id>BevyRemoteService.ts`, for example `src/brp/http/v0_20BevyRemoteService.ts`.
- **Version adapter**: `src/extension/brp/v<version_id>BrpAdapter.ts`, for example `src/extension/brp/v0_20BrpAdapter.ts`.
- **Adapter contract**: `src/extension/brp/adapter.ts`, where `BrpAdapter` extends the target release's service interface.
- **Version selector**: `src/extension/bevyInspectorExtension.ts`, where the `0.20` case selects its version adapter.
- **Example directory**: `examples/server-<version>/`, containing `Cargo.toml`, `src/main.rs`, and `README.md`, for example `examples/server-0.20/`.
- **Example task**: `run-server-<version>-example` in `.vscode/tasks.json`, for example `run-server-0.20-example`.

Prefix a versioned term with **target** or **baseline** to select the corresponding release. Replace the placeholders with that release's version when creating or editing files. Preserve support for existing releases and their protocol behavior.

## 1. Compare Bevy's Protocol

1. Compare the _target release_ and _baseline release_ tags in the Bevy repository, especially `crates/bevy_remote/src/lib.rs`, `builtin_methods.rs`, `http.rs`, and `schemas/`. Check the release notes and migration guides as well.
2. Record method names, availability by release, request and response fields, serialization names, schema metadata, entity IDs, and reflected `Name` and parent component paths and values. Inspect Bevy's history when a method's first supported release is unclear.
3. Check related source for complex response types, such as `bevy_dev_tools` schedule data, and identify fields added or changed since the _baseline release_.

## 2. Add the Protocol and HTTP Service

1. Add an independent _target protocol definition_, using the _baseline protocol definition_ as a starting point. Update its interfaces and documented methods to match the _target release_, including optional fields and wire-format names.
2. Add the _target HTTP service_, implementing the service interface in the _target protocol definition_ and mapping methods to their exact BRP names. Follow the existing JSON-RPC client conventions, including the request-based handling of watch methods.
3. If the _target release_ has methods missing from the extension but also available in older releases, update those releases' _protocol definitions_ and _HTTP services_ where supported. Verify availability against their release source rather than assuming it.

## 3. Update Adapters and Version Selection

1. Update the _adapter contract_ and the `brplatest` imports in older _version adapters_ to reference the _target protocol definition_. `BrpAdapter` extends the complete latest service interface.
2. Add the _target version adapter_ using the _target HTTP service_. Set its _version_, capabilities, component paths, and conversion methods based on the _target release_'s actual data.
3. Convert the _baseline version adapter_ into a wrapper around the _baseline HTTP service_, following existing older _version adapters_. Adapt requests and responses to the target interface, preserving data where possible. If a method is unsupported in an older release, implement it with an explicit error. Make fallbacks for unavailable data explicit and do not mistake placeholder values for observed data.
4. Update other _version adapters_ as needed for changed types or newly added methods. Check shared consumers of protocol types, including schema conversion and registry views.
5. In the _version selector_, select the _target version adapter_ for the _target release_ and update the unsupported-version fallback to that adapter. Check discovery behavior if _version_ reporting changed.

## 4. Add an Example and Task

1. Add the _target example directory_, following the other versioned examples. Enable `bevy_remote`, include the remote and HTTP plugins, and accept an optional port argument. Include reflected components, a resource, and a named entity hierarchy so inspector workflows can be exercised.
2. Add the _target example task_. The server in the _target example directory_ uses Bevy's default port `15702`; older versioned examples use `15700` plus their Bevy minor version. Move the _baseline example task_ to its versioned port, and assign the development server the next minor version's port.
3. Update the server task list and ports in `CONTRIBUTING.md`, the example READMEs where applicable, and the supported-version and dependency examples in `README.md`. Update release notes as appropriate for the project's release process.

## 5. Verify the Release

1. Run `npm run check-types`, `npm run lint`, and `npm run build`. Run focused checks for the _target HTTP service_, adapter conversions, unsupported methods, and existing releases.
2. Compile and run the server in the _target example directory_, replacing _`<version>`_ with the target _version_:

   ```sh
   cargo check --manifest-path examples/server-<version>/Cargo.toml
   cargo run --manifest-path examples/server-<version>/Cargo.toml
   ```

3. Inspect the running app with BRP tools or JSON-RPC calls. Check `rpc.discover` for the version and methods, `registry.schema` for schema and filter formats, and `world.query` for entity names and parents. Inspect type guides when available.
4. Exercise the extension against the server in the _target example directory_: connect without an unsupported-version warning; inspect the entity hierarchy, components, resources, and registry; modify a reflected value; and exercise entity operations. Compare results with the server in the _baseline example directory_ to catch regressions.
5. Stop the example servers after verification. Record any release-specific limitations, including fields that an older server cannot supply.
