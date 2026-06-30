import { RequestHandler, Router } from 'express'
import verifyToken from '../middlewares/validate-token'
import verifyRole from '../middlewares/verifyRoles'
import { schemaValidator } from '../middlewares/schemaValidator'
import ProfileBase from '../permissions/ProfileBase'
import variantAttributesController from '../controllers/variantAttributes'
import { ChangeIsActiveVariantAttributeBodyType, ChangeIsActiveVariantAttributeParamsType, ChangeIsActiveVariantAttributeSchema, CreateVariantAttributeSchema, DeleteVariantAttributeParamsType, DeleteVariantAttributeSchema, GetVariantAttributeSchema, UpdateVariantAttributeBodyType, UpdateVariantAttributeParamsType, UpdateVariantAttributeSchema } from '../schemas/variantAttributes'

const variantAttributesRouter = Router()

variantAttributesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.view), schemaValidator(GetVariantAttributeSchema)], variantAttributesController.getAll as RequestHandler)
variantAttributesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.view), schemaValidator(GetVariantAttributeSchema)], variantAttributesController.getOne as unknown as RequestHandler)
variantAttributesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.create), schemaValidator(CreateVariantAttributeSchema)], variantAttributesController.store as RequestHandler)
variantAttributesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.edit), schemaValidator(UpdateVariantAttributeSchema)], variantAttributesController.update as RequestHandler<UpdateVariantAttributeParamsType, {}, UpdateVariantAttributeBodyType, {}>)
variantAttributesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.delete), schemaValidator(DeleteVariantAttributeSchema)], variantAttributesController.delete as RequestHandler<DeleteVariantAttributeParamsType, {}, {}, {}>)
variantAttributesRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributes.deactivate), schemaValidator(ChangeIsActiveVariantAttributeSchema)], variantAttributesController.changeIsActive as RequestHandler<ChangeIsActiveVariantAttributeParamsType, {}, ChangeIsActiveVariantAttributeBodyType, {}>)

export default variantAttributesRouter
