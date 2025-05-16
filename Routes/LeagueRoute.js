import express from 'express';

import { authenticateToken } from "../middlewares/authmiddleware.js";
import * as LeagueController from "../Controllers/LeagueController.js";


const router = express.Router();

// Lig oluşturma rotası
router.post("/LigOlustur", LeagueController.createLeague);
router.post("/LigeKatil", LeagueController.joinLeague);
router.post('/lig/:id/kadro-yayinla', LeagueController.createMatch);
router.post('/lig/:ligId/sonuc-gir', LeagueController.enterResults);
router.post('/lig/:ligId/lig-duzenle', LeagueController.editLeague);


export default router;