import {
  TrendingUp,
  Users,
  TrendingDown,
  Layers,
  DollarSign,
  RefreshCw,
  Heart,
  UserPlus,
  BarChart2,
} from "lucide-react";
import type { Insight } from "../components/dashboard/InsightsPanel";

export const overviewInsights: Insight[] = [
  {
    id: "mrr-increase",
    title: "MRR increased by 12.5%",
    description: "From $42,800 to $48,200.",
    icon: TrendingUp,
    trend: "positive",
  },
  {
    id: "new-customers",
    title: "You added 178 new customers",
    description: "A growth of 8.4% compared to the previous period.",
    icon: Users,
    trend: "positive",
  },
  {
    id: "churn-decrease",
    title: "Churn rate decreased by 1.3 pp",
    description: "From 5.5% to 4.2%.",
    icon: TrendingDown,
    trend: "negative",
  },
];

export const revenueInsights: Insight[] = [
  {
    id: "revenue-increase",
    title: "Revenue increased by 12.5%",
    description: "MRR grew from $42,800 to $48,200 (+$5,400).",
    icon: TrendingUp,
    trend: "positive",
  },
  {
    id: "pro-plan-mrr",
    title: "Pro plan contributes 51.0% of total MRR",
    description: "$24,600 from 1,240 customers.",
    icon: Layers,
    trend: "neutral",
  },
  {
    id: "avg-revenue",
    title: "Average revenue per customer is $20.90",
    description: "An increase of 3.4% compared to the previous period.",
    icon: DollarSign,
    trend: "positive",
  },
];

export const retentionInsights: Insight[] = [
  {
    id: "churn-decrease",
    title: "Churn rate decreased by 1.3 percentage points",
    description: "From 5.5% to 4.2% in the selected period.",
    icon: TrendingDown,
    trend: "negative",
  },
  {
    id: "starter-churn",
    title: "Starter plan has the highest churn (6.8%)",
    description: "2.9 pp higher than your overall churn rate (4.2%).",
    icon: Layers,
    trend: "negative",
  },
  {
    id: "retention-improved",
    title: "Retention rate improved to 95.8%",
    description: "An increase of 1.3 pp compared to the previous period.",
    icon: Heart,
    trend: "positive",
  },
];

export const growthInsights: Insight[] = [
  {
    id: "customer-base-grew",
    title: "Customer base grew by 8.1%",
    description: "From 2,188 to 2,366 customers (+178).",
    icon: TrendingUp,
    trend: "positive",
  },
  {
    id: "new-customers-acquired",
    title: "276 new customers acquired",
    description: "An increase of 18.5% compared to the previous period.",
    icon: UserPlus,
    trend: "positive",
  },
  {
    id: "enterprise-fastest",
    title: "Enterprise plan grew the fastest",
    description: "+17.1% growth with 12 net new customers.",
    icon: BarChart2,
    trend: "positive",
  },
];

// Re-export the churn rate icon for retention insight that uses a downward arrow
export { RefreshCw };

