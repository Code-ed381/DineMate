import { create } from "zustand";
import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabaseAdmin";
import { persist } from "zustand/middleware";
import Swal from "sweetalert2";
import { database_logs } from "./logActivities";
import PaymentForm from "../pages/auth/components/PaymentForm";
import RestaurantForm from "../pages/auth/components/RestaurantForm";
import Review from "../pages/auth/components/Review";
import PersonalInformationForm from "../pages/auth/components/PersonalInformationForm";
import useRestaurantStore from "./restaurantStore";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      memberships: [],
      setMemberships: (memberships) => set({ memberships }),
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

      // setOnboardingPassword: (password) => { 

      // },

      // --- Validation logic
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

      // --- Update field values
      updateConsent: (value) => {
        set({ consent: value });

        console.log(get().consent);
      },

      // --- Update field values
      updatePersonalInfo: (field, value) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, [field]: value },
        })),

      // --- Update restaurant info
      updateRestaurantInfo: (field, value) =>
        set((state) => ({
          restaurantInfo: { ...state.restaurantInfo, [field]: value },
        })),

      // --- Update subscription info
      updateSubscription: (field, value, plans) => {
        set((state) => {
          // Reset to defaults is selected plan is free
          if (value === "free") {
            return {
              subscription: state.defaultSubscription,
            };
          }

          let newSubscription = { ...state.subscription, [field]: value };

          // Find the selected plan
          const selectedPlan = plans.find(
            (p) => p.id === newSubscription.subscription_plan
          );

          // If subscription_plan or billing_cycle changes, update price
          if (
            (field === "subscription_plan" || field === "billing_cycle") &&
            selectedPlan
          ) {
            const cycle = newSubscription.billing_cycle || "monthly";
            newSubscription.price = selectedPlan[cycle]; // use monthly or yearly price
          }

          return { subscription: newSubscription };
        });

        console.log(get().subscription);
      },

      // --- Validation logic (returns errors object)
      validatePersonalInfo: () => {
        const { personalInfo } = get();
        const errors = {};

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

      // --- Validate restaurant info
      validateRestaurantInfo: () => {
        const { restaurantInfo } = get();
        const errors = {};

        if (!restaurantInfo.name.trim())
          errors.name = "Restaurant name is required";

        // if (!restaurantInfo.description.trim())
        //   errors.description = "Description is required";

        if (!restaurantInfo.address_line_1.trim())
          errors.address_line_1 = "Address line 1 is required";

        if (!restaurantInfo.city.trim()) errors.city = "City is required";

        if (!restaurantInfo.state.trim()) errors.state = "State is required";

        // if (!restaurantInfo.zipCode.trim())
        //   errors.zipCode = "Zip code is required";

        if (!restaurantInfo.country.trim())
          errors.country = "Country is required";

        if (!restaurantInfo.phone_number.trim())
          errors.phone_number = "Phone number is required";

        if (!restaurantInfo.email.trim()) {
          errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(restaurantInfo.email)) {
          errors.email = "Invalid email format";
        }

        // if (!restaurantInfo.website.trim())
        //   errors.website = "Website is required";

        return errors;
      },

      // --- Validate subscription info
      validateSubscriptionInfo: () => {
        const { subscription } = get();
        const errors = {};
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

      // --- Validate user agreement
      validateUserAgreement: () => {
        const { consent } = get();
        const errors = {};
        if (!consent) errors.consent = "You must agree to the user agreement";
        return errors;
      },

      // --- Step handling with validation
      handleNextWithValidation: () => {
        const {
          activeStep,
          validatePersonalInfo,
          validateRestaurantInfo,
          validateSubscriptionInfo,
          validateUserAgreement,
        } = get();
        let errors = {};

        if (activeStep === 0) errors = validatePersonalInfo();
        if (activeStep === 1) errors = validateRestaurantInfo();
        if (activeStep === 2) errors = validateSubscriptionInfo();
        if (activeStep === 3) errors = validateUserAgreement();
        // etc.

        if (Object.keys(errors).length > 0) {
          set((state) => ({ validationErrors: errors }));
          return { success: false, errors };
        }

        set((state) => ({ activeStep: state.activeStep + 1 }));
        return { success: true };
      },

      setActiveStep: (step) => set({ activeStep: step }),

      handleNext: (step) => {
        const { activeStep } = get();
        set({ activeStep: activeStep + 1 });
      },
      handleBack: (step) => {
        const { activeStep } = get();
        set({ activeStep: activeStep - 1 });
      },

      getStepContent: (step) => {
        switch (step) {
          case 0:
            return <PersonalInformationForm />;
          case 1:
            return <RestaurantForm />;
          case 2:
            return <PaymentForm />;
          case 3:
            return <Review />;
          default:
            throw new Error("Unknown step");
        }
      },

      // Setters
      setUsername: (username) => set({ username }),
      setPassword: (password) => set({ password }),
      setRole: (role) => set({ role }),
      setSelectedEmployee: (employee) => set({ selectedEmployee: employee, username: employee?.name || "" }),

      // ✅ Fetch current session
      fetchUser: async () => {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) console.error(error);

        set({ session, user: session?.user || null, loading: false });
      },

      // Update user avatar
      updateUserAvatar: async (avatar) => {
        const { data, error } = await supabase.auth.updateUser({
          data: { profileAvatar: avatar },
        });
        if (error) throw error;
        return data;
      },

      // Update another user’s avatar as admin
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

      // Update anothe users details as admin
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

        console.log(data)
        return data;
      },

      // ✅ Sign in
      signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { session, user } = data;

        useAuthStore.getState().setAuth({ user, session });

        // fetch memberships (from your restaurant_members table)
        const { data: memberships } = await supabase
          .from("restaurant_members")
          .select("restaurant_id, role")
          .eq("user_id", user.id);

        useAuthStore.getState().setMemberships(memberships);

        return data;
      },

      // ✅ Store extra data inside user_metadata
      signUp: async (email, password, extraData = {}) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              // 👈 this becomes user_metadata
              firstName: extraData.firstName,
              lastName: extraData.lastName,
              phone: extraData.phone_number,
            },
          },
        });

        if (error) throw error;

        useAuthStore.getState().setAuth({ user: data.user, session: data.session });
        return data;
      },

      // ✅ Sign out
      signOut: async () => {
        await supabase.auth.signOut();
        useAuthStore.persist.clearStorage(); // clears persisted store
        useAuthStore.setState({ user: null, session: null, email: "", password: "" }); // reset any in-memory state
        useRestaurantStore.persist.clearStorage(); // if you persist restaurants
        useRestaurantStore.setState({
          restaurants: [],
          selectedRestaurant: null,
        });
      },

      // Fetch employees
      fetchEmployees: async () => {
        try {
          const { data, error } = await supabase.from("employees").select("*");
          if (error) throw error;
          set({ employees: data });
        } catch (error) {
          Swal.fire({ title: "Error", text: error.message, icon: "error" });
        }
      },

      // Login logic
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
            employees[0]?.password === password &&
            employees[0]?.name === username
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

      // Reset auth state
      resetAuth: () => {
        set({
          username: "",
          password: "",
          role: "waiter",
          selectedEmployee: null,
          employees: [],
        });
      },

      // Insert into restaurant table
      insertRestaurant: async (userId) => {
        const { restaurantInfo } = get();
        const { data, error } = await supabase.from("restaurants").insert([
          {
            name: restaurantInfo.name,
            ownerId: userId,
            description: restaurantInfo.description || "",
            address_line_1: restaurantInfo.addressLine1,
            address_line_2: restaurantInfo.addressLine2 || "",
            city: restaurantInfo.city,
            state: restaurantInfo.state,
            zip_code: restaurantInfo.zipCode || "",
            country: restaurantInfo.country,
            phone_number: restaurantInfo.phoneNumber,
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
