import { ChangeEvent, FormEvent } from "react";
import { ScamType } from "@/types/scam";

export interface MapFormData {
  type: ScamType;
  description: string;
  evidence: string;
  reporterEmail: string;
}

export type HandleChange = (e: ChangeEvent<HTMLInputElement>) => void;
export type HandleSubmit = (e: FormEvent<HTMLFormElement>) => void;
export type HandleSelectChange = (value: string) => void; 