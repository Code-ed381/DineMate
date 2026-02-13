import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { 
  Restaurant as RestaurantIcon,
  LocalBar as DrinkIcon,
  Fastfood as FoodIcon,
  Icecream as DessertIcon,
  Coffee as CoffeeIcon,
  LocalPizza as PizzaIcon
} from '@mui/icons-material';

interface MenuImageProps {
  src?: string;
  name: string;
  category?: string;
  sx?: any;
}

const MenuImage: React.FC<MenuImageProps> = ({ src, name, category, sx }) => {
  const [error, setError] = useState(false);
  const isPlaceholder = !src || src.includes('placeholder.com') || error;

  const getFallbackDetails = () => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('drink') || cat.includes('beverage') || cat.includes('wine')) {
      return { icon: <DrinkIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)' };
    }
    if (cat.includes('dessert') || cat.includes('sweet')) {
      return { icon: <DessertIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' };
    }
    if (cat.includes('coffee') || cat.includes('tea')) {
      return { icon: <CoffeeIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #3e2723 0%, #5d4037 100%)' };
    }
    if (cat.includes('pizza')) {
      return { icon: <PizzaIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' };
    }
    if (cat.includes('burger') || cat.includes('snack')) {
      return { icon: <FoodIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' };
    }
    return { icon: <RestaurantIcon sx={{ fontSize: 40, opacity: 0.5 }} />, color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' };
  };

  const fallback = getFallbackDetails();

  if (isPlaceholder) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          background: fallback.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          ...sx
        }}
      >
        {fallback.icon}
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            fontWeight: 'bold', 
            textTransform: 'uppercase', 
            letterSpacing: 1,
            opacity: 0.8,
            px: 2,
            textAlign: 'center'
          }}
        >
          {name}
        </Typography>
        
        {/* Decorative elements */}
        <Box sx={{ position: 'absolute', bottom: -10, right: -10, width: 60, height: 60, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        <Box sx={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={name}
      onError={() => setError(true)}
      sx={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...sx
      }}
    />
  );
};

export default MenuImage;
