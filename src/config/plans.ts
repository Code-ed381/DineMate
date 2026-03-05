export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanLimit {
  // Resource caps
  maxEmployees: number;
  maxTables: number;
  maxMenuItems: number;
  maxOrdersPerDay: number;
  // UI & personalization
  canToggleTheme: boolean;
  canSwitchViewMode: boolean;
  // Feature gates
  canUseFloorPlan: boolean;
  canUseBarModule: boolean;
  canUseReports: boolean;
  canUseAdvancedReports: boolean;
  canUseSplitBill: boolean;
  canUseDiscounts: boolean;
  canUseAuditLogs: boolean;
  canUseCsvExport: boolean;
  canUseOnlineOrdering: boolean;
  canUseComplaints: boolean;
  canUseCommandPalette: boolean;
  canUsePageTransitions: boolean;
  canUseMultiplePayments: boolean;
  canUseTableTransfer: boolean;
  canUseEmployeePerformance: boolean;
  canUseCustomReceipt: boolean;
  canUseSessionTimeout: boolean;
  hasPrioritySupport: boolean;
}

export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  monthly: number;
  yearly: number;
  cta: string;
  popular?: boolean;
  features: PlanFeature[];
  limits: PlanLimit;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Starter",
    subtitle: "Try it out",
    monthly: 0,
    yearly: 0,
    cta: "Get Started",
    features: [
      { text: "Up to 5 tables", included: true },
      { text: "Up to 10 menu items", included: true },
      { text: "Up to 2 staff accounts", included: true },
      { text: "30 orders per day", included: true },
      { text: "Basic table management", included: true },
      { text: "Kitchen display (KDS)", included: true },
      { text: "Cash payments", included: true },
      { text: "Basic receipts", included: true },
      { text: "Floor plan view", included: false },
      { text: "Bar module & OTC sales", included: false },
      { text: "Multiple payment methods", included: false },
      { text: "Reports & analytics", included: false },
      { text: "Dark / light mode", included: false },
    ],
    limits: {
      maxEmployees: 2,
      maxTables: 5,
      maxMenuItems: 10,
      maxOrdersPerDay: 30,
      canToggleTheme: false,
      canSwitchViewMode: false,
      canUseFloorPlan: false,
      canUseBarModule: false,
      canUseReports: false,
      canUseAdvancedReports: false,
      canUseSplitBill: false,
      canUseDiscounts: false,
      canUseAuditLogs: false,
      canUseCsvExport: false,
      canUseOnlineOrdering: false,
      canUseComplaints: false,
      canUseCommandPalette: false,
      canUsePageTransitions: false,
      canUseMultiplePayments: false,
      canUseTableTransfer: false,
      canUseEmployeePerformance: false,
      canUseCustomReceipt: false,
      canUseSessionTimeout: false,
      hasPrioritySupport: false,
    },
  },
  {
    id: "growth",
    name: "Growth",
    subtitle: "Scale your team",
    monthly: 29,
    yearly: 290,
    cta: "Choose Growth",
    features: [
      { text: "Up to 15 tables", included: true },
      { text: "Up to 40 menu items", included: true },
      { text: "Up to 8 staff accounts", included: true },
      { text: "Unlimited orders", included: true },
      { text: "Floor plan & table positioning", included: true },
      { text: "Table transfer between staff", included: true },
      { text: "Card, MoMo & cash payments", included: true },
      { text: "Bar module with OTC sales", included: true },
      { text: "Basic sales reports", included: true },
      { text: "Employee management", included: true },
      { text: "Dark / light mode", included: true },
      { text: "Complaints system", included: true },
      { text: "Proforma bills", included: true },
      { text: "Advanced reports (X/Z)", included: false },
      { text: "Split bills & discounts", included: false },
      { text: "CSV data export", included: false },
    ],
    limits: {
      maxEmployees: 8,
      maxTables: 15,
      maxMenuItems: 40,
      maxOrdersPerDay: 9999,
      canToggleTheme: true,
      canSwitchViewMode: true,
      canUseFloorPlan: true,
      canUseBarModule: true,
      canUseReports: true,
      canUseAdvancedReports: false,
      canUseSplitBill: false,
      canUseDiscounts: false,
      canUseAuditLogs: false,
      canUseCsvExport: false,
      canUseOnlineOrdering: false,
      canUseComplaints: true,
      canUseCommandPalette: false,
      canUsePageTransitions: false,
      canUseMultiplePayments: true,
      canUseTableTransfer: true,
      canUseEmployeePerformance: false,
      canUseCustomReceipt: false,
      canUseSessionTimeout: false,
      hasPrioritySupport: false,
    },
  },
  {
    id: "professional",
    name: "Professional",
    subtitle: "Full power",
    monthly: 59,
    yearly: 590,
    cta: "Go Professional",
    popular: true,
    features: [
      { text: "Up to 50 tables", included: true },
      { text: "Up to 150 menu items", included: true },
      { text: "Up to 25 staff accounts", included: true },
      { text: "Unlimited orders", included: true },
      { text: "Everything in Growth", included: true },
      { text: "Advanced reports (X/Z, KPIs)", included: true },
      { text: "Audit logs & transaction history", included: true },
      { text: "Employee performance tracking", included: true },
      { text: "Split bills & comp items", included: true },
      { text: "Manual discounts", included: true },
      { text: "CSV data export", included: true },
      { text: "Custom receipt messages", included: true },
      { text: "Command palette", included: true },
      { text: "Session timeout protection", included: true },
      { text: "Online ordering", included: false },
      { text: "Priority support", included: false },
    ],
    limits: {
      maxEmployees: 25,
      maxTables: 50,
      maxMenuItems: 150,
      maxOrdersPerDay: 9999,
      canToggleTheme: true,
      canSwitchViewMode: true,
      canUseFloorPlan: true,
      canUseBarModule: true,
      canUseReports: true,
      canUseAdvancedReports: true,
      canUseSplitBill: true,
      canUseDiscounts: true,
      canUseAuditLogs: true,
      canUseCsvExport: true,
      canUseOnlineOrdering: false,
      canUseComplaints: true,
      canUseCommandPalette: true,
      canUsePageTransitions: true,
      canUseMultiplePayments: true,
      canUseTableTransfer: true,
      canUseEmployeePerformance: true,
      canUseCustomReceipt: true,
      canUseSessionTimeout: true,
      hasPrioritySupport: false,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "Total control",
    monthly: 99,
    yearly: 990,
    cta: "Go Enterprise",
    features: [
      { text: "Unlimited tables", included: true },
      { text: "Unlimited menu items", included: true },
      { text: "Unlimited staff accounts", included: true },
      { text: "Unlimited orders", included: true },
      { text: "Everything in Professional", included: true },
      { text: "Online ordering", included: true },
      { text: "Scheduled menu availability", included: true },
      { text: "Inventory reports", included: true },
      { text: "All dashboard components", included: true },
      { text: "Priority support", included: true },
      { text: "No resource limits", included: true },
    ],
    limits: {
      maxEmployees: 9999,
      maxTables: 9999,
      maxMenuItems: 9999,
      maxOrdersPerDay: 9999,
      canToggleTheme: true,
      canSwitchViewMode: true,
      canUseFloorPlan: true,
      canUseBarModule: true,
      canUseReports: true,
      canUseAdvancedReports: true,
      canUseSplitBill: true,
      canUseDiscounts: true,
      canUseAuditLogs: true,
      canUseCsvExport: true,
      canUseOnlineOrdering: true,
      canUseComplaints: true,
      canUseCommandPalette: true,
      canUsePageTransitions: true,
      canUseMultiplePayments: true,
      canUseTableTransfer: true,
      canUseEmployeePerformance: true,
      canUseCustomReceipt: true,
      canUseSessionTimeout: true,
      hasPrioritySupport: true,
    },
  },
];

export const getPlanById = (id: string) => plans.find((p) => p.id === id) || plans[0];

export const getPrice = (planId: string, cycle: "monthly" | "yearly") => {
  const plan = getPlanById(planId);
  return cycle === "monthly" ? plan.monthly : plan.yearly;
};
