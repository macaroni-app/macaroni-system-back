import { RequestHandler, Router } from 'express'
import verifyToken from '../middlewares/validate-token'
import verifyRole from '../middlewares/verifyRoles'
import { schemaValidator } from '../middlewares/schemaValidator'
import ProfileBase from '../permissions/ProfileBase'
import variantAttributeValuesController from '../controllers/variantAttributeValues'
import { ChangeIsActiveVariantAttributeValueBodyType, ChangeIsActiveVariantAttributeValueParamsType, ChangeIsActiveVariantAttributeValueSchema, CreateVariantAttributeValueSchema, DeleteVariantAttributeValueParamsType, DeleteVariantAttributeValueSchema, GetVariantAttributeValueSchema, UpdateVariantAttributeValueBodyType, UpdateVariantAttributeValueParamsType, UpdateVariantAttributeValueSchema } from '../schemas/variantAttributeValues'

const variantAttributeValuesRouter = Router()

variantAttributeValuesRouter.get('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.view), schemaValidator(GetVariantAttributeValueSchema)], variantAttributeValuesController.getAll as RequestHandler)
variantAttributeValuesRouter.get('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.view), schemaValidator(GetVariantAttributeValueSchema)], variantAttributeValuesController.getOne as unknown as RequestHandler)
variantAttributeValuesRouter.post('/', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.create), schemaValidator(CreateVariantAttributeValueSchema)], variantAttributeValuesController.store as RequestHandler)
variantAttributeValuesRouter.put('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.edit), schemaValidator(UpdateVariantAttributeValueSchema)], variantAttributeValuesController.update as RequestHandler<UpdateVariantAttributeValueParamsType, {}, UpdateVariantAttributeValueBodyType, {}>)
variantAttributeValuesRouter.delete('/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.delete), schemaValidator(DeleteVariantAttributeValueSchema)], variantAttributeValuesController.delete as RequestHandler<DeleteVariantAttributeValueParamsType, {}, {}, {}>)
variantAttributeValuesRouter.put('/soft-delete/:id', [verifyToken as RequestHandler, verifyRole(ProfileBase.variantAttributeValues.deactivate), schemaValidator(ChangeIsActiveVariantAttributeValueSchema)], variantAttributeValuesController.changeIsActive as RequestHandler<ChangeIsActiveVariantAttributeValueParamsType, {}, ChangeIsActiveVariantAttributeValueBodyType, {}>)

export default variantAttributeValuesRouter
