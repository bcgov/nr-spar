import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe, it, expect, vi
} from 'vitest';

import AreaOfUseRead, {
  AREA_OF_USE_COMMENT_MAX_LENGTH
} from '../../views/Seedlot/SeedlotReviewClassB/read/AreaOfUseRead';
import ClassBContext, { ClassBContextType } from '../../views/Seedlot/ContextContainerClassB/context';

const context = {
  seedlotData: { areaOfUseComment: 'Stored comment' },
  richSeedlotData: { bClassDetail: { aouSpzList: [] } },
  isFetchingData: false
} as unknown as ClassBContextType;

const renderSection = (props: React.ComponentProps<typeof AreaOfUseRead>) => render(
  <ClassBContext.Provider value={context}>
    <AreaOfUseRead {...props} />
  </ClassBContext.Provider>
);

describe('B-class review AreaOfUseRead comment', () => {
  it('shows the stored comment read only in read mode', () => {
    renderSection({});
    const comment = screen.getByLabelText('Area of use comment') as HTMLTextAreaElement;
    expect(comment.value).toBe('Stored comment');
    expect(comment.readOnly).toBe(true);
  });

  it('makes the comment editable in edit mode, limited to the column length', () => {
    const onCommentChange = vi.fn();
    renderSection({ isReadMode: false, comment: 'Draft', onCommentChange });
    const comment = screen.getByLabelText('Area of use comment') as HTMLTextAreaElement;
    expect(comment.readOnly).toBe(false);
    expect(comment.value).toBe('Draft');
    expect(comment.maxLength).toBe(AREA_OF_USE_COMMENT_MAX_LENGTH);

    fireEvent.change(comment, { target: { value: 'Edited' } });
    expect(onCommentChange).toHaveBeenCalledWith('Edited');
  });
});
