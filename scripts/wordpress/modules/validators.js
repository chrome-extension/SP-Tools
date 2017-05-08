/* exported authorMoreValidator, relativeLinkValidator, h1Validator */
/* exported excerptValidator, slugValidator */
/* global getAllMatches, linkOk */

function authorMoreValidator(page) {
  const content = page.editor.value;

  if (content.indexOf('[author_more]') === -1) {
    return {
      isValid: false,
      message: 'Missing [author_more] shortcode',
    };
  }

  return { isValid: true };
}

function relativeLinkValidator(page) {
  const rx = /<a\s+(?:[^>]*?\s+)?href=(['"])([^"]*)\1/ig;
  const matches = getAllMatches(rx, page.editor.value);

  const relativeSlugs = [];
  matches.forEach((el) => {
    if (!linkOk(el[2])) {
      const relSlug = (el[2] === '')? 'empty href' : el[2];
      relativeSlugs.push(relSlug);
    }
  });

  if (relativeSlugs.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: `Relative link found: ${relativeSlugs.join(', ')}`,
  };
}

function h1Validator(page) {
  const rx = /<h1.*?>.*?<\/h1>/ig;
  const matches = getAllMatches(rx, page.editor.value);

  if (matches.length === 0) {
    return { isValid: true };
  }

  return {
    isValid: false,
    message: 'H1 tag found!',
  };
}

/* eslint no-param-reassign: "page" */
function excerptValidator(page) {
  const content = page.excerpt.value;
  const errorMsgs = [];

  // Silently replace special tags in the excerpt
  // as these get picked up by some aggregators
  if (content.match(/\[special].*\[\/special]/)) {
    page.excerpt.value = content
      .replace(/(<p.*?>)?\[special]/, '<p class="wp-special">')
      .replace(/\[\/special](<\/p>)?/, '</p>');
  }

  if (content.includes('[author_more]')) {
    errorMsgs.push('[author_more] shortcode');
  }

  if (content.includes('was peer reviewed by') ||
      content.includes('for having reviewed this article')) {
    errorMsgs.push('peer review credit');
  }

  if (content === '' || errorMsgs.length === 0) return { isValid: true };

  return {
    isValid: false,
    message: `Excerpt contains ${errorMsgs.join(', ')}`,
  };
}

function slugValidator(page) {
  const slugVal = page.getSlug();

  // slug value doesn't consist of just numbers and minuses
  const isAutoGenerated = /^\d*$/.test(slugVal.replace(/-/g, ''));

  // slug value matches: one or more word characters, a minus,
  // one or more word characters, any number of optional characters
  const containsValidChars = /^\w+-\w+.*?$/.test(slugVal);

  const isValid = (slugVal === '' || (!isAutoGenerated && containsValidChars));

  return {
    isValid,
    message: isValid ? null : 'Post URL appears incorrect',
  };
}

function premiumLinkValidator(page) {
  const rx = /<a.*>.*<\/a>/ig;
  const matches = getAllMatches(rx, page.editor.value);
  let premiumLinkFound = false;

  matches.forEach((el) => {
    const pattern = /.*href="(.*)".*/;
    const hrefValue = el[0].replace(pattern,'$1');
    if (hrefValue.match(/sitepoint.com\/premium/)){
      premiumLinkFound = true;
    }
  });

  if (premiumLinkFound) {
   return { isValid: true };
  }

  return {
    isValid: false,
    message: 'No SitePoint Premium link found',
  };
}
