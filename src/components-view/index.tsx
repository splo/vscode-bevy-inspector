import { createRoot } from 'react-dom/client';
import { ComponentsView } from './components/ComponentsView';

const root = createRoot(document.getElementById('root')!);
root.render(<ComponentsView />);
