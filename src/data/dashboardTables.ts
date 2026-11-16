import type { CustomerRecord } from "../components/dashboard/CustomerTable";

export interface RecentCustomer extends Record<string, unknown> {
  id: string;
  customer: string;
  plan: string;
  mrr: string;
  status: string;
  signedUp: string;
}

export interface PlanPerformance extends Record<string, unknown> {
  id: string;
  plan: string;
  customers: string;
  mrr: string;
  arr: string;
  growth: string;
  share: string;
}

export interface ChurnedCustomer extends Record<string, unknown> {
  id: string;
  customer: string;
  plan: string;
  mrr: string;
  activeFor: string;
  churnedOn: string;
  reason: string;
}

export interface GrowthByPlan extends Record<string, unknown> {
  id: string;
  plan: string;
  startingCustomers: string;
  newCustomers: string;
  lostCustomers: string;
  endingCustomers: string;
  growth: string;
  growthPercent: string;
}

export const recentCustomers: RecentCustomer[] = [
  { id: "acme-tech", customer: "Acme Tech", plan: "Pro", mrr: "$249", status: "Active", signedUp: "Jun 18, 2024" },
  { id: "nova-systems", customer: "Nova Systems", plan: "Business", mrr: "$499", status: "Active", signedUp: "Jun 16, 2024" },
  { id: "cloudlift", customer: "CloudLift", plan: "Pro", mrr: "$249", status: "Active", signedUp: "Jun 14, 2024" },
  { id: "pioneer-dev", customer: "Pioneer Dev", plan: "Starter", mrr: "$99", status: "Active", signedUp: "Jun 12, 2024" },
];

export const planPerformance: PlanPerformance[] = [
  { id: "pro", plan: "Pro", customers: "1,240", mrr: "$24,600", arr: "$295,200", growth: "+14.2%", share: "51.0%" },
  { id: "starter", plan: "Starter", customers: "820", mrr: "$12,400", arr: "$148,800", growth: "+9.8%", share: "25.7%" },
  { id: "business", plan: "Business", customers: "210", mrr: "$8,400", arr: "$100,800", growth: "+11.9%", share: "17.4%" },
  { id: "enterprise", plan: "Enterprise", customers: "36", mrr: "$2,800", arr: "$33,600", growth: "+7.7%", share: "5.8%" },
];

export const recentlyChurnedCustomers: ChurnedCustomer[] = [
  { id: "brightlayer", customer: "BrightLayer", plan: "Pro", mrr: "$199", activeFor: "11 months", churnedOn: "Jun 18, 2024", reason: "Price" },
  { id: "devx-systems", customer: "DevX Systems", plan: "Business", mrr: "$499", activeFor: "18 months", churnedOn: "Jun 16, 2024", reason: "Not using" },
  { id: "cloudlink", customer: "CloudLink", plan: "Pro", mrr: "$199", activeFor: "7 months", churnedOn: "Jun 14, 2024", reason: "Missing features" },
  { id: "techmove", customer: "TechMove", plan: "Starter", mrr: "$49", activeFor: "5 months", churnedOn: "Jun 12, 2024", reason: "Other" },
];

export const growthByPlan: GrowthByPlan[] = [
  { id: "pro", plan: "Pro", startingCustomers: "1,078", newCustomers: "132", lostCustomers: "34", endingCustomers: "1,176", growth: "+98", growthPercent: "+9.1%" },
  { id: "starter", plan: "Starter", startingCustomers: "692", newCustomers: "86", lostCustomers: "42", endingCustomers: "736", growth: "+44", growthPercent: "+6.4%" },
  { id: "business", plan: "Business", startingCustomers: "348", newCustomers: "42", lostCustomers: "18", endingCustomers: "372", growth: "+24", growthPercent: "+6.9%" },
  { id: "enterprise", plan: "Enterprise", startingCustomers: "70", newCustomers: "16", lostCustomers: "4", endingCustomers: "82", growth: "+12", growthPercent: "+17.1%" },
];

