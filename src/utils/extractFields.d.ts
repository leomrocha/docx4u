import { Dilimiters } from "easy-template-x";

export async function extractFields(
  delimiters: Partial<Dilimiters>,
  fileContent: Binary
): Promise<string[]>;
