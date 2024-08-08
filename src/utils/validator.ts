export const isValidImageUrl = (url: string): boolean => {
  const imageExtensions = /\.(jpeg|jpg|gif|png|svg|webp|bmp|tiff|ico|blob)$/i;
  const urlPattern = new RegExp(
    "^(http?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$", // validate fragment locator
    "i"
  );

  if (!imageExtensions.test(url) && !urlPattern.test(url)) {
    return false;
  }

  return true;
};
