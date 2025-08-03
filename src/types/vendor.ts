import { Account } from "./account";
import { Category } from "./category";
import { Contact } from "./contact";

/**
 * A vendor who supplies a raw material or provides a service
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface Vendor {

    // Unique Id of a supplier
    id: string,

    // Name of the supplier/vendor
    name: string,

    // A short description - what's supplied (chicke, egg, vegetables, beverages) etc
    description: string,

    // Category - on what's this vendor supplying
    category: Category,

        // Total expenses paid under this category
    expenseCount: number,

    // Contact details of supplier - 
    contact: Contact,

    // Optional account - helps in reconciling our bank transactions
    // For instance from transaction remarks or payee account no, we can categorize
    // the transactions. A vendor can have one or more accounts
    // for different payment modes - cash, bank transfer, cheque etc
    accounts?: Account[],
    
    // One or more product or brand images of supplier
    imageUrls: string[],

    // Is the vendor active in the system
    isActive: boolean,

    // Total amount paid to the vendor, should this be date range ?
    totalAmount: number,

    // Who created this vendor
    createdBy: string,

    // When its created
    createdAt: string,

    // When this record is updated
    updatedAt: string
}