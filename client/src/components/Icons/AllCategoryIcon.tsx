import React from "react";

interface Props {
  className?: string;
}

const AllCategoryIcon: React.FC<Props> = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    > <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 3h6m-3 -3v6" /></svg>
  );
};
export default AllCategoryIcon;