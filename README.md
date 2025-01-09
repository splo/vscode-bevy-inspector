# Bevy Inspector Visual Studio Code Extension

Display live data from your [Bevy](https://bevyengine.org/) application using the [Bevy Remote Protocol HTTP plugin](https://docs.rs/bevy_remote/latest/bevy_remote/).

## Features

- Displays Bevy entities and components right in your editor side view.
- Respects entity hierarchy (children entities displayed under their parent's `Children` component).
- Refresh data when wanted or via automatic polling with configurable delay.
- Destroy an entity simply by the power of a click (right click on an entity or hover over it, the bin icon is to the right).
- Copy a component's full name (right click on a component).

Resources, assets and states aren't yet supported since the Bevy Remote Protocol doesn't yet support them.

## Requirements

There is an example server at [`examples/server`](./examples/server/).

- A Rust project with the `bevy` dependency and the `bevy_remote` feature enabled.

```toml
[dependencies]
bevy = { version = "0.15.1", features = ["bevy_remote"] }
```

Only stable version of Bevy `0.15` is supported at the moment.

- A Bevy application with the `RemotePlugin` and `RemoteHttpPlugin` plugins enabled.

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(RemotePlugin::default())
        .add_plugins(RemoteHttpPlugin::default())
        .run();
}
```

By default the connection URL is `http://127.0.0.1:15702`. You can configure this under the "Bevy Inspector" group in the VS Code settings.
