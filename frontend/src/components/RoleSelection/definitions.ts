import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType'

export type clientTypeConfig = {
  isIcon: boolean,
  img: string
}

export type OrganizationItemProps = {
  forestClient?: ForestClientType
}
