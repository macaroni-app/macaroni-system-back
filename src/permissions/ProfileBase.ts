import { RoleCodes } from '../config/rolesCodes'

const ProfileBase = {
  routes: {
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  sales: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    cancel: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  saleItems: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    cancel: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  products: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  productItems: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  assets: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR]
  },
  inventories: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN]
  },
  inventoryTransactions: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN]
  },
  categories: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR]
  },
  productTypes: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR]
  },
  clients: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    edit: [RoleCodes.ADMIN],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  paymentMethods: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    edit: [RoleCodes.ADMIN],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR]
  },
  roles: {
    create: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    edit: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    deactivate: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER]
  },
  users: {
    create: [RoleCodes.ADMIN],
    edit: [RoleCodes.ADMIN],
    editOwnInfo: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    deactivate: [RoleCodes.ADMIN],
    delete: [RoleCodes.ADMIN],
    view: [RoleCodes.ADMIN],
    viewDetails: [RoleCodes.ADMIN, RoleCodes.SUPERVISOR, RoleCodes.SELLER],
    viewActions: [RoleCodes.ADMIN]
  }
}

export default ProfileBase
