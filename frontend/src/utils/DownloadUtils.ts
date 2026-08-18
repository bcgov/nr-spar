/**
 * Helpers for opening authenticated file blobs in the browser.
 */
export const openBlankTab = (): Window | null => window.open('', '_blank');

export const openBlobInNewTab = (blob: Blob, tab?: Window | null): void => {
  const blobUrl = URL.createObjectURL(blob);
  const preparedTab = tab && !tab.closed ? tab : null;
  if (preparedTab) {
    preparedTab.location.href = blobUrl;
  } else {
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
