import type { CareBilling, CarePlan } from '@constants/services';
import { formatRM } from '@lib/format';
import BillingSwitch from './BillingSwitch';

export default function HostingCare({
  plan,
  withDatabase,
  billing,
  onBillingChange,
  name,
  onShowDetails,
  className = '',
}: {
  plan: CarePlan;
  withDatabase: boolean;
  billing: CareBilling;
  onBillingChange: (value: CareBilling) => void;
  name: string;
  onShowDetails?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-gray-900 dark:text-gray-100 ${className}`}
    >
      <div className="min-w-0 flex-1 basis-56">
        <p className="font-semibold">{plan.name}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {plan.summary}
          {withDatabase &&
            plan.databasePrice &&
            ` Includes a database (+${formatRM(plan.databasePrice)}/month).`}
          {onShowDetails && (
            <>
              {' '}
              <button
                type="button"
                onClick={onShowDetails}
                className="font-medium text-gray-700 underline underline-offset-2 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
              >
                What&apos;s included?
              </button>
            </>
          )}
        </p>
      </div>

      {plan.quoted ? (
        <p className="shrink-0 text-sm">
          <span className="font-semibold">By quotation</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            Confirmed in your quote
          </span>
        </p>
      ) : (
        <BillingSwitch
          name={name}
          value={billing}
          onChange={onBillingChange}
          label={`Pay the ${plan.name}`}
          className="shrink-0"
        />
      )}
    </div>
  );
}
