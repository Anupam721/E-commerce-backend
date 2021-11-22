const expres = require('express')
const router = express.Router()

const {} = require('../controllers/product')
const {isSignedIn, isAuthenticated, isAdmin} = require('../controllers/auth')
const {getUserById} = require('../controllers/user')

//all params
router.param('userId',getUserById)
router.param('productId', getProductbyId)

//actual routes


module.exports = router