export default {
  async fetch(request, env, ctx) {
    const destinationURL = "https://haichai-script-studio.web.app/";
    return Response.redirect(destinationURL, 301);
  },
};
