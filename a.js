import path from 'path'

const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);

export default { __dirname }