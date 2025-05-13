import { createRoot } from 'react-dom/client';
import { ResourcesView } from './components/ResourcesView';

const root = createRoot(document.getElementById('root')!);
root.render(<ResourcesView />);
