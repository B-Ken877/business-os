/**
 * Public barrel for the SQLite persistence adapter.
 *
 * Consumers (the HTTP server, integration tests) import from here.
 */

export { openDatabase } from "./database";
export type { SqliteOptions, DatabaseType } from "./database";

// Core stores (identity, organizations, authorization, audit-log).
export { SqliteIdentityStore } from "./stores/identity-store";
export { SqliteOrganizationsStore } from "./stores/organizations-store";
export { SqliteAuthorizationStore } from "./stores/authorization-store";
export { SqliteAuditLogStore } from "./stores/audit-log-store";

// restaurants vertical stores (10 components).
export {
  SqliteRestaurantMenuStore,
  SqliteRestaurantOrderManagementStore,
  SqliteRestaurantTableManagementStore,
  SqliteRestaurantKitchenDisplayStore,
  SqliteRestaurantReservationsStore,
  SqliteRestaurantDeliveryManagementStore,
  SqliteRestaurantIngredientTrackingStore,
  SqliteRestaurantBillingStore,
  SqliteRestaurantShiftManagementStore,
  SqliteRestaurantPromotionsStore,
} from "./stores/restaurants";

// retail-shops vertical stores (9 components).
export {
  SqliteRetailBarcodeScanningStore,
  SqliteRetailCustomerManagementStore,
  SqliteRetailInventoryStore,
  SqliteRetailPointOfSaleStore,
  SqliteRetailProductCatalogStore,
  SqliteRetailPromotionsStore,
  SqliteRetailSalesReportsStore,
  SqliteRetailStockAlertsStore,
  SqliteRetailSupplierManagementStore,
} from "./stores/retail";

// schools vertical stores (10 components).
export {
  SqliteSchoolAttendanceStore,
  SqliteSchoolCertificatesStore,
  SqliteSchoolClassSchedulingStore,
  SqliteSchoolExamsStore,
  SqliteSchoolGradingStore,
  SqliteSchoolParentCommunicationStore,
  SqliteSchoolStudentEnrollmentStore,
  SqliteSchoolStudentPortalStore,
  SqliteSchoolTeacherManagementStore,
  SqliteSchoolTuitionManagementStore,
} from "./stores/school";

// churches vertical stores (8 components).
export {
  SqliteChurchAnnouncementsStore,
  SqliteChurchAttendanceStore,
  SqliteChurchDonationsStore,
  SqliteChurchEventsStore,
  SqliteChurchGroupsStore,
  SqliteChurchMemberManagementStore,
  SqliteChurchSermonsStore,
  SqliteChurchVolunteersStore,
} from "./stores/church";

// clinics vertical stores (10 components).
export {
  SqliteClinicAppointmentsStore,
  SqliteClinicBillingStore,
  SqliteClinicConsentStore,
  SqliteClinicLabOrdersStore,
  SqliteClinicMedicalRecordsStore,
  SqliteClinicPatientManagementStore,
  SqliteClinicPrescriptionsStore,
  SqliteClinicRemindersStore,
  SqliteClinicStaffManagementStore,
  SqliteClinicTriageStore,
} from "./stores/clinic";

// service-businesses vertical stores (8 components).
export {
  SqliteServiceBookingStore,
  SqliteServiceCatalogStore,
  SqliteServiceCustomerManagementStore,
  SqliteServiceFeedbackStore,
  SqliteServiceInvoicingStore,
  SqliteServiceJobTrackingStore,
  SqliteServiceQuotesStore,
  SqliteServiceSchedulingStore,
} from "./stores/service";

// cross-cutting vertical stores (10 components).
export {
  SqliteActivityTimelineStore,
  SqliteDocumentManagementStore,
  SqliteFormsAndIntakeStore,
  SqliteMessagingCenterStore,
  SqliteNotesAndCommentsStore,
  SqliteNotificationsCenterStore,
  SqlitePaymentsOrCollectionsStore,
  SqliteReportingDashboardStore,
  SqliteRolesAndPermissionsUiStore,
  SqliteSearchAndFilterStore,
} from "./stores/cross_cutting";

/**
 * Convenience: create all 4 core stores from a single database connection.
 */
import type { DatabaseType } from "./database";
import { SqliteIdentityStore } from "./stores/identity-store";
import { SqliteOrganizationsStore } from "./stores/organizations-store";
import { SqliteAuthorizationStore } from "./stores/authorization-store";
import { SqliteAuditLogStore } from "./stores/audit-log-store";

export function createStores(db: DatabaseType) {
  return {
    identity: new SqliteIdentityStore(db),
    organizations: new SqliteOrganizationsStore(db),
    authorization: new SqliteAuthorizationStore(db),
    auditLog: new SqliteAuditLogStore(db),
  };
}

