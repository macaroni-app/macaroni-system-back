import { RequestHandler, Router } from 'express'

import usersController from '../controllers/users'

import verifyToken from '../middlewares/validate-token'

const usersRouter = Router()

usersRouter.get('/', verifyToken as RequestHandler, usersController.getAll as RequestHandler)
usersRouter.post('/login', usersController.login as RequestHandler)
usersRouter.get('/logout', usersController.logout as RequestHandler)
usersRouter.get('/refresh', usersController.refreshToken as RequestHandler)
usersRouter.post('/register', usersController.store as RequestHandler)
// usersRouter.put("/recovery-password", usersController.recoverPassword);
// usersRouter.put('/new-password', usersController.newPassword)

export default usersRouter
