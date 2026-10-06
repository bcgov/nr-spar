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
import { getGerminatorTrayContents } from '../../../../api-service/consep/germinatorTrayAPI';
import {
  GermCountSlotType, GermReplicateType, GerminationTestHeaderType
} from '../../../../types/consep/GerminationType';
import useAutosave from '../../../../hooks/useAutosave';
import useActivityConflict from '../hooks/useActivityConflict';

import Breadcrumbs from '../../../../components/Breadcrumbs';
import PageTitle from '../../../../components/PageTitle';
import StatusTag from '../../../../components/StatusTag';
import ConflictNotification from '../../../../components/CONSEP/ConflictNotification';
import SummaryGrid, { type SummaryColumn } from '../../../../components/CONSEP/SummaryGrid';

import DailyGermTable from './DailyGermTable';
import AbnormalsTable, { ABNORMAL_CATEGORIES } from './AbnormalsTable';
import {
  getDefaultSeeds, validateCountDates, checkOverLimit, buildUpsertPayload,
  parseCountInput, ABNORMAL_MAX, REP_ABNORMAL_KEYS
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

const GerminationTestContent = ({ riaKey }: { riaKey?: string }) => {
  const navigate = useNavigate();

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
  // The count day the abnormals table is showing (#2606). Sticky: set by moving
  // into a column of the germinants table, never cleared on the way out.
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
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

    const status = (germCountQuery.error as AxiosError | undefined)?.response?.status;
    if (germCountQuery.isError && status !== 404) {
      setAlert({
        isSuccess: false,
        message: 'Could not load germination counts. Try reloading the page.'
      });
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
  }, [germCountQuery.isFetched, germCountQuery.data, germCountQuery.isError, germCountQuery.error]);

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

  // Falls back to the first dated day, which covers both "nothing selected yet"
  // (AC2: the screen opens showing a day's abnormals) and "the selected day's
  // date was just cleared", where the slot it points at no longer holds counts.
  const activeSlot = slots.find((slot) => slot.slotIndex === selectedSlot && slot.countDt)
    ?? slots.find((slot) => slot.countDt);

  const handleAbnormalChange = (
    repNumber: number,
    field: string,
    raw: string
  ) => {
    const parsed = parseCountInput(raw, ABNORMAL_MAX);
    if (parsed === null || !activeSlot) {
      return;
    }
    const repKey = REP_ABNORMAL_KEYS[repNumber - 1];
    setSlots(slots.map((slot) => (
      slot.slotIndex === activeSlot.slotIndex
        ? { ...slot, [repKey]: { ...slot[repKey], [field]: parsed } }
        : slot
    )));
  };

  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
  }, []);

  // Read after an awaited flush, where the mutation object in this render's
  // closure would still report the state from before the save.
  const lastSaveFailed = useRef(false);
  const saveMutation = useMutation({
    mutationFn: (data: { slots: GermCountSlotType[]; replicates: GermReplicateType[] }) => (
      putGermCounts(
        riaKey ?? '',
        buildUpsertPayload(data.slots, data.replicates, updateTimestamp)
      )
    ),
    onSuccess: (response) => {
      lastSaveFailed.current = false;
      setUpdateTimestamp(response.updateTimestamp);
      setAlert({ isSuccess: true, message: 'Daily germination counts saved' });
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
      }
      alertTimerRef.current = setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      lastSaveFailed.current = true;
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

  const { markSaved, flush } = useAutosave({
    data: autosaveData,
    onSave: async (data) => { await saveMutation.mutateAsync(data); },
    enabled:
      isHydrated
      && isEditable
      // A record that already exists can be cleared back to no dates at all --
      // the PUT sends an empty `days` list and the backend blanks every slot.
      // A record that does not exist yet has nothing to clear, and saving one
      // would create an empty germ-count row for a test nobody has counted.
      && (hasDatedSlot || !!updateTimestamp)
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

  // Alt+Y: on to the next test on the same germinator tray (#2681), in the
  // tray's own order (seedlot, then request). Whatever was just typed is saved
  // first; anything that cannot be saved keeps the user here, because leaving
  // would drop it.
  const goToNextTrayTest = async () => {
    const trayId = header?.germinatorTrayId;
    if (!trayId) {
      return;
    }
    if (isConflict || Object.keys(validationErrors).length > 0) {
      setAlert({ isSuccess: false, message: 'Fix the errors on this test before moving to the next one.' });
      return;
    }
    // ponytail: a save already in flight disables flush, so edits made since
    // would be lost on leaving. Ignoring the key until it settles is the cheap
    // guard; queue the jump behind the save if users trip over it.
    if (saveMutation.isPending) {
      return;
    }
    try {
      await flush();
      if (lastSaveFailed.current) {
        return;
      }
      const tests = await getGerminatorTrayContents(trayId);
      const current = tests.findIndex((test) => String(test.riaSkey) === riaKey);
      const next = current === -1 ? undefined : tests[current + 1];
      if (!next?.riaSkey) {
        setAlert({ isSuccess: true, message: 'This is the last test on the tray.' });
        return;
      }
      navigate(ROUTES.GERMINATION_TEST_RESULT.replace(':riaKey', String(next.riaSkey)));
    } catch (error) {
      setAlert({
        isSuccess: false,
        message: `Could not load the tray's tests: ${(error as AxiosError).message}`
      });
    }
  };
  const goToNextTrayTestRef = useRef(goToNextTrayTest);
  // eslint-disable-next-line react-hooks/refs
  goToNextTrayTestRef.current = goToNextTrayTest;
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // `code`, not `key`: on a Mac Alt+Y types "¥".
      if (e.altKey && e.code === 'KeyY') {
        e.preventDefault();
        goToNextTrayTestRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  const summaryColumns: SummaryColumn<GerminationTestHeaderType>[] = [
    { key: 'requestId', label: 'Request ID', renderValue: (data) => data?.requestId ?? '-' },
    { key: 'activity', label: 'Activity', renderValue: (data) => data?.activityTypeCd ?? '-' },
    {
      key: 'seedlotNumber',
      label: 'Seedlot number',
      renderValue: (data) => (
        !data?.seedlotNumber || data.seedlotNumber === '00000'
          ? data?.familyLotNumber ?? '-'
          : data.seedlotNumber
      )
    },
    { key: 'species', label: 'Species', renderValue: (data) => data?.vegetationState ?? '-' },
    { key: 'germTray', label: 'Germ tray', renderValue: (data) => data?.germinatorTrayId ?? '-' }
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
      {/* A missing test redirects to 404 (see the effect above). Any other
          header failure — the Oracle API being unreachable, say — has to be
          said out loud, or the screen below just renders empty. */}
      {headerQuery.isError && (headerQuery.error as AxiosError).response?.status !== 404 && (
        <InlineNotification
          lowContrast
          kind="error"
          title="Could not load this germination test"
          subtitle="The test details are unavailable right now. Try reloading the page."
        />
      )}
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
          <Row className="consep-germination-content-summary">
            <SummaryGrid
              item={header}
              isFetching={headerQuery.isFetching}
              columns={summaryColumns}
              cellClassName="consep-germination-content-summary-cell"
            />
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
                onSlotSelect={setSelectedSlot}
                isHydrated={isHydrated}
                firstAbnormalCode={ABNORMAL_CATEGORIES[0].code}
              />
            </Column>
          </Row>
          <Row className="consep-germination-content-table">
            <Column>
              <AbnormalsTable
                slot={activeSlot}
                replicates={replicates}
                isEditable={isEditable}
                validationErrors={validationErrors}
                onAbnormalChange={handleAbnormalChange}
              />
            </Column>
          </Row>
          {/* Legacy action buttons (Final/Rank/Curve/Copy results/...) are still
              out of scope — placeholders intentionally omitted. */}
        </>
      )}
    </FlexGrid>
  );
};

/**
 * Remounted per test: `header`, `slots`, `replicates`, the update timestamp and
 * the hydration gate are all per-RIA state, and React Router reuses the element
 * across a param change. Without the key, navigating between two germination
 * tests would leave the previous test's table on screen and editable while the
 * new queries load, and an edit in that window would autosave the old snapshot
 * (and old lock timestamp) onto the new RIA.
 */
const GerminationContent = () => {
  const { riaKey } = useParams();
  return <GerminationTestContent key={riaKey} riaKey={riaKey} />;
};

export default GerminationContent;