import {
  SqliteRestaurantMenuStore,
  SqliteRestaurantOrderManagementStore,
  SqliteRestaurantTableManagementStore,
  SqliteRestaurantKitchenDisplayStore,
  SqliteRestaurantReservationsStore,
  SqliteRestaurantDeliveryManagementStore,
  SqliteRestaurantIngredientTrackingStore,
  SqliteRestaurantBillingStore,
  SqliteRestaurantShiftManagementStore,
  SqliteRestaurantPromotionsStore,
} from "./stores/restaurants";
export function createRestaurantsStores(db: DatabaseType) {
  return {
    "restaurant-billing": new SqliteRestaurantBillingStore(db),
    "restaurant-delivery-management": new SqliteRestaurantDeliveryManagementStore(db),
    "restaurant-ingredient-tracking": new SqliteRestaurantIngredientTrackingStore(db),
    "restaurant-kitchen-display": new SqliteRestaurantKitchenDisplayStore(db),
    "restaurant-menu": new SqliteRestaurantMenuStore(db),
    "restaurant-order-management": new SqliteRestaurantOrderManagementStore(db),
    "restaurant-promotions": new SqliteRestaurantPromotionsStore(db),
    "restaurant-reservations": new SqliteRestaurantReservationsStore(db),
    "restaurant-shift-management": new SqliteRestaurantShiftManagementStore(db),
    "restaurant-table-management": new SqliteRestaurantTableManagementStore(db),
  };
}

import {
  SqliteRetailBarcodeScanningStore,
  SqliteRetailCustomerManagementStore,
  SqliteRetailInventoryStore,
  SqliteRetailPointOfSaleStore,
  SqliteRetailProductCatalogStore,
  SqliteRetailPromotionsStore,
  SqliteRetailSalesReportsStore,
  SqliteRetailStockAlertsStore,
  SqliteRetailSupplierManagementStore,
} from "./stores/retail";
export function createRetailStores(db: DatabaseType) {
  return {
    "retail-barcode-scanning": new SqliteRetailBarcodeScanningStore(db),
    "retail-customer-management": new SqliteRetailCustomerManagementStore(db),
    "retail-inventory": new SqliteRetailInventoryStore(db),
    "retail-point-of-sale": new SqliteRetailPointOfSaleStore(db),
    "retail-product-catalog": new SqliteRetailProductCatalogStore(db),
    "retail-promotions": new SqliteRetailPromotionsStore(db),
    "retail-sales-reports": new SqliteRetailSalesReportsStore(db),
    "retail-stock-alerts": new SqliteRetailStockAlertsStore(db),
    "retail-supplier-management": new SqliteRetailSupplierManagementStore(db),
  };
}

import {
  SqliteSchoolAttendanceStore,
  SqliteSchoolCertificatesStore,
  SqliteSchoolClassSchedulingStore,
  SqliteSchoolExamsStore,
  SqliteSchoolGradingStore,
  SqliteSchoolParentCommunicationStore,
  SqliteSchoolStudentEnrollmentStore,
  SqliteSchoolStudentPortalStore,
  SqliteSchoolTeacherManagementStore,
  SqliteSchoolTuitionManagementStore,
} from "./stores/school";
export function createSchoolStores(db: DatabaseType) {
  return {
    "school-attendance": new SqliteSchoolAttendanceStore(db),
    "school-certificates": new SqliteSchoolCertificatesStore(db),
    "school-class-scheduling": new SqliteSchoolClassSchedulingStore(db),
    "school-exams": new SqliteSchoolExamsStore(db),
    "school-grading": new SqliteSchoolGradingStore(db),
    "school-parent-communication": new SqliteSchoolParentCommunicationStore(db),
    "school-student-enrollment": new SqliteSchoolStudentEnrollmentStore(db),
    "school-student-portal": new SqliteSchoolStudentPortalStore(db),
    "school-teacher-management": new SqliteSchoolTeacherManagementStore(db),
    "school-tuition-management": new SqliteSchoolTuitionManagementStore(db),
  };
}

