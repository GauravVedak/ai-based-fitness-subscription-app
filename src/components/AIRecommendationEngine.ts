import { useCallback, useMemo } from "react";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  benefits: string[];
  image: string;
  aiRecommended?: boolean;
  bmiCategory?: string[];
};

type Recommendation = {
  product: Product;
  category: "primary" | "secondary";
  rationale: string;
};

const BASE_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Lean Mass Builder",
    category: "weight-gain",
    price: 49.99,
    description: "Premium mass gainer for quality lean gains.",
    benefits: ["40g protein", "Low sugar", "Complex carbs"],
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
    aiRecommended: true,
    bmiCategory: ["Underweight", "Normal Weight"],
  },
  {
    id: "p2",
    name: "Thermo Burn Pro",
    category: "weight-loss",
    price: 34.99,
    description: "Metabolism support with green tea and carnitine.",
    benefits: ["Boosts metabolism", "Appetite control", "Clean energy"],
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=400",
    aiRecommended: true,
    bmiCategory: ["Overweight", "Obese"],
  },
  {
    id: "p3",
    name: "Premium Whey Isolate",
    category: "protein",
    price: 45.99,
    description: "Ultra-pure whey isolate for fast recovery.",
    benefits: ["25g protein", "Fast absorption", "Low carb & fat"],
    image: "https://images.unsplash.com/photo-1680265158261-5fd6ba5d9959?w=400",
    aiRecommended: true,
    bmiCategory: ["Normal Weight", "Underweight"],
  },
  {
    id: "p4",
    name: "Creatine Monohydrate",
    category: "performance",
    price: 29.99,
    description: "Micronized creatine to support strength and power.",
    benefits: ["Increases strength", "Improves performance", "5g per serving"],
    image: "https://images.unsplash.com/photo-1724160167780-1aef4db75030?w=400",
    aiRecommended: true,
  },
  {
    id: "p5",
    name: "BCAA Complex",
    category: "recovery",
    price: 34.99,
    description: "2:1:1 ratio BCAAs for muscle recovery and soreness reduction.",
    benefits: ["Reduces soreness", "Supports recovery", "Hydration blend"],
    image: "https://images.unsplash.com/photo-1657244358898-d9e110504fd8?w=400",
    aiRecommended: true,
  },
  {
    id: "p6",
    name: "Multivitamin Elite",
    category: "wellness",
    price: 24.99,
    description: "Daily essentials for immune and energy support.",
    benefits: ["Immune support", "Daily nutrition", "Energy boost"],
    image: "https://images.unsplash.com/photo-1640958898466-b4dd00872fc8?w=400",
    bmiCategory: ["Normal Weight", "Overweight", "Underweight"],
  },
];

export function useAIRecommendations() {
  const products = useMemo(() => BASE_PRODUCTS, []);

  const getRecommendations = useCallback((): Recommendation[] => {
    const primary = products
      .filter((p) => p.aiRecommended)
      .slice(0, 3)
      .map((product) => ({
        product,
        category: "primary" as const,
        rationale: "High match to your recent goals and activity.",
      }));

    const secondary = products.slice(3, 6).map((product) => ({
      product,
      category: "secondary" as const,
      rationale: "Complements your current plan with balanced support.",
    }));

    return [...primary, ...secondary];
  }, [products]);

  const addProductFeedback = useCallback(
    (_productId: string, _positive: boolean) => {
      // Placeholder: could send analytics/telemetry
    },
    [],
  );

  const getAIInsights = useCallback(() => {
    const recs = getRecommendations();
    return [
      {
        type: "achievement" as const,
        message: "Consistency streak unlocked! You're on track this week.",
        products: recs.slice(0, 2).map((r) => r.product),
      },
      {
        type: "insight" as const,
        message: "Protein intake could be increased on training days.",
        products: recs.filter((r) => r.product.category === "protein").map((r) => r.product),
      },
      {
        type: "warning" as const,
        message: "Hydration levels dipped yesterday. Aim for 3L today.",
        products: recs.filter((r) => r.product.category === "wellness").map((r) => r.product),
      },
    ];
  }, [getRecommendations]);

  return {
    products,
    getRecommendations,
    addProductFeedback,
    getAIInsights,
  };
}