export const customers: CustomerRecord[] = [
  { id: "acme-tech", name: "Acme Tech", email: "billing@acme.tech", plan: "Pro", mrr: 249, status: "Active", signupDate: "Jun 18, 2024" },
  { id: "nova-systems", name: "Nova Systems", email: "hello@novasystems.io", plan: "Business", mrr: 499, status: "Active", signupDate: "Jun 16, 2024" },
  { id: "cloudlift", name: "CloudLift", email: "team@cloudlift.co", plan: "Pro", mrr: 249, status: "Active", signupDate: "Jun 14, 2024" },
  { id: "pioneer-dev", name: "Pioneer Dev", email: "contact@pioneer.dev", plan: "Starter", mrr: 99, status: "Active", signupDate: "Jun 12, 2024" },
  { id: "brightlayer", name: "BrightLayer", email: "hi@brightlayer.co", plan: "Pro", mrr: 199, status: "Active", signupDate: "Jun 10, 2024" },
  { id: "devx-systems", name: "DevX Systems", email: "support@devx.com", plan: "Business", mrr: 499, status: "Past Due", signupDate: "Jun 8, 2024" },
  { id: "techmove", name: "TechMove", email: "hello@techmove.io", plan: "Starter", mrr: 49, status: "Canceled", signupDate: "May 28, 2024" },
  { id: "orbiton", name: "Orbiton", email: "admin@orbiton.ai", plan: "Enterprise", mrr: 999, status: "Active", signupDate: "May 20, 2024" },
  { id: "stackforge", name: "StackForge", email: "billing@stackforge.dev", plan: "Business", mrr: 399, status: "Active", signupDate: "May 15, 2024" },
  { id: "hexlabs", name: "HexLabs", email: "team@hexlabs.io", plan: "Pro", mrr: 199, status: "Active", signupDate: "May 10, 2024" },
  { id: "pulsecrm", name: "PulseCRM", email: "hello@pulsecrm.com", plan: "Starter", mrr: 49, status: "Active", signupDate: "May 5, 2024" },
  { id: "datawave", name: "DataWave", email: "ops@datawave.io", plan: "Enterprise", mrr: 999, status: "Active", signupDate: "Apr 28, 2024" },
  { id: "launchpad-co", name: "Launchpad Co", email: "finance@launchpad.co", plan: "Business", mrr: 499, status: "Past Due", signupDate: "Apr 20, 2024" },
  { id: "skyvault", name: "SkyVault", email: "accounts@skyvault.net", plan: "Pro", mrr: 249, status: "Active", signupDate: "Apr 14, 2024" },
  { id: "finbridge", name: "FinBridge", email: "billing@finbridge.io", plan: "Starter", mrr: 99, status: "Active", signupDate: "Apr 8, 2024" },
  { id: "trustloop", name: "TrustLoop", email: "admin@trustloop.com", plan: "Business", mrr: 399, status: "Active", signupDate: "Mar 30, 2024" },
  { id: "codestream", name: "CodeStream", email: "hello@codestream.dev", plan: "Pro", mrr: 249, status: "Canceled", signupDate: "Mar 22, 2024" },
  { id: "zerohub", name: "ZeroHub", email: "team@zerohub.app", plan: "Starter", mrr: 49, status: "Active", signupDate: "Mar 14, 2024" },
  { id: "meridian-io", name: "Meridian IO", email: "support@meridian.io", plan: "Enterprise", mrr: 999, status: "Active", signupDate: "Mar 5, 2024" },
  { id: "apexflow", name: "ApexFlow", email: "billing@apexflow.co", plan: "Business", mrr: 499, status: "Active", signupDate: "Feb 25, 2024" },
  { id: "nimbustech", name: "NimbusTech", email: "accounts@nimbustech.io", plan: "Pro", mrr: 199, status: "Past Due", signupDate: "Feb 15, 2024" },
  { id: "vortex-ai", name: "Vortex AI", email: "hello@vortex.ai", plan: "Enterprise", mrr: 999, status: "Active", signupDate: "Feb 5, 2024" },
  { id: "glowmetrics", name: "GlowMetrics", email: "finance@glowmetrics.com", plan: "Starter", mrr: 99, status: "Active", signupDate: "Jan 28, 2024" },
  { id: "tideops", name: "TideOps", email: "ops@tideops.io", plan: "Business", mrr: 399, status: "Canceled", signupDate: "Jan 18, 2024" },
  { id: "basecamp-ai", name: "Basecamp AI", email: "billing@basecampai.com", plan: "Pro", mrr: 249, status: "Active", signupDate: "Jan 10, 2024" },
  { id: "cobaltdev", name: "CobaltDev", email: "team@cobaltdev.io", plan: "Starter", mrr: 49, status: "Active", signupDate: "Dec 20, 2023" },
  { id: "stellarops", name: "StellarOps", email: "admin@stellarops.com", plan: "Business", mrr: 499, status: "Active", signupDate: "Dec 10, 2023" },
  { id: "pivotlab", name: "PivotLab", email: "hello@pivotlab.dev", plan: "Pro", mrr: 199, status: "Active", signupDate: "Nov 25, 2023" },
  { id: "terralink", name: "TerraLink", email: "billing@terralink.io", plan: "Starter", mrr: 99, status: "Past Due", signupDate: "Nov 10, 2023" },
  { id: "fusiondata", name: "FusionData", email: "accounts@fusiondata.co", plan: "Enterprise", mrr: 999, status: "Active", signupDate: "Oct 28, 2023" },
];

export const availablePlans = ["Starter", "Pro", "Business", "Enterprise"];
export const availableStatuses = ["Active", "Past Due", "Canceled"];
