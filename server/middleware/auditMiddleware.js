import AuditLog from '../models/AuditLog.js'

export const auditAction = (action) => (controller) => async (req, res, next) => {
  const originalJson = res.json.bind(res)
  let statusCode = 200

  res.status = (code) => {
    statusCode = code
    return res
  }

  res.json = (data) => {
    const result = originalJson(data)
    if (statusCode < 400) {
      setImmediate(async () => {
        try {
          await AuditLog.create({
            action,
            performedBy: req.user?._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            status: 'success',
          })
        } catch {
          // Do not block response on audit failure
        }
      })
    }
    return result
  }

  try {
    await controller(req, res, next)
  } catch (error) {
    setImmediate(async () => {
      try {
        await AuditLog.create({
          action,
          performedBy: req.user?._id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          status: 'failure',
          details: { error: error.message },
        })
      } catch {
        // Never throw from audit
      }
    })
    next(error)
  }
}

export const logAction = async ({ action, userId, targetId, targetModel, details, req, status = 'success' }) => {
  try {
    await AuditLog.create({
      action,
      performedBy: userId,
      targetId,
      targetModel,
      details,
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
      status,
    })
  } catch {
    // Do not allow audit failures to interrupt main flow
  }
}
