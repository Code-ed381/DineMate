import * as React from 'react';
import PaymentForm from "./PaymentForm";
import RestaurantForm from "./RestaurantForm";
import Review from "./Review";
import PersonalInformationForm from "./PersonalInformationForm";

interface AuthStepperContentProps {
  step: number;
}

const AuthStepperContent: React.FC<AuthStepperContentProps> = ({ step }) => {
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
      return null;
  }
};

export default AuthStepperContent;
