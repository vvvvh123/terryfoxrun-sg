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
  indemnityText?: string;
  pdpaConsentText?: string;
  refundCancellationText?: string;
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

export type Announcement = {
  id: number;
  eventId: number;
  title: string;
  body: string;
  channelEmail: boolean;
  channelDashboard: boolean;
  createdBy?: string;
  createdAt?: string;
};

export type EmailCampaign = {
  id: number;
  eventId: number;
  audience: string;
  subject: string;
  body: string;
  sentStatus: string;
  createdBy?: string;
  createdAt?: string;
  sentAt?: string;
};

export type CorporatePackage = {
  id?: number;
  eventId?: number;
  packageName: string;
  price: number;
  shirtAllocationRulesJson: string;
  active: boolean;
};

export type EmailAudienceSegment = {
  key: string;
  label: string;
  description: string;
  count: number;
};

export type ShirtOrder = {
  size: string;
  type: string;
  quantity: number;
};

export type CorporateOrder = {
  id: number;
  eventId: number;
  companyName: string;
  companyAddress: string;
  uen: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  corporatePackageId?: number;
  corporatePackageName?: string;
  status: string;
  createdAt?: string;
  items: { id?: number; size: string; type: string; quantity: number }[];
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
  shirtOrders?: ShirtOrder[];
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
  eventYear?: number;
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
    shirtOrders?: ShirtOrder[];
    pickupCode?: string;
    pickupStatus?: string;
  }[];
  paymentAttempts: PaymentAttempt[];
};

export type PickupResult = {
  result: "COLLECTED" | "ALREADY_COLLECTED" | "PAYMENT_NOT_CONFIRMED" | string;
  message: string;
  registrationId: number;
  payerName: string;
  payerEmail: string;
  paymentStatus: string;
  totalAmount: number;
  participantId: number;
  participantName: string;
  categoryName?: string;
  tshirtSize?: string;
  tshirtType?: string;
  tshirtQty?: number;
  shirtOrders?: ShirtOrder[];
  pickupCode: string;
  pickupStatus: string;
  pickupTimestamp?: string;
  pickupCollectedBy?: string;
};

export type PickupSummary = {
  collectedCount: number;
  pendingCount: number;
  collected: {
    participantId: number;
    registrationId: number;
    participantName: string;
    pickupCode: string;
    tshirtSize?: string;
    tshirtType?: string;
    tshirtQty?: number;
    pickupTimestamp?: string;
  }[];
};

export type RoleUser = {
  id: string;
  email: string;
  appRole: string;
  createdAt?: string;
  lastSignInAt?: string;
};

export type RoleUsersResponse = {
  users: RoleUser[];
  counts: {
    admin: number;
    volunteer: number;
    participant: number;
  };
  configured: boolean;
  message: string;
};

export type EventStats = {
  confirmedAmount: number;
  pendingAmount: number;
  confirmedPaymentCount: number;
  pendingPaymentCount: number;
  dailyAmounts: {
    date: string;
    confirmedAmount: number;
    pendingAmount: number;
    cumulativeConfirmedAmount: number;
    cumulativePendingAmount: number;
  }[];
};

