import { defaultCategories } from "./defaultCategories";
import type { CategoryDefinition, ResearchMode } from "../types";

export interface CategoryStore {
  list(mode?: ResearchMode): Promise<CategoryDefinition[]>;
  get(id: string): Promise<CategoryDefinition | undefined>;
  save(category: CategoryDefinition): Promise<CategoryDefinition>;
}

export class InMemoryCategoryStore implements CategoryStore {
  private categories = new Map(defaultCategories.map((category) => [category.id, category]));

  async list(mode?: ResearchMode) {
    const categories = [...this.categories.values()].filter((category) => category.isActive);
    return mode ? categories.filter((category) => category.mode === mode) : categories;
  }

  async get(id: string) {
    return this.categories.get(id);
  }

  async save(category: CategoryDefinition) {
    this.categories.set(category.id, category);
    return category;
  }
}
