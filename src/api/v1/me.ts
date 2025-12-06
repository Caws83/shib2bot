/**
 * User profile API endpoints
 */

import { Router, Response } from 'express';
import { authenticateApiKey, AuthRequest } from '../../middleware/auth';
import { getBalance } from '../../services/creditService';
import { logger } from '../../utils/logger';

const router = Router();

/**
 * GET /api/v1/me/credits
 * Get user credit balance
 */
router.get('/credits', authenticateApiKey, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const balance = await getBalance(req.user.id);

    res.json({
      userId: req.user.id,
      creditBalance: balance,
    });
  } catch (error: any) {
    logger.error('Error in /api/v1/me/credits', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

