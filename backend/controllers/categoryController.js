import Category from "../models/Category.js";

// @desc Create a new category (Admin only)
// @route POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, slug, image, parentCategory } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: "Category with this slug already exists" });
    }

    const category = await Category.create({
      name,
      slug,
      image,
      parentCategory: parentCategory || null,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all categories (as nested tree)
// @route GET /api/categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).lean();

    // Build nested tree: top-level categories with their children attached
    const buildTree = (parentId = null) =>
      categories
        .filter((cat) => String(cat.parentCategory) === String(parentId))
        .map((cat) => ({ ...cat, children: buildTree(cat._id) }));

    const tree = buildTree(null);

    res.json(tree);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single category by slug
// @route GET /api/categories/:slug
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update category (Admin only)
// @route PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const { name, slug, image, parentCategory } = req.body;

    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.image = image || category.image;
    category.parentCategory = parentCategory !== undefined ? parentCategory : category.parentCategory;

    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete category (Admin only)
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prevent deleting a category that still has subcategories
    const hasChildren = await Category.findOne({ parentCategory: category._id });
    if (hasChildren) {
      return res.status(400).json({ message: "Cannot delete category with subcategories. Delete subcategories first." });
    }

    await category.deleteOne();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};