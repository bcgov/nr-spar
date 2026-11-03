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
  // False once the test is completed or accepted (#2784): nothing on the page saves.
  isEditable: boolean
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
    // Other failures show as SaveStatus "Not saved", not as a toast.
    onError: (error) => {
      if ((error as AxiosError).response?.status === 409) {
        markConflict();
      }
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

  const { markSaved, flush, status } = useAutosave<Snapshot, AxiosResponse>({
    data,
    // Lock on the timestamp of the last saved snapshot, not the one in the edited data: a
    // save queued behind another (or flushed on unmount) must carry the newer timestamp.
    onSave: (snapshot, previous) => saveMutation.mutateAsync({
      ...snapshot,
      activityRecord: {
        ...snapshot.activityRecord,
        updateTimestamp: previous?.activityRecord.updateTimestamp
      }
    }),
    onSaved: (response, sent) => {
      const { updateTimestamp } = response.data;
      setActivityRecord((prev) => ({ ...prev, updateTimestamp }));
      return { ...sent, activityRecord: { ...sent.activityRecord, updateTimestamp } };
    },
    enabled: !!activityRecord
      && isEditable
      && !isReplicatesBlocked
      && isDateRangeValid,
    conflict: isConflict
  });

  // Load server state as already saved: hydration never PUTs.
  const hydrate = (server: ActivityRecordType, replicatesList: ReplicateType[]) => {
    const record: ActivityRecordType = {
      testCategoryCode: server.testCategoryCode,
      riaComment: server.riaComment,
      actualBeginDateTime: server.actualBeginDateTime,
      actualEndDateTime: server.actualEndDateTime,
      updateTimestamp: server.updateTimestamp
    };
    setActivityRecord(record);
    setReplicates(replicatesList);
    markSaved({ activityRecord: record, replicates: replicatesList });
  };

  const updateActivityRecord = (edit: ActivityRecordType) => {
    setActivityRecord((prev) => ({ ...prev, ...edit }));
  };

  return {
    activityRecord,
    updateActivityRecord,
    replicates,
    setReplicates,
    setReplicatesBlocked,
    hydrate,
    // Await before an action that reads the saved record (Complete test): true once
    // every edit, including one queued behind an in-flight save, is saved.
    saveNow: flush,
    saveStatus: status,
    isDateRangeValid,
    isConflict,
    clearConflict
  };
};

export default useTestAutosave;
