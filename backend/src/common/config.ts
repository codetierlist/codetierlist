import { BackendConfig, LimitsConfig } from "codetierlist-types";
import { readFileSync } from "fs";

export const config : BackendConfig = JSON.parse(readFileSync('config_backend.json', 'utf-8'));
export const limits : LimitsConfig = JSON.parse(readFileSync('config_limits.json', 'utf-8'));
export const images = config.runners;
export const achievementsConfig = config.achievements;
