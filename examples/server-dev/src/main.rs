// Example adapted from https://raw.githubusercontent.com/bevyengine/bevy/refs/heads/main/examples/remote/server.rs
//! A Bevy app that you can connect to with the BRP and edit.

use bevy::prelude::*;
use bevy::{
    color::palettes::tailwind,
    math::ops::cos,
    remote::{RemotePlugin, http::RemoteHttpPlugin},
};

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_plugins(RemotePlugin::default())
        .add_plugins(RemoteHttpPlugin::default())
        .add_systems(Startup, setup)
        .add_systems(Update, move_cube)
        .register_type::<Cube>()
        .register_type::<MyObject>()
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

fn move_cube(mut query: Query<&mut Transform, With<Cube>>, time: Res<Time>) {
    for mut transform in &mut query {
        transform.translation.y = -cos(time.elapsed_secs()) + 1.5;
    }
}
