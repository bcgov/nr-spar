/* eslint-disable no-undef */
import { formatDate } from '../../utils/DateUtils';

describe('Date Utils test', () => {
  it('should return formatted date', () => {
    const formattedDate = formatDate('2022-12-24');
    expect(formattedDate).toBe('December 24, 2022');
  });

  it('should return a placeholder', () => {
    const formattedDate = formatDate('');
    expect(formattedDate).toBe('--');
  });
});
