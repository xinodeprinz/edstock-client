import { Star } from "lucide-react";
import React from "react";

type RatingProps = {
  rating: number;
  onRatingChange: (rate: number) => void;
  editable: boolean;
};

const Rating = ({ rating, onRatingChange, editable }: RatingProps) => {
  return [1, 2, 3, 4, 5].map((index) => (
    <Star
      key={index}
      color={index <= rating ? "#FFC107" : "#E4E5E9"}
      className="w-4 h-4"
      onClick={() => onRatingChange(index)}
    />
  ));
};

export default Rating;
