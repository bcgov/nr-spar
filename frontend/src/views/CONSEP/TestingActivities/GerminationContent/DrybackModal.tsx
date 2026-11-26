import React, { useMemo, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  Button, Column, ComposedModal, InlineLoading, InlineNotification, ModalBody, ModalFooter,
  ModalHeader, Row, TextArea, TextInput
} from '@carbon/react';

import { getDryback, putDryback } from '../../../../api-service/consep/drybackAPI';
import { DrybackScreenType } from '../../../../types/consep/DrybackType';
import useAutosave from '../../../../hooks/useAutosave';
import SaveStatus from '../../../../components/CONSEP/SaveStatus';
import useActivityConflict from '../hooks/useActivityConflict';
import GermDatePicker from './GermDatePicker';
import {
  DrybackForm, buildDrybackPayload, calculateDryback, formatCalc, formFromData, validateDryback
} from './dryback';

type Summary = { activity: string; lot: string; species: string };

type DrybackModalProps = {
  riaKey: string;
  summary: Summary;
  stratStartDt?: string;
  /** Called once the latest edit is saved (or could not be), so the parent can refetch. */
  onClose: () => void;
};

type EditorProps = {
  riaKey: string;
  data: DrybackScreenType;
  stratStartDt?: string;
  /** Hands the parent the editor's flush, so Close can wait for the last save. */
  registerFlush: (flush: () => Promise<boolean>) => void;
  onReload: () => void;
};

type InputField = 'dryWeight' | 'imbibedWeight' | 'drybackMoist' | 'drybackWeight'
  | 'drybackTime' | 'stratEndWeight';

const errorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message ?? axiosError.message;
};

/**
 * Mounted once the data has loaded, so the autosave's first snapshot is the loaded record
 * (with the defaulted dates): opening the modal saves nothing until the user edits.
 */
const DrybackEditor = ({
  riaKey, data, stratStartDt, registerFlush, onReload
}: EditorProps) => {
  const [form, setForm] = useState<DrybackForm>(() => formFromData(data, stratStartDt));
  const timestampRef = useRef(data.updateTimestamp);
  const { isConflict, markConflict } = useActivityConflict();
  const [saveError, setSaveError] = useState<string>();

  const calc = useMemo(() => calculateDryback(form, data.storageMc), [form, data.storageMc]);
  const errors = useMemo(() => validateDryback(form, data, calc), [form, data, calc]);
  const payload = useMemo(() => buildDrybackPayload(form, data, calc), [form, data, calc]);

  const { status, flush } = useAutosave({
    data: payload,
    onSave: async (body) => {
      try {
        return await putDryback(riaKey, { ...body, updateTimestamp: timestampRef.current });
      } catch (error) {
        if ((error as AxiosError).response?.status === 409) {
          markConflict();
        } else {
          setSaveError(errorMessage(error));
        }
        throw error;
      }
    },
    onSaved: (saved, sent) => {
      timestampRef.current = saved.updateTimestamp;
      setSaveError(undefined);
      return sent;
    },
    enabled: Object.keys(errors).length === 0,
    conflict: isConflict
  });
  registerFlush(flush);

  const set = (field: keyof DrybackForm, value: string | undefined) => (
    setForm((prev) => ({ ...prev, [field]: value }))
  );

  const input = (field: InputField, label: string) => (
    <TextInput
      id={`dryback-${field}`}
      labelText={label}
      inputMode="decimal"
      autoComplete="off"
      value={form[field]}
      invalid={!!errors[field]}
      invalidText={errors[field]}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => set(field, e.target.value)}
    />
  );

  const display = (id: string, label: string, value: string, error?: string) => (
    <TextInput id={`dryback-${id}`} labelText={label} value={value} readOnly invalid={!!error} invalidText={error} />
  );

  return (
    <>
      <SaveStatus status={status} onRetry={flush} onReload={onReload} />
      {saveError && status.state === 'failed' && (
        <InlineNotification lowContrast kind="error" title="Could not save" subtitle={saveError} />
      )}
      <Row className="dryback-row">
        <Column sm={4} md={3} lg={5}>
          <GermDatePicker
            id="dryback-beginDate"
            label="Start date"
            size="md"
            value={form.beginDate}
            error={errors.beginDate}
            onChange={(iso) => set('beginDate', iso)}
          />
        </Column>
        <Column sm={4} md={3} lg={5}>
          <GermDatePicker
            id="dryback-endDate"
            label="End date"
            size="md"
            value={form.endDate}
            error={errors.endDate}
            onChange={(iso) => set('endDate', iso)}
          />
        </Column>
        <Column sm={4} md={2} lg={6}>{input('drybackMoist', 'Dryback M.C.')}</Column>
      </Row>
      <Row className="dryback-row">
        <Column sm={4} md={3} lg={5}>
          {display('storageMc', 'Storage M.C.', formatCalc(data.storageMc ?? undefined, 1))}
        </Column>
        <Column sm={4} md={3} lg={5}>{input('imbibedWeight', 'Imbibed Wt (g)')}</Column>
        <Column sm={4} md={2} lg={6}>{input('drybackWeight', 'Dryback Wt (g)')}</Column>
      </Row>
      <Row className="dryback-row">
        <Column sm={4} md={3} lg={5}>{input('dryWeight', 'StWt400 (g)')}</Column>
        <Column sm={4} md={3} lg={5}>
          {display('imbibedMoist', 'Imbibed M.C.', formatCalc(calc.imbibedMoist, 1))}
        </Column>
        <Column sm={4} md={2} lg={6}>{input('drybackTime', 'Dryback Time (min)')}</Column>
      </Row>
      <Row className="dryback-row">
        <Column sm={4} md={3} lg={5}>{display('odwt', 'ODWT 400', formatCalc(calc.odwt, 3))}</Column>
      </Row>
      <fieldset className="dryback-targets">
        <legend>Target Weight Range</legend>
        <Row className="dryback-row">
          <Column sm={4} md={3} lg={5}>
            {display(
              'targetThirtyMoist',
              '30% M.C.',
              formatCalc(calc.targetThirtyMoist ?? data.targetThirtyMoist ?? undefined, 3),
              errors.targetThirtyMoist
            )}
          </Column>
          <Column sm={4} md={3} lg={5}>
            {display(
              'targetThirtyFiveMoist',
              '35% M.C.',
              formatCalc(calc.targetThirtyFiveMoist ?? data.targetThirtyFiveMoist ?? undefined, 3),
              errors.targetThirtyFiveMoist
            )}
          </Column>
          <Column sm={4} md={2} lg={6}>{input('stratEndWeight', 'Strat End Wt (g)')}</Column>
        </Row>
      </fieldset>
      <Row className="dryback-row dryback-comments">
        <Column sm={4} md={6} lg={12}>
          <TextArea
            id="dryback-comment"
            labelText="Comments"
            rows={3}
            maxCount={2000}
            enableCounter
            value={form.riaComment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set('riaComment', e.target.value)}
          />
        </Column>
        <Column sm={4} md={2} lg={4}>
          {/* Dryback M.C. is user-entered; Calculate overwrites it (the spec). The rest recalculate live. */}
          <Button
            kind="tertiary"
            size="md"
            disabled={calc.drybackMoist === undefined}
            onClick={() => set('drybackMoist', formatCalc(calc.drybackMoist, 1))}
          >
            Calculate
          </Button>
        </Column>
      </Row>
    </>
  );
};

