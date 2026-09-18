import { Link } from "react-router-dom";

// Curated high quality fashion images for common and dynamically added categories
const CATEGORY_IMAGES = {
  kids: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=600&auto=format&fit=crop&q=80",
  boy: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80",
  girl: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80",
  men: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80",
  women: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
  ethnic: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
  shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
  accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  bag: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80",
};

export const getCategoryImageUrl = (cat) => {
  if (cat?.image && typeof cat.image === "string" && cat.image.trim() !== "") {
    return cat.image;
  }
  const text = `${cat?.name || ""} ${cat?.slug || ""}`.toLowerCase();
  if (text.includes("kid") || text.includes("child") || text.includes("baby") || text.includes("infant")) {
    return CATEGORY_IMAGES.kids;
  }
  if (text.includes("boy")) {
    return CATEGORY_IMAGES.boy;
  }
  if (text.includes("girl")) {
    return CATEGORY_IMAGES.girl;
  }
  if (text.includes("women") || text.includes("woman") || text.includes("female") || text.includes("lady") || text.includes("dress")) {
    return CATEGORY_IMAGES.women;
  }
  if (text.includes("men") || text.includes("man") || text.includes("male") || text.includes("gent")) {
    return CATEGORY_IMAGES.men;
  }
  if (text.includes("ethnic") || text.includes("saree") || text.includes("kurta") || text.includes("traditional")) {
    return CATEGORY_IMAGES.ethnic;
  }
  if (text.includes("shoe") || text.includes("footwear") || text.includes("sneaker")) {
    return CATEGORY_IMAGES.shoes;
  }
  if (text.includes("accessori") || text.includes("watch") || text.includes("belt")) {
    return CATEGORY_IMAGES.accessories;
  }
  if (text.includes("bag")) {
    return CATEGORY_IMAGES.bag;
  }
  return CATEGORY_IMAGES.default;
};

const CategoryCard = ({ category }) => {
  const imageUrl = getCategoryImageUrl(category);

  return (
    <Link to={`/products?category=${category._id}`} className="group block text-center">
      <div className="aspect-square bg-sand overflow-hidden mb-3 rounded-full border border-sand shadow-sm group-hover:shadow-md transition-shadow">
        <img
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = CATEGORY_IMAGES.default;
          }}
        />
      </div>
      <p className="text-sm font-medium text-ink group-hover:text-crimson transition-colors">{category.name}</p>
    </Link>
  );
};

export default CategoryCard;