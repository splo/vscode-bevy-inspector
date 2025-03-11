/// <reference types="@vitest/browser/providers/playwright" />
import {
  GetSchemaRequestData,
  GetSchemaResponseData,
  InspectorMessage,
  ListComponentsResponseData,
} from '@bevy-inspector/inspector-messages';
import { RequestMessage, ResponseMessage } from '@bevy-inspector/messenger/types';
import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { EntityDetails } from '../src/components/EntityDetails';

test('renders entity and components', async () => {
  window.vscodeApiMock.handler = (message: unknown) => {
    console.log('Mock received message', message);
    const request = message as RequestMessage<unknown>;
    switch (request.type) {
      case InspectorMessage.ListComponents: {
        const response: ResponseMessage<ListComponentsResponseData> = {
          requestId: request.id,
          data: {
            components: [
              { typePath: 'ipsum::dolor::Lorem', shortPath: 'Lorem', value: 'Lorem ipsum dolor sit amet' },
              { typePath: 'bevy::PI', shortPath: 'PI', value: 3.14 },
            ],
          },
        };
        window.postMessage(response);
        break;
      }
      case InspectorMessage.GetSchema: {
        const { componentTypePath: typePath } = request.data as GetSchemaRequestData;
        const response: ResponseMessage<GetSchemaResponseData> = {
          requestId: request.id,
          data: {
            schema: { type: typePath === 'bevy::PI' ? 'number' : 'string' },
          },
        };
        window.postMessage({ type: 'message', data: response });
        break;
      }
      default:
        console.log('Unhandled message type:', request.type);
    }
  };

  const entity = {
    id: 1234,
    name: 'Foo',
  };
  const { getByText } = render(<EntityDetails entity={entity} />);
  await expect.element(getByText('Foo').first()).toBeInTheDocument();
  await expect.element(getByText('ipsum::dolor::Lorem')).toBeInTheDocument();
  await expect.element(getByText('bevy::PI')).toBeInTheDocument();
});
