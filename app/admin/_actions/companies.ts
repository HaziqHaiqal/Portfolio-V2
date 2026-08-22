'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { upsertCompany, deleteCompany, PORTFOLIO_TAG } from '@lib/data';
import type { Company, NullableWritable } from '@lib/supabase';
import { requireAdminClient } from './auth';

export async function upsertCompanyAction(
  row: NullableWritable<Company> & { id?: string }
) {
  const db = await requireAdminClient();
  const result = await upsertCompany(db, row);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/companies');
  return result;
}

export async function deleteCompanyAction(id: string) {
  const db = await requireAdminClient();
  await deleteCompany(db, id);
  revalidateTag(PORTFOLIO_TAG, 'max');
  revalidatePath('/admin/companies');
}
