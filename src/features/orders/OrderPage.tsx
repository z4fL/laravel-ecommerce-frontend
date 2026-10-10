import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, hasAccessToken } from "../../api";
import { storefrontContainerClass } from "../../components/storefront/storefrontStyles";
import { formatPrice } from "../../components/storefront/StorefrontProductTile";
import type { Order, OrderStatus } from "../../generated/models";
import {
  getListMyOrdersQueryKey,
  useCancelMyOrder,
  useListMyOrders,
} from "../../generated/orders/orders";
import { useCreatePayment } from "../../generated/payments/payments";

const PAGE_SIZE = 12;
const PROGRESS_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "shipped",
  "completed",
];
const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Needs payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

type OrderBucket =
  | "all"
  | "needs-payment"
  | "in-progress"
  | "completed"
  | "cancelled";

const FILTERS: {
  value: OrderBucket;
  label: string;
  statuses?: OrderStatus[];
}[] = [
  { value: "all", label: "All" },
  {
    value: "needs-payment",
    label: "Needs payment",
    statuses: ["pending_payment", "payment_failed"],
  },
  {
    value: "in-progress",
    label: "In progress",
    statuses: ["paid", "processing", "shipped"],
  },
  { value: "completed", label: "Completed", statuses: ["completed"] },
  { value: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

function readPage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readBucket(value: string | null): OrderBucket {
  return FILTERS.find((filter) => filter.value === value)?.value ?? "all";
}

function formatOrderDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function orderNewestFirst(orders: Order[]) {
  return [...orders].sort((first, second) => {
    const firstDate = Date.parse(first.created_at);
    const secondDate = Date.parse(second.created_at);
    if (
      Number.isFinite(firstDate) &&
      Number.isFinite(secondDate) &&
      firstDate !== secondDate
    ) {
      return secondDate - firstDate;
    }
    return second.id - first.id;
  });
}

function getErrorStatus(error: unknown) {
  return error instanceof ApiError ? error.status : undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Try again.";
}

export function OrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isAuthenticated] = useState(hasAccessToken);
  const page = readPage(searchParams.get("page"));
  const selectedBucket = readBucket(searchParams.get("status"));
  const ordersQuery = useListMyOrders(
    { page, per_page: PAGE_SIZE },
    { query: { enabled: isAuthenticated, retry: false, staleTime: 30_000 } },
  );
  const paymentMutation = useCreatePayment({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListMyOrdersQueryKey(),
        });
      },
    },
  });
  const cancelMutation = useCancelMyOrder({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getListMyOrdersQueryKey(),
        });
      },
    },
  });

  const response =
    ordersQuery.data?.status === 200 ? ordersQuery.data.data : undefined;
  const allOrders = response?.data ?? [];
  const orders = orderNewestFirst(allOrders);
  const selectedFilter = FILTERS.find(
    (filter) => filter.value === selectedBucket,
  );
  const visibleOrders = selectedFilter?.statuses
    ? orders.filter((order) => selectedFilter.statuses?.includes(order.status))
    : orders;

  function selectBucket(bucket: OrderBucket) {
    const next = new URLSearchParams(searchParams);
    if (bucket === "all") next.delete("status");
    else next.set("status", bucket);
    next.delete("page");
    setSearchParams(next, { replace: true });
  }

  function changePage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    setSearchParams(next, { replace: true });
  }

  const pageError = ordersQuery.error;
  const needsSignIn = getErrorStatus(pageError) === 401;

  return (
    <main
      className={`${storefrontContainerClass} pb-20 pt-9 md:pb-28 md:pt-12`}
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
        <h1 className="m-0 text-[30px] font-[560] leading-[1.15]">
          <span className="bg-spectral-citron box-decoration-clone">
            Orders
          </span>
        </h1>
        {response ? (
          <p className="m-0 text-[13px] tabular-nums text-muted">
            {response.meta.total}{" "}
            {response.meta.total === 1 ? "order" : "orders"}
          </p>
        ) : ordersQuery.isLoading ? (
          <span className="mb-1 h-3 w-16 bg-skeleton" aria-hidden="true" />
        ) : null}
      </header>

      <nav
        className="overflow-x-auto border-y border-rule [scrollbar-color:var(--color-rule)_var(--color-bone)] [scrollbar-width:thin]"
        aria-label="Filter orders by status"
        tabIndex={0}
      >
        <div className="flex min-w-max items-stretch gap-5 sm:gap-7">
          {FILTERS.map((filter) => {
            const isSelected = selectedBucket === filter.value;
            return (
              <button
                className={`inline-flex min-h-[46px] items-center gap-2 border-0 bg-transparent p-0 text-[13px] text-ink ${isSelected ? "font-semibold" : "font-normal hover:underline hover:underline-offset-4"}`}
                type="button"
                key={filter.value}
                aria-pressed={isSelected}
                onClick={() => selectBucket(filter.value)}
              >
                <span
                  className="flex w-[7px] shrink-0 items-center gap-[2px]"
                  aria-hidden="true"
                >
                  <span
                    className={`h-4 w-[2px] bg-marker-olive ${isSelected ? "" : "opacity-0"}`}
                  />
                  <span
                    className={`h-4 w-[2px] bg-marker-olive ${isSelected ? "" : "opacity-0"}`}
                  />
                </span>
                {filter.label}
              </button>
            );
          })}
        </div>
      </nav>

      <section
        className="pt-6 md:pt-8"
        aria-label="Your orders"
        aria-busy={ordersQuery.isLoading}
      >
        {!isAuthenticated ? (
          <OrderMessage
            title="Sign in to see your orders"
            detail="Your order history is tied to your account. Sign in to continue."
            action={
              <Link className={textLinkClass} to="/login">
                Sign in
              </Link>
            }
          />
        ) : ordersQuery.isLoading ? (
          <OrderSkeletons />
        ) : ordersQuery.isError ? (
          <OrderMessage
            title={
              needsSignIn
                ? "Sign in to see your orders"
                : "Orders could not load"
            }
            detail={
              needsSignIn
                ? "Your order history is tied to your account. Sign in to continue."
                : getErrorMessage(pageError)
            }
            action={
              needsSignIn ? (
                <Link className={textLinkClass} to="/login">
                  Sign in
                </Link>
              ) : (
                <button
                  className={textLinkClass}
                  type="button"
                  onClick={() => void ordersQuery.refetch()}
                >
                  Try again
                </button>
              )
            }
          />
        ) : allOrders.length === 0 ? (
          <OrderMessage
            title="No orders yet"
            detail="Your orders will appear here after checkout."
            action={
              <Link className={textLinkClass} to="/products">
                Browse products
              </Link>
            }
          />
        ) : visibleOrders.length === 0 ? (
          <OrderMessage
            title={`No ${selectedFilter?.label.toLowerCase() ?? ""} orders on this page`}
            detail="Try another status or move to a different page."
            action={
              selectedBucket !== "all" ? (
                <button
                  className={textLinkClass}
                  type="button"
                  onClick={() => selectBucket("all")}
                >
                  Show all orders
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ol
              className="m-0 list-none border-t border-rule p-0"
              aria-label="Order history"
            >
              {visibleOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onPay={() => paymentMutation.mutate({ order: order.id })}
                  onCancel={() => cancelMutation.mutate({ order: order.id })}
                  actionsDisabled={
                    paymentMutation.isPending || cancelMutation.isPending
                  }
                  paymentPending={
                    paymentMutation.isPending &&
                    paymentMutation.variables?.order === order.id
                  }
                  cancelPending={
                    cancelMutation.isPending &&
                    cancelMutation.variables?.order === order.id
                  }
                  paymentError={
                    paymentMutation.isError &&
                    paymentMutation.variables?.order === order.id
                      ? paymentMutation.error
                      : undefined
                  }
                  cancelError={
                    cancelMutation.isError &&
                    cancelMutation.variables?.order === order.id
                      ? cancelMutation.error
                      : undefined
                  }
                  paymentResult={
                    paymentMutation.isSuccess &&
                    paymentMutation.variables?.order === order.id &&
                    paymentMutation.data.status === 201
                      ? paymentMutation.data.data.data
                      : undefined
                  }
                />
              ))}
            </ol>
          </>
        )}
        {response && response.meta.last_page > 1 && ordersQuery.isSuccess && (
          <nav
            className="mt-4 flex items-center justify-between border-t border-rule pt-3"
            aria-label="Order pagination"
          >
            <button
              className={paginationButtonClass}
              type="button"
              disabled={response.meta.current_page <= 1}
              onClick={() => changePage(response.meta.current_page - 1)}
            >
              Previous
            </button>
            <span className="text-[12px] tabular-nums text-muted sm:text-[13px]">
              Page {response.meta.current_page} of {response.meta.last_page}
            </span>
            <button
              className={paginationButtonClass}
              type="button"
              disabled={response.meta.current_page >= response.meta.last_page}
              onClick={() => changePage(response.meta.current_page + 1)}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

const textLinkClass =
  "inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline";
const paginationButtonClass =
  "inline-flex min-h-10 items-center border-0 bg-transparent p-0 text-[14px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-muted";
const orderRowGridClass =
  "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,1.35fr)_7rem_12.5rem] lg:items-center lg:gap-x-6";
const primaryActionClass =
  "inline-flex min-h-11 w-full items-center justify-center border-0 bg-charcoal px-4 font-semibold text-spectral-citron no-underline hover:bg-charcoal-hover disabled:cursor-not-allowed disabled:opacity-55 sm:w-fit lg:min-h-10";

function OrderRow({
  order,
  onPay,
  onCancel,
  actionsDisabled,
  paymentPending,
  cancelPending,
  paymentError,
  cancelError,
  paymentResult,
}: {
  order: Order;
  onPay: () => void;
  onCancel: () => void;
  actionsDisabled: boolean;
  paymentPending: boolean;
  cancelPending: boolean;
  paymentError?: unknown;
  cancelError?: unknown;
  paymentResult?: { payment_url: string | null };
}) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const canCancel =
    order.status === "pending_payment" || order.status === "paid";

  return (
    <li className="border-b border-rule">
      <article className={orderRowGridClass}>
        <div className="min-w-0">
          <p className="m-0 break-words text-[14px] font-semibold">
            Order {order.order_number}
          </p>
          <p className="mb-0 mt-1 text-[12px] text-muted">
            {formatOrderDate(order.created_at)}
          </p>
        </div>

        <div className="col-span-2 mt-3 min-w-0 lg:col-span-1 lg:mt-0">
          <OrderStatusDisplay status={order.status} />
        </div>

        <dl className="col-start-2 row-start-1 m-0 flex flex-col-reverse text-right lg:col-auto lg:row-auto">
          <dt className="mt-1 text-[12px] text-muted lg:sr-only">Total</dt>
          <dd className="m-0 text-[14px] font-semibold tabular-nums">
            {formatPrice(order.total)}
          </dd>
        </dl>

        <div className="col-span-2 mt-5 grid min-w-0 gap-y-2 text-[13px] lg:col-span-1 lg:mt-0 lg:flex lg:flex-wrap lg:items-center lg:justify-end lg:gap-x-3">
          {order.status === "pending_payment" &&
            (paymentResult?.payment_url ? (
              <a
                className={primaryActionClass}
                href={paymentResult.payment_url}
                target="_blank"
                rel="noreferrer"
              >
                Continue to payment
              </a>
            ) : (
              <button
                className={primaryActionClass}
                type="button"
                disabled={actionsDisabled}
                onClick={onPay}
                aria-busy={paymentPending}
              >
                {paymentPending
                  ? "Preparing payment…"
                  : paymentError
                    ? "Try payment again"
                    : "Pay"}
              </button>
            ))}

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:justify-start sm:gap-x-6 lg:contents">
            <Link
              className="inline-flex min-h-10 items-center font-semibold text-ink underline-offset-4 hover:underline"
              to={`/orders/${order.id}`}
            >
              View details
            </Link>

            {canCancel && !confirmingCancel && (
              <button
                className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted"
                type="button"
                disabled={actionsDisabled}
                onClick={() => setConfirmingCancel(true)}
              >
                Cancel
              </button>
            )}

            {canCancel && confirmingCancel && (
              <div
                className="flex min-h-10 basis-full flex-wrap items-center gap-x-3 gap-y-1 lg:basis-auto"
                role="group"
                aria-label={`Cancel order ${order.order_number}`}
              >
                <span className="text-muted">Cancel this order?</span>
                <button
                  className={textLinkClass}
                  type="button"
                  disabled={cancelPending}
                  onClick={() => setConfirmingCancel(false)}
                >
                  Keep order
                </button>
                <button
                  className="inline-flex min-h-10 items-center border-0 bg-transparent p-0 font-semibold text-ink underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted"
                  type="button"
                  disabled={actionsDisabled}
                  onClick={onCancel}
                  aria-busy={cancelPending}
                >
                  {cancelPending
                    ? "Cancelling…"
                    : cancelError
                      ? "Try again"
                      : "Confirm cancel"}
                </button>
              </div>
            )}
          </div>

          {Boolean(paymentError) && (
            <MutationError error={paymentError} onRetry={onPay} />
          )}
          {Boolean(cancelError) && (
            <MutationError error={cancelError} onRetry={onCancel} />
          )}
          {paymentResult && !paymentResult.payment_url && (
            <p className="m-0 basis-full text-[12px] text-muted" role="status">
              A payment link is not available yet.
            </p>
          )}
        </div>
      </article>
    </li>
  );
}

function OrderStatusDisplay({ status }: { status: OrderStatus }) {
  const progressIndex = PROGRESS_STATUSES.indexOf(status);
  const isInProgress = progressIndex >= 0;

  return (
    <div className="min-w-0">
      {isInProgress && (
        <div
          className="mt-2 max-w-[320px]"
          role="group"
          aria-label={`Order progress: ${STATUS_LABELS[status]}`}
        >
          <div className="grid grid-cols-4 gap-[3px]" aria-hidden="true">
            {PROGRESS_STATUSES.map((step, index) => (
              <span
                className={`h-[2px] ${
                  index <= progressIndex ? "bg-charcoal" : "bg-rule"
                }`}
                key={step}
              />
            ))}
          </div>

          <div className="mt-1 grid grid-cols-4 text-[11px] leading-tight">
            {PROGRESS_STATUSES.map((step, index) => (
              <span
                className={`relative isolate ${
                  index === progressIndex
                    ? "font-semibold text-ink after:absolute after:inset-x-0 after:top-0 after:-z-10 after:h-[95%] after:bg-spectral-citron after:opacity-90"
                    : "text-muted"
                } ${
                  index === 0
                    ? "text-left"
                    : index === PROGRESS_STATUSES.length - 1
                      ? "text-right"
                      : "text-center"
                }`}
                key={step}
              >
                {STATUS_LABELS[step]}
              </span>
            ))}
          </div>
        </div>
      )}

      {!isInProgress && (
        <p className="m-0 text-[13px] font-medium text-muted">
          {STATUS_LABELS[status]}
        </p>
      )}
    </div>
  );
}

function MutationError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const needsSignIn = getErrorStatus(error) === 401;

  return (
    <div className="basis-full text-[12px] text-ink" role="alert">
      <p className="m-0">{getErrorMessage(error)}</p>
      <div className="flex flex-wrap items-center gap-x-3">
        {needsSignIn && (
          <Link
            className="inline-flex min-h-9 items-center font-semibold underline-offset-4 hover:underline"
            to="/login"
          >
            Sign in
          </Link>
        )}
        <button
          className="inline-flex min-h-9 items-center border-0 bg-transparent p-0 font-semibold underline-offset-4 hover:underline"
          type="button"
          onClick={onRetry}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function OrderSkeletons() {
  return (
    <div role="status" aria-label="Loading orders">
      <ol className="m-0 list-none border-t border-rule p-0" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <li
            className={`${orderRowGridClass} border-b border-rule`}
            key={index}
          >
            <div className="grid gap-2">
              <span className="h-3 w-36 max-w-full bg-skeleton" />
              <span className="h-3 w-24 bg-skeleton" />
            </div>
            <div className="col-span-2 mt-3 grid gap-2 lg:col-span-1 lg:mt-0">
              <span className="h-3 w-24 bg-skeleton" />
              <span className="h-[2px] w-full max-w-[280px] bg-skeleton" />
            </div>
            <span className="col-start-2 row-start-1 h-3 w-20 justify-self-end bg-skeleton lg:col-auto lg:row-auto" />
            <span className="col-span-2 mt-5 h-11 w-full bg-skeleton sm:w-24 lg:col-span-1 lg:mt-0 lg:h-10 lg:justify-self-end" />
          </li>
        ))}
      </ol>
      <span className="sr-only">Loading orders</span>
    </div>
  );
}

function OrderMessage({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-start justify-center border-t border-rule py-9">
      <h2 className="m-0 text-[24px] font-[560] leading-tight">{title}</h2>
      <p className="mb-4 mt-2 max-w-[65ch] text-[14px] text-muted">{detail}</p>
      {action}
    </div>
  );
}
