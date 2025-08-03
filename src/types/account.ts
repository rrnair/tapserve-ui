import { Address } from "./contact"

/**
 * A bank account pf vendor/supplier.
 * 
 * @author Ratheesh Nair
 * @since 0.1.0
 */
export interface Account {
    
    // Unique id of the account record
    id: string,

    // Account number
    accountNo: string,

    // Bank details
    bank?: Bank
}

/**
 * Bank account details
 */
export interface Bank {
    
    // Name of the bank - ICICI Bank, SBI etc
    name: string,

    // IFSC Code
    ifsc: string,

    // Account type - savings, checking, current etc
    accountType: string,

    // Optional Address of Bank
    address?: Address,

     // A transaction remark matcher rule, this is used
    // for matching a transaction while reconciling transactions. So that we
    // can say the TXN 0001 with remarks "chicken vendor" account no ending with xxx245
    // is a payment to poultry supplier MK Enterprises. 
    txnMatchRule?: string
}