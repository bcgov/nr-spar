import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  FlexGrid, Row, Column, InlineNotification, TextInput
} from '@carbon/react';
import { CheckmarkFilled } from '@carbon/icons-react';

import ROUTES from '../../../../routes/constants';
import {
  getGerminationTestHeader, getGermCounts, getTestReplicates, putGermCounts
} from '../../../../api-service/consep/germinationTestAPI';
import {
  GermCountSlotType, GermReplicateType, GerminationTestHeaderType
} from '../../../../types/consep/GerminationType';
import useAutosave from '../../../../hooks/useAutosave';
import useActivityConflict from '../hooks/useActivityConflict';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import StatusTag from '../../../../components/StatusTag';
import ConflictNotification from '../../../../components/CONSEP/ConflictNotification';

import DailyGermTable from './DailyGermTable';
import {
  getDefaultSeeds, validateCountDates, checkOverLimit, buildUpsertPayload
} from './utils';

import './styles.scss';

const emptySlots = (): GermCountSlotType[] => Array.from(
  { length: 13 },
  (_, i) => ({ slotIndex: i + 1 })
);

const defaultReplicates = (testCategoryCd?: string): GermReplicateType[] => Array.from(
  { length: 4 },
  (_, i) => ({
    replicateNumber: i + 1,
    totalNoSeeds: getDefaultSeeds(testCategoryCd),
    repAcceptedInd: 1,
    tolrncOvrrdeDesc: null
  })
);

