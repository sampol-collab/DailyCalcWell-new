export type CalculatorCategoryId = "everyday" | "health";

export interface CalculatorMeta {
  slug: string;
  name: string;
  shortName: string;
  category: CalculatorCategoryId;
  categoryName: string;
  categoryPath: string;
  seoTitle: string;
  seoDescription: string;
  shortDescription: string;
  primaryKeyword: string;
  keywords: string[];
  popular?: boolean;
  recentlyAdded?: boolean;
  relatedSlugs: string[];
  lastReviewed: string;
}

export const SITE_NAME = "DailyCalcWell";
export const SITE_TAGLINE =
  "Free Online Everyday & Health Calculators Worldwide";
export const LAST_EDITORIAL_REVIEW = "2026-11-24";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    "https://dailycalcwell.com";
  return raw.replace(/\/+$/, "");
}

export const CATEGORIES: Record<
  CalculatorCategoryId,
  {
    id: CalculatorCategoryId;
    name: string;
    path: string;
    seoTitle: string;
    seoDescription: string;
    intro: string;
  }
> = {
  everyday: {
    id: "everyday",
    name: "Everyday Calculators",
    path: "/everyday/",
    seoTitle: "Everyday Calculators – Percentages, Dates, Age & Units",
    seoDescription:
      "Browse free online everyday calculators for percentages, averages, exact age, dates, discounts, profit and loss, ratios, fractions, time and unit conversions.",
    intro:
      "Practical tools for daily math, shopping discounts in 150+ world currencies, business margins, calendar planning, time tracking, and metric-to-imperial conversions.",
  },
  health: {
    id: "health",
    name: "Health Calculators",
    path: "/health/",
    seoTitle: "Health Calculators – BMI, BMR, Calories & Pregnancy Tools",
    seoDescription:
      "Use free online health calculators for BMI, BMR, TDEE, daily calories, ideal weight, body fat, protein, hydration, pregnancy dates and ovulation estimates.",
    intro:
      "Evidence-referenced wellness and pregnancy estimation tools supporting both metric (kg, cm) and imperial (lb, ft/in) measurements with clear assumptions.",
  },
};

