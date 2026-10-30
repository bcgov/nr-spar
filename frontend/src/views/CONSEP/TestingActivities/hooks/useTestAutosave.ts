import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

import useAutosave from '../../../../hooks/useAutosave';
import testingActivitiesAPI from '../../../../api-service/consep/testingActivitiesAPI';
import {
  ActivityRecordType, ReplicateType, TestingTypes
} from '../../../../types/consep/TestingActivityType';
import useActivityConflict from './useActivityConflict';
import { isDateRangeOrdered } from './dateRange';

type Snapshot = { activityRecord: ActivityRecordType; replicates: ReplicateType[] };

const toDate = (value?: string) => (value ? new Date(value) : null);

/**
 * Moisture/Purity auto save: the activity record and the replicates go out together in
 * one PUT, locked on the activity's updateTimestamp (#2782).
 */
const useTestAutosave = (
  testType: TestingTypes,
  riaKey: string | undefined,
  onError: (message: string) => void
) => {
  const [activityRecord, setActivityRecord] = useState<ActivityRecordType>();
  const [replicates, setReplicates] = useState<ReplicateType[]>([]);
  // Reported by ActivityResult: a cell is invalid or a delete is in flight.
  const [isReplicatesBlocked, setReplicatesBlocked] = useState(false);
  const { isConflict, markConflict, clearConflict } = useActivityConflict();

  const saveMutation = useMutation({
    mutationFn: (snapshot: Snapshot): Promise<AxiosResponse> => testingActivitiesAPI(
      testType,
      'autosave',
      { riaKey, payload: { activity: snapshot.activityRecord, replicates: snapshot.replicates } }
    ),
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        markConflict();
        return;
      }
      onError(`Failed to save: ${(error as AxiosError).message}`);
    }
  });

  // Derived from state, not checked in the change handler, so the error shown and the
  // save gate always agree with the dates on screen.
  const isDateRangeValid = isDateRangeOrdered(
    toDate(activityRecord?.actualBeginDateTime),
    toDate(activityRecord?.actualEndDateTime)
  );

  const data = useMemo<Snapshot>(
    () => ({ activityRecord: activityRecord ?? {}, replicates }),
    [activityRecord, replicates]
  );

  const { markSaved } = useAutosave<Snapshot, AxiosResponse>({
    data,
    onSave: (snapshot) => saveMutation.mutateAsync(snapshot),
    onSaved: (response, sent) => {
      const { updateTimestamp } = response.data;
      setActivityRecord((prev) => ({ ...prev, updateTimestamp }));
      return { ...sent, activityRecord: { ...sent.activityRecord, updateTimestamp } };
    },
    enabled: !!activityRecord
      && !saveMutation.isPending
      && !isReplicatesBlocked
      && isDateRangeValid,
    conflict: isConflict
  });

  // Load server state as already saved: hydration never PUTs.
  const hydrate = (record: ActivityRecordType, replicatesList: ReplicateType[]) => {
    setActivityRecord(record);
    setReplicates(replicatesList);
    markSaved({ activityRecord: record, replicates: replicatesList });
  };

  return {
    activityRecord,
    setActivityRecord,
    replicates,
    setReplicates,
    setReplicatesBlocked,
    hydrate,
    isDateRangeValid,
    isConflict,
    clearConflict
  };
};

export default useTestAutosave;