import {
  SqliteChurchAnnouncementsStore,
  SqliteChurchAttendanceStore,
  SqliteChurchDonationsStore,
  SqliteChurchEventsStore,
  SqliteChurchGroupsStore,
  SqliteChurchMemberManagementStore,
  SqliteChurchSermonsStore,
  SqliteChurchVolunteersStore,
} from "./stores/church";
export function createChurchStores(db: DatabaseType) {
  return {
    "church-announcements": new SqliteChurchAnnouncementsStore(db),
    "church-attendance": new SqliteChurchAttendanceStore(db),
    "church-donations": new SqliteChurchDonationsStore(db),
    "church-events": new SqliteChurchEventsStore(db),
    "church-groups": new SqliteChurchGroupsStore(db),
    "church-member-management": new SqliteChurchMemberManagementStore(db),
    "church-sermons": new SqliteChurchSermonsStore(db),
    "church-volunteers": new SqliteChurchVolunteersStore(db),
  };
}

import {
  SqliteClinicAppointmentsStore,
  SqliteClinicBillingStore,
  SqliteClinicConsentStore,
  SqliteClinicLabOrdersStore,
  SqliteClinicMedicalRecordsStore,
  SqliteClinicPatientManagementStore,
  SqliteClinicPrescriptionsStore,
  SqliteClinicRemindersStore,
  SqliteClinicStaffManagementStore,
  SqliteClinicTriageStore,
} from "./stores/clinic";
export function createClinicStores(db: DatabaseType) {
  return {
    "clinic-appointments": new SqliteClinicAppointmentsStore(db),
    "clinic-billing": new SqliteClinicBillingStore(db),
    "clinic-consent": new SqliteClinicConsentStore(db),
    "clinic-lab-orders": new SqliteClinicLabOrdersStore(db),
    "clinic-medical-records": new SqliteClinicMedicalRecordsStore(db),
    "clinic-patient-management": new SqliteClinicPatientManagementStore(db),
    "clinic-prescriptions": new SqliteClinicPrescriptionsStore(db),
    "clinic-reminders": new SqliteClinicRemindersStore(db),
    "clinic-staff-management": new SqliteClinicStaffManagementStore(db),
    "clinic-triage": new SqliteClinicTriageStore(db),
  };
}

import {
  SqliteServiceBookingStore,
  SqliteServiceCatalogStore,
  SqliteServiceCustomerManagementStore,
  SqliteServiceFeedbackStore,
  SqliteServiceInvoicingStore,
  SqliteServiceJobTrackingStore,
  SqliteServiceQuotesStore,
  SqliteServiceSchedulingStore,
} from "./stores/service";
export function createServiceStores(db: DatabaseType) {
  return {
    "service-booking": new SqliteServiceBookingStore(db),
    "service-catalog": new SqliteServiceCatalogStore(db),
    "service-customer-management": new SqliteServiceCustomerManagementStore(db),
    "service-feedback": new SqliteServiceFeedbackStore(db),
    "service-invoicing": new SqliteServiceInvoicingStore(db),
    "service-job-tracking": new SqliteServiceJobTrackingStore(db),
    "service-quotes": new SqliteServiceQuotesStore(db),
    "service-scheduling": new SqliteServiceSchedulingStore(db),
  };
}

import {
  SqliteActivityTimelineStore,
  SqliteDocumentManagementStore,
  SqliteFormsAndIntakeStore,
  SqliteMessagingCenterStore,
  SqliteNotesAndCommentsStore,
  SqliteNotificationsCenterStore,
  SqlitePaymentsOrCollectionsStore,
  SqliteReportingDashboardStore,
  SqliteRolesAndPermissionsUiStore,
  SqliteSearchAndFilterStore,
} from "./stores/cross_cutting";
export function createCrossCuttingStores(db: DatabaseType) {
  return {
    "activity-timeline": new SqliteActivityTimelineStore(db),
    "document-management": new SqliteDocumentManagementStore(db),
    "forms-and-intake": new SqliteFormsAndIntakeStore(db),
    "messaging-center": new SqliteMessagingCenterStore(db),
    "notes-and-comments": new SqliteNotesAndCommentsStore(db),
    "notifications-center": new SqliteNotificationsCenterStore(db),
    "payments-or-collections": new SqlitePaymentsOrCollectionsStore(db),
    "reporting-dashboard": new SqliteReportingDashboardStore(db),
    "roles-and-permissions-ui": new SqliteRolesAndPermissionsUiStore(db),
    "search-and-filter": new SqliteSearchAndFilterStore(db),
  };
}

/**
 * Create a map of component-id -> store for all verticals.
 * Used by the HTTP server to inject persistent stores into component routes.
 */
export function createAllComponentStores(db: DatabaseType): Record<string, unknown> {
  return {
  ...createRestaurantsStores(db),
  ...createRetailStores(db),
  ...createSchoolStores(db),
  ...createChurchStores(db),
  ...createClinicStores(db),
  ...createServiceStores(db),
  ...createCrossCuttingStores(db),
  };
}