const GerminationContent = () => {
  const navigate = useNavigate();
  const { riaKey } = useParams();

  const [header, setHeader] = useState<GerminationTestHeaderType>();
  const [slots, setSlots] = useState<GermCountSlotType[]>(emptySlots());
  const [replicates, setReplicates] = useState<GermReplicateType[]>([]);
  const [alert, setAlert] = useState<{ isSuccess: boolean; message: string } | null>(null);
  const [updateTimestamp, setUpdateTimestamp] = useState<string | undefined>(undefined);
  const { isConflict, markConflict, clearConflict } = useActivityConflict();

  const headerQuery = useQuery({
    queryKey: ['germination-test-header', riaKey],
    queryFn: () => getGerminationTestHeader(riaKey ?? ''),
    refetchOnMount: true
  });

  const germCountQuery = useQuery({
    queryKey: ['germ-counts', riaKey],
    queryFn: () => getGermCounts(riaKey ?? ''),
    retry: false,
    refetchOnMount: true
  });

  const replicatesQuery = useQuery({
    queryKey: ['test-replicates', riaKey],
    queryFn: () => getTestReplicates(riaKey ?? ''),
    retry: false,
    refetchOnMount: true
  });

  useEffect(() => {
    if (
      headerQuery.isFetched
      && headerQuery.status === 'error'
      && (headerQuery.error as AxiosError).response?.status === 404
    ) {
      navigate(ROUTES.FOUR_OH_FOUR);
    } else if (headerQuery.data) {
      setHeader(headerQuery.data);
    }
  }, [headerQuery.status, headerQuery.isFetched]);

  // Hydrate slots: merge sparse API slots into the fixed 13-slot grid
  useEffect(() => {
    if (germCountQuery.data) {
      const next = emptySlots();
      germCountQuery.data.slots.forEach((slot) => {
        next[slot.slotIndex - 1] = slot;
      });
      setSlots(next);
      setUpdateTimestamp(germCountQuery.data.updateTimestamp);
    }
  }, [germCountQuery.data]);

  // Hydrate replicates: API rows or category defaults (AC4)
  useEffect(() => {
    if (!headerQuery.data || !replicatesQuery.isFetched) {
      return;
    }
    const fetched = replicatesQuery.data;
    if (fetched && fetched.length > 0) {
      setReplicates(fetched);
    } else {
      setReplicates(defaultReplicates(headerQuery.data.testCategoryCd));
    }
  }, [replicatesQuery.isFetched, replicatesQuery.data, headerQuery.data]);

  const validationErrors = useMemo(() => ({
    ...validateCountDates(slots),
    ...checkOverLimit(slots, replicates)
  }), [slots, replicates]);

  const hasDatedSlot = slots.some((slot) => slot.countDt);
  const isEditable = header?.testCompleteInd !== 1 && !isConflict;

  // Hydration completes once both the germ-count query (200 or 404) and the
  // replicates query have settled — until then autosave must stay disabled,
  // otherwise the pre-hydration empty/default state would be saved as if it
  // were a real edit.
  const isHydrated = germCountQuery.isFetched && replicatesQuery.isFetched;

  const saveMutation = useMutation({
    mutationFn: (data: { slots: GermCountSlotType[]; replicates: GermReplicateType[] }) => (
      putGermCounts(
        riaKey ?? '',
        buildUpsertPayload(data.slots, data.replicates, updateTimestamp)
      )
    ),
    onSuccess: (response) => {
      setUpdateTimestamp(response.updateTimestamp);
      setAlert({ isSuccess: true, message: 'Daily germination counts saved' });
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        markConflict();
        return;
      }
      setAlert({
        isSuccess: false,
        message: `Failed to save germination counts: ${(error as AxiosError).message}`
      });
    }
  });

  const autosaveData = useMemo(
    () => ({ slots, replicates }),
    [slots, replicates]
  );

  const { markSaved } = useAutosave({
    data: autosaveData,
    onSave: (data) => saveMutation.mutateAsync(data),
    enabled:
      isHydrated
      && isEditable
      && hasDatedSlot
      && replicates.length > 0
      && Object.keys(validationErrors).length === 0
      && !saveMutation.isPending
  });

  // Mark the freshly hydrated data as already-saved so the debounce/maxWait
  // timers in useAutosave never fire for the initial load itself — only for
  // edits made after hydration. This must run from an effect keyed on the
  // hydration flags (not assigned inline during render via a ref) so it
  // fires exactly once per hydration, after state settles, avoiding a
  // spurious early PUT with empty days on first render.
  useEffect(() => {
    if (isHydrated) {
      markSaved(autosaveData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const handleReloadOnConflict = async () => {
    const [countResult] = await Promise.all([
      germCountQuery.refetch(),
      replicatesQuery.refetch()
    ]);
    // germ-counts may legitimately 404 (no row yet); only a fresh read matters
    if (countResult.status === 'success' || countResult.status === 'error') {
      clearConflict();
    }
  };

  const crumbs = [
    { name: 'CONSEP', path: ROUTES.CONSEP_FAVOURITE_ACTIVITIES },
    { name: 'Testing activities search', path: ROUTES.TESTING_REQUESTS_REPORT },
    { name: 'Testing list', path: ROUTES.TESTING_ACTIVITIES_LIST }
  ];

  const headerFields: Array<{ label: string; value?: string | number }> = [
    { label: 'Request ID', value: header?.requestId },
    { label: 'Activity', value: header?.activityTypeCd },
    { label: 'Seedlot number', value: header?.seedlotNumber },
    { label: 'Species', value: header?.vegetationState },
    { label: 'Germ tray', value: header?.germinatorTrayId },
    { label: 'Category', value: header?.testCategoryCd },
    { label: 'Rank', value: header?.testRank },
    { label: 'Germination %', value: header?.germinationPct },
    { label: 'GV', value: header?.germinationValue },
    { label: 'PV', value: header?.peakValueGrmPct },
    { label: 'Germinator ID', value: header?.germinatorId }
  ];

  return (
    <FlexGrid className="consep-germination-content">
      {isConflict && (
        <ConflictNotification
          className="consep-germination-content-conflict"
          onReload={handleReloadOnConflict}
        />
      )}
      {alert?.message && (
        <InlineNotification
          lowContrast
          kind={alert.isSuccess ? 'success' : 'error'}
          title={alert.isSuccess ? 'Success' : 'Error'}
          subtitle={alert.message}
        />
      )}
      <Row className="consep-germination-content-breadcrumb">
        <Breadcrumbs crumbs={crumbs} />
      </Row>
      {/* Title (and everything below) is gated on the header having loaded:
          the header card, table hydration and day-number calculations all
          depend on header fields (e.g. germinatorEntry), so rendering them
          before header exists would show stale/blank data and let a user
          interact with the table before day numbers can be computed. */}
      {header && (
        <>
          <Row className="consep-germination-content-title">
            <PageTitle title={`Germination test result (${header.activityTypeCd ?? ''})`} />
            <>
              {header.testCompleteInd === 1 && <StatusTag type="Completed" renderIcon={CheckmarkFilled} />}
              {header.acceptResultInd === 1 && <StatusTag type="Accepted" renderIcon={CheckmarkFilled} />}
            </>
          </Row>
          <Row className="consep-germination-content-header-card">
            {headerFields.map((field) => (
              <Column key={field.label} sm={2} md={2} lg={3} xlg={3}>
                <div className="consep-germination-content-header-field">
                  <span className="consep-germination-content-header-label">{field.label}</span>
                  <span className="consep-germination-content-header-value">
                    {field.value?.toString() ?? '—'}
                  </span>
                </div>
              </Column>
            ))}
          </Row>
          <Row className="consep-germination-content-comments">
            <Column>
              <TextInput
                id="germ-header-comments"
                labelText="Comments"
                value={header.riaComment ?? ''}
                readOnly
              />
            </Column>
          </Row>
          <Row className="consep-germination-content-table">
            <Column>
              <DailyGermTable
                slots={slots}
                replicates={replicates}
                germinatorEntry={header.germinatorEntry}
                isEditable={isEditable}
                validationErrors={validationErrors}
                onSlotsChange={setSlots}
                onReplicatesChange={setReplicates}
              />
            </Column>
          </Row>
          {/* Abnormals table (#2606) and legacy action buttons (Final/Rank/Curve/...)
              are out of scope for #2514 — placeholders intentionally omitted. */}
        </>
      )}
    </FlexGrid>
  );
};

export default GerminationContent;
