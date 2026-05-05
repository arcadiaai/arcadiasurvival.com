export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  if (url.hostname === 'www.arcadiasurvival.com') {
    url.hostname = 'arcadiasurvival.com';
    return Response.redirect(url.toString(), 301);
  }
  return next();
};
