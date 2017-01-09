// Miscellaneous functions without a specific context

/**
 * Returns an array of all matches in a regex global search
 *
 * @param myRe RegExp
 * @param str String to search
 * @returns {Array}
 */
function getAllMatches(myRe, str) {
  var returnData = [];
  var myArray;
  while ((myArray = myRe.exec(str)) !== null) {
    returnData.push(myArray);
  }
  return returnData;
}

/**
 * Checks if the URL starts with a protocol, i.e. if it's absolute
 *
 * @param url
 * @returns {boolean}
 */
function linkOk(url) {
  var r = new RegExp('^(?:[a-z]+:)?//', 'i');
  return (r.test(url) || url.startsWith("mailto:") || url.startsWith("#"));
}

/**
 * Copies passed in text to clipboard
 *
 * @param text
 */
function copyTextToClipboard(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

/**
 * Turns a DOM element tree into HTML. Note that all event listeners are lost.
 * @param parentElement
 * @returns {*|jQuery}
 */
function getHtmlFromElements(parentElement) {
  var holder = document.createElement('div');
  $(holder).append(parentElement);
  return $(holder).html();
}

/**
 * Fetches template contents
 * @param fileName
 * @returns {Promise<string>}
 * http://stackoverflow.com/a/14220323
 */
function getTemplate(fileName){
  var templateURL = chrome.runtime.getURL(`/fragments/${fileName}`);
  return fetch(templateURL).then(response => response.text());
}

function insertAt(content, newString, position = 0) {
  const textBefore = content.substring(0, position);
  const textAfter = content.substring(position, content.length);

  return `${textBefore}${newString}${textAfter}`;
}

function getMatchingElements(html, pattern) {
  const matches = getAllMatches(pattern, html);
  return matches.map((match) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = match[0];
    return wrapper.firstChild;
  });
}

function getAllHeadings(html) {
  const rx = /<(h[2-6]).+>(.+)<\/\1>/ig;
  const elems = getMatchingElements(html, rx);

  return elems.map(el => ({
    level: el.tagName.toLowerCase(),
    title: el.textContent,
    slug: el.id,
  }));
}

function pageFactory(dom = document) {
  // Set up cached elements
  const editor = dom.querySelector('#content');
  const editorToolbar = dom.querySelector('#ed_toolbar');
  const fullHeightEditorToggle = dom.querySelector('#editor-expand-toggle');
  const postMessageTable = dom.querySelectorAll('.post-info-table');
  const postStatusTable = dom.querySelector('#post-status-info');
  const publishingActions = dom.querySelector('#misc-publishing-actions');

  // Private
  const publishBtn = dom.querySelector('#publish');
  let isMollyguardEnabled = true;

  function disablePublishBtn() {
    this.mollyGuard.style.visibility = 'visible';
    if (isMollyguardEnabled) publishBtn.disabled = true;
  }

  function enablePublishBtn(overrideChecks = false) {
    if (overrideChecks) {
      isMollyguardEnabled = false;
      this.mollyGuard.querySelector('a').outerHTML = '<strong>Mollyguard overridden</strong>';
    } else {
      this.mollyGuard.style.visibility = 'hidden';
    }
    publishBtn.disabled = false;
  }

  return {
    editor,
    editorToolbar,
    fullHeightEditorToggle,
    postMessageTable,
    postStatusTable,
    publishingActions,
    mollyGuard: null, // <div> element inserted dynamically in editorPane.js
    disablePublishBtn,
    enablePublishBtn,
  };
}
function getMDLink(obj){
  const title = (obj.title === '') ? '' : ` "${obj.title}"`;
  return `[${obj.text}](${obj.href}${title})`;
}
