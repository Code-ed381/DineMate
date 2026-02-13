import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { formatCurrency } from '../utils/currency';

interface CardsProps {
  title: string;
  value: number;
  icon: string;
  bgColor: string;
}

const Cards: React.FC<CardsProps> = ({ title, value, icon, bgColor }) => {
    const formattedValue = formatCurrency(value);

    return (
        <Card sx={{ backgroundColor: bgColor, color: '#fff', mb: 3 }}>
            <CardContent>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {title} <img src={icon} alt="Icon" width="30" height="30" />
                </Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                    {formattedValue}
                </Typography>
            </CardContent>
        </Card>
    );
}

export default Cards;
