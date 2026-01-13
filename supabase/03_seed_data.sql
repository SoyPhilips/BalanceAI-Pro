-- SEED DATA FOR FOODS (Global)
insert into public.foods (name, calories, protein, carbs, fat, serving_size) values
('Banana', 105, 1.3, 27, 0.3, '1 medium'),
('Apple', 95, 0.5, 25, 0.3, '1 medium'),
('Chicken Breast (Grilled)', 165, 31, 0, 3.6, '100g'),
('Rice (White, Cooked)', 130, 2.7, 28, 0.3, '100g'),
('Egg (Boiled)', 78, 6, 0.6, 5, '1 large'),
('Oats (Rolled)', 150, 5, 27, 3, '40g'),
('Almonds', 164, 6, 6, 14, '1 oz (28g)'),
('Greek Yogurt (Plain)', 100, 17, 6, 0.7, '170g'),
('Salmon (Cooked)', 208, 20, 0, 13, '100g'),
('Avocado', 160, 2, 8.5, 14.7, '100g');

-- SEED DATA FOR RECIPES (Suggestions)
insert into public.recipes (name, description, category, calories, protein, carbs, fat, ingredients, instructions, image_url) values
(
  'Avocado Toast with Egg',
  'A classic, healthy breakfast packed with protein and healthy fats.',
  'breakfast',
  350,
  18,
  25,
  20,
  '["2 slices whole grain bread", "1 ripe avocado", "2 eggs", "Salt and pepper", "Red pepper flakes"]',
  '1. Toast the bread. 2. Mash the avocado and spread on toast. 3. Fry or poach the eggs. 4. Top toast with eggs and seasoning.',
  'https://images.unsplash.com/photo-1588137372308-15f75323ca8d?auto=format&fit=crop&w=800&q=80'
),
(
  'Grilled Chicken Salad',
  'Light and refreshing lunch with lean protein.',
  'lunch',
  400,
  45,
  12,
  18,
  '["150g Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil dressing"]',
  '1. Grill chicken breast until cooked. 2. Chop vegetables. 3. Toss greens and veggies with dressing. 4. Slice chicken and place on top.',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
),
(
  'Salmon with Asparagus',
  'Nutrient-dense dinner rich in Omega-3s.',
  'dinner',
  500,
  45,
  10,
  30,
  '["1 Salmon fillet", "1 bunch Asparagus", "Lemon", "Garlic", "Butter"]',
  '1. Season salmon with lemon and garlic. 2. Pan sear salmon in butter. 3. Sauté asparagus until tender. 4. Serve hot.',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'
),
(
  'Greek Yogurt Parfait',
  'Perfect high-protein snack or dessert.',
  'snack',
  250,
  20,
  30,
  5,
  '["1 cup Greek yogurt", "1/2 cup Berries", "1 tbsp Honey", "1/4 cup Granola"]',
  '1. Layer yogurt, berries, and granola in a glass. 2. Drizzle with honey.',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80'
);
