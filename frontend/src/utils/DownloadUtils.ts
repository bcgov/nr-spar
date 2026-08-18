/**
 * Helpers for opening authenticated file blobs in the browser.
 *
 * openBlankTab cannot pass noopener/noreferrer: that makes window.open
 * return null and breaks the popup-blocker-safe pattern. Clearing
 * window.opener still closes the reverse-tabnabbing channel.
 */
export const openBlankTab = (): Window | null => {
  const tab = window.open('', '_blank');
  if (tab) {
    tab.opener = null;
  }
  return tab;
};

export const openBlobInNewTab = (blob: Blob, tab?: Window | null): void => {
  const blobUrl = URL.createObjectURL(blob);
  const preparedTab = tab && !tab.closed ? tab : null;
  if (preparedTab) {
    preparedTab.opener = null;
    preparedTab.location.href = blobUrl;
  } else {
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
