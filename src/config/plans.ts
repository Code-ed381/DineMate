export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PlanLimit {
  maxEmployees: number;
  maxTables: number;
  maxMenuItems: number;
  canToggleTheme: boolean;
  canSwitchViewMode: boolean;
}

export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  monthly: number;
  yearly: number;
  cta: string;
  features: PlanFeature[];
  limits: PlanLimit;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    subtitle: "Start your journey",
    monthly: 0,
    yearly: 0,
    cta: "Get Started",
    features: [
      { text: "Up to 3 tables", included: true },
      { text: "Up to 5 menu items", included: true },
      { text: "1 staff account", included: true },
      { text: "Basic reports", included: true },
      { text: "Custom themes", included: false },
      { text: "Grid/List view", included: false },
      { text: "Edit Employees", included: false },
      { text: "Add Menu Items", included: true },
      { text: "Manage Tables", included: true },
    ],
    limits: {
      maxEmployees: 1,
      maxTables: 3,
      maxMenuItems: 5,
      canToggleTheme: false,
      canSwitchViewMode: false,
    },
  },
  {
    id: "basic",
    name: "Basic",
    subtitle: "For small teams",
    monthly: 19,
    yearly: 190,
    cta: "Choose Basic",
    features: [
      { text: "Up to 10 tables", included: true },
      { text: "Up to 20 menu items", included: true },
      { text: "Up to 5 staff accounts", included: true },
      { text: "Advanced reports", included: true },
      { text: "Custom themes", included: true },
      { text: "Grid/List view", included: true },
      { text: "Edit Employees", included: true },
      { text: "Add Menu Items", included: true },
      { text: "Manage Tables", included: true },
    ],
    limits: {
      maxEmployees: 5,
      maxTables: 10,
      maxMenuItems: 20,
      canToggleTheme: true,
      canSwitchViewMode: true,
    },
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "For growing restaurants",
    monthly: 49,
    yearly: 490,
    cta: "Go Pro",
    features: [
      { text: "Unlimited tables", included: true },
      { text: "Unlimited menu items", included: true },
      { text: "Unlimited staff accounts", included: true },
      { text: "Priority support", included: true },
      { text: "Custom themes", included: true },
      { text: "Grid/List view", included: true },
      { text: "Edit Employees", included: true },
      { text: "Add Menu Items", included: true },
      { text: "Manage Tables", included: true },
    ],
    limits: {
      maxEmployees: 9999,
      maxTables: 9999,
      maxMenuItems: 9999,
      canToggleTheme: true,
      canSwitchViewMode: true,
    },
  },
];

export const getPlanById = (id: string) => plans.find((p) => p.id === id) || plans[0];

export const getPrice = (planId: string, cycle: "monthly" | "yearly") => {
  const plan = getPlanById(planId);
  return cycle === "monthly" ? plan.monthly : plan.yearly;
};
