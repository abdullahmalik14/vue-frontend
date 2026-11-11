/**
 * Builds tag / performer catalogs for the media uploader.
 * Used by the library page to hydrate the store until a backend catalog API exists.
 */
export function buildMediaUploaderCatalog({ t, assets = {} } = {}) {
  const translate = typeof t === 'function' ? t : (key) => key;
  const avatar = assets.performerAvatar || assets.thumbA || '';

  const tagHistory = [
    { id: 'h1', name: translate('demo.mediaUploaderComponents.tags.history.bluebettle') },
    { id: 'h2', name: translate('demo.mediaUploaderComponents.tags.history.dhdt') },
    { id: 'h3', name: translate('demo.mediaUploaderComponents.tags.history.hello') },
  ];

  const tagCatalog = [
    { id: 1, name: translate('demo.mediaUploaderComponents.tags.list.apple') },
    { id: 2, name: translate('demo.mediaUploaderComponents.tags.list.april') },
    { id: 3, name: translate('demo.mediaUploaderComponents.tags.list.apricote') },
    { id: 4, name: translate('demo.mediaUploaderComponents.tags.list.bigSmile') },
    { id: 5, name: translate('demo.mediaUploaderComponents.tags.list.bigEnergy') },
    { id: 6, name: translate('demo.mediaUploaderComponents.tags.list.bluebettle') },
    { id: 7, name: translate('demo.mediaUploaderComponents.tags.list.cantonese') },
    { id: 8, name: translate('demo.mediaUploaderComponents.tags.list.chinese') },
    { id: 9, name: translate('demo.mediaUploaderComponents.tags.list.dumplings') },
    { id: 10, name: translate('demo.mediaUploaderComponents.tags.list.eeeee') },
  ];

  const performerCatalog = [
    {
      id: 1,
      name: translate('demo.mediaUploaderComponents.performers.jellyJam.name'),
      username: translate('demo.mediaUploaderComponents.performers.jellyJam.username'),
      avatar,
    },
    {
      id: 2,
      name: translate('demo.mediaUploaderComponents.performers.sammiJelly.name'),
      username: translate('demo.mediaUploaderComponents.performers.sammiJelly.username'),
      avatar,
    },
    {
      id: 3,
      name: translate('demo.mediaUploaderComponents.performers.jellyJam.name'),
      username: translate('demo.mediaUploaderComponents.performers.jellyJam.username'),
      avatar,
    },
  ];

  return { tagHistory, tagCatalog, performerCatalog };
}
