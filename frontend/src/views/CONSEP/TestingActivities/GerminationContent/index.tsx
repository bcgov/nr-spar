import React, {
  useEffect, useMemo, useRef, useState
} from 'react';
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
  // Hydration completes once both the germ-count query (200 or 404) and the
  // replicates query have settled — until then autosave must stay disabled,
  // otherwise the pre-hydration empty/default state would be saved as if it
  // were a real edit. Held in state so autosave re-evaluates its `enabled`
  // gate when it flips true.
  const [isHydrated, setIsHydrated] = useState(false);
  const { isConflict, markConflict, clearConflict } = useActivityConflict();

  // Latest slots/replicates mirrored into refs so a hydration effect can hand
  // useAutosave a combined { slots, replicates } snapshot as already-saved,
  // even when only one half is being set in that effect. Mirroring during
  // render is the "latest ref" pattern — read only in effects below, never to
  // drive rendering — so the lint warning does not apply here.
  const slotsRef = useRef<GermCountSlotType[]>(slots);
  // eslint-disable-next-line react-hooks/refs
  slotsRef.current = slots;
  const replicatesRef = useRef<GermReplicateType[]>(replicates);
  // eslint-disable-next-line react-hooks/refs
  replicatesRef.current = replicates;
  // markSaved is created by useAutosave below, but the hydration effects run
  // after that hook on every render; a ref lets them call the latest instance.
  const markSavedRef = useRef<(v: { slots: GermCountSlotType[]; replicates: GermReplicateType[] }) => void>(
    () => {}
  );

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
    // headerQuery.data is included so a conflict-reload refetch (I5) that
    // returns a changed header — e.g. testCompleteInd flipping to 1 — actually
    // reapplies; status/isFetched alone can stay unchanged across a refetch.
  }, [headerQuery.status, headerQuery.isFetched, headerQuery.data]);

  // Hydrate slots: merge sparse API slots into the fixed 13-slot grid.
  // Sets state AND marks the resulting { slots, replicates } snapshot as
  // already-saved in the same effect (via refs for the replicates half), so
  // useAutosave's savedRef is never a render behind the hydrated data — the
  // C1 ghost-PUT root cause. germ-counts may legitimately 404 (no row yet):
  // isFetched (not data) is what settles this half.
  useEffect(() => {
    if (!germCountQuery.isFetched) {
      return;
    }
    const nextSlots = emptySlots();
    if (germCountQuery.data) {
      germCountQuery.data.slots.forEach((slot) => {
        nextSlots[slot.slotIndex - 1] = slot;
      });
      setUpdateTimestamp(germCountQuery.data.updateTimestamp);
    }
    setSlots(nextSlots);
    slotsRef.current = nextSlots;
    if (replicatesQuery.isFetched && headerQuery.data) {
      markSavedRef.current({ slots: nextSlots, replicates: replicatesRef.current });
      setIsHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [germCountQuery.isFetched, germCountQuery.data]);

  // Hydrate replicates: API rows or category defaults (AC4). Same
  // set-state-then-markSaved discipline as the slots effect.
  useEffect(() => {
    if (!headerQuery.data || !replicatesQuery.isFetched) {
      return;
    }
    const fetched = replicatesQuery.data;
    const nextReplicates = (fetched && fetched.length > 0)
      ? fetched
      : defaultReplicates(headerQuery.data.testCategoryCd);
    setReplicates(nextReplicates);
    replicatesRef.current = nextReplicates;
    if (germCountQuery.isFetched) {
      markSavedRef.current({ slots: slotsRef.current, replicates: nextReplicates });
      setIsHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replicatesQuery.isFetched, replicatesQuery.data, headerQuery.data]);

  const validationErrors = useMemo(() => ({
    ...validateCountDates(slots),
    ...checkOverLimit(slots, replicates)
  }), [slots, replicates]);

  const hasDatedSlot = slots.some((slot) => slot.countDt);
  const isEditable = header?.testCompleteInd !== 1 && !isConflict;

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
    onSave: async (data) => { await saveMutation.mutateAsync(data); },
    enabled:
      isHydrated
      && isEditable
      && hasDatedSlot
      && replicates.length > 0
      && Object.keys(validationErrors).length === 0
      && !saveMutation.isPending
  });

  // Keep the ref the hydration effects call pointing at the latest markSaved.
  // markSaved is a fresh closure each render but always mutates the same
  // savedRef inside useAutosave, so the hydration effects (which run after
  // this assignment on every commit) hand it the freshly hydrated snapshot —
  // never a stale pre-hydration closure. This replaces the old
  // [isHydrated]-keyed markSaved effect whose captured autosaveData lagged a
  // render behind and produced the C1 ghost PUT. Assigning during render (not
  // in an effect) is deliberate: effects run after render, so this guarantees
  // the ref is current before the hydration effects below fire this commit.
  // eslint-disable-next-line react-hooks/refs
  markSavedRef.current = markSaved;

  const handleReloadOnConflict = async () => {
    // Refetch the header too (I5): germinatorEntry drives day-number calc and
    // testCompleteInd gates isEditable, so a stale header would leave both
    // wrong after a conflict reload.
    const [countResult] = await Promise.all([
      germCountQuery.refetch(),
      replicatesQuery.refetch(),
      headerQuery.refetch()
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
