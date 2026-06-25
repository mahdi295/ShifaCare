import { motion } from 'framer-motion';

export const Skeleton = ({ className = '' }) => (
  <div
    className={`animate-shimmer rounded-lg ${className}`}
  />
);

export const DoctorCardSkeleton = () => (
  <div className="rounded-xl bg-surface border border-border p-5">
    <div className="flex items-start gap-4">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-28" />
        <div className="flex gap-3 pt-1">
          <Skeleton className="h-3 w-18" />
          <Skeleton className="h-3 w-18" />
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
      <Skeleton className="h-5 w-14" />
      <Skeleton className="h-8 w-22 rounded-lg" />
    </div>
  </div>
);

export const StatCardSkeleton = () => (
  <div className="rounded-xl bg-surface border border-border p-5">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-14" />
      </div>
      <Skeleton className="w-10 h-10 rounded-lg" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="rounded-xl bg-surface border border-border p-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-22" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-18 rounded-lg" />
        <Skeleton className="h-8 w-18 rounded-lg" />
      </div>
    </div>
  </div>
);

export const PrescriptionSkeleton = () => (
  <div className="rounded-xl bg-surface border border-border p-5">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-22" />
        </div>
      </div>
      <Skeleton className="h-3 w-18" />
    </div>
    <Skeleton className="h-16 w-full rounded-lg mb-4" />
    <Skeleton className="h-9 w-full rounded-lg" />
  </div>
);

export const PageLoader = () => (
  <div className="flex flex-col items-center justify-center py-24 gap-3">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-9 h-9 rounded-full border-[3px] border-primary/20 border-t-primary"
    />
    <p className="text-sm text-muted">Loading...</p>
  </div>
);

export default Skeleton;
