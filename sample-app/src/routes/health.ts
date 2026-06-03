import { Router, Request, Response } from 'express';

const router = Router();

/** Track server start time for uptime calculation */
const serverStartTime = Date.now();

/**
 * @route GET /health
 * @description Returns service health status with uptime and timestamp
 * @returns {object} 200 - Health status object
 * @returns {string} 200.status - Service status ("ok")
 * @returns {number} 200.uptime - Server uptime in seconds
 * @returns {string} 200.timestamp - Current timestamp in ISO 8601 format
 */
router.get('/health', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor((Date.now() - serverStartTime) / 1000);
  const timestamp = new Date().toISOString();

  res.status(200).json({
    status: 'ok',
    uptime: uptimeSeconds,
    timestamp,
  });
});

export default router;
