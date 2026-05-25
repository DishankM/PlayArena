// server/routes/tournamentRoutes.js
import express from 'express'
import { body, param } from 'express-validator'
import {
  createTournament,
  deleteTournament,
  getAllTournaments,
  getMyRegistrations,
  getTournamentById,
  getTournamentRegistrations,
  getUpcomingTournaments,
  registerForTournament,
  updateTournament,
  updateTournamentStatus,
} from '../controllers/tournamentController.js'
import { isAdmin, protect } from '../middleware/authMiddleware.js'

const router = express.Router()
const admin = [protect, isAdmin]
const futureDate = (value) => {
  if (new Date(value) <= new Date()) throw new Error('Start date must be in the future')
  return true
}

router.get('/', getAllTournaments)
router.get('/upcoming', getUpcomingTournaments)
router.get('/my-registrations', protect, getMyRegistrations)
router.get('/:id', [param('id').isMongoId()], getTournamentById)
router.post('/', admin, [
  body('name').trim().notEmpty().isLength({ min: 3, max: 100 }),
  body('sport').notEmpty(),
  body('type').isIn(['indoor', 'outdoor']),
  body('format').isIn(['solo', 'team', 'doubles']),
  body('entryFee').isNumeric(),
  body('maxSlots').isInt({ min: 2, max: 1000 }),
  body('startDate').isISO8601().custom(futureDate),
], createTournament)
router.patch('/:id', admin, [param('id').isMongoId()], updateTournament)
router.delete('/:id', admin, [param('id').isMongoId()], deleteTournament)
router.post('/:id/register', protect, [param('id').isMongoId()], registerForTournament)
router.get('/:id/registrations', admin, [param('id').isMongoId()], getTournamentRegistrations)
router.patch('/:id/status', admin, [param('id').isMongoId(), body('status').isIn(['upcoming', 'open', 'ongoing', 'completed', 'cancelled'])], updateTournamentStatus)

export default router