/** The G64 Dryback Calculation modal, opened from the germination test result screen. */
const DrybackModal = ({
  riaKey, summary, stratStartDt, onClose
}: DrybackModalProps) => {
  const query = useQuery({
    queryKey: ['dryback', riaKey],
    queryFn: () => getDryback(riaKey),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false
  });
  const flushRef = useRef<() => Promise<boolean>>(() => Promise.resolve(true));
  const [closing, setClosing] = useState(false);

  const close = async () => {
    setClosing(true);
    await flushRef.current();
    onClose();
  };

  const { data } = query;
  return (
    <ComposedModal open size="md" className="consep-dryback-modal" onClose={() => { close(); return false; }}>
      <ModalHeader title={`${summary.activity} Dryback Calculation`} />
      <ModalBody>
        <p className="dryback-summary">
          {[
            ['Request ID', data?.requestId],
            ['Item', data?.itemId],
            ['Activity', summary.activity],
            ['Seedlot', summary.lot],
            ['Species', summary.species]
          ].map(([label, value]) => (
            <span key={label}>{`${label}: ${value ?? ''}`}</span>
          ))}
        </p>
        {query.isPending && <InlineLoading description="Loading..." />}
        {query.isError && (
          <InlineNotification
            lowContrast
            kind="error"
            title="Could not load the dryback data"
            subtitle={errorMessage(query.error)}
          />
        )}
        {data && (
          <DrybackEditor
            // A conflict reload refetches; the new record remounts the editor with a fresh snapshot.
            key={query.dataUpdatedAt}
            riaKey={riaKey}
            data={data}
            stratStartDt={stratStartDt}
            registerFlush={(flush) => { flushRef.current = flush; }}
            onReload={() => query.refetch()}
          />
        )}
      </ModalBody>
      <ModalFooter>
        <Button kind="tertiary" onClick={close} disabled={closing}>Close</Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default DrybackModal;
