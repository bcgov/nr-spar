import React from 'react';
import {
  render, screen, fireEvent, waitFor
} from '@testing-library/react';
import DailyGermTable from '../../../views/CONSEP/TestingActivities/GerminationContent/DailyGermTable';
import { DateTime } from 'luxon';
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
    onSlotSelect: vi.fn(),
    ...over
  };
  render(<DailyGermTable {...props} />);
  return props;
};

/**
 * Opens the calendar for a column that ALREADY holds a date — arriving at an
 * empty one fills today instead. These are controlled-component tests, so a
 * date filled by the first arrival never comes back as a prop; seed one.
 */
const openDatePicker = (slotIndex: number) => {
  fireEvent.click(screen.getByTestId(`germ-date-trigger-${slotIndex}`));
  return screen.getByTestId(`germ-date-${slotIndex}`);
};

describe('DailyGermTable', () => {
  it('renders 13 date columns and 4 replicate rows', () => {
    renderTable();
    expect(screen.getAllByTestId(/^germ-date-trigger-/)).toHaveLength(13);
    expect(screen.getAllByTestId(/^germ-seeds-/)).toHaveLength(4);
  });

  it('shows the count date over two lines and only opens a picker on demand', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    renderTable({ slots });
    expect(screen.getByTestId('germ-date-trigger-1')).toHaveTextContent('2024-11-04');
    expect(screen.queryByTestId('germ-date-1')).not.toBeInTheDocument();
    openDatePicker(1);
    expect(screen.getByTestId('germ-date-1')).toBeInTheDocument();
  });

  it('shows the calendar with the modal, without a second click', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    renderTable({ slots });
    fireEvent.click(screen.getByTestId('germ-date-trigger-1'));
    expect(document.querySelector('.flatpickr-calendar.inline')).toBeInTheDocument();
  });

  // Arriving at an empty column is the common case — recording a count today —
  // so it fills today's date outright instead of asking for the calendar.
  it('fills today on arrival at an empty column, without opening the calendar', () => {
    const props = renderTable({ germinatorEntry: undefined });
    fireEvent.click(screen.getByTestId('germ-date-trigger-1'));
    const today = DateTime.now().toFormat('yyyy-MM-dd');
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slotIndex: 1, countDt: today })
      ])
    );
    expect(screen.queryByTestId('germ-date-1')).not.toBeInTheDocument();
    expect(document.querySelector('.flatpickr-calendar')).not.toBeInTheDocument();
  });

  it('fills today when the column is reached by Tab', () => {
    const props = renderTable();
    fireEvent.focus(screen.getByTestId('germ-date-trigger-2'));
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          slotIndex: 2,
          countDt: DateTime.now().toFormat('yyyy-MM-dd')
        })
      ])
    );
    expect(screen.queryByTestId('germ-date-2')).not.toBeInTheDocument();
  });

  it('opens the calendar when the dated column is reached by Tab', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    const props = renderTable({ slots });
    fireEvent.focus(screen.getByTestId('germ-date-trigger-1'));
    expect(screen.getByTestId('germ-date-1')).toBeInTheDocument();
    expect(props.onSlotsChange).not.toHaveBeenCalled();
  });

  // A record can carry day numbers with no germinator entry date. Recomputing
  // from nothing used to blank the day number for good, even on changing back.
  it('keeps day numbers when the header has no germinator entry date', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2026-03-09', dayNoOfTest: 3 };
    slots[1] = { slotIndex: 2, countDt: '2026-03-11', dayNoOfTest: 5 };
    const props = renderTable({ slots, germinatorEntry: undefined });
    fireEvent.change(openDatePicker(1), { target: { value: '2026-03-10' } });
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slotIndex: 1, countDt: '2026-03-10', dayNoOfTest: 4 })
      ])
    );
  });

  it('emits the day number when a count date is entered (AC1)', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-10-31', dayNoOfTest: 0 };
    const props = renderTable({ slots });
    fireEvent.change(openDatePicker(1), { target: { value: '2024-11-04' } });
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 })
      ])
    );
  });

  // AC2: the day number is counted for every column, not just the first, and
  // it stays relative to the germinator entry rather than to the prior date.
  it('emits the day number for a later count date (AC2)', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    slots[1] = { slotIndex: 2, countDt: '2024-11-05', dayNoOfTest: 5 };
    const props = renderTable({ slots });
    fireEvent.change(openDatePicker(2), { target: { value: '2024-11-07' } });
    expect(props.onSlotsChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ slotIndex: 2, countDt: '2024-11-07', dayNoOfTest: 7 })
      ])
    );
  });

  // Regression for I4: clearing a date column must also clear that slot's rep
  // counts. They are dropped from the upsert payload and wiped server-side, so
  // leaving them in state showed ghost values in disabled inputs and counted
  // them into rep totals.
  // Abnormals hang off the same day and are wiped server-side with it, so
  // leaving them in state would show ghost counts in the now-disabled inputs
  // and keep inflating the germinated + abnormal check (#2606).
  it('clears abnormals when the count date is cleared', () => {
    const slots = emptySlots();
    slots[0] = {
      slotIndex: 1,
      countDt: '2024-11-04',
      dayNoOfTest: 4,
      rep1NoSeedsGerm: 5,
      rep1Abnormal: { abnormalNumRotten: 2 },
      rep2Abnormal: { abnormalNumWeak: 1 }
    };
    const props = renderTable({ slots });
    fireEvent.change(openDatePicker(1), { target: { value: '' } });
    const [updated] = (props.onSlotsChange as ReturnType<typeof vi.fn>).mock.calls.at(-1)!;
    const slotOne = updated.find((s: { slotIndex: number }) => s.slotIndex === 1);
    expect(slotOne.rep1Abnormal).toBeUndefined();
    expect(slotOne.rep2Abnormal).toBeUndefined();
  });

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
    fireEvent.change(openDatePicker(1), { target: { value: '' } });
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

  // #2682-1: the tolerance override tick boxes were never used and are gone.
  it('has no override column', () => {
    renderTable();
    expect(screen.queryByTestId('germ-ovr-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Ovr')).not.toBeInTheDocument();
  });

  // #2682-4: a number input steps its value on the arrow keys and the scroll
  // wheel, which was changing counts by accident.
  it('does not render count cells as number spinners', () => {
    renderTable();
    expect(screen.getByTestId('germ-count-1-1')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('germ-seeds-1')).toHaveAttribute('type', 'text');
  });

  // #2682-2: chronology enforced in the calendar, not just by the error below
  // the table -- the days up to the previous column's date are unselectable.
  it('disables days before the previous count date in the picker', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    slots[1] = { slotIndex: 2, countDt: '2024-11-07', dayNoOfTest: 7 };
    renderTable({ slots });
    openDatePicker(2);
    const day = (label: string) => document.querySelector(
      `.flatpickr-calendar.inline .flatpickr-day[aria-label$="${label}"]`
    );
    expect(day('November 4, 2024')).toHaveClass('flatpickr-disabled');
    expect(day('November 5, 2024')).not.toHaveClass('flatpickr-disabled');
  });

  it.each(['.5', '5.5', '-1'])('refuses %s in # seeds instead of corrupting state', (value) => {
    const props = renderTable();
    // `type="number"` lets decimals and negatives through -- min/step are only
    // form-validity hints -- and parseInt would turn 5.5 into 5 and pass -1 on.
    fireEvent.change(screen.getByTestId('germ-seeds-1'), { target: { value } });
    expect(props.onReplicatesChange).not.toHaveBeenCalled();
  });

  it.each(['5.5', '-1'])('refuses %s in a daily count instead of corrupting state', (value) => {
    const props = renderTable();
    fireEvent.change(screen.getByTestId('germ-count-1-1'), { target: { value } });
    expect(props.onSlotsChange).not.toHaveBeenCalled();
  });

  it('clears # seeds when the cell is emptied', () => {
    const props = renderTable();
    fireEvent.change(screen.getByTestId('germ-seeds-1'), { target: { value: '' } });
    expect(props.onReplicatesChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ replicateNumber: 1, totalNoSeeds: undefined })
      ])
    );
    (props.onReplicatesChange as ReturnType<typeof vi.fn>).mock.calls.forEach(([reps]) => {
      (reps as GermReplicateType[]).forEach((rep) => {
        expect(Number.isNaN(rep.totalNoSeeds as number)).toBe(false);
      });
    });
  });

  // AC6: the column being worked in is highlighted, so a count is never
  // attributed to the wrong date thirteen narrow columns across.
  it('highlights the column being worked in (AC6)', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    slots[1] = { slotIndex: 2, countDt: '2024-11-07', dayNoOfTest: 7 };
    renderTable({ slots });
    const highlighted = () => Array.from(document.querySelectorAll('.germ-slot-active'));
    expect(highlighted()).toHaveLength(0);

    fireEvent.focus(screen.getByTestId('germ-count-1-2'));
    // The date header, the day-number header and all four count cells.
    expect(highlighted()).toHaveLength(6);
    expect(screen.getByTestId('germ-date-trigger-2').closest('th'))
      .toHaveClass('germ-slot-active');
    expect(screen.getByTestId('germ-date-trigger-1').closest('th'))
      .not.toHaveClass('germ-slot-active');

    fireEvent.blur(screen.getByTestId('germ-count-1-2'));
    expect(highlighted()).toHaveLength(0);
  });

  it('highlights the column whose date modal is open (AC6)', () => {
    const slots = emptySlots();
    slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
    renderTable({ slots });
    fireEvent.click(screen.getByTestId('germ-date-trigger-1'));
    expect(document.querySelectorAll('.germ-slot-active')).toHaveLength(6);
  });

  it('disables inputs when not editable', () => {
    renderTable({ isEditable: false });
    const trigger = screen.getByTestId('germ-date-trigger-1');
    expect(trigger).toBeDisabled();
    expect(screen.getByTestId('germ-count-1-1')).toBeDisabled();
    // A disabled trigger must not be able to summon the picker either.
    fireEvent.click(trigger);
    expect(screen.queryByTestId('germ-date-1')).not.toBeInTheDocument();
  });

  // #2681: keyboard entry runs down a date column, not along a replicate row.
  describe('Enter-key entry', () => {
    const datedSlots = () => {
      const slots = emptySlots();
      slots[0] = { slotIndex: 1, countDt: '2024-11-04', dayNoOfTest: 4 };
      return slots;
    };
    const count = (rep: number) => screen.getByTestId(`germ-count-${rep}-1`);
    const pressEnter = (el: HTMLElement) => fireEvent.keyDown(el, { key: 'Enter' });

    it('moves from a dated column\'s date to replicate 1, without the calendar', async () => {
      const props = renderTable({ slots: datedSlots() });
      pressEnter(screen.getByTestId('germ-date-trigger-1'));
      await waitFor(() => expect(count(1)).toHaveFocus());
      expect(screen.queryByTestId('germ-date-1')).not.toBeInTheDocument();
      expect(props.onSlotsChange).not.toHaveBeenCalled();
    });

    it('stays on an undated column\'s date, whose counts are disabled', () => {
      const props = renderTable();
      const trigger = screen.getByTestId('germ-date-trigger-1');
      pressEnter(trigger);
      expect(document.activeElement).not.toBe(count(1));
      expect(props.onSlotsChange).not.toHaveBeenCalled();
    });

    it('advances through replicates 1-4 of the same column and stops at 4', async () => {
      renderTable({ slots: datedSlots() });
      count(1).focus();
      for (const rep of [2, 3, 4]) {
        pressEnter(count(rep - 1));
        // eslint-disable-next-line no-await-in-loop
        await waitFor(() => expect(count(rep)).toHaveFocus());
      }
      pressEnter(count(4));
      // MRT blurs replicate 4 on any Enter in the column; it must come back.
      await new Promise((resolve) => { setTimeout(resolve); });
      expect(count(4)).toHaveFocus();
    });

    const tableProps = (validationErrors: Record<string, string>) => ({
      slots: datedSlots(),
      replicates: defaultReps(),
      germinatorEntry: '2024-10-31',
      isEditable: true,
      validationErrors,
      onSlotsChange: vi.fn(),
      onReplicatesChange: vi.fn(),
      onSlotSelect: vi.fn()
    });

    it('holds focus on a count whose edit put its replicate over the limit', async () => {
      const { rerender } = render(<DailyGermTable {...tableProps({})} />);
      count(2).focus();
      rerender(<DailyGermTable {...tableProps({ 'rep-2': 'over' })} />);
      pressEnter(count(2));
      await new Promise((resolve) => { setTimeout(resolve); });
      expect(count(2)).toHaveFocus();
    });

    it('lets Enter leave a replicate that was already over the limit on arrival', async () => {
      render(<DailyGermTable {...tableProps({ 'rep-2': 'over' })} />);
      count(2).focus();
      pressEnter(count(2));
      await waitFor(() => expect(count(3)).toHaveFocus());
    });
  });
});
