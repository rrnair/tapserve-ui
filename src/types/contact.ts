
/**
 * Contact details of an entity - Supplier/Vendor etc
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface Contact {

    // Contact person name
    firstName: string,

    lastName?: string,

    // One or more phone details
    phone?: Phone[],

    // Address details
    address?: Address,

    // Email address
    email?: string,
}

/**
 * A phone record
 */
export interface Phone {
    // Mobile or landline number
    phone: number,

    // Country Code - 91, 01 etc
    countryCode: number,
}

/**
 * Address details 
 */
export interface Address {

    // A grouping head for the address - Head Office, regional office, branch office etc
    head?: string,

    // Building or house name/no
    building?: string,

    // Street name
    street?: string,

    // City code - BLR, TVC etc
    city: string,

    // State code - KA, KL, VA etc
    state: string,

    // Country code - IN, US, JP etc
    country: string,

    // Postal code
    zipCode?: string,
}