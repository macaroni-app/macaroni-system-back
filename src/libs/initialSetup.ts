import Role from '../models/roles'

export const createRoles = async (): Promise<any> => {
  try {
    const count = await Role.estimatedDocumentCount()

    if (count > 0) return

    const values = await Promise.all([
      new Role({ name: 'Seller', code: 2001 }).save(),
      new Role({ name: 'Supervisor', code: 7085 }).save(),
      new Role({ name: 'Admin', code: 5150 }).save()
    ])
    console.log(values)
  } catch (error) {
    console.error(error)
  }
}
