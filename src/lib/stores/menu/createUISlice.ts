import { StateCreator } from "zustand";
import { MenuState } from "../../../types/menu";
import { handleError } from "../../../components/Error";

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
    try {
      if (get().activeStep === 1) {
        const success = await get().confirmPayment();
        if (!success) return;
        // The order is reset internally on success, so we stay at step 0
        return; 
      }
      set((state: any) => ({
        activeStep: state.activeStep + 1,
        proceedToCheckOut: true,
      }));
    } catch (error) {
      console.error("Error in handleNext:", error);
      handleError(error as Error);
    }
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
