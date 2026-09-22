import js from "@eslint/js";
import ts from "typescript-eslint";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
const costFiles = ["app/pages/cost/**/*.vue", "app/components/cost/**/*.vue"];
const mealFiles = ["app/pages/meals/**/*.vue", "app/components/meals/**/*.vue"];
const files = [
  ...mealFiles,
  "app/composables/useMeal*.ts",
  "app/utils/mealCalculation.ts",
  "app/types/meal.ts",
  "app/constants/meal.ts",
  ...costFiles,
  "app/composables/useCostEstimate.ts",
  "app/utils/costCalculation.ts",
  "app/types/cost.ts",
  "app/constants/cost.ts",
  "app/pages/events/**/*.vue",
  "app/components/events/**/*.vue",
  "app/composables/useEvents.ts",
  "app/composables/useEventOverlap.ts",
  "app/composables/useEventExport.ts",
  "app/utils/event*.ts",
  "app/utils/exportEvents.ts",
  "app/types/event.ts",
  "app/types/eventStaffing.ts",
  "app/composables/useEventStaffing.ts",
];
export default [
  { ignores: ["node_modules/**", ".nuxt/**", ".output/**"] },
  {
    files,
    languageOptions: {
      parser: ts.parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: Object.fromEntries(
        [
          "ref",
          "computed",
          "watch",
          "onMounted",
          "nextTick",
          "definePageMeta",
          "defineProps",
          "defineEmits",
          "useEventCosts",
          "useEvents",
          "useEventOverlap",
          "useEventExport",
          "ElMessage",
          "ElMessageBox",
          "URL",
          "Blob",
          "Uint8Array",
          "document",
          "setTimeout",
        ].map((name) => [name, "readonly"]),
      ),
    },
    plugins: { "@typescript-eslint": ts.plugin },
    rules: {
      ...js.configs.recommended.rules,
      ...ts.configs.recommended.reduce(
        (rules, config) => ({ ...rules, ...config.rules }),
        {},
      ),
      "no-undef": "off",
    },
  },
  ...vue.configs["flat/essential"].map((config) => ({
    ...config,
    files: [
      ...costFiles,
      ...mealFiles,
      "app/pages/events/**/*.vue",
      "app/components/events/**/*.vue",
    ],
  })),
  {
    files: [
      ...costFiles,
      ...mealFiles,
      "app/pages/events/**/*.vue",
      "app/components/events/**/*.vue",
    ],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: ts.parser, extraFileExtensions: [".vue"] },
    },
    rules: { "vue/multi-word-component-names": "off" },
  },
];
