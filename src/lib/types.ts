export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export type Tier = "S" | "A" | "B" | "C" | "D" | "?";
