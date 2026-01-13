import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'

console.log('Main: Starting...');
const rootElement = document.getElementById('root');
console.log('Main: Root element found:', !!rootElement);
console.log('Main: App type:', typeof App);

createRoot(rootElement!).render(
    <App />,
)
