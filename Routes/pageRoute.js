import express from 'express'
import * as pageController from "../Controllers/pageController.js"


const router = express.Router()

router.route("/").get(pageController.getIndexPage)
router.route("/UyeGirisi").get(pageController.getUyeGirisiPage)
router.route("/UyeOl").get(pageController.getUyeOlPage)
router.route("/UyeOlundu").get(pageController.getUyeOlunduPage)
router.route("/Anasayfa").get(pageController.getAnaSayfaPage)
router.route("/LigOlustur").get(pageController.getLigOlusturPage);
router.route("/LigeKatil").get(pageController.getLigeKatilPage)
router.route("/Liglerim").get(pageController.getLiglerimPage)
router.route("/lig/:id").get(pageController.getLeagueDetails);
router.route('/lig/:id/MacEkle').get(pageController.getAddMatchPage);
router.route('/lig/:ligId/mac/:matchId').get(pageController.getMatchDetails)




export default router