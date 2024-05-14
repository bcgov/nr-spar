import { QueryState } from '@tanstack/react-query';
import { ForestClientType } from '../../types/ForestClientTypes/ForestClientType';

export type ClientTypeConfig = {
  isIcon: boolean,
  img: string
}

export type OrganizationItemProps = {
  forestClient?: ForestClientType
  queryState?: QueryState<unknown, undefined>
  selected?: boolean
}

export type RoleSelectionProps = {
  simpleView?: boolean;
}
