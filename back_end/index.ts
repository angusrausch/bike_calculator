export { MyContainer } from 'cloudflare:workers';

export default {
  async fetch(request, env) {
    // This is where you route traffic to your container
    const id = env.MY_CONTAINER.idFromName('default');
    const obj = env.MY_CONTAINER.get(id);
    return obj.fetch(request);
  },
};
