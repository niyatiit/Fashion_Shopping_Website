import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => (
  <Link to={`/products?category=${category._id}`} className="group block text-center">
    <div className="aspect-square bg-sand overflow-hidden mb-3 rounded-full">
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink/40 font-display text-3xl">
          {category.name?.[0]}
        </div>
      )}
    </div>
    <p className="text-sm text-ink group-hover:text-crimson transition-colors">{category.name}</p>
  </Link>
);

export default CategoryCard;