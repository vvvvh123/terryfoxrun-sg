"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export type EventDto = {
  id: number;
  name: string;
  year: number;
  isCurrent: boolean;
  status: string;
  registrationOpen?: string;
  registrationClose?: string;
  eventStart?: string;
  eventEnd?: string;
  pickupStart?: string;
  pickupEnd?: string;
  locationEvent?: string;
  locationPickup?: string;
  donationPresets?: number[];
  shirtPrice?: number;
  shirtSizes?: ShirtInventoryItem[];
};

export type CategoryDto = {
  id: number;
  eventId: number;
  name: string;
  description?: string;
  basePrice?: number;
  isActive: boolean;
};

export type SlideshowImage = {
  id?: number;
  imageUrl: string;
  blurb: string;
  displayOrder: number;
  active: boolean;
};

export type FormFieldConfig = {
  id?: number;
  fieldKey: string;
  label: string;
  visibility: "required" | "optional" | "hidden" | string;
  appliesTo: "payer" | "participant" | "corporate" | string;
  displayOrder: number;
};

export type ShirtInventoryItem = {
  type: string;
  size: string;
  quantityAvailable: number;
};

export type ParticipantInput = {
  categoryId: number;
  name: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dob: string;
  gender: string;
  address: string;
  nricLast4: string;
  medicalNotes?: string;
  tshirtSize?: string;
  tshirtType?: string;
  tshirtQty?: number;
};

export type RegistrationCreateRequest = {
  eventId: number;
  payerName: string;
  payerEmail: string;
  payerIdentityNumber: string;
  payerAddress: string;
  payerBloodType: string;
  participants: ParticipantInput[];
  donationAmount: number;
  extraShirts: { size: string; type: string; quantity: number }[];
  indemnityAccepted: boolean;
  successUrl?: string;
  cancelUrl?: string;
};

export type RegistrationCreateResponse = {
  registrationId: number;
  generatedPaymentReference: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
};

export type PaymentAttempt = {
  id: number;
  registrationId: number;
  method: "PAYNOW" | "BANK_TRANSFER";
  generatedReference: string;
  userTransactionId: string;
  adminTransactionId?: string;
  verificationStatus: string;
  submittedAt?: string;
  verifiedAt?: string;
};

export type RegistrationDetail = {
  id: number;
  eventId: number;
  eventName: string;
  payerName: string;
  payerEmail: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  generatedPaymentReference: string;
  createdAt?: string;
  participants: {
    id: number;
    categoryId?: number;
    categoryName?: string;
    name: string;
    email?: string;
    tshirtSize?: string;
    tshirtType?: string;
    tshirtQty?: number;
    pickupCode?: string;
    pickupStatus?: string;
  }[];
  paymentAttempts: PaymentAttempt[];
};

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function getCurrentEvent() {
  return api<EventDto>("/api/events/current");
}

export function getEvent(id: number) {
  return api<EventDto>(`/api/events/${id}`);
}

export function getCategories(eventId: number) {
  return api<CategoryDto[]>(`/api/events/${eventId}/categories`);
}

export function getSlideshow(eventId: number) {
  return api<SlideshowImage[]>(`/api/events/${eventId}/slideshow`);
}

export function saveSlideshow(eventId: number, images: SlideshowImage[]) {
  return api<SlideshowImage[]>(`/api/events/${eventId}/slideshow`, {
    method: "PUT",
    body: JSON.stringify(images),
  });
}

export function getFormFields(eventId: number) {
  return api<FormFieldConfig[]>(`/api/events/${eventId}/form-fields`);
}

export function createRegistration(request: RegistrationCreateRequest) {
  return api<RegistrationCreateResponse>("/api/registrations", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function submitPayment(
  registrationId: number,
  request: { method: "PAYNOW" | "BANK_TRANSFER"; userTransactionId: string; proofFileUrl?: string },
) {
  return api<PaymentAttempt>(`/api/registrations/${registrationId}/payment-attempts`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getRegistration(id: number) {
  return api<RegistrationDetail>(`/api/registrations/${id}`);
}

export function getMyRegistrations() {
  return api<RegistrationDetail[]>("/api/registrations/me");
}

export function getPendingPayments() {
  return api<PaymentAttempt[]>("/api/admin/payment-attempts?status=PENDING_ADMIN_VERIFICATION");
}

export function confirmPayment(paymentAttemptId: number, adminTransactionId: string) {
  return api<PaymentAttempt>(`/api/admin/payment-attempts/${paymentAttemptId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ adminTransactionId, verifiedBy: "local-admin" }),
  });
}

export function getInventory(eventId: number) {
  return api<ShirtInventoryItem[]>(`/api/events/${eventId}/inventory`);
}

export function createCorporateOrder(request: {
  eventId: number;
  companyName: string;
  companyAddress: string;
  uen: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  items: { size: string; type: string; quantity: number }[];
}) {
  return api<number>("/api/corporate-orders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
