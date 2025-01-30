import * as assert from 'assert';
import { BevyTreeService, Category, CategoryType, Component, Entity } from '../bevyViewService';
import { InMemoryBevyRemoteService } from './inmemoryRemote';

suite('BevyTreeService Test Suite', () => {
    const remoteService = new InMemoryBevyRemoteService();
    const treeService = new BevyTreeService(remoteService);

    const setupEmptyDataSet = () => {
        treeService.invalidateCache();
        remoteService.entities.clear();
    };

    const setupSimpleDataSet = () => {
        treeService.invalidateCache();
        remoteService.entities.clear();
        remoteService.entities.set(1, {
            'bevy_core::name::Name': { hash: 11, name: 'foo' },
            'bevy_hierarchy::components::children::Children': [2],
            'random::Component': 'RandomValue1',
        });
        remoteService.entities.set(2, {
            'bevy_core::name::Name': { hash: 12, name: 'bar' },
            'bevy_hierarchy::components::parent::Parent': 1,
            'bevy_hierarchy::components::children::Children': [3],
        });
        remoteService.entities.set(3, {
            'bevy_core::name::Name': { hash: 13, name: 'baz' },
            'bevy_hierarchy::components::parent::Parent': 2,
        });
        remoteService.entities.set(4, {});
    };

    test('listCategories', async () => {
        setupEmptyDataSet();
        const categories = await treeService.listCategories();
        assert.deepEqual(categories, [new Category(CategoryType.Schema), new Category(CategoryType.Entities)]);
    });

    test('listTopLevelEntities doesnt return children', async () => {
        setupSimpleDataSet();
        const entities = await treeService.listTopLevelEntities();
        assert.deepEqual(entities, [new Entity(1, 'foo'), new Entity(4)]);
    });

    test('listTopLevelEntities without data', async () => {
        setupEmptyDataSet();
        const entities = await treeService.listTopLevelEntities();
        assert.deepEqual(entities, []);
    });

    test('listComponents with parent and no children', async () => {
        setupSimpleDataSet();
        const entities = await treeService.listComponents(3);
        assert.deepEqual(entities, [
            new Component('bevy_core::name::Name', { hash: 13, name: 'baz' }),
            new Component('bevy_hierarchy::components::parent::Parent', 2),
        ]);
    });

    test('listComponents sorts children first', async () => {
        setupSimpleDataSet();
        const entities = await treeService.listComponents(1);
        assert.deepEqual(entities, [
            new Component('bevy_hierarchy::components::children::Children', [2]),
            new Component('bevy_core::name::Name', { hash: 11, name: 'foo' }),
            new Component('random::Component', 'RandomValue1'),
        ]);
    });
});
