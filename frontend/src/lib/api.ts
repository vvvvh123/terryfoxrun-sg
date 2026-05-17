"use client";

import { supabase } from "@/lib/supabase";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

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
  paymentInstructions?: PaymentInstructions;
  eventDetails?: EventDetails;
  faqs?: FaqItem[];
  contactRecipientEmail?: string;
  socialLinks?: SocialLinks;
};

export type EventDetails = {
  scheduleSummary?: string;
  routeNotes?: string;
  tshirtTitle?: string;
  tshirtDescription?: string;
  tshirtFrontImageUrl?: string;
  tshirtBackImageUrl?: string;
  kidsSizeChartImageUrl?: string;
  adultSizeChartImageUrl?: string;
  pickupDisclaimer?: string;
  donationNote?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  displayOrder: number;
  active: boolean;
};

export type SocialLinks = {
  instagramUrl?: string;
  instagramLogoUrl?: string;
  facebookUrl?: string;
  facebookLogoUrl?: string;
};

export type PaymentInstructions = {
  payNowQrImageUrl?: string;
  payNowInstruction?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankInstruction?: string;
  proofBucket?: string;
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

export type DailyInventorySold = {
  date: string;
  size: string;
  quantitySold: number;
};

export type ContactSubmissionRequest = {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
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
  rejectionReason?: string;
  proofFileUrl?: string;
  verificationStatus: string;
  eventId?: number;
  payerName?: string;
  payerEmail?: string;
  totalAmount?: number;
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
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export function getCurrentEvent() {
  return api<EventDto>("/api/events/current");
}

export function getEvents() {
  return api<EventDto[]>("/api/events");
}

export function getEvent(id: number) {
  return api<EventDto>(`/api/events/${id}`);
}

export function createEvent(request: EventDto) {
  return api<EventDto>("/api/events", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateEvent(id: number, request: EventDto) {
  return api<EventDto>(`/api/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function copyEvent(id: number) {
  return api<EventDto>(`/api/events/${id}/copy`, {
    method: "POST",
  });
}

export function setCurrentEvent(id: number) {
  return api<EventDto>(`/api/events/${id}/current`, {
    method: "PATCH",
  });
}

export function deleteEvent(id: number) {
  return api<void>(`/api/events/${id}`, {
    method: "DELETE",
  });
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

export function saveFormFields(eventId: number, fields: FormFieldConfig[]) {
  return api<FormFieldConfig[]>(`/api/events/${eventId}/form-fields`, {
    method: "PUT",
    body: JSON.stringify(fields),
  });
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

export async function uploadPaymentProof(options: {
  bucket: string;
  file: File;
  registrationId: number;
  userId: string;
}) {
  const safeName = options.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${options.userId}/${options.registrationId}/${Date.now()}-${safeName}`;
  const { data, error } = await supabase.storage.from(options.bucket).upload(path, options.file, {
    cacheControl: "3600",
    contentType: options.file.type || undefined,
    upsert: false,
  });
  if (error) {
    throw error;
  }

  const signed = await supabase.storage.from(options.bucket).createSignedUrl(data.path, 60 * 60 * 24 * 7);
  return signed.data?.signedUrl ?? `supabase://${options.bucket}/${data.path}`;
}

export function getRegistration(id: number) {
  return api<RegistrationDetail>(`/api/registrations/${id}`);
}

export function getMyRegistrations() {
  return api<RegistrationDetail[]>("/api/registrations/me");
}

export function getPaymentAttempts(filters: { status?: string; method?: "PAYNOW" | "BANK_TRANSFER" | ""; eventId?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.method) params.set("method", filters.method);
  if (filters.eventId) params.set("eventId", String(filters.eventId));
  const query = params.toString();
  return api<PaymentAttempt[]>(`/api/admin/payment-attempts${query ? `?${query}` : ""}`);
}

export function getPendingPayments() {
  return getPaymentAttempts({ status: "PENDING_ADMIN_VERIFICATION" });
}

export function confirmPayment(paymentAttemptId: number, adminTransactionId: string) {
  return api<PaymentAttempt>(`/api/admin/payment-attempts/${paymentAttemptId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ adminTransactionId, verifiedBy: "local-admin" }),
  });
}

export function rejectPayment(paymentAttemptId: number, rejectionReason: string) {
  return api<PaymentAttempt>(`/api/admin/payment-attempts/${paymentAttemptId}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason, verifiedBy: "local-admin" }),
  });
}

export function exportCsvUrl(eventId: number, exportType: "registrations" | "finance" | "corporate-orders" | "inventory") {
  return `${API_BASE_URL}/api/events/${eventId}/exports/${exportType}.csv`;
}

export function getInventory(eventId: number) {
  return api<ShirtInventoryItem[]>(`/api/events/${eventId}/inventory`);
}

export function getDailySold(eventId: number, size = "ALL") {
  return api<DailyInventorySold[]>(`/api/events/${eventId}/inventory/sold-daily?size=${encodeURIComponent(size)}`);
}

export function updateInventory(eventId: number, items: ShirtInventoryItem[]) {
  return api<void>(`/api/events/${eventId}/inventory`, {
    method: "PATCH",
    body: JSON.stringify(items),
  });
}

export function submitContact(eventId: number, request: ContactSubmissionRequest) {
  return api<{ id: number; status: string }>(`/api/events/${eventId}/contact-submissions`, {
    method: "POST",
    body: JSON.stringify(request),
  });
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
