import React from 'react';
import {
  Row,
  Column,
  RadioButtonSkeleton
} from '@carbon/react';
import './styles.scss';

type SummaryColumn<T> = {
  key: string;
  label: string;
  renderValue: (item?: T) => React.ReactNode;
  emphasize?: boolean;
};

interface SummaryGridProps<T> {
  item?: T;
  isFetching: boolean;
  columns: SummaryColumn<T>[];
  containerClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const SummaryGrid = <T,>({
  item,
  isFetching,
  columns,
  containerClassName = 'activity-summary-container',
  rowClassName = 'activity-summary',
  cellClassName = 'info-col',
  labelClassName = 'activity-summary-info-label',
  valueClassName = 'activity-summary-info-value'
}: SummaryGridProps<T>) => (
  <div className={containerClassName}>
    <Row className={rowClassName}>
      {columns.map((column) => (
        <Column key={column.key} className={cellClassName}>
          <p className={labelClassName}>
            {column.label}
          </p>
          {isFetching
            ? <RadioButtonSkeleton />
            : (
              <p
                className={valueClassName}
                style={column.emphasize ? { fontWeight: 700 } : undefined}
              >
                {column.renderValue(item)}
              </p>
            )}
        </Column>
      ))}
    </Row>
  </div>
);

export type { SummaryColumn };
export default SummaryGrid;
