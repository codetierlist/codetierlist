import { BackendConfig } from "codetierlist-types";
import { readFileSync } from "fs";

export const config : BackendConfig = JSON.parse(readFileSync('backend_config.json', 'utf-8'));
export const images = config.runners;
export const achievementsConfig = config.achievements;
