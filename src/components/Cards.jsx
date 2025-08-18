import React from 'react';
import { Typography, Card, CardContent } from '@mui/material';

const Cards = ({ title, value, icon, bgColor }) => {
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return (
        <Card sx={{ backgroundColor: `${bgColor}`, color: '#fff', mb: 3 }}>
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