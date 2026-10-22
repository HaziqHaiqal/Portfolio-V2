'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar,
  Check,
  CheckCheck,
  Gift,
  Handshake,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  Shuffle,
  TicketPercent,
  User,
} from 'lucide-react';

import { createBrowserSupabase } from '@lib/supabase/browser';
import {
  upsertPromoCodeAction,
  setPromoCodeUsesAction,
  deletePromoCodeAction,
} from '@app/admin/_actions/promoCodes';
import type { PromoCode } from '@lib/supabase';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Switch } from '@components/ui/switch';
import { Badge } from '@components/ui/badge';
import { Checkbox } from '@components/ui/checkbox';
import { Textarea } from '@components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@components/ui/select';
import {
  BulletList,
  CardGridSkeleton,
  ConfirmDialog,
  EditDeleteActions,
  EditorPanel,
  EmptyState,
  EntityCard,
  Field,
  FormActions,
  FormGrid,
  FormSection,
  IconAction,
  MediaTile,
  PageHeader,
  SearchInput,
  StatTile,
  ToggleRow,
  Toolbar,
  useConfirm,
} from '@components/Admin/shared';
import { getPromoTargets } from '@constants/services';
import { listContainer } from '@constants/motion';
import { SITE_URL } from '@lib/site';
import {
  formatSiteDate,
  formatSiteLastDay,
  fromSiteDateInput,
  pluralize,
  toSiteDateInput,
} from '@lib/format';
import {
  normalizePromoCode,
  PROMO_CODE_PATTERN,
  rewardSummary,
  type DiscountType,
} from '@lib/promo';
import { cn } from '@lib/utils';

const TARGETS = getPromoTargets();

type PromoStatus = 'active' | 'scheduled' | 'expired' | 'used-up' | 'off';

const STATUS_LABELS: Record<PromoStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  'used-up': 'Used up',
  off: 'Off',
};

const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'none', label: 'No discount (free extras only)' },
  { value: 'fixed', label: 'Ringgit off (RM)' },
  { value: 'percent', label: 'Percent off (%)' },
];

function statusOf(promo: PromoCode, now: number): PromoStatus {
  if (!promo.is_active) return 'off';
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now) {
    return 'scheduled';
  }
  if (promo.expires_at && new Date(promo.expires_at).getTime() <= now) {
    return 'expired';
  }
  if (promo.max_uses && promo.uses_count >= promo.max_uses) return 'used-up';
  return 'active';
}

function summaryOf(promo: PromoCode) {
  return rewardSummary({
    discountType: promo.discount_type,
    discountValue: Number(promo.discount_value),
    perks: promo.perks,
  });
}

function targetsLabel(ids: string[]) {
  if (ids.length === 0) return 'All services';
  return ids
    .map((id) => TARGETS.find((t) => t.id === id)?.label ?? `${id} (removed)`)
    .join(', ');
}

function dateRangeOf(promo: PromoCode) {
  const from = promo.starts_at && formatSiteDate(promo.starts_at);
  const until = promo.expires_at && formatSiteLastDay(promo.expires_at);
  if (from && until) return `${from} – ${until}`;
  return from ? `From ${from}` : `Until ${until}`;
}

function shareLinkOf(code: string) {
  return `${SITE_URL}/services?promo=${encodeURIComponent(code)}`;
}

function generateCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export default function PromoCodesEditor() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(0);
  const [editing, setEditing] = useState<PromoCode | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const supabase = createBrowserSupabase();
  const confirmDelete = useConfirm<PromoCode>();

  const loadCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCodes((data ?? []) as PromoCode[]);
      setNow(Date.now());
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Failed to load promo codes');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const replaceCode = (next: PromoCode) =>
    setCodes((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  const setUses = async (promo: PromoCode, uses: number) => {
    try {
      replaceCode(await setPromoCodeUsesAction(promo.id, uses));
    } catch (error) {
      console.error('Error updating uses:', error);
      toast.error('Failed to update the deal count');
      throw error;
    }
  };

  const handleMarkUsed = async (promo: PromoCode) => {
    try {
      await setUses(promo, promo.uses_count + 1);
    } catch {
      return;
    }
    const limit = promo.max_uses ? ` of ${promo.max_uses}` : '';
    toast.success(
      `Deal recorded for ${promo.code} (${promo.uses_count + 1}${limit})`,
      {
        action: {
          label: 'Undo',
          onClick: () => void setUses(promo, promo.uses_count).catch(() => {}),
        },
      }
    );
  };

  const handleCopyLink = async (promo: PromoCode) => {
    try {
      await navigator.clipboard.writeText(shareLinkOf(promo.code));
      toast.success(`Share link for ${promo.code} copied`);
    } catch {
      toast.error('Could not copy the link');
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    try {
      await deletePromoCodeAction(promo.id);
      toast.success(`Deleted ${promo.code}`);
      await loadCodes();
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete promo code'
      );
    }
  };

  const handleSave = async (
    row: Parameters<typeof upsertPromoCodeAction>[0]
  ) => {
    const code = normalizePromoCode(row.code ?? '');
    const duplicate = codes.find(
      (c) => c.code === code && c.id !== editing?.id
    );
    if (duplicate) {
      toast.error(`${code} already exists.`);
      return;
    }

    setSaving(true);
    try {
      await upsertPromoCodeAction({ ...row, id: editing?.id });
      toast.success(editing ? 'Promo code updated' : 'Promo code created');
      setShowForm(false);
      setEditing(null);
      await loadCodes();
    } catch (error) {
      console.error('Error saving promo code:', error);
      const msg =
        error instanceof Error ? error.message : 'Failed to save promo code';
      toast.error(
        msg.includes('23505') || msg.toLowerCase().includes('duplicate')
          ? `${code} already exists.`
          : msg
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return codes;
    return codes.filter((c) =>
      [c.code, c.title, c.referrer_name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [codes, query]);

  const stats = useMemo(
    () => ({
      active: codes.filter((c) => statusOf(c, now) === 'active').length,
      applied: codes.reduce((sum, c) => sum + c.applied_count, 0),
      deals: codes.reduce((sum, c) => sum + c.uses_count, 0),
    }),
    [codes, now]
  );

  const startCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <PromoCodeForm
        promo={editing}
        onSave={handleSave}
        onCancel={() => {
          setShowForm(false);
          setEditing(null);
        }}
        saving={saving}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business"
        title="Promo codes"
        description="Discounts and free extras for the services page. Share the code, or its link."
        actions={
          <Button size="sm" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            New code
          </Button>
        }
      />

      {!loading && codes.length > 0 && (
        <m.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <StatTile
            label="Active codes"
            value={stats.active}
            hint={`of ${codes.length} total`}
            icon={TicketPercent}
          />
          <StatTile
            label="Times applied"
            value={stats.applied}
            hint="Visitors who applied a code"
            icon={MousePointerClick}
          />
          <StatTile
            label="Deals closed"
            value={stats.deals}
            hint="Marked by you after a sale"
            icon={Handshake}
          />
        </m.div>
      )}

      <Toolbar
        meta={
          loading
            ? undefined
            : `${pluralize(filteredCodes.length, 'code')}${
                query.trim() ? ` of ${codes.length}` : ''
              }`
        }
      >
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search code, campaign or referrer..."
          className="sm:max-w-xs"
        />
      </Toolbar>

      {loading ? (
        <CardGridSkeleton count={3} />
      ) : filteredCodes.length === 0 ? (
        <EmptyState
          icon={TicketPercent}
          title={query.trim() ? 'No matching codes' : 'No promo codes yet'}
          description={
            query.trim()
              ? 'Try a different search term.'
              : 'Create a code for a campaign, a festive promo, or a client who refers you.'
          }
          action={
            query.trim() ? (
              <Button variant="outline" size="sm" onClick={() => setQuery('')}>
                Clear search
              </Button>
            ) : (
              <Button size="sm" onClick={startCreate}>
                <Plus className="h-4 w-4" />
                New code
              </Button>
            )
          }
        />
      ) : (
        <m.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filteredCodes.map((promo) => {
            const status = statusOf(promo, now);
            return (
              <EntityCard
                key={promo.id}
                media={
                  <MediaTile>
                    <TicketPercent className="h-4 w-4" />
                  </MediaTile>
                }
                title={<span className="font-mono">{promo.code}</span>}
                subtitle={promo.title || 'No campaign name'}
                meta={
                  <>
                    <Badge
                      variant="outline"
                      className={cn(
                        'px-1.5 py-0 text-[10px] font-normal',
                        status === 'active'
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {STATUS_LABELS[status]}
                    </Badge>
                    {promo.is_featured && (
                      <Badge
                        variant="outline"
                        className="border-border px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                      >
                        On site
                      </Badge>
                    )}
                  </>
                }
                actions={
                  <EditDeleteActions
                    onEdit={() => {
                      setEditing(promo);
                      setShowForm(true);
                    }}
                    onDelete={() => confirmDelete.ask(promo)}
                    extra={
                      <>
                        <IconAction
                          label="Copy share link"
                          onClick={() => handleCopyLink(promo)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                        </IconAction>
                        <IconAction
                          label="Record a closed deal"
                          onClick={() => handleMarkUsed(promo)}
                          disabled={status === 'used-up'}
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                        </IconAction>
                      </>
                    }
                  />
                }
              >
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2 text-foreground">
                    <Gift className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                    {summaryOf(promo)}
                  </li>
                  <li className="pl-5">
                    {targetsLabel(promo.eligible_targets)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Handshake className="mt-0.5 h-3 w-3 shrink-0" />
                    <span className="tabular-nums">
                      {promo.max_uses
                        ? `${promo.uses_count} / ${promo.max_uses} deals`
                        : pluralize(promo.uses_count, 'deal')}{' '}
                      · {promo.applied_count} applied
                    </span>
                  </li>
                  {(promo.starts_at || promo.expires_at) && (
                    <li className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-3 w-3 shrink-0" />
                      {dateRangeOf(promo)}
                    </li>
                  )}
                  {promo.referrer_name && (
                    <li className="flex items-start gap-2">
                      <User className="mt-0.5 h-3 w-3 shrink-0" />
                      Referred by {promo.referrer_name}
                    </li>
                  )}
                </ul>
              </EntityCard>
            );
          })}
        </m.div>
      )}

      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => !open && confirmDelete.dismiss()}
        loading={confirmDelete.loading}
        title="Delete promo code?"
        description={
          confirmDelete.target
            ? `${confirmDelete.target.code} will stop working straight away, and its share link with it. Turn it off instead to keep the history.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => confirmDelete.run(handleDelete)}
      />
    </div>
  );
}

interface PromoCodeFormProps {
  promo: PromoCode | null;
  onSave: (row: Parameters<typeof upsertPromoCodeAction>[0]) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

function PromoCodeForm({
  promo,
  onSave,
  onCancel,
  saving,
}: PromoCodeFormProps) {
  const [form, setForm] = useState({
    code: promo?.code ?? '',
    title: promo?.title ?? '',
    referrer_name: promo?.referrer_name ?? '',
    discount_type: promo?.discount_type ?? ('fixed' as DiscountType),
    discount_value: promo ? String(promo.discount_value) : '',
    perks: promo?.perks ?? [],
    eligible_targets: promo?.eligible_targets ?? [],
    start_date: toSiteDateInput(promo?.starts_at),
    end_date: toSiteDateInput(promo?.expires_at, { endOfDay: true }),
    max_uses: promo?.max_uses ? String(promo.max_uses) : '',
    uses_count: String(promo?.uses_count ?? 0),
    is_active: promo?.is_active ?? true,
    is_featured: promo?.is_featured ?? false,
    notes: promo?.notes ?? '',
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const code = normalizePromoCode(form.code);
  const codeValid = PROMO_CODE_PATTERN.test(code);
  const discountValue = Number(form.discount_value) || 0;
  const preview = rewardSummary({
    discountType: form.discount_type,
    discountValue,
    perks: form.perks,
  });

  const toggleTarget = (id: string, checked: boolean) =>
    set(
      'eligible_targets',
      checked
        ? [...form.eligible_targets, id]
        : form.eligible_targets.filter((t) => t !== id)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codeValid) {
      toast.error(
        'Codes are 3–32 characters: letters, numbers, dashes or underscores.'
      );
      return;
    }
    if (form.discount_type === 'percent' && discountValue > 100) {
      toast.error('A percent discount cannot be more than 100%.');
      return;
    }
    const hasDiscount = form.discount_type !== 'none' && discountValue > 0;
    if (!hasDiscount && form.perks.length === 0) {
      toast.error('Add a discount, a free extra, or both.');
      return;
    }
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      toast.error('The end date must be on or after the start date.');
      return;
    }
    const maxUses = form.max_uses ? Number(form.max_uses) : null;
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
      toast.error('Max deals must be a whole number above 0, or left blank.');
      return;
    }

    await onSave({
      code,
      title: form.title.trim(),
      referrer_name: form.referrer_name.trim() || null,
      discount_type: hasDiscount ? form.discount_type : 'none',
      discount_value: hasDiscount ? discountValue : 0,
      perks: form.perks,
      eligible_targets: form.eligible_targets,
      starts_at: fromSiteDateInput(form.start_date),
      expires_at: fromSiteDateInput(form.end_date, { endOfDay: true }),
      max_uses: maxUses,
      uses_count: Math.max(0, Math.floor(Number(form.uses_count) || 0)),
      is_active: form.is_active,
      is_featured: form.is_featured,
      notes: form.notes.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <EditorPanel
        eyebrow={promo ? 'Editing promo code' : 'New promo code'}
        title={promo ? promo.code : 'New promo code'}
        description="Visitors apply the code on the services page, or open its share link. It is added to their WhatsApp message."
        onBack={onCancel}
        backLabel="Promo codes"
        className="max-w-3xl"
        footer={
          <FormActions>
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !code}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {promo ? 'Save changes' : 'Create code'}
            </Button>
          </FormActions>
        }
      >
        <FormSection title="Code">
          <FormGrid>
            <Field
              label="Code"
              htmlFor="code"
              required
              hint={
                codeValid
                  ? `Share link: ${shareLinkOf(code).replace(/^https?:\/\//, '')}`
                  : 'Letters, numbers, dashes or underscores. 3–32 characters.'
              }
            >
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="RAYA2026"
                  maxLength={32}
                  className="font-mono uppercase tracking-wider"
                  required
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => set('code', generateCode())}
                  aria-label="Generate a random code"
                  title="Generate a random code"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            </Field>
            <Field
              label="Campaign name"
              htmlFor="title"
              hint="Private, unless the code is shown on the site."
            >
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Hari Raya 2026"
              />
            </Field>
          </FormGrid>
          <Field
            label="Referred by"
            htmlFor="referrer_name"
            hint="For referral codes: the client who shares it, so you can thank or reward them."
          >
            <Input
              id="referrer_name"
              value={form.referrer_name}
              onChange={(e) => set('referrer_name', e.target.value)}
              placeholder="Aisyah (Kedai Bunga Mawar)"
            />
          </Field>
        </FormSection>

        <FormSection
          title="Reward"
          description="A discount, free extras, or both."
        >
          <FormGrid>
            <Field label="Discount" htmlFor="discount_type">
              <Select
                value={form.discount_type}
                onValueChange={(value) =>
                  set('discount_type', value as DiscountType)
                }
              >
                <SelectTrigger id="discount_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label={
                form.discount_type === 'percent' ? 'Percent' : 'Amount (RM)'
              }
              htmlFor="discount_value"
            >
              <Input
                id="discount_value"
                type="number"
                inputMode="decimal"
                min="0"
                max={form.discount_type === 'percent' ? 100 : undefined}
                step="1"
                value={form.discount_type === 'none' ? '' : form.discount_value}
                onChange={(e) => set('discount_value', e.target.value)}
                placeholder={form.discount_type === 'percent' ? '10' : '100'}
                disabled={form.discount_type === 'none'}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              />
            </Field>
          </FormGrid>

          <Field label="Free extras" hint="Press Enter to add each one.">
            <BulletList
              value={form.perks}
              onChange={(perks) => set('perks', perks)}
              placeholder="Free domain for the first year"
              icon={Gift}
            />
          </Field>

          <p className="rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
            Visitors see:{' '}
            <span className="font-medium text-foreground">
              {preview || 'Nothing yet. Add a discount or a free extra.'}
            </span>
          </p>
        </FormSection>

        <FormSection
          title="Applies to"
          description="Leave everything unticked to apply it to every service."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {TARGETS.map((target) => (
              <label
                key={target.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-raised/60 px-4 py-3 text-sm text-foreground transition-colors hover:border-input has-[[data-state=checked]]:border-primary/50"
              >
                <Checkbox
                  checked={form.eligible_targets.includes(target.id)}
                  onCheckedChange={(checked) =>
                    toggleTarget(target.id, checked === true)
                  }
                />
                {target.label}
              </label>
            ))}
          </div>
        </FormSection>

        <FormSection title="Limits">
          <FormGrid>
            <Field
              label="Start date"
              htmlFor="start_date"
              hint="Blank starts it straight away."
            >
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => set('start_date', e.target.value)}
              />
            </Field>
            <Field
              label="Last day"
              htmlFor="end_date"
              hint="Valid until midnight (Malaysia time). Blank never ends."
            >
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => set('end_date', e.target.value)}
              />
            </Field>
            <Field
              label="Max deals"
              htmlFor="max_uses"
              hint="The code stops working once this many deals are recorded. Blank for no limit."
            >
              <Input
                id="max_uses"
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={form.max_uses}
                onChange={(e) => set('max_uses', e.target.value)}
                placeholder="No limit"
              />
            </Field>
            <Field
              label="Deals closed"
              htmlFor="uses_count"
              hint="Goes up when you record a deal from the card."
            >
              <Input
                id="uses_count"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={form.uses_count}
                onChange={(e) => set('uses_count', e.target.value)}
              />
            </Field>
          </FormGrid>

          <ToggleRow
            label="Active"
            description="Turn off to pause the code without deleting it."
            control={
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => set('is_active', checked)}
              />
            }
          />
          <ToggleRow
            label="Show on site"
            description="List it as a deal on the Services page, with the campaign name, reward and end date, so visitors can apply it. Hidden automatically once it ends or is used up."
            control={
              <Switch
                checked={form.is_featured}
                onCheckedChange={(checked) => set('is_featured', checked)}
              />
            }
          />
        </FormSection>

        <FormSection title="Notes">
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Where you shared it, terms you agreed, anything to remember."
            rows={3}
          />
        </FormSection>
      </EditorPanel>
    </form>
  );
}
