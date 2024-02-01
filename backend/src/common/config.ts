import {readFileSync} from "fs";
import {BackendConfig} from "codetierlist-types";

export const config : BackendConfig = JSON.parse(readFileSync('backend_config.json', 'utf-8'));
export const images = config.runners;
export const achievementsConfig = config.achievements;