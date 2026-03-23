const auditLogger = (action, entity, entityId) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      originalSend.call(this, body);
      
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.userId) {
        logAudit(
          req.userId,
          action,
          entity,
          entityId,
          JSON.stringify({ 
            method: req.method, 
            path: req.path,
            body: sanitizeBody(req.body),
            response: body ? JSON.parse(body) : null
          }),
          req.ip
        ).catch(console.error);
      }
      
      return this;
    };
    
    next();
  };
};

async function logAudit(userId, action, entity, entityId, details, ipAddress) {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

function sanitizeBody(body) {
  if (!body) return {};
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'creditCard'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

module.exports = { auditLogger };