import * as React from 'react';

const PaymentForm = React.lazy(() => import("./PaymentForm"));
const RestaurantForm = React.lazy(() => import("./RestaurantForm"));
const Review = React.lazy(() => import("./Review"));
const PersonalInformationForm = React.lazy(() => import("./PersonalInformationForm"));

interface AuthStepperContentProps {
  step: number;
}

const AuthStepperContent: React.FC<AuthStepperContentProps> = ({ step }) => {
  switch (step) {
    case 0:
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <PersonalInformationForm />
        </React.Suspense>
      );
    case 1:
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <RestaurantForm />
        </React.Suspense>
      );
    case 2:
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <PaymentForm />
        </React.Suspense>
      );
    case 3:
      return (
        <React.Suspense fallback={<div>Loading...</div>}>
          <Review />
        </React.Suspense>
      );
    default:
      return null;
  }
};

export default AuthStepperContent;
