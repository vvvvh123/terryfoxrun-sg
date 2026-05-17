import { FormFieldConfig } from "@/lib/api";

export const defaultFormFields: FormFieldConfig[] = [
  { fieldKey: "payerName", label: "Name", visibility: "required", appliesTo: "payer", displayOrder: 1 },
  { fieldKey: "payerEmail", label: "Email address", visibility: "required", appliesTo: "payer", displayOrder: 2 },
  { fieldKey: "payerIdentityNumber", label: "NRIC / Passport / FIN", visibility: "required", appliesTo: "payer", displayOrder: 3 },
  { fieldKey: "payerAddress", label: "Address in Singapore", visibility: "required", appliesTo: "payer", displayOrder: 4 },
  { fieldKey: "payerBloodType", label: "Blood type", visibility: "required", appliesTo: "payer", displayOrder: 5 },
  { fieldKey: "participantCategory", label: "Event category", visibility: "required", appliesTo: "participant", displayOrder: 6 },
  { fieldKey: "participantPhone", label: "Phone", visibility: "optional", appliesTo: "participant", displayOrder: 7 },
  { fieldKey: "participantEmail", label: "Email", visibility: "optional", appliesTo: "participant", displayOrder: 8 },
  { fieldKey: "tshirtSize", label: "T-shirt size", visibility: "optional", appliesTo: "participant", displayOrder: 9 },
  { fieldKey: "indemnity", label: "Indemnity acknowledgement", visibility: "required", appliesTo: "payer", displayOrder: 10 },
];

export function isFieldRequired(fields: FormFieldConfig[], key: string) {
  const configured = fields.find((field) => field.fieldKey === key);
  return configured ? configured.visibility === "required" : defaultFormFields.some((field) => field.fieldKey === key && field.visibility === "required");
}

export function isFieldVisible(fields: FormFieldConfig[], key: string) {
  const configured = fields.find((field) => field.fieldKey === key);
  return configured ? configured.visibility !== "hidden" : true;
}