export const CALCULATORS: CalculatorMeta[] = [
  // Everyday Calculators (12)
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortName: "Percentage",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Percentage Calculator – Increase, Decrease & Change",
    seoDescription:
      "Calculate what percent of a number, percentage increase, percentage decrease, percentage difference and percentage change with clear formulas.",
    shortDescription:
      "Find X% of Y, percentage increase, decrease, difference and percentage change.",
    primaryKeyword: "percentage calculator",
    keywords: [
      "percentage calculator",
      "what is x percent of y calculator",
      "percentage increase calculator",
      "percentage decrease calculator",
      "percentage difference between two numbers",
      "percentage change calculator",
    ],
    popular: true,
    relatedSlugs: [
      "discount-calculator",
      "profit-loss-calculator",
      "average-calculator",
      "ratio-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "average-calculator",
    name: "Average Calculator",
    shortName: "Average",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Average Calculator – Mean, Median & Weighted Average",
    seoDescription:
      "Calculate arithmetic mean, median and weighted average for any list of numbers, decimals or course grades with step-by-step explanations online.",
    shortDescription:
      "Compute arithmetic mean, median, grade average and weighted average.",
    primaryKeyword: "average calculator",
    keywords: [
      "average calculator",
      "weighted average calculator with steps",
      "arithmetic mean and median calculator",
      "grade average calculator",
      "calculate average of numbers",
      "mean and median calculator",
    ],
    popular: true,
    relatedSlugs: [
      "percentage-calculator",
      "ratio-calculator",
      "fraction-calculator",
      "profit-loss-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    shortName: "Age",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Age Calculator – Chronological Age in Years, Months & Days",
    seoDescription:
      "Find your exact chronological age from your date of birth: calculate years, months, days, total days lived and days until your next birthday.",
    shortDescription:
      "Calculate exact chronological age in years, months, days and days lived.",
    primaryKeyword: "chronological age calculator",
    keywords: [
      "age calculator",
      "chronological age calculator",
      "exact age in years months and days",
      "calculate age from date of birth",
      "age in days calculator",
      "days until my next birthday calculator",
    ],
    popular: true,
    relatedSlugs: [
      "date-calculator",
      "days-between-dates-calculator",
      "time-calculator",
      "time-duration-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "date-calculator",
    name: "Date Calculator",
    shortName: "Date",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Date Calculator – Add or Subtract Days, Weeks & Years",
    seoDescription:
      "Add or subtract days, weeks, months and years from any calendar date—check 60 or 90 days from today with exact leap-year and month-end math.",
    shortDescription:
      "Add or subtract days, weeks, months and years from any date accurately.",
    primaryKeyword: "date calculator",
    keywords: [
      "date calculator",
      "add days to a date calculator",
      "90 days from today calculator",
      "subtract days from date calculator",
      "add months and years to date",
      "what date will it be in 60 days",
    ],
    relatedSlugs: [
      "days-between-dates-calculator",
      "age-calculator",
      "time-calculator",
      "pregnancy-due-date-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "days-between-dates-calculator",
    name: "Days Between Dates Calculator",
    shortName: "Days Between Dates",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Days Between Dates Calculator – Day & Week Counter",
    seoDescription:
      "Count how many days and weeks are between two dates. Include or exclude the end date for contracts, travel timelines and event deadline planning.",
    shortDescription:
      "Count how many days and weeks between two dates with optional end date.",
    primaryKeyword: "days between dates calculator",
    keywords: [
      "days between dates calculator",
      "how many days between two dates",
      "day counter between dates",
      "weeks between two dates calculator",
      "include end date day counter",
      "date duration in days and weeks",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "date-calculator",
      "age-calculator",
      "time-duration-calculator",
      "pregnancy-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    shortName: "Discount",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Discount Calculator – Percent Off & Sale Price",
    seoDescription:
      "Calculate percent off sale prices, discount amounts and total savings in 156 world currencies (USD, EUR, INR, GBP, JPY, BRL and more) online.",
    shortDescription:
      "Compute percent off savings and final sale price in 156 world currencies.",
    primaryKeyword: "discount calculator",
    keywords: [
      "discount calculator",
      "percent off sale price calculator",
      "how much do i save discount calculator",
      "calculate discount percentage from original price",
      "final price after discount calculator",
      "multi currency discount calculator",
    ],
    popular: true,
    relatedSlugs: [
      "percentage-calculator",
      "profit-loss-calculator",
      "average-calculator",
      "ratio-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "profit-loss-calculator",
    name: "Profit and Loss Calculator",
    shortName: "Profit & Loss",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Profit and Loss Calculator – Gross Margin & Markup",
    seoDescription:
      "Calculate profit or loss, profit percentage, gross margin and markup from cost and selling price across 156 world currencies with clear examples.",
    shortDescription:
      "Calculate profit percentage, gross margin and markup in 156 currencies.",
    primaryKeyword: "profit and loss calculator",
    keywords: [
      "profit and loss calculator",
      "gross profit margin and markup calculator",
      "calculate profit percentage from cost and selling price",
      "markup vs margin calculator",
      "loss percentage calculator",
      "selling price and profit calculator",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "discount-calculator",
      "percentage-calculator",
      "average-calculator",
      "ratio-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "ratio-calculator",
    name: "Ratio Calculator",
    shortName: "Ratio",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Ratio Calculator – Simplify, Compare & Solve Proportions",
    seoDescription:
      "Simplify 2-part or 3-part ratios to lowest terms, compare two ratios side by side, or solve a missing proportion value with step-by-step math.",
    shortDescription:
      "Simplify 2- or 3-part ratios, compare ratios and solve proportions.",
    primaryKeyword: "ratio calculator",
    keywords: [
      "ratio calculator",
      "simplify ratio calculator with steps",
      "solve missing value in ratio",
      "3 part ratio simplifier",
      "compare two ratios calculator",
      "proportion calculator step by step",
    ],
    relatedSlugs: [
      "fraction-calculator",
      "percentage-calculator",
      "average-calculator",
      "unit-converter",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "fraction-calculator",
    name: "Fraction Calculator",
    shortName: "Fraction",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Fraction Calculator – Add, Subtract, Simplify & Mixed",
    seoDescription:
      "Add, subtract, multiply and divide fractions online. Automatically simplify fractions to lowest terms with mixed numbers and decimal values.",
    shortDescription:
      "Add, subtract, multiply, divide and simplify fractions with mixed numbers.",
    primaryKeyword: "fraction calculator",
    keywords: [
      "fraction calculator",
      "add subtract multiply divide fractions calculator",
      "simplify fractions to lowest terms",
      "mixed number calculator",
      "fraction to decimal calculator",
      "fraction math with steps",
    ],
    relatedSlugs: [
      "ratio-calculator",
      "percentage-calculator",
      "average-calculator",
      "unit-converter",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "time-calculator",
    name: "Time Calculator",
    shortName: "Time",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Time Calculator – Add & Subtract Hours and Minutes",
    seoDescription:
      "Add or subtract hours and minutes accurately in base-60 for timesheets, project billing, schedules and travel with total minutes and day totals.",
    shortDescription:
      "Add and subtract hours and minutes for timesheets and schedules.",
    primaryKeyword: "time calculator",
    keywords: [
      "time calculator",
      "add hours and minutes calculator",
      "subtract hours and minutes calculator",
      "hours and minutes to total minutes",
      "timesheet hours adder",
      "base 60 time addition calculator",
    ],
    relatedSlugs: [
      "time-duration-calculator",
      "date-calculator",
      "days-between-dates-calculator",
      "age-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "time-duration-calculator",
    name: "Time Duration Calculator",
    shortName: "Time Duration",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Time Duration Calculator – Hours Between Two Times",
    seoDescription:
      "Calculate exact elapsed hours and minutes between two times, including overnight shifts crossing midnight, 12/24-hour clocks and decimal hours.",
    shortDescription:
      "Measure hours between two times, overnight shifts and decimal hours.",
    primaryKeyword: "time duration calculator",
    keywords: [
      "time duration calculator",
      "hours between two times calculator",
      "time duration calculator overnight shift",
      "elapsed time in decimal hours",
      "work shift hours calculator",
      "12 hour to 24 hour duration calculator",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "time-calculator",
      "days-between-dates-calculator",
      "date-calculator",
      "age-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    shortName: "Unit Converter",
    category: "everyday",
    categoryName: "Everyday Calculators",
    categoryPath: "/everyday/",
    seoTitle: "Unit Converter – Metric & Imperial (kg to lbs, cm to ft)",
    seoDescription:
      "Convert cm to feet, kg to lbs, Celsius to Fahrenheit, length, weight, volume, speed and area between metric and imperial units with formulas.",
    shortDescription:
      "Convert cm to feet, kg to lbs, Celsius to Fahrenheit, volume and area.",
    primaryKeyword: "unit converter",
    keywords: [
      "unit converter",
      "cm to feet and inches converter",
      "kg to lbs weight converter",
      "celsius to fahrenheit converter",
      "metric to imperial unit converter",
      "square meters to square feet converter",
    ],
    popular: true,
    relatedSlugs: [
      "bmi-calculator",
      "water-intake-calculator",
      "ratio-calculator",
      "fraction-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },

  // Health Calculators (12)
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    shortName: "BMI",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "BMI Calculator – Body Mass Index (kg/cm & lb/ft/in)",
    seoDescription:
      "Calculate adult BMI using kg/cm or pounds, feet and inches. View WHO Body Mass Index categories, healthy weight range and key screening limits.",
    shortDescription:
      "Check adult BMI in kg/cm or lb/ft/in with healthy weight range chart.",
    primaryKeyword: "bmi calculator",
    keywords: [
      "bmi calculator",
      "body mass index calculator",
      "bmi calculator kg and cm",
      "bmi calculator pounds feet and inches",
      "adult bmi range chart calculator",
      "healthy weight range for height bmi",
    ],
    popular: true,
    relatedSlugs: [
      "bmr-calculator",
      "tdee-calculator",
      "ideal-weight-calculator",
      "calorie-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "bmr-calculator",
    name: "BMR Calculator",
    shortName: "BMR",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "BMR Calculator – Basal Metabolic Rate (Mifflin-St Jeor)",
    seoDescription:
      "Estimate your Basal Metabolic Rate and resting calories burned per day using the Mifflin-St Jeor equation in metric (kg/cm) or imperial units.",
    shortDescription:
      "Estimate resting calories burned per day using the Mifflin-St Jeor formula.",
    primaryKeyword: "bmr calculator",
    keywords: [
      "bmr calculator",
      "mifflin st jeor bmr calculator",
      "basal metabolic rate calculator",
      "resting calories burned per day calculator",
      "bmr calculator kg cm",
      "daily resting energy calculator",
    ],
    relatedSlugs: [
      "tdee-calculator",
      "calorie-calculator",
      "bmi-calculator",
      "protein-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "tdee-calculator",
    name: "TDEE Calculator",
    shortName: "TDEE",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "TDEE Calculator – Maintenance Calories & Daily Burn",
    seoDescription:
      "Calculate your Total Daily Energy Expenditure (TDEE) and daily maintenance calories by activity level using the Mifflin-St Jeor formula online.",
    shortDescription:
      "Estimate TDEE and maintenance calories burned by weekly activity level.",
    primaryKeyword: "tdee calculator",
    keywords: [
      "tdee calculator",
      "tdee maintenance calories calculator",
      "total daily energy expenditure calculator",
      "tdee calculator mifflin st jeor",
      "how many calories do i burn a day calculator",
      "sedentary vs active tdee calculator",
    ],
    popular: true,
    relatedSlugs: [
      "bmr-calculator",
      "calorie-calculator",
      "bmi-calculator",
      "protein-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "calorie-calculator",
    name: "Calorie Calculator",
    shortName: "Calorie",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Calorie Calculator – Calorie Deficit & Daily Intake",
    seoDescription:
      "Estimate daily calories for a safe calorie deficit to lose weight, maintain weight or gain weight using Mifflin-St Jeor and activity levels.",
    shortDescription:
      "Calculate a safe calorie deficit, maintenance or weight-gain target.",
    primaryKeyword: "calorie deficit calculator",
    keywords: [
      "calorie calculator",
      "calorie deficit calculator to lose weight",
      "daily calories to maintain weight",
      "safe minimum calorie intake calculator",
      "calories to gain weight calculator",
      "mifflin st jeor calorie estimator",
    ],
    popular: true,
    relatedSlugs: [
      "tdee-calculator",
      "bmr-calculator",
      "protein-calculator",
      "bmi-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    shortName: "Ideal Weight",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Ideal Weight Calculator – Healthy Weight by Height",
    seoDescription:
      "Compare ideal body weight by height and sex with Devine, Robinson, Miller and Hamwi formulas plus healthy BMI weight ranges in kg and pounds.",
    shortDescription:
      "Compare Devine, Robinson, Miller & Hamwi ideal body weight by height.",
    primaryKeyword: "ideal weight calculator",
    keywords: [
      "ideal weight calculator",
      "devine formula ideal weight calculator",
      "robinson miller hamwi ideal weight",
      "ideal body weight by height and sex",
      "healthy weight range for my height",
      "ideal weight in kg and lbs",
    ],
    relatedSlugs: [
      "bmi-calculator",
      "body-fat-calculator",
      "bmr-calculator",
      "calorie-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "body-fat-calculator",
    name: "Body Fat Calculator",
    shortName: "Body Fat",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Body Fat Calculator – U.S. Navy Body Fat & Lean Mass",
    seoDescription:
      "Estimate body fat percentage, fat mass and lean body mass using the U.S. Navy circumference formula with neck, waist, hip and height inputs.",
    shortDescription:
      "Estimate U.S. Navy body fat %, fat mass and lean body mass in cm or in.",
    primaryKeyword: "us navy body fat calculator",
    keywords: [
      "body fat calculator",
      "us navy body fat calculator",
      "body fat percentage calculator neck waist hip",
      "navy circumference body fat formula",
      "lean body mass and fat mass calculator",
      "body fat calculator in cm and inches",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "bmi-calculator",
      "ideal-weight-calculator",
      "protein-calculator",
      "tdee-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "protein-calculator",
    name: "Protein Calculator",
    shortName: "Protein",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Protein Calculator – Daily Grams per kg & Activity Goal",
    seoDescription:
      "Estimate how many grams of protein you need per day based on body weight (kg or lb) and fitness goal with evidence-based per-kg multipliers.",
    shortDescription:
      "Calculate daily grams of protein per kg or lb by fitness goal.",
    primaryKeyword: "protein calculator",
    keywords: [
      "protein calculator",
      "daily protein intake calculator in grams",
      "grams of protein per kg of body weight",
      "how much protein do i need per day",
      "protein calculator for muscle gain",
      "protein intake by activity level",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "calorie-calculator",
      "tdee-calculator",
      "water-intake-calculator",
      "body-fat-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "water-intake-calculator",
    name: "Water Intake Calculator",
    shortName: "Water Intake",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Water Intake Calculator – Daily Hydration by Weight",
    seoDescription:
      "Calculate how much water to drink per day in liters, milliliters, ounces and cups based on body weight, daily exercise duration and climate.",
    shortDescription:
      "Find daily water intake in liters, oz and cups by weight and climate.",
    primaryKeyword: "water intake calculator",
    keywords: [
      "water intake calculator",
      "daily water intake calculator by weight",
      "how many liters of water should i drink a day",
      "hydration calculator exercise and climate",
      "water intake in ounces and cups",
      "daily fluid needs calculator",
    ],
    relatedSlugs: [
      "protein-calculator",
      "calorie-calculator",
      "tdee-calculator",
      "unit-converter",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "pregnancy-weeks-to-months",
    name: "Pregnancy Weeks to Months Calculator",
    shortName: "Pregnancy Weeks to Months",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Pregnancy Weeks to Months Calculator & Trimester Chart",
    seoDescription:
      "Convert pregnancy weeks and days into months and trimester, see a week-by-month chart, and learn why clinical dating counts weeks over months.",
    shortDescription:
      "Convert pregnancy weeks to months and trimester with a clinical chart.",
    primaryKeyword: "pregnancy weeks to months calculator",
    keywords: [
      "pregnancy weeks to months",
      "pregnancy weeks to months calculator",
      "how many months pregnant am i in weeks",
      "pregnancy weeks months trimester chart",
      "20 weeks pregnant in months",
      "why doctors count pregnancy in weeks",
    ],
    relatedSlugs: [
      "pregnancy-calculator",
      "pregnancy-due-date-calculator",
      "ovulation-calculator",
      "date-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "pregnancy-due-date-calculator",
    name: "Pregnancy Due Date Calculator",
    shortName: "Pregnancy Due Date",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Pregnancy Due Date Calculator – Estimated EDD from LMP",
    seoDescription:
      "Calculate your estimated due date (EDD), current pregnancy week and trimester from your last menstrual period (LMP) and cycle length online.",
    shortDescription:
      "Estimate due date (EDD), gestational week and trimester by LMP.",
    primaryKeyword: "pregnancy due date calculator by lmp",
    keywords: [
      "pregnancy due date calculator",
      "pregnancy due date calculator by lmp",
      "280 day estimated due date calculator",
      "due date calculator by cycle length",
      "when is my baby due lmp calculator",
      "edd pregnancy calculator",
    ],
    popular: true,
    relatedSlugs: [
      "pregnancy-calculator",
      "pregnancy-weeks-to-months",
      "ovulation-calculator",
      "days-between-dates-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "pregnancy-calculator",
    name: "Pregnancy Calculator",
    shortName: "Pregnancy",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Pregnancy Calculator – How Many Weeks Pregnant & Progress",
    seoDescription:
      "Check how many weeks and days pregnant you are today, plus gestational age, current trimester, progress percentage and due date from LMP or EDD.",
    shortDescription:
      "Find how many weeks pregnant you are today, progress % and due date.",
    primaryKeyword: "how many weeks pregnant am i calculator",
    keywords: [
      "pregnancy calculator",
      "how many weeks pregnant am i calculator",
      "gestational age calculator from lmp or due date",
      "pregnancy progress percentage calculator",
      "current week and trimester calculator",
      "weeks and days pregnant today",
    ],
    relatedSlugs: [
      "pregnancy-due-date-calculator",
      "pregnancy-weeks-to-months",
      "ovulation-calculator",
      "days-between-dates-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
  {
    slug: "ovulation-calculator",
    name: "Ovulation Calculator",
    shortName: "Ovulation",
    category: "health",
    categoryName: "Health Calculators",
    categoryPath: "/health/",
    seoTitle: "Ovulation Calculator – Fertile Window & Next Period",
    seoDescription:
      "Estimate your likely ovulation date, most fertile days window and next period start from your last menstrual period, cycle and luteal length.",
    shortDescription:
      "Estimate ovulation date, most fertile days window and next period.",
    primaryKeyword: "ovulation and fertile window calculator",
    keywords: [
      "ovulation calculator",
      "ovulation and fertile window calculator",
      "next period and ovulation date estimator",
      "most fertile days calculator by cycle length",
      "when do i ovulate calculator",
      "luteal phase ovulation calculator",
    ],
    recentlyAdded: true,
    relatedSlugs: [
      "pregnancy-due-date-calculator",
      "pregnancy-calculator",
      "pregnancy-weeks-to-months",
      "date-calculator",
    ],
    lastReviewed: LAST_EDITORIAL_REVIEW,
  },
];

export function getCalculatorBySlug(slug: string): CalculatorMeta {
  const found = CALCULATORS.find((c) => c.slug === slug);
  if (!found) {
    throw new Error(`Unknown calculator slug: ${slug}`);
  }
  return found;
}

export function getCalculatorsByCategory(
  category: CalculatorCategoryId
): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.category === category);
}

export function getPopularCalculators(): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.popular);
}

export function getRecentlyAddedCalculators(): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.recentlyAdded);
}
