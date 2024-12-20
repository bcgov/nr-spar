/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  Modal, Table, TableHead, TableRow, TableHeader, Pagination,
  TableBody, TableCell, TableContainer, DataTable, TableSelectRow, TableSelectAll
} from '@carbon/react';
import * as Icons from '@carbon/icons-react';

import { getFavAct, postFavAct, deleteFavAct } from '../../../api-service/favouriteActivitiesAPI';
import { FavActivityPostType } from '../../../types/FavActivityTypes';

import { textConfig, favActHeaders } from './constants';
import {
  HeaderProps, RowProps, FavouriteActivityModalProps, FavActivityTableProps
} from './definitions';
import './styles.scss';

import FavouriteActivityMap from '../../../config/FavouriteActivityMap';

const allRows: RowProps[] = Object.keys(FavouriteActivityMap).map((key) => {
  const activity = FavouriteActivityMap[key];
  if (activity.isConsep) {
    return {
      id: key,
      activityName: activity.header,
      department: activity.department || 'Unknown'
    };
  }
  return null;
}).filter((activity) => activity !== null);

type Department = 'Testing' | 'Administrative' | 'Withdrawal' | 'Processing' | 'Seed and family lot';

const headerIconMap: Record<Department, string> = {
  Testing: 'Chemistry',
  Administrative: 'Tools',
  Withdrawal: 'StayInside',
  Processing: 'Industry',
  'Seed and family lot': 'SoilMoistureGlobal'
};

const FavouriteActivityModal = ({ open, setOpen }: FavouriteActivityModalProps) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [initActs, setInitActs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const currentRows = allRows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectRow = (row: RowProps) => {
    setSelectedRows((prev: string[]) => (prev.includes(row.id)
      ? prev.filter((id: string) => id !== row.id)
      : [...prev, row.id]));
  };

  const queryClient = useQueryClient();

  const favActQueryKey = ['favourite-activities'];

  const favActQuery = useQuery({
    queryKey: favActQueryKey,
    queryFn: getFavAct
  });

  const addFavAct = useMutation({
    mutationFn: (actObjs: FavActivityPostType[]) => postFavAct(actObjs),
    onSuccess: () => {
      queryClient.invalidateQueries(favActQueryKey);
    }
  });

  const removeFavAct = useMutation({
    mutationFn: (id: number) => deleteFavAct(id),
    onSuccess: () => {
      queryClient.invalidateQueries(favActQueryKey);
    }
  });

  const handleSubmit = () => {
    const newActs = selectedRows.filter((act) => !initActs.includes(act))
      .map((act) => ({ activity: act, isConsep: true }));
    const removedActs = initActs.filter((act) => !selectedRows.includes(act))
      .map((act) => favActQuery.data?.filter((fav) => fav.type === act)[0]?.id)
      .filter((id) => id !== undefined);
    addFavAct.mutate(newActs);
    removedActs.forEach((id) => removeFavAct.mutate(id));
    setInitActs(selectedRows);
    setOpen(false);
  };

  useEffect(
    () => {
      if (favActQuery.isSuccess
            && favActQuery.data) {
        const consepData = favActQuery.data.filter((fav) => fav.isConsep === true)
          .map((fav) => fav.type);
        setSelectedRows(consepData);
        setInitActs(consepData);
      }
    },
    [favActQuery.isSuccess]
  );

  return (
    <Modal
      className="favourite-activity-modal"
      modalHeading={textConfig.title}
      primaryButtonText={textConfig.buttons.confirm}
      secondaryButtonText={textConfig.buttons.cancel}
      open={open}
      onRequestClose={() => {
        setOpen(false);
      }}
      onRequestSubmit={handleSubmit}
      size="sm"
    >
      <p className="favourite-activity-modal-description">
        {textConfig.description}
      </p>
      <DataTable
        rows={currentRows}
        headers={favActHeaders}
        render={({
          rows,
          headers,
          getHeaderProps,
          getSelectionProps,
          getRowProps
        }: FavActivityTableProps) => (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableSelectAll />
                  {headers.map((header: HeaderProps) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: RowProps) => (
                  <TableRow
                    {...getRowProps({ row })}
                    key={row.id}
                    onClick={() => handleSelectRow(row)}
                  >
                    <TableSelectRow
                      {...getSelectionProps({ row })}
                      checked={selectedRows.includes(row.id)}
                      disabled={selectedRows.length >= 12 && !selectedRows.includes(row.id)}
                    />
                    {row.cells?.map((cell) => {
                      const Icon = Icons[headerIconMap[cell.value as keyof typeof headerIconMap]];
                      return (
                        <TableCell key={cell.id} className="fav-act-row">
                          {Icon && (<Icon className="fav-act-department-icon" />)}
                          <span>{cell.value}</span>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      />

      <Pagination
        totalItems={allRows.length}
        pageSize={itemsPerPage}
        pageSizes={[5, 10, 15, 20]}
        onChange={({ page, pageSize }: { page: number; pageSize: number }) => {
          setCurrentPage(page);
          setItemsPerPage(pageSize);
        }}
      />
    </Modal>
  );
};

export default FavouriteActivityModal;
