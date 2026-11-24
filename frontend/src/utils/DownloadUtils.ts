/**
 * Helpers for opening authenticated file blobs in the browser.
 *
 * openBlankTab cannot pass noopener/noreferrer: that makes window.open
 * return null and breaks the popup-blocker-safe pattern. Clearing
 * window.opener still closes the reverse-tabnabbing channel.
 *
 * If the blank tab was never opened, fall back to a
 * same-document <a download> click so the file still arrives.
 */
export const openBlankTab = (): Window | null => {
  const tab = window.open('', '_blank');
  if (tab) {
    tab.opener = null;
  }
  return tab;
};

export const openBlobInNewTab = (
  blob: Blob,
  tab?: Window | null,
  filename = 'download.pdf'
): void => {
  const blobUrl = URL.createObjectURL(blob);
  const preparedTab = tab && !tab.closed ? tab : null;
  if (preparedTab) {
    preparedTab.opener = null;
    preparedTab.location.href = blobUrl;
  } else {
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
};
