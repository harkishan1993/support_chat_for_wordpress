export const getYoutubeVideoId = (text) => {
  if (!text) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = text.match(regExp);
  return match ? match[1] : null;
};

  