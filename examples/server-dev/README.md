# Example dev Server

This is an example Bevy app with a quite minimal setup that allows to demonstrate the extension features. It runs a server that exposes the app contents using the JSON-RPC BRP protocol at the `http://127.0.0.1:15702` URL.

It uses the development version of Bevy (`main` branch).

It is an adaptation of Bevy's original [remote server example](https://github.com/bevyengine/bevy/blob/main/examples/remote/server.rs).

## Usage

Just launch from the `examples/server-dev` directory with the `cargo run` command.
