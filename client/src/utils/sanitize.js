// client/src/utils/sanitize.js
import DOMPurify from 'dompurify'

export const sanitizeHTML = (dirty) =>
  DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  })

export const sanitizeText = (text) =>
  DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