export type AdminRegistrationReport = {
  counts: {
    total: number;
    confirmed: number;
    pendingPayment: number;
    rejected: number;
  };
  dailyRegistrations: {
    date: string;
    count: number;
  }[];
  registrations: {
    id: number;
    payerName: string;
    payerEmail: string;
    generatedPaymentReference: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    createdAt?: string;
    participantCount: number;
    shirtSummary: string;
  }[];
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

export function createCategory(eventId: number, request: CategoryDto) {
  return api<CategoryDto>(`/api/events/${eventId}/categories`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateCategory(eventId: number, categoryId: number, request: CategoryDto) {
  return api<CategoryDto>(`/api/events/${eventId}/categories/${categoryId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteCategory(eventId: number, categoryId: number) {
  return api<void>(`/api/events/${eventId}/categories/${categoryId}`, {
    method: "DELETE",
  });
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

export function scanPickup(tokenOrCode: string) {
  return api<PickupResult>("/api/pickup/scan", {
    method: "POST",
    body: JSON.stringify({ tokenOrCode }),
  });
}

export function lookupPickup(tokenOrCode: string) {
  return api<PickupResult>("/api/pickup/lookup", {
    method: "POST",
    body: JSON.stringify({ tokenOrCode }),
  });
}

export function collectPickup(tokenOrCode: string) {
  return api<PickupResult>("/api/pickup/collect", {
    method: "POST",
    body: JSON.stringify({ tokenOrCode }),
  });
}

export function getPickupHistory(filters: { eventId: number; query?: string; status?: string }) {
  const params = new URLSearchParams({ eventId: String(filters.eventId) });
  if (filters.query) params.set("query", filters.query);
  if (filters.status) params.set("status", filters.status);
  return api<PickupResult[]>(`/api/pickup/history?${params.toString()}`);
}

export function getPickupSummary(eventId: number) {
  return api<PickupSummary>(`/api/pickup/events/${eventId}/summary`);
}

export function getRoleUsers() {
  return api<RoleUsersResponse>("/api/admin/roles/users");
}

export function getEventStats(eventId: number) {
  return api<EventStats>(`/api/events/${eventId}/stats`);
}

export function getAdminRegistrations(eventId: number, filters: { query?: string; paymentStatus?: string; status?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.query) params.set("query", filters.query);
  if (filters.paymentStatus) params.set("paymentStatus", filters.paymentStatus);
  if (filters.status) params.set("status", filters.status);
  const query = params.toString();
  return api<AdminRegistrationReport>(`/api/events/${eventId}/registrations${query ? `?${query}` : ""}`);
}

export function getAnnouncements(eventId: number, dashboardOnly = false) {
  return api<Announcement[]>(`/api/events/${eventId}/announcements${dashboardOnly ? "?dashboardOnly=true" : ""}`);
}

export function createAnnouncement(eventId: number, request: { title: string; body: string; channelEmail: boolean; channelDashboard: boolean }) {
  return api<Announcement>(`/api/events/${eventId}/announcements`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getEmailCampaigns(eventId: number) {
  return api<EmailCampaign[]>(`/api/events/${eventId}/email-campaigns`);
}

export function getEmailAudiences(eventId: number) {
  return api<EmailAudienceSegment[]>(`/api/events/${eventId}/email-campaigns/audiences`);
}

export function createEmailCampaign(eventId: number, request: { audience: string; subject: string; body: string; sendPreview: boolean }) {
  return api<EmailCampaign>(`/api/events/${eventId}/email-campaigns`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getCorporatePackages(eventId: number, activeOnly = false) {
  return api<CorporatePackage[]>(`/api/events/${eventId}/corporate-packages${activeOnly ? "?activeOnly=true" : ""}`);
}

export function createCorporatePackage(eventId: number, request: CorporatePackage) {
  return api<CorporatePackage>(`/api/events/${eventId}/corporate-packages`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateCorporatePackage(eventId: number, packageId: number, request: CorporatePackage) {
  return api<CorporatePackage>(`/api/events/${eventId}/corporate-packages/${packageId}`, {
    method: "PATCH",
    body: JSON.stringify(request),
  });
}

export function deleteCorporatePackage(eventId: number, packageId: number) {
  return api<void>(`/api/events/${eventId}/corporate-packages/${packageId}`, {
    method: "DELETE",
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
  corporatePackageId?: number;
  items: { size: string; type: string; quantity: number }[];
}) {
  return api<number>("/api/corporate-orders", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function getCorporateOrders(eventId: number) {
  return api<CorporateOrder[]>(`/api/corporate-orders?eventId=${eventId}`);
}

export function updateCorporateOrderStatus(orderId: number, status: string) {
  return api<CorporateOrder>(`/api/corporate-orders/${orderId}?status=${encodeURIComponent(status)}`, {
    method: "PATCH",
  });
}
