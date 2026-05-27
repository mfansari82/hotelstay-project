import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { VALID_DESTINATIONS, DocumentType, Destination } from '../../models/document.model';

/**
 * Validators for form validation
 */
export class CustomValidators {
  /**
   * Validate that checkout date is after checkin date
   */
  static checkoutAfterCheckin(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const checkInDate = parent.get('checkInDate')?.value;
      const checkOutDate = control.value;

      if (!checkInDate || !checkOutDate) return null;

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      return checkOut > checkIn ? null : { checkoutBeforeCheckin: true };
    };
  }

  /**
   * Validate that the destination is in the allowed list
   */
  static validDestination(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const isValid = VALID_DESTINATIONS.some(
        (dest: Destination) => dest.name.toLowerCase() === control.value.toLowerCase()
      );

      return isValid ? null : { invalidDestination: true };
    };
  }

  /**
   * Validate document type matches destination requirements
   */
  static documentTypeMatchesDestination(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const parent = control.parent;
      if (!parent) return null;

      const destination = parent.get('destination')?.value;
      const documentType = control.value;

      if (!destination || !documentType) return null;

      const destinationData = VALID_DESTINATIONS.find(
        (dest: Destination) => dest.name.toLowerCase() === destination.toLowerCase()
      );

      if (!destinationData) return { invalidDestination: true };

      const isValidDocType = destinationData.requiredDocumentTypes.includes(
        documentType
      );

      return isValidDocType ? null : { documentTypeNotAllowed: true };
    };
  }

  /**
   * Validate document number format
   */
  static validDocumentNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const parent = control.parent;
      if (!parent) return null;

      const documentType = parent.get('documentType')?.value;
      const docNumber = control.value;

      if (!documentType) return null;

      // Simple validation: document number should be alphanumeric and at least 5 characters
      if (!docNumber.match(/^[A-Z0-9]{5,}$/i)) {
        return { invalidDocumentNumber: true };
      }

      return null;
    };
  }

  /**
   * Validate minimum length
   */
  static minLengthCustom(length: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value.length >= length
        ? null
        : { minLengthCustom: { length } };
    };
  }
}

/**
 * Document validation utility
 */
export class DocumentValidator {
  /**
   * Validate if document type is allowed for destination
   */
  static isDocumentTypeAllowedForDestination(
    destination: string,
    documentType: DocumentType
  ): boolean {
    const destinationData = VALID_DESTINATIONS.find(
      (dest: Destination) => dest.name.toLowerCase() === destination.toLowerCase()
    );

    if (!destinationData) return false;

    return destinationData.requiredDocumentTypes.includes(documentType);
  }

  /**
   * Get allowed document types for a destination
   */
  static getAllowedDocumentTypes(destination: string): DocumentType[] {
    const destinationData = VALID_DESTINATIONS.find(
      (dest: Destination) => dest.name.toLowerCase() === destination.toLowerCase()
    );

    return destinationData?.requiredDocumentTypes || [];
  }

  /**
   * Get error message for invalid document type
   */
  static getDocumentTypeErrorMessage(
    destination: string,
    documentType?: DocumentType
  ): string {
    const destinationData = VALID_DESTINATIONS.find(
      (dest: Destination) => dest.name.toLowerCase() === destination.toLowerCase()
    );

    if (!destinationData) return 'Invalid destination';

    const isDomestic = destinationData.isDomestic;
    if (isDomestic) {
      return 'Domestic destinations require National ID or Passport';
    } else {
      return 'International destinations require Passport';
    }
  }
}
