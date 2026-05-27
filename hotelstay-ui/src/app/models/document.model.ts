/**
 * Document Type Enum
 */
export enum DocumentType {
  PASSPORT = 'Passport',
  NATIONAL_ID = 'NationalID'
}

/**
 * Destination Classification
 */
export interface Destination {
  name: string;
  country: string;
  isDomestic: boolean; // true if in home country
  requiredDocumentTypes: DocumentType[];
}

/**
 * Predefined list of valid destinations
 * Includes at least 2 domestic and 3 international per requirements
 */
export const VALID_DESTINATIONS: Destination[] = [
  // Domestic destinations (India)
  { name: 'Mumbai', country: 'India', isDomestic: true, requiredDocumentTypes: [DocumentType.PASSPORT, DocumentType.NATIONAL_ID] },
  { name: 'Delhi', country: 'India', isDomestic: true, requiredDocumentTypes: [DocumentType.PASSPORT, DocumentType.NATIONAL_ID] },
  
  // International destinations
  { name: 'New York', country: 'United States', isDomestic: false, requiredDocumentTypes: [DocumentType.PASSPORT] },
  { name: 'London', country: 'United Kingdom', isDomestic: false, requiredDocumentTypes: [DocumentType.PASSPORT] },
  { name: 'Paris', country: 'France', isDomestic: false, requiredDocumentTypes: [DocumentType.PASSPORT] },
];

/**
 * Traveller document details
 */
export interface TravellerDocument {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  destination: string;
}

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  isValid: boolean;
  errors?: string[];
}
