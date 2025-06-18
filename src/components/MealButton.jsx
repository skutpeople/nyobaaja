// src/components/MealButton.jsx
import React from 'react';
import './MealButton.css';

export default function MealButton({ mealType, onClick }) {
  // Atur ikon dan teks sesuai mealType
  const iconMap = {
    breakfast: 'free_breakfast',
    lunch: 'lunch_dining',
    dinner: 'dinner_dining',
    snacks: 'fastfood',
  };
  const labelMap = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
  };

  return (
    <div className="meal-button" onClick={() => onClick(mealType)}>
      <div className="meal-left">
        <span className="material-icons meal-icon">{iconMap[mealType]}</span>
        <span>{labelMap[mealType]}</span>
      </div>
      <span className="material-icons add-icon">add</span>
    </div>
  );
}
