// biome-ignore-all assist/source/organizeImports: page order, which is also the order the era stylesheets are bundled in
import type { Era } from '../core/types';
import { era as prologue } from './prologue';
import { era as y2010 } from './y2010';
import { era as y2012 } from './y2012';
import { era as y2015 } from './y2015';
import { era as y2018 } from './y2018';
import { era as y2021 } from './y2021';
import { era as y2023 } from './y2023';
import { era as y2025 } from './y2025';
import { era as epilogue } from './epilogue';

export const eras: Era[] = [prologue, y2010, y2012, y2015, y2018, y2021, y2023, y2025, epilogue];
