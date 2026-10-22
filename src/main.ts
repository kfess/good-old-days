import './styles/base.css';
import './styles/components.css';
import './styles/stage.css';
import './styles/stack-skins.css';
import './styles/clawd.css';
import './styles/brand.css';
import { loadNameFonts } from './components/brand';
import { initAnalytics } from './core/analytics';
import { initScroll } from './core/scroll';
import { mountEras } from './core/stage';
import { eras } from './eras';

initAnalytics();
loadNameFonts();
initScroll();
mountEras(document.getElementById('app')!, eras);
