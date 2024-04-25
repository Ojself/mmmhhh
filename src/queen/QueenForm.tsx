'use client';

import SubmitButtonWithStatus from '@/components/SubmitButtonWithStatus';
import Link from 'next/link';
import { PATH_ADMIN_QUEENS } from '@/site/paths';
import FieldSetWithStatus from '@/components/FieldSetWithStatus';
import { ReactNode, useMemo, useState } from 'react';
import { renamePhotoQueenGloballyAction } from '@/photo/actions';
import { parameterize } from '@/utility/string';

export default function QueenForm({
  queen,
  children,
}: {
  queen: string
  children?: ReactNode
}) {
  const [updatedQueenRaw, setUpdatedQueenRaw] = useState(queen);

  const updatedQueen = useMemo(() =>
    parameterize(updatedQueenRaw)
  , [updatedQueenRaw]);

  const isFormValid = (
    updatedQueen &&
    updatedQueen !== queen
  );

  return (
    <form
      action={renamePhotoQueenGloballyAction}
      className="space-y-8"
    >
      <FieldSetWithStatus
        id="updatedQueenRaw"
        label="New Queen Name"
        value={updatedQueenRaw}
        onChange={setUpdatedQueenRaw}
      />
      {/* Form data: queen to be replaced */}
      <input
        name="queen"
        value={queen}
        hidden
        readOnly
      />
      {/* Form data: updated queen */}
      <input
        name="updatedQueen"
        value={updatedQueen}
        hidden
        readOnly
      />
      {children}
      <div className="flex gap-3">
        <Link
          className="button"
          href={PATH_ADMIN_QUEENS}
        >
          Cancel
        </Link>
        <SubmitButtonWithStatus
          disabled={!isFormValid}
        >
          Update
        </SubmitButtonWithStatus>
      </div>
    </form>
  );
}
