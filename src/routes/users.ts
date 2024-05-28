import { RequestHandler, Router } from 'express'

import usersController from '../controllers/users'

import verifyToken from '../middlewares/validate-token'

import verifyRole from '../middlewares/verifyRoles'

import ProfileBase from '../permissions/ProfileBase'

const usersRouter = Router()

usersRouter.get('/', verifyToken as RequestHandler, usersController.getAll as RequestHandler)
usersRouter.post('/login', usersController.login as RequestHandler)
usersRouter.get('/logout', usersController.logout as RequestHandler)
usersRouter.get('/refresh', usersController.refreshToken as RequestHandler)
usersRouter.post('/register', [verifyToken as RequestHandler, verifyRole(ProfileBase.users.create)], usersController.store as RequestHandler)
usersRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.users.deactivate)], usersController.changeIsActive as RequestHandler)
usersRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.users.edit)], usersController.update as RequestHandler)
usersRouter.put('/change-password/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.users.edit)], usersController.changePassword as RequestHandler)
usersRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.users.delete)], usersController.delete as RequestHandler)

// usersRouter.put("/recovery-password", usersController.recoverPassword);
// usersRouter.put('/new-password', usersController.newPassword)

export default usersRouter
