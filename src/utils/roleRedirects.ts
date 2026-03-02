export const getRoleRedirectPath = (role: string): string => {
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case 'cashier':
      return '/app/cashier';
    case 'chef':
      return '/app/kitchen';
    case 'bartender':
      return '/app/bar';
    case 'waiter':
    case 'owner':
    case 'admin':
    case 'manager':
    default:
      return '/app/dashboard';
  }
};
