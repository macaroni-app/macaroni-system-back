import { RequestHandler, Router } from 'express'
import verifyToken from '../middlewares/validate-token'
import verifyRole from '../middlewares/verifyRoles'
import { schemaValidator } from '../middlewares/schemaValidator'
import ProfileBase from '../permissions/ProfileBase'
import assetVariantsController from '../controllers/assetVariants'
import { ChangeIsActiveAssetVariantBodyType, ChangeIsActiveAssetVariantParamsType, ChangeIsActiveAssetVariantSchema, CreateAssetVariantSchema, DeleteAssetVariantParamsType, DeleteAssetVariantSchema, GetAssetVariantSchema, UpdateAssetVariantBodyType, UpdateAssetVariantParamsType, UpdateAssetVariantSchema } from '../schemas/assetVariants'

const assetVariantsRouter = Router()

assetVariantsRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.view), schemaValidator(GetAssetVariantSchema)], assetVariantsController.getAll as RequestHandler)
assetVariantsRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.view), schemaValidator(GetAssetVariantSchema)], assetVariantsController.getOne as unknown as RequestHandler)
assetVariantsRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.create), schemaValidator(CreateAssetVariantSchema)], assetVariantsController.store as RequestHandler)
assetVariantsRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.edit), schemaValidator(UpdateAssetVariantSchema)], assetVariantsController.update as RequestHandler<UpdateAssetVariantParamsType, {}, UpdateAssetVariantBodyType, {}>)
assetVariantsRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.delete), schemaValidator(DeleteAssetVariantSchema)], assetVariantsController.delete as RequestHandler<DeleteAssetVariantParamsType, {}, {}, {}>)
assetVariantsRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.assetVariants.deactivate), schemaValidator(ChangeIsActiveAssetVariantSchema)], assetVariantsController.changeIsActive as RequestHandler<ChangeIsActiveAssetVariantParamsType, {}, ChangeIsActiveAssetVariantBodyType, {}>)

export default assetVariantsRouter
