import { StateCreator } from "zustand";
import { MenuState } from "../../../types/menu";

export interface UISlice {
  activeStep: number;
  steps: string[];
  proceedToCheckOut: boolean;
  proceedToPrint: boolean;
  showSearch: boolean;
  showFilter: boolean;
  handleNext: () => Promise<void>;
  handleBack: () => void;
  resetStepper: () => void;
  formatCashInput: (amount: string | number) => string;
}

export const createUISlice: StateCreator<MenuState, [], [], UISlice> = (set, get) => ({
  activeStep: 0,
  steps: ["Select Menu Items", "Pay & Check Out"],
  proceedToCheckOut: false,
  proceedToPrint: false,
  showSearch: false,
  showFilter: false,

  handleNext: async () => {
    if (get().activeStep === 1) {
      await get().confirmPayment();
    }
    set((state: any) => ({
      activeStep: state.activeStep + 1,
      proceedToCheckOut: true,
    }));
  },

  handleBack: () => {
    set((state: any) => ({
      activeStep: state.activeStep - 1,
      proceedToCheckOut: false,
    }));
  },

  resetStepper: () => {
    set({ activeStep: 0 });
  },

  formatCashInput: (amount) => {
    const numericValue = String(amount).replace(/[^0-9.]/g, "");
    if (numericValue === "") return "";
    return parseFloat(numericValue).toFixed(2);
  },
});
