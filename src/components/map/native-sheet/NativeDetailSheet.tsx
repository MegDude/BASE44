import type * as React from "react";
import { NativeDrawerShell } from "@/components/map/NativeDrawerShell";

export const NativeDetailSheet = NativeDrawerShell;

export function SheetStateController({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SheetHandle(props: React.HTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className="dp-route-sheet-grabber" {...props}><i /></button>;
}

export function SheetHeader({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <header className={`dp-route-sheet-header ${className}`.trim()} {...props}>{children}</header>;
}

export function SheetViewport({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={`dp-native-detail-viewport ${className}`.trim()} {...props}>{children}</section>;
}

export function SheetSection({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={`dp-native-detail-section ${className}`.trim()} {...props}>{children}</section>;
}

export function SheetRow({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`dp-native-detail-row ${className}`.trim()} {...props}>{children}</div>;
}

export function SheetActionBar({ children, className = "", ...props }: React.HTMLAttributes<HTMLElement>) {
  return <footer className={`dp-native-detail-action-bar ${className}`.trim()} {...props}>{children}</footer>;
}

export const DestinationDetailSheet = NativeDetailSheet;
export const PerkDetailSheet = NativeDetailSheet;
export const ListingDetailSheet = NativeDetailSheet;
export const EventDetailSheet = NativeDetailSheet;
export const CivicDetailSheet = NativeDetailSheet;
export const SearchResultSheet = NativeDetailSheet;
export const ResidentPassSheet = NativeDetailSheet;
export const PartnerIntelligenceSheet = NativeDetailSheet;
