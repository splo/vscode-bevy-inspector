// Example adapted from https://raw.githubusercontent.com/bevyengine/bevy/refs/heads/main/examples/remote/server.rs
//! A Bevy app that you can connect to with the BRP and edit.

use std::env;

use bevy::prelude::*;
use bevy::remote::http::DEFAULT_PORT;
use bevy::{
    color::palettes::tailwind,
    math::ops::cos,
    remote::{RemotePlugin, http::RemoteHttpPlugin},
};

fn main() {
    let port: u16 = env::args()
        .nth(1)
        .and_then(|arg| arg.parse().ok())
        .unwrap_or(DEFAULT_PORT);
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(RemotePlugin::default())
        .add_plugins(RemoteHttpPlugin::default().with_port(port))
        .add_systems(Startup, setup)
        .add_systems(Update, move_cube)
        .register_type::<Cube>()
        .register_type::<MyObject>()
        .register_type::<MoveSpeed>()
        .run();
}

#[derive(Component, Reflect)]
#[reflect(Component)]
struct Cube(f32);

#[derive(Component, Reflect)]
#[reflect(Component)]
struct MyObject {
    vec3: Vec3,
    color: Color,
}

#[derive(Resource, Reflect)]
#[reflect(Resource)]
struct MoveSpeed {
    value: f32,
}

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // unnamed object
    commands.spawn(MyObject {
        vec3: Vec3::new(1.0, 2.0, 3.0),
        color: Color::from(tailwind::BLUE_500),
    });

    // cube
    let cube_handle = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    commands.spawn((
        Name::new("Cube"),
        Mesh3d(cube_handle.clone()),
        MeshMaterial3d(materials.add(Color::from(tailwind::RED_200))),
        Transform::from_xyz(0.0, 0.5, 0.0),
        Cube(1.0),
        children![(
            Name::new("Sub-cube"),
            Mesh3d(cube_handle.clone()),
            MeshMaterial3d(materials.add(Color::from(tailwind::GREEN_500))),
            Transform::from_xyz(0.0, 1.5, 0.0),
            children![(
                Name::new("Sub-sub-cube"),
                Mesh3d(cube_handle),
                MeshMaterial3d(materials.add(Color::from(tailwind::BLUE_800))),
                Transform::from_xyz(1.5, 0.0, 0.0),
            )]
        )],
    ));

    // circular base
    commands.spawn((
        Name::new("Circular base"),
        Mesh3d(meshes.add(Circle::new(4.0))),
        MeshMaterial3d(materials.add(Color::from(tailwind::GREEN_300))),
        Transform::from_rotation(Quat::from_rotation_x(-std::f32::consts::FRAC_PI_2)),
    ));

    // light
    commands.spawn((
        Name::new("Light"),
        PointLight {
            shadows_enabled: true,
            ..default()
        },
        Transform::from_xyz(4.0, 8.0, 4.0),
    ));

    // camera
    commands.spawn((
        Name::new("Camera"),
        Camera3d::default(),
        Transform::from_xyz(-2.5, 4.5, 9.0).looking_at(Vec3::Y, Vec3::Y),
    ));
}

fn move_cube(
    mut query: Query<&mut Transform, With<Cube>>,
    time: Res<Time>,
    move_speed_res: Option<Res<MoveSpeed>>,
) {
    let move_speed = move_speed_res.map(|res| res.value).unwrap_or(1.0);
    for mut transform in &mut query {
        transform.translation.y = -cos(time.elapsed_secs() * move_speed) + 1.5;
    }
}
