import { Router } from 'express';
import {
  getHistory,
  predictNews,
  predictNewsFromUrl,
  getArticleWithClaims,
  getAnalytics,
  clearHistory,
  deleteArticle,
} from '../controllers/newsController.js';

const router = Router();

router.post('/predict', predictNews);
router.post('/predict-url', predictNewsFromUrl);
router.get('/history', getHistory);
router.delete('/history', clearHistory);
router.delete('/history/:articleId', deleteArticle);
router.get('/article/:articleId', getArticleWithClaims);
router.get('/analytics', getAnalytics);

export default router;
