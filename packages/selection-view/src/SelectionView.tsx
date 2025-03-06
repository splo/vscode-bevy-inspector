import '@vscode-elements/elements/dist/vscode-icon';
import { useEffect, useState } from 'react';
import { Empty } from './components/Empty';
import { Entity } from './components/Entity';
import { Error } from './components/Error';
import { useWebviewApi } from './WebviewApiContext';

export function SelectionView() {
  const [entity, setEntity] = useState(null);
  const [error, setError] = useState(null);
  const webviewApi = useWebviewApi();
  useEffect(() => {
    webviewApi.on('EntitySelected', setEntity, setError);
    console.info('Listening to EntitySelected events ...');
  }, [webviewApi]);
  if (entity) {
    return <Entity entity={entity} />;
  } else if (error) {
    return Error(error);
  }
  return <Empty />;
}
