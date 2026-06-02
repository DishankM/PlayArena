import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean/lib/xss.js'
import hpp from 'hpp'

const replaceContents = (target, sanitized) => {
  if (typeof target !== 'object' || target === null || typeof sanitized !== 'object' || sanitized === null) {
    return sanitized
  }

  Object.keys(target).forEach((key) => delete target[key])
  Object.assign(target, sanitized)
  return target
}

const sanitizeRequestPart = (req, key, sanitizer) => {
  if (!req[key]) return

  const sanitized = sanitizer(req[key])
  if (key === 'query') {
    replaceContents(req[key], sanitized)
  } else {
    req[key] = sanitized
  }
}

export const sanitizeMongo = (req, _res, next) => {
  ;['body', 'params', 'headers', 'query'].forEach((key) => {
    if (!req[key]) return

    const wasSanitized = mongoSanitize.has(req[key])
    sanitizeRequestPart(req, key, (value) => mongoSanitize.sanitize(value, { replaceWith: '_' }))

    if (wasSanitized && process.env.NODE_ENV === 'development') {
      console.warn(`Sanitized key: ${key}`)
    }
  })

  next()
}

export const sanitizeXSS = (req, _res, next) => {
  ;['body', 'query', 'params'].forEach((key) => {
    sanitizeRequestPart(req, key, xss.clean)
  })

  next()
}

export const preventHPP = hpp({
  whitelist: ['sort', 'category', 'sport', 'status', 'price', 'rating'],
})

export const deepSanitize = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(/\0/g, '').replace(/\$\{/g, '').trim()
    }
    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item))
    }
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete value[key]
        } else {
          value[key] = sanitizeValue(value[key])
        }
      })
    }
    return value
  }

  sanitizeRequestPart(req, 'body', sanitizeValue)
  sanitizeRequestPart(req, 'params', sanitizeValue)
  sanitizeRequestPart(req, 'query', sanitizeValue)

  next()
}
