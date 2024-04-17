globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../renderers.mjs';

const page = () => import('./pages/_trpc__GIzfMcGy.mjs').then(n => n._);

export { page };
