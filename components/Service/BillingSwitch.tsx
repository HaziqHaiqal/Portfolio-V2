import { CARE_YEARLY_SAVING, type CareBilling } from '@constants/services';

const BILLING_OPTIONS: { id: CareBilling; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
];

export default function BillingSwitch({
  name,
  value,
  onChange,
  label,
  className = '',
}: {
  name: string;
  value: CareBilling;
  onChange: (value: CareBilling) => void;
  label: string;
  className?: string;
}) {
  return (
    <fieldset className={className}>
      <legend className="sr-only">{label}</legend>
      <div className="inline-flex rounded-full bg-gray-100 p-0.5 dark:bg-gray-900/70">
        {BILLING_OPTIONS.map((option) => {
          const checked = value === option.id;
          return (
            <label
              key={option.id}
              className={`flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500/40 ${
                checked
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={checked}
                onChange={() => onChange(option.id)}
                className="sr-only"
              />
              {option.label}
              {option.id === 'yearly' && (
                <span className="text-green-700 dark:text-green-400">
                  Save {CARE_YEARLY_SAVING}%
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
