import { create } from "zustand";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabaseAdmin";
import { persist } from "zustand/middleware";
import Swal from "sweetalert2";
import { database_logs } from "./logActivities";
import { Session, User } from "@supabase/supabase-js";
import React from 'react';

// Import components used in getStepContent
// These will still be .js/.jsx for now, which is fine with allowJs: true
// But we should try to type them as React components
const PaymentForm = React.lazy(() => import("../pages/auth/components/PaymentForm"));
const RestaurantForm = React.lazy(() => import("../pages/auth/components/RestaurantForm"));
const Review = React.lazy(() => import("../pages/auth/components/Review"));
const PersonalInformationForm = React.lazy(() => import("../pages/auth/components/PersonalInformationForm"));

import useRestaurantStore from "./restaurantStore";

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone_number: string;
  password?: string;
  confirmPassword?: string;
  profileAvatar?: string;
}

export interface RestaurantInfo {
  name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone_number: string;
  email: string;
  website: string;
  logo: string;
  addressLine1?: string; // Legacy fields used in insertRestaurant
  addressLine2?: string;
  zipCode?: string;
  phoneNumber?: string;
}

export interface CardDetails {
  card_number: string;
  card_holder_name: string;
  card_expiry_date: string;
  card_cvv: string;
}

export interface Subscription {
  subscription_plan: string;
  price: number;
  billing_cycle: string;
  payment_method: string;
  card_details: CardDetails;
  momo_number: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  memberships: any[];
  currentMember: any;
  setMemberships: (memberships: any[]) => void;
  setCurrentMember: (member: any) => void;
  refreshSession: () => Promise<void>;
  setAuth: (user: User | null, session: Session | null) => void;
  clearAuth: () => void;
  personalInfo: PersonalInfo;
  restaurantInfo: RestaurantInfo;
  subscription: Subscription;
  defaultSubscription: Subscription;
  validationErrors: Record<string, string>;
  email: string;
  password: string;
  confirmPassword: string;
  emailError: boolean;
  emailErrorMessage: string;
  passwordError: boolean;
  passwordErrorMessage: string;
  role: string;
  employees: any[];
  selectedEmployee: any;
  loading: boolean;
  steps: string[];
  countries: string[];
  activeStep: number;
  consent: boolean;
  processing: boolean;

  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setEmailError: (value: boolean) => void;
  setEmailErrorMessage: (value: string) => void;
  setPasswordError: (value: boolean) => void;
  setPasswordErrorMessage: (value: string) => void;
  setConfirmPasswordError: (value: boolean) => void;
  setConfirmPasswordErrorMessage: (value: string) => void;
  setLoading: (value: boolean) => void;
  getRestaurantMemberDetails: (restaurantId: string, userId: string) => Promise<any>;
  resetPassword: (email: string, password: string) => Promise<any>;
  validateInputs: (email: string, password: string) => boolean;
  validateConfirmPassword: (password: string, confirmPassword: string) => boolean;
  setProcessing: (value: boolean) => void;
  updateConsent: (value: boolean) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  updateRestaurantInfo: (field: keyof RestaurantInfo, value: string) => void;
  updateSubscription: (field: string, value: string, plans: any[]) => void;
  validatePersonalInfo: () => Record<string, string>;
  validateRestaurantInfo: () => Record<string, string>;
  validateSubscriptionInfo: () => Record<string, string>;
  validateUserAgreement: () => Record<string, string>;
  handleNextWithValidation: () => { success: boolean; errors?: Record<string, string> };
  setActiveStep: (step: number) => void;
  handleNext: () => void;
  handleBack: () => void;
  getStepContent: (step: number) => React.ReactNode;
  setUsername: (username: string) => void;
  setRole: (role: string) => void;
  setSelectedEmployee: (employee: any) => void;
  fetchUser: () => Promise<void>;
  updateUserAvatar: (avatar: string) => Promise<any>;
  updateUserAvatarAsAdmin: (userId: string, avatarUrl: string) => Promise<any>;
  updateUserDetailsAsAdmin: (userId: string, details: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, extraData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  login: (navigate: any) => Promise<void>;
  resetAuth: () => void;
  insertRestaurant: (userId: string) => Promise<any>;
  // Added username field as it's used in login/resetAuth
  username: string;
  confirmPasswordError?: boolean;
  confirmPasswordErrorMessage?: string;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      memberships: [],
      currentMember: null,
      username: "",
      setMemberships: (memberships) => set({ memberships }),
      setCurrentMember: (member) => set({ currentMember: member }),
      refreshSession: async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          set({ user: session.user, session });
        } else {
          set({ user: null, session: null });
        }
      },
      setAuth: (user, session) => set({ user, session }),
      clearAuth: () => set({ user: null, session: null }),
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone_number: "",
        password: "",
        confirmPassword: "",
        profileAvatar: "",
      },
      restaurantInfo: {
        name: "",
        description: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        phone_number: "",
        email: "",
        website: "",
        logo: "",
      },
      subscription: {
        subscription_plan: "free",
        price: 0,
        billing_cycle: "monthly",
        payment_method: "",
        card_details: {
          card_number: "",
          card_holder_name: "",
          card_expiry_date: "",
          card_cvv: "",
        },
        momo_number: "",
      },
      defaultSubscription: {
        subscription_plan: "free",
        price: 0,
        billing_cycle: "monthly",
        payment_method: "",
        card_details: {
          card_number: "",
          card_holder_name: "",
          card_expiry_date: "",
          card_cvv: "",
        },
        momo_number: "",
      },
      validationErrors: {},
      email: "",
      password: "",
      confirmPassword: "",
      emailError: false,
      emailErrorMessage: "",
      passwordError: false,
      passwordErrorMessage: "",
      role: "waiter",
      employees: [],
      selectedEmployee: null,
      loading: false,
      steps: [
        "Personal Information",
        "Restaurant Details",
        "Billing & Subscription",
        "User Agreement & Privacy Policy",
      ],
      countries: [
        "United States",
        "Canada",
        "United Kingdom",
        "Australia",
        "Germany",
        "France",
        "Ghana",
        "Nigeria",
        "South Africa",
        "India",
        "Japan",
        "China",
      ],
      activeStep: 0,
      consent: false,
      processing: false,

      setEmail: (value) => set({ email: value }),
      setPassword: (value) => set({ password: value }),
      setConfirmPassword: (value) => set({ confirmPassword: value }),

      setEmailError: (value) => set({ emailError: value }),
      setEmailErrorMessage: (value) => set({ emailErrorMessage: value }),
      setPasswordError: (value) => set({ passwordError: value }),
      setPasswordErrorMessage: (value) => set({ passwordErrorMessage: value }),
      setConfirmPasswordError: (value) => set({ confirmPasswordError: value }),
      setConfirmPasswordErrorMessage: (value) => set({ confirmPasswordErrorMessage: value }),

      setLoading: (value) => set({ loading: value }),

      getRestaurantMemberDetails: async (restaurantId, userId) => {
        const { data, error } = await supabase
          .from('restaurant_members_with_users')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('user_id', userId)
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching restaurant member details:', error);
          return null;
        }

        return data;
      },

      resetPassword: async (email, password) => {
        const { data, error } = await supabase.auth.updateUser({
          email,
          password,
        })

        if (error) {
          console.error(error);

          Swal.fire({
            title: 'Error',
            text: error.message,
            icon: 'error',
          });

          return null;
        }
        
        return data;
      },

      validateInputs: (email, password) => {
        let isValid = true;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          set({
            emailError: true,
            emailErrorMessage: "Please enter a valid email address.",
          });
          isValid = false;
        } else {
          set({ emailError: false, emailErrorMessage: "" });
        }

        if (!password || password.length < 6) {
          set({
            passwordError: true,
            passwordErrorMessage:
              "Password must be at least 6 characters long.",
          });
          isValid = false;
        } else {
          set({ passwordError: false, passwordErrorMessage: "" });
        }

        return isValid;
      },

      validateConfirmPassword: (password, confirmPassword) => {
        let isValid = true;

        if (password.length < 6) {
          set({
            passwordError: true,
            passwordErrorMessage: "Password must be at least 6 characters long.",
          });
          isValid = false;
        } else if (password !== confirmPassword) {
          set({
            confirmPasswordError: true,
            confirmPasswordErrorMessage: "Passwords do not match.",
          });
          isValid = false;
        } else {
          set({ confirmPasswordError: false, confirmPasswordErrorMessage: "" });
        }

        return isValid;
      },

      setProcessing: (value) => set({ processing: value }),

      updateConsent: (value) => {
        set({ consent: value });
      },

      updatePersonalInfo: (field, value) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, [field]: value },
        })),

      updateRestaurantInfo: (field, value) =>
        set((state) => ({
          restaurantInfo: { ...state.restaurantInfo, [field]: value },
        })),

      updateSubscription: (field, value, plans) => {
        set((state) => {
          if (value === "free") {
            return {
              subscription: state.defaultSubscription,
            };
          }

          let newSubscription = { ...state.subscription, [field as keyof Subscription]: value };

          const selectedPlan = plans.find(
            (p) => p.id === newSubscription.subscription_plan
          );

          if (
            (field === "subscription_plan" || field === "billing_cycle") &&
            selectedPlan
          ) {
            const cycle = (newSubscription.billing_cycle as 'monthly' | 'yearly') || "monthly";
            newSubscription.price = selectedPlan[cycle];
          }

          return { subscription: newSubscription };
        });
      },

      validatePersonalInfo: () => {
        const { personalInfo } = get();
        const errors: Record<string, string> = {};

        if (!personalInfo.firstName.trim())
          errors.firstName = "First name is required";

        if (!personalInfo.lastName.trim())
          errors.lastName = "Last name is required";

        if (!personalInfo.email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
          errors.email = "Invalid email format";
        }

        if (!personalInfo.password) {
          errors.password = "Password is required";
        } else if (personalInfo.password.length < 6) {
          errors.password = "Password must be at least 6 characters";
        }

        if (personalInfo.confirmPassword !== personalInfo.password) {
          errors.confirmPassword = "Passwords do not match";
        }

        return errors;
      },

      validateRestaurantInfo: () => {
        const { restaurantInfo } = get();
        const errors: Record<string, string> = {};

        if (!restaurantInfo.name.trim())
          errors.name = "Restaurant name is required";

        if (!restaurantInfo.address_line_1.trim())
          errors.address_line_1 = "Address line 1 is required";

        if (!restaurantInfo.city.trim()) errors.city = "City is required";

        if (!restaurantInfo.state.trim()) errors.state = "State is required";

        if (!restaurantInfo.country.trim())
          errors.country = "Country is required";

        if (!restaurantInfo.phone_number.trim())
          errors.phone_number = "Phone number is required";

        if (!restaurantInfo.email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(restaurantInfo.email)) {
          errors.email = "Invalid email format";
        }

        return errors;
      },

      validateSubscriptionInfo: () => {
        const { subscription } = get();
        const errors: Record<string, string> = {};
        if (subscription.payment_method === "creditCard") {
          if (!subscription.card_details.card_number.trim())
            errors.card_number = "Card number is required";
          if (!subscription.card_details.card_holder_name.trim())
            errors.card_holder_name = "Card holder name is required";
          if (!subscription.card_details.card_expiry_date.trim())
            errors.card_expiry_date = "Card expiry date is required";
          if (!subscription.card_details.card_cvv.trim())
            errors.card_cvv = "Card CVV is required";
        }

        if (subscription.payment_method === "momo") {
          if (!subscription.momo_number.trim())
            errors.momo_number = "Momo number is required";
        }

        return errors;
      },

      validateUserAgreement: () => {
        const { consent } = get();
        const errors: Record<string, string> = {};
        if (!consent) errors.consent = "You must agree to the user agreement";
        return errors;
      },

      handleNextWithValidation: () => {
        const {
          activeStep,
          validatePersonalInfo,
          validateRestaurantInfo,
          validateSubscriptionInfo,
          validateUserAgreement,
        } = get();
        let errors: Record<string, string> = {};

        if (activeStep === 0) errors = validatePersonalInfo();
        if (activeStep === 1) errors = validateRestaurantInfo();
        if (activeStep === 2) errors = validateSubscriptionInfo();
        if (activeStep === 3) errors = validateUserAgreement();

        if (Object.keys(errors).length > 0) {
          set({ validationErrors: errors });
          return { success: false, errors };
        }

        set((state) => ({ activeStep: state.activeStep + 1 }));
        return { success: true };
      },

      setActiveStep: (step) => set({ activeStep: step }),

      handleNext: () => {
        const { activeStep } = get();
        set({ activeStep: activeStep + 1 });
      },
      handleBack: () => {
        const { activeStep } = get();
        set({ activeStep: activeStep - 1 });
      },

      getStepContent: (step) => {
        switch (step) {
          case 0:
            return <React.Suspense fallback={<div>Loading...</div>}><PersonalInformationForm /></React.Suspense>;
          case 1:
            return <React.Suspense fallback={<div>Loading...</div>}><RestaurantForm /></React.Suspense>;
          case 2:
            return <React.Suspense fallback={<div>Loading...</div>}><PaymentForm /></React.Suspense>;
          case 3:
            return <React.Suspense fallback={<div>Loading...</div>}><Review /></React.Suspense>;
          default:
            throw new Error("Unknown step");
        }
      },

      setUsername: (username) => set({ username }),
      setRole: (role) => set({ role }),
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee, username: employee?.name || "" }),

      fetchUser: async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) console.error(error);

        set({ session, user: session?.user || null, loading: false });
      },

      updateUserAvatar: async (avatar) => {
        const { data, error } = await supabase.auth.updateUser({
          data: { profileAvatar: avatar },
        });
        if (error) throw error;
        return data;
      },

      updateUserAvatarAsAdmin: async (userId, avatarUrl) => {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            user_metadata: { profileAvatar: avatarUrl },
          }
        );

        if (error) throw error;
        return data;
      },

      updateUserDetailsAsAdmin: async (userId, details) => {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          {
            phone: details.phone_number,
            user_metadata: {
              firstName: details.first_name,
              lastName: details.last_name,
            },
          }
        );

        if (error) throw error;
        return data;
      },

      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { session, user } = data;

        get().setAuth(user, session);

        const { data: memberships } = await supabase
          .from("restaurant_members")
          .select("*")
          .eq("user_id", user?.id);

        get().setMemberships(memberships || []);

        return data;
      },

      signUp: async (email, password, extraData = {}) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              firstName: extraData.firstName,
              lastName: extraData.lastName,
              phone: extraData.phone_number,
            },
          },
        });

        if (error) throw error;

        get().setAuth(data.user, data.session);
        return data;
      },

      signOut: async () => {
        await supabase.auth.signOut();
        (useAuthStore as any).persist.clearStorage();
        useAuthStore.setState({ user: null, session: null, email: "", password: "", username: "" });
        (useRestaurantStore as any).persist.clearStorage();
        useRestaurantStore.setState({
          restaurants: [],
          selectedRestaurant: null,
        });
      },

      fetchEmployees: async () => {
        try {
          const { data, error } = await supabase.from("employees").select("*");
          if (error) throw error;
          set({ employees: data || [] });
        } catch (error: any) {
          Swal.fire({ title: "Error", text: error.message, icon: "error" });
        }
      },

      login: async (navigate) => {
        const { username, password } = get();
        if (!username || !password) {
          Swal.fire({
            title: "Error",
            text: "Username and Password are required.",
            icon: "error",
          });
          return;
        }

        try {
          const { data: employees, error } = await supabase
            .from("employees")
            .select("*")
            .eq("name", username);
          if (error) throw error;

          if (
            employees?.[0]?.password === password &&
            employees?.[0]?.name === username
          ) {
            localStorage.setItem("employee", JSON.stringify(employees));
            navigate("/app/dashboard", { replace: true });
            const details = { info: "User logged in successfully" };
            database_logs(username, "USER_LOGGED_IN", details);
          } else {
            Swal.fire({
              title: "Failed",
              text: "Incorrect password",
              icon: "error",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Network Error",
            text: "Please check your internet and try again",
            icon: "error",
          });
        }
      },

      resetAuth: () => {
        set({
          username: "",
          password: "",
          role: "waiter",
          selectedEmployee: null,
          employees: [],
        });
      },

      insertRestaurant: async (userId) => {
        const { restaurantInfo } = get();
        const { data, error } = await supabase.from("restaurants").insert([
          {
            name: restaurantInfo.name,
            ownerId: userId,
            description: restaurantInfo.description || "",
            address_line_1: restaurantInfo.addressLine1 || restaurantInfo.address_line_1,
            address_line_2: restaurantInfo.addressLine2 || restaurantInfo.address_line_2 || "",
            city: restaurantInfo.city,
            state: restaurantInfo.state,
            zip_code: restaurantInfo.zipCode || restaurantInfo.zip_code || "",
            country: restaurantInfo.country,
            phone_number: restaurantInfo.phoneNumber || restaurantInfo.phone_number,
            email: restaurantInfo.email,
            website: restaurantInfo.website || "",
            logo: restaurantInfo.logo || "",
          },
        ]);
        if (error) throw error;
        return data;
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        memberships: state.memberships,
      }),
    }
  )
);  

export default useAuthStore;
