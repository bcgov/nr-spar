import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyGermTable from '../../../views/CONSEP/TestingActivities/GerminationContent/DailyGermTable';
import { GermCountSlotType, GermReplicateType } from '../../../types/consep/GerminationType';

const emptySlots = (): GermCountSlotType[] => Array.from(
  { length: 13 },
  (_, i) => ({ slotIndex: i + 1 })
);
const defaultReps = (): GermReplicateType[] => Array.from(
  { length: 4 },
  (_, i) => ({ replicateNumber: i + 1, totalNoSeeds: 100, repAcceptedInd: 1 })
);

const renderTable = (over: Partial<React.ComponentProps<typeof DailyGermTable>> = {}) => {
  const props = {
    slots: emptySlots(),
    replicates: defaultReps(),
    germinatorEntry: '2024-10-31',
    isEditable: true,
    validationErrors: {},
    onSlotsChange: vi.fn(),
    onReplicatesChange: vi.fn(),
    ...over
  };
  render(<DailyGermTable {...props} />);
  return props;
};

describe('DailyGermTable', () => {
  it('renders 13 date columns and 4 replicate rows', () => {
    renderTable();
    expect(screen.getAllByTestId(/^germ-date-/)).toHaveLength(13);
    expect(screen.getAllByTestId(/^germ-seeds-/)).toHaveLength(4);
  });

  it('emits the day number when a count date is entered (AC1)', () => {
    const props = renderTable();
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '2024-11-04' } });
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 })
      ])
    );
  });

  // Regression for I4: clearing a date column must also clear that slot's rep
  // counts. They are dropped from the upsert payload and wiped server-side, so
  // leaving them in state showed ghost values in disabled inputs and counted
  // them into rep totals.
  it('clears rep counts when the count date is cleared', () => {
    const slots = emptySlots();
    slots[0] = {
      slotIndex: 1,
      countDt: '2024-11-04',
      dayNoOfTest: 4,
      rep1NoSeedsGerm: 5,
      rep2NoSeedsGerm: 6,
      rep3NoSeedsGerm: 7,
      rep4NoSeedsGerm: 8
    };
    const props = renderTable({ slots });
    fireEvent.change(screen.getByTestId('germ-date-1'), { target: { value: '' } });
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          slotIndex: 1,
          countDt: undefined,
          dayNoOfTest: undefined,
          rep1NoSeedsGerm: undefined,
          rep2NoSeedsGerm: undefined,
          rep3NoSeedsGerm: undefined,
          rep4NoSeedsGerm: undefined
        })
      ])
    );
  });

  it('shows rep total and germination percent', () => {
    const slots = emptySlots();
    slots[0] = {
      slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4, rep1NoSeedsGerm: 45
    };
    renderTable({ slots });
    expect(screen.getByTestId('germ-rep-total-1')).toHaveTextContent('45');
    expect(screen.getByTestId('germ-pct-1')).toHaveTextContent('45%');
  });

  it('emits replicate change when # seeds is overridden (AC5)', () => {
    const props = renderTable();
    fireEvent.change(screen.getByTestId('germ-seeds-2'), { target: { value: '55' } });
    expect(props.onReplicatesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ replicateNumber: 2, totalNoSeeds: 55 })
      ])
    );
  });

  it('renders over-limit warnings (AC3)', () => {
    renderTable({ validationErrors: { 'rep-1': 'Total germinated (110) exceeds number of seeds (100)' } });
    expect(screen.getByText(/exceeds number of seeds/i)).toBeInTheDocument();
  });

  it('maps Ovr checkbox to tolrncOvrrdeDesc ok/null', () => {
    const props = renderTable();
    fireEvent.click(screen.getByTestId('germ-ovr-3'));
    expect(props.onReplicatesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ replicateNumber: 3, tolrncOvrrdeDesc: 'ok' })
      ])
    );
  });

  it('guards NaN when # seeds receives a value that does not parse to an integer', () => {
    const props = renderTable();
    // '.5' survives the number-input value sanitizer (valid float) but parseInt('.5', 10) is NaN
    fireEvent.change(screen.getByTestId('germ-seeds-1'), { target: { value: '.5' } });
    expect(props.onReplicatesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ replicateNumber: 1, totalNoSeeds: undefined })
      ])
    );
    // state must never receive NaN
    (props.onReplicatesChange as ReturnType<typeof vi.fn>).mock.calls.forEach(([reps]) => {
      (reps as GermReplicateType[]).forEach((rep) => {
        expect(Number.isNaN(rep.totalNoSeeds as number)).toBe(false);
      });
    });
  });

  it('disables inputs when not editable', () => {
    renderTable({ isEditable: false });
    expect(screen.getByTestId('germ-date-1')).toBeDisabled();
    expect(screen.getByTestId('germ-count-1-1')).toBeDisabled();
  });
});
