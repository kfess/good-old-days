/**
 * The few three.js parts the clay tile uses. Named re-exports let the bundler drop the rest of the
 * library; `import('three')` as a namespace would pull in all of it.
 */
export {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three';
